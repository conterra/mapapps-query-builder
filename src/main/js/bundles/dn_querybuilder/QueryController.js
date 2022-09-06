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
import apprt_when from "apprt-core/when";
import async from "apprt-core/async";
import ct_lang from "ct/_lang";
import Filter from "ct/store/Filter";
import {MemoryStore} from "./MemoryStore";
import CachingStore from "./CachingStore";

const DELAY = 500;

export default class QueryController {

    #i18n = undefined;
    #query = undefined;
    #bundleContext = undefined;
    #serviceRegistration = undefined;

    activate(componentContext) {
        this.#bundleContext = componentContext.getBundleContext();
        this.#i18n = this._i18n.get().ui;
    }

    deactivate() {
        this.cancelQuery();
        this.#query = undefined;
        this.#i18n = undefined;
    }

    query(store, complexQuery, options, tool, queryBuilderWidgetModel, setLayerDefinition) {
        this.searchReplacer(complexQuery);
        this.queryStore(store, complexQuery, options, tool, queryBuilderWidgetModel, setLayerDefinition);
        this._eventService.postEvent("dn_querybuilder/QUERY", {complexQuery: complexQuery});
    }

    cancelQuery() {
        const query = this.#query;
        if (query && query.cancel) {
            query.cancel();
        }
        this._dataModel.setDatasource();
    }

    queryStore(store, complexQuery, options, tool, queryBuilderWidgetModel, setLayerDefinition) {
        this._setProcessing(tool, true, queryBuilderWidgetModel);
        const filter = new Filter(store, complexQuery, options);
        const countFilter = new Filter(store, complexQuery, {});
        const idProperty = store.idProperty;
        let opts = null;
        if (idProperty) {
            opts = Object.assign({}, options);
            const fields = opts.fields = {};
            fields[idProperty] = true;
        }

        const layer = queryBuilderWidgetModel.layer;
        if (setLayerDefinition && layer) {
            // save initial definitionExpression to enable reversion to initial state
            if (layer.definitionExpression && !layer._initialDefinitionExpression) {
                layer._initialDefinitionExpression = layer.definitionExpression;
            }
            // reset previously applied or initial definitionExpression to allow filtering the entire layer
            if (layer._initialDefinitionExpression) {
                layer.definitionExpression = layer._initialDefinitionExpression;
            }
        }

        let query = this.#query = countFilter.query({}, {count: 0});
        return apprt_when(query.total, (total) => {
            if (total) {
                if (this._smartfinderComplexQueryHandler && store.coreName) {
                    this._smartfinderComplexQueryHandler.setComplexQuery(complexQuery);
                    this._setProcessing(tool, false, queryBuilderWidgetModel);
                } else {
                    query = this.#query = store.query(complexQuery, opts || options);
                    return apprt_when(query, (result) => {
                        this._setProcessing(tool, false, queryBuilderWidgetModel);
                        let resultStore;
                        const idList = result ? result.map(item => item[idProperty]) : [];

                        if (setLayerDefinition && layer) {
                            layer.definitionExpression = idProperty + " IN(" + idList.join() + ")";
                        } else {
                            if (store.get) { // Check if store has a get-method, i.e. it can retrieve single features by ID
                                resultStore = this._createResultReferenceStore(idList, store, 1000);
                            } else {
                                resultStore = this._createFullItemResultStore(idList, result, store);
                            }
                            resultStore.id = store.id;

                            if (this._queryBuilderProperties.enableTempStore) {
                                this._registerTempStore(filter, queryBuilderWidgetModel);
                            }
                            this._dataModel.setDatasource(resultStore);
                            this._resultcenterToggleTool.set("active", true);
                        }
                    });
                }
            } else {
                this._logService.warn({
                    message: this.#i18n.errors.noResultsError
                });
                this._setProcessing(tool, false, queryBuilderWidgetModel);
            }
        }, (e) => {
            this._setProcessing(tool, false, queryBuilderWidgetModel);
            this._logService.error({
                id: e.name,
                message: e.message
            });
        });
    }

    _createFullItemResultStore(idList, result, masterStore) {
        return new MemoryStore({
            masterStore: masterStore,
            data: result,
            idProperty: masterStore.idProperty,
            // TODO: remove id list
            idList: idList
        });
    }

    _createResultReferenceStore(idList, masterStore, maxServerFeaturesLimit) {
        return new CachingStore({
            masterStore: masterStore,
            idList: idList,
            maxFeaturesLimit: maxServerFeaturesLimit
        });
    }

    searchReplacer(o) {
        const that = this;
        ct_lang.forEachOwnProp(o, function (value, name) {
            if (typeof (value) === "string") {
                o[name] = that._replacer.replace(value);
            }
            if (value !== null && typeof (value) === "object" && !value.extent) {
                that.searchReplacer(value);
            }
        });
    }

    _registerTempStore(store, queryBuilderWidgetModel) {
        if (store.id === "querybuilder_temp") {
            return;
        }
        const storeTitle = queryBuilderWidgetModel.getSelectedStoreTitle(store.id);
        if (this.#serviceRegistration) {
            const registration = this.#serviceRegistration;
            // clear the reference
            this.#serviceRegistration = null;
            if (registration) {
                // call unregister
                registration.unregister();
            }
        }
        const title = storeTitle ? this.#i18n.tempStoreTitle + " (" + storeTitle + ")" : this.#i18n.tempStoreTitle;
        const serviceProperties = {
            id: "querybuilder_temp",
            title: title,
            useIn: ["selection"]
        };
        const interfaces = ["ct.api.Store"];
        this.#serviceRegistration = this.#bundleContext.registerService(interfaces, store, serviceProperties);
    }

    _setProcessing(tool, processing, queryBuilderWidgetModel) {
        if (queryBuilderWidgetModel) {
            async(() => {
                queryBuilderWidgetModel.set("processing", processing);
            }, DELAY);
        }
        if (tool) {
            tool.set("processing", processing);
        }
    }
}
