/*
 * Copyright (C) 2021 con terra GmbH (info@conterra.de)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import d_lang from "dojo/_base/lang";
import declare from "dojo/_base/declare";
import ct_lang from "ct/_lang";
import when from "apprt-core/when";
import Deferred from "dojo/Deferred";
import Sequence from "ct/Sequence";
import Hash from "ct/Hash";
import SpatialQuery from "store-api/SpatialQuery";
import { createComplexQueryEngine, toQueryResult } from "store-api/utils";

/*
 * This class provides a caching store. All used field values will be cached in a memory store.
 */
export default declare([], {
    /**
     * Defines if geometry will be cached
     */
    _cache: null,
    _geometryCache: null,
    // Default value for ags
    maxFeaturesLimit: 500,
    // IDs managed in this store
    idList: null,
    masterStore: null,
    initialQuery: null,
    querySequenz: null,

    constructor(args) {
        args = args || {};
        ct_lang.hasProp(args, "masterStore", true, "CachingStore: No master store defined!");
        ct_lang.hasProp(args, "idList", true, "CachingStore: No IDs defined!");
        d_lang.mixin(this, args);
        this.idProperty = this.masterStore.idProperty;
        this._cache = [];
        this._geometryCache = new Hash();
        // Check that idList is not undefined
        if (!this.idList) {
            this.idList = [];
        }
    },

    deactivate() {
        const geometryCache = this._geometryCache;
        geometryCache.clear();
        this._geometryCache = null;
        this._cache = null;
        this.idProperty = null;
    },

    getInitialQuery() {
        return this.initialQuery;
    },

    _addItemToCache(item, offset) {
        const idList = this.idList;
        const idPropName = this.idProperty;
        const id = item[idPropName];
        const pos = idList.indexOf(id);
        // update geometry cache
        this._updateGeometryCache(item, offset);
        this._cache[pos] = item;
    },

    _updateGeometryCache(item, offset) {
        const geometry = item.geometry;
        if (geometry) {
            const geometryCache = this._geometryCache;
            const itemId = item[this.idProperty];
            const offsetMap = geometryCache.contains(offset) ? geometryCache.get(offset) : new Hash();
            offsetMap.set(itemId, geometry);
            geometryCache.set(offset, offsetMap);
            //console.debug("CachingStore: Caching geometry for item '" + itemId + "' at offset " + offset);
        }
    },

    getMetadata(object) {
        return this.masterStore.getMetadata(object);
    },

    getIdentity(object) {
        return this.masterStore.getIdentity(object);
    },

    _getAllMasterStoreFields() {
        //console.debug("CachingStore: Retrieving all fields from store metadata");
        return when(this.masterStore.getMetadata(), (metadata) => {
            const allFields = {};
            let geometryField;
            const fieldsFromMetadata = metadata.fields || [];
            fieldsFromMetadata.forEach((field) => {
                const fieldName = field.name;
                if (fieldName) {
                    allFields[fieldName] = true;
                    if (field.type === "geometry") {
                        geometryField = field.name;
                    }
                }
            });
            if (!fieldsFromMetadata.some((field) =>
                // TODO: why this check?
                !field.name.indexOf(geometryField + "."))) {
                delete allFields[geometryField];
            }
            return allFields;
        });
    },

    _getItems(itemIds, opts) {
        itemIds = (itemIds instanceof Array) ? itemIds : [itemIds];
        if (!itemIds.length) {
            return [];
        }
        let serverMax = this.maxFeaturesLimit;
        const masterStore = this.masterStore;
        // direct support for MapServerLayerStore
        const maxRecordCount = masterStore.maxRecordCount;
        if (maxRecordCount !== undefined && serverMax > maxRecordCount) {
            serverMax = maxRecordCount;
        }
        // check if we need to split the request due to the ags limit!
        if (serverMax > 0 && itemIds.length > serverMax) {
            const sequence = new Sequence();
            for (let i = 0; i < itemIds.length; i += serverMax) {
                sequence.add((function (i, serverMax) {
                    const tempIds = itemIds.slice(i, i + serverMax);
                    //console.debug("CachingStore: Querying items for IDs: " + tempIds);
                    const query = this._buildQuery(tempIds);
                    return () => {
                        const options = this._fixCount(opts, tempIds);
                        return masterStore.query(query, options);
                    };
                }).call(this, i, serverMax));
            }
            return when(sequence.start(), (results) => {
                let result = [];
                results.forEach((r) => {
                    result = result.concat(r);
                });
                result.total = result.length;
                return result;
            });
        } else {
            const query = this._buildQuery(itemIds);
            const options = this._fixCount(opts, itemIds);
            return this.masterStore.query(query, options);
        }
    },

    _fixCount(opts, itemIds) {
        const options = Object.assign({}, opts);
        options.count = itemIds.length;

        //suppress count request in MapServerLayerStore
        if (this.masterStore.enablePagination) {
            options.total = itemIds.length;
        }

        return options;
    },

    _buildQuery(itemIds) {
        // All fields
        const idProperty = this.idProperty;
        const query = {};
        const isArray = itemIds instanceof Array;
        query[idProperty] = {
            $in: isArray ? itemIds : [itemIds]
        };
        return query;
    },

    _isGeometryRequired(options, defaultRequired) {
        const opts = options || {};
        const fields = opts.fields || {};
        return ct_lang.chk(fields.geometry, defaultRequired);
    },

    _getGeometryFromCache(id, offset) {
        const geometryCache = this._geometryCache;
        const itemsForOffset = geometryCache.get(offset || 0);
        //TODO: -> check lower limits?
        return itemsForOffset && itemsForOffset.get(id);
    },

    _isSpatialQuery(query) {
        return SpatialQuery.isSpatialQuery(query);
    },

    _getItemsFromCache(query, options = {}) {
        //console.debug("CachingStore: Querying items from cache...");
        const cache = this._cache;
        if (options.suggestContains === undefined) {
            // Use suggestContains like defined in master
            options.suggestContains = ct_lang.chk(this.masterStore.suggestContains, true);
        }
        return createComplexQueryEngine(query, options)(cache);
    },

    _getGeometryForItems(items, options) {
        // Fetch geometry for items
        const idProperty = this.idProperty;
        const opts = Object.assign({}, options || {});
        opts.fields = {
            geometry: true
        };
        // Ensure that not * properties are fetched!
        opts.fields[this.idProperty] = true;
        const geom = opts.geometry || (opts.geometry = {});
        const offset = geom.maxAllowableOffset = this._getOffset(opts);

        // Check if geometry is already fetched for some items
        const itemsWithoutGeom = items.filter((item) => {
            const id = item[idProperty];
            return !this._getGeometryFromCache(id, offset);
        });
        const itemIds = itemsWithoutGeom.map((item) => item[idProperty]);
        //console.debug("CachingStore: Querying geometries for items with IDs:", itemIds);
        return when(this._getItems(itemIds, Object.assign({}, opts, {
            start: undefined,
            count: undefined
        })), (results) => {
            (results || []).forEach((item) => {
                this._updateGeometryCache(item, offset);
            });
            // Merge geometry with existing items
            const resultItems = items.map((item) => {
                const id = item[idProperty];
                const geom = this._getGeometryFromCache(id, offset);
                return d_lang.mixin({}, item, {
                    geometry: geom
                });
            });
            resultItems.total = resultItems.length;
            return resultItems;
        });
    },

    _getItemsForQuery(query, options) {
        // First query org store for query matching ids, inside our id restriction
        // TODO: remove id query if query has already an $id operator!
        if (!SpatialQuery.usesOperator(query, options, "$in", this.idProperty)) {
            const idQuery = this._buildQuery(this.idList);
            query = {
                $and: [idQuery, query]
            };
        }
        // Only fetch ids
        const opts = Object.assign({}, options || {});
        opts.fields = {};
        opts.fields[this.idProperty] = true;
        const queryResult = this.masterStore.query(query, opts);
        return when(queryResult, (result) => {
            // Now get properties from populated cache
            const items = [];
            const cache = this._cache;
            const idProperty = this.idProperty;
            result.forEach((item) => {
                const itemId = item[idProperty];
                const result = cache.find(cacheEntry => cacheEntry[idProperty] === itemId);
                if (result) {
                    items[items.length] = result;
                }
            });
            items.total = ct_lang.chk(result.total, queryResult.total);
            return items;
        });
    },

    // Query for items
    query(query, options) {
        const opts = options || {};
        const initialQuery = this.initialQuery;
        if (initialQuery && initialQuery.options.geometry && !opts.geometry) {
            // Ensure outSR parameter always
            // MAPAPPS-2855
            opts.geometry = initialQuery.options.geometry;
        }
        let r;
        if (!this._checkIfCacheIsPopulated()) {
            r = when(this._populateCache(), () => this._synchronizedQueryOnCache(query, opts));
        } else {
            r = this._synchronizedQueryOnCache(query, opts);
        }
        return toQueryResult(r);
    },

    _synchronizedQueryOnCache(query, opts) {
        let cancelled = false;
        let queryPromise;
        const d = new Deferred(function () {
            cancelled = true;
            queryPromise?.cancel?.();
            queryPromise = undefined;
        });
        const q = function () {
            return cancelled ? [] : queryPromise = when(this._queryOnCache(query, opts), function (r) {
                cancelled || d.resolve(r);
            }, function (e) {
                cancelled || d.reject(e);
            });
        };
        // Sequence is only used to control the waiting
        let seq = this.querySequence;
        if (seq && !seq.finished) {
            seq.add(q, this);
        } else {
            seq = this.querySequence = new Sequence();
            seq.add(q, this);
            seq.start();
        }
        return d;
    },

    _queryOnCache(query, opts) {
        let itemsDef;
        // This is required if a spatial query is performed
        // (in case the cache is populated with items containing no geometry)
        const isSpatialQuery = this._isSpatialQuery(query);
        const offset = this._getOffset(opts);
        if (isSpatialQuery && this._geometryMissingInCachedItems(offset, query, opts)) {
            itemsDef = this._getItemsForQuery(query, opts);
        } else {
            itemsDef = this._getItemsFromCache(query, opts);
        }
        return when(itemsDef, (items) => {
            // Re-check since items may have been retrieved from service including the geometry
            if (this._isGeometryRequired(opts, false) && items.length > 0) {
                //console.debug("CachingStore: Fetching geometries...");
                items = this._getGeometryForItems(items, opts);
            }
            items.total = ct_lang.chk(items.total, items.length);
            return items;
        });
    },

    _geometryMissingInCachedItems(offset, query, opts) {
        const idProperty = this.idProperty;
        const requestedIds = new Set();
        // This works only because we know,that $in is mostly used
        // TODO: better try a different approach -> e.g. apply query without geometry and check then the missing
        //  geometries?
        SpatialQuery.findOperators(query, opts, "$in", idProperty).forEach((astNode) => {
            astNode.v.forEach((id) => {
                requestedIds.add(id);
            });
        });
        const cache = this._cache;
        return cache.some((cacheEntry) => {
            const id = cacheEntry[idProperty];
            // Side effect geometry is required for ComplexQuery in memory evaluation
            const hasGeometry = !!(cacheEntry.geometry = this._getGeometryFromCache(id, offset));
            if (requestedIds.size) {
                return !hasGeometry && requestedIds.has(id);
            }
            return !hasGeometry;
        });
    },

    _getOffset(options) {
        const opts = options || {};
        return ct_lang.chkProp(opts.geometry, "maxAllowableOffset", 0)
    },

    _checkIfCacheIsPopulated() {
        const cache = this._cache;
        return (!this._fetchCache) && cache.length === this.idList.length && !cache.dirty;
    },

    _populateCache() {
        // Ensure that external cancel, don't break this fetch cache
        let cancelled = false;
        // We need an own deferred, because _fetchCache is shared between all queries, and cancel should not break it!
        const d = new Deferred(function () {
            cancelled = true;
        });

        const onError = (e) => {
            this._fetchCache = undefined;
            throw e;
        };

        const fetchCache = this._fetchCache
            || (this._fetchCache = when(this._getAllMasterStoreFields(), (allFields) => {
                // The idea is that this updates only all attributes of the features, but not the geometry
                // block request for geometry in this place
                allFields["geometry"] = false;
                // Ensure that id property is in field list
                allFields[this.idProperty] = true;
                const opts = {
                    fields: allFields
                };
                const initialQuery = this.initialQuery;
                if (initialQuery && initialQuery.options.geometry) {
                    // Ensure outSR parameter is to populate cache query
                    // MAPAPPS-2855
                    opts.geometry = initialQuery.options.geometry;
                }
                let ids = this.idList;
                const cache = this._cache;
                if (cache.length) {
                    // Invalidate case!
                    ids = ids.filter((id, i) => !cache[i]);
                }
                return when(this._getItems(ids, opts), (results) => {
                    results.forEach((result) => {
                        this._addItemToCache(result, 0);
                    });
                    results.total = results.length;
                    this._fetchCache = null;
                    this._cache.dirty = false;
                    return results;
                }, onError);
            }, onError));

        when(fetchCache, function () {
            if (!cancelled) {
                d.resolve();
            }
        }, function () {
            if (!cancelled) {
                d.reject();
            }
        });

        return d;
    },

    // returns full item
    get(id, options) {
        //console.debug("CachingStore: get() called for ID '" + id + "'");
        if (!this._checkIfCacheIsPopulated()) {
            if (this.idList.indexOf(id) < 0) {
                return Promise.reject(new Error("item not found"));
            }
            // return result directly from master store
            return this.masterStore.get(id, options);
        }
        const query = this._buildQuery(id);
        let items = this._getItemsFromCache(query, options);
        if (this._isGeometryRequired(options, true)) {
            items = this._getGeometryForItems(items, options);
        }
        return when(items, (items) => items[0]);
    },

    // Removes an item
    remove(id) {
        //console.debug("CachingStore: Removing item with ID '" + id + "'");
        const cache = this._cache;
        const dirty = cache.dirty;
        const idList = this.idList;
        this.invalidate(id);

        const index = idList.indexOf(id);
        if (index >= 0) {
            idList.splice(index, 1);
            cache.splice(index, 1);
        }

        cache.dirty = dirty;
        return true;
    },

    invalidate(id) {
        // Check if id is in cache
        const comp = {};
        comp[this.idProperty] = id;
        const i = this.idList.indexOf(id);
        this._cache[i] = null;
        this._cache.dirty = true;
        // Cleaning geometry cache
        const geometryCache = this._geometryCache;
        geometryCache.getKeys().forEach((offset) => {
            const entry = geometryCache.get(offset);
            if (entry.contains(id)) {
                //console.debug("CachingStore: Removing geometry from cache for offset '" + offset + "'");
                entry.remove(id);
            }
        });
    }
});
