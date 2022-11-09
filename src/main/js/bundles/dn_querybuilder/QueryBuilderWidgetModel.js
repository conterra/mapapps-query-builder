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
import {declare} from "apprt-core/Mutable";
import apprt_when from "apprt-core/when";
import ct_lang from "ct/_lang";
import ServiceResolver from "apprt/ServiceResolver";
import Locale from "ct/Locale";
import Connect from "ct/_Connect";
import Graphic from "esri/Graphic";
import Extent from "esri/geometry/Extent";
import {union, difference} from "esri/geometry/geometryEngine";
import Binding from "apprt-binding/Binding";
import ProjectParameters from "esri/rest/support/ProjectParameters";

const _spatialInputActionServiceBinding = Symbol("_spatialInputActionServiceBinding");
const _spatialInputActionPromise = Symbol("_spatialInputActionPromise");

export default declare({

    locale: "en",
    stores: [],
    storeData: [],
    sortFieldData: [],
    selectedStoreId: null,
    selectedSortFieldName: null,
    sortDescending: false,
    fieldQueries: [],
    loading: false,
    processing: false,
    activeTool: false,
    geometry: null,
    activeSpatialInputAction: null,
    activeSpatialInputActionDescription: null,
    negateSpatialInput: false,
    linkOperator: null,
    spatialRelation: null,

    // properties
    storeIds: [],
    enableDistinctValues: true,
    enableInitialDistinctValues: true,
    defaultLinkOperator: "$or",
    defaultSpatialRelation: "everywhere",
    allowNegation: false,
    useUserExtent: false,
    showQuerySettingsInEditableMode: true,
    showSortSelectInUserMode: false,
    showFieldType: true,
    showSpatialRelation: true,
    showSpatialInputActions: false,
    spatialInputActions: ["*"],
    allowMultipleSpatialInputs: true,
    defaultQueryOptions: {
        ignoreCase: false
    },
    hiddenFields: [
        "objectid",
        "OBJECTID",
        "shape"
    ],
    hiddenFieldTypes: [
        "oid",
        "guid",
        "global-id"
    ],
    hiddenSortFields: [
        "objectid",
        "OBJECTID",
        "shape"
    ],

    activate(componentContext) {
        this.locale = Locale.getCurrent().getLanguage();
        const serviceResolver = this.serviceResolver = new ServiceResolver();
        const bundleCtx = componentContext.getBundleContext();
        serviceResolver.setBundleCtx(bundleCtx);

        this.getStoreDataFromMetadata();
        this.linkOperator = this.defaultLinkOperator;
        this.spatialRelation = this.defaultSpatialRelation;
        this.fieldQueries = [];

        const connect = this.connect = new Connect();
        connect.connect(this._tool, "onActivate", () => {
            this.activeTool = true;
            this.getStoreDataFromMetadata();
            if (this.geometry) {
                this.addGraphicToView(this.geometry);
            }
        });
        connect.connect(this._tool, "onDeactivate", () => {
            this.activeTool = false;
            this.loading = false;
            this.processing = false;
            this.removeGraphicFromView();
            const oldSpatialInputAction = this[_spatialInputActionPromise];
            if (oldSpatialInputAction) {
                oldSpatialInputAction.cancel();
                this[_spatialInputActionPromise] = null;
            }
        });
        this.watch("geometry", (evt) => {
            this.removeGraphicFromView();
            if (evt.value) {
                this.addGraphicToView(evt.value);
            }
        });
        this.watch("negateSpatialInput", () => {
            this.resetSpatialInput();
        });
        this.watch("selectedStoreId", (evt) => {
            this.removeFieldQueries();
            this.addFieldQuery(evt.value);
            this.getFieldData(evt.value);
        });

        const spatialInputActionService = this._spatialInputActionService;
        this[_spatialInputActionServiceBinding] = Binding.for(this, spatialInputActionService)
            .syncToLeft("actions", "spatialInputActions",
                (actions) => actions.filter(this.getActionFilter()).map(({id, title, description, iconClass}) => {
                    return {
                        id,
                        title,
                        description,
                        iconClass
                    };
                }))
            .enable()
            .syncToLeftNow();
    },

    deactivate() {
        this.locale = null;
        this.connect.disconnect();
        this[_spatialInputActionServiceBinding].unbind();
        this[_spatialInputActionServiceBinding] = undefined;
        const oldSpatialInputAction = this[_spatialInputActionPromise];
        if (oldSpatialInputAction) {
            oldSpatialInputAction.cancel();
            this[_spatialInputActionPromise] = null;
        }
    },

    selectSpatialInputAction(id) {
        const spatialInputActionService = this._spatialInputActionService;
        const oldSpatialInputAction = this[_spatialInputActionPromise];
        if (oldSpatialInputAction) {
            oldSpatialInputAction.cancel();
            this[_spatialInputActionPromise] = null;
        }
        if (!id) {
            this.activeSpatialInputAction = null;
            this.activeSpatialInputActionDescription = null;
            return;
        }
        const spatialInputAction = spatialInputActionService.getById(id);
        const promise = this[_spatialInputActionPromise] = spatialInputAction.trigger({queryBuilderSelection: true});
        promise.then((geometry) => {
            this.activeSpatialInputAction = null;
            this.activeSpatialInputActionDescription = null;
            if (this.negateSpatialInput) {
                if (this.allowMultipleSpatialInputs && this.geometry) {
                    this.geometry = difference(this.geometry, geometry);
                } else {
                    this.negateGeometry(geometry).then((g) => {
                        this.geometry = g;
                    });
                }
            } else {
                if (this.allowMultipleSpatialInputs && this.geometry) {
                    this.geometry = union([geometry, this.geometry]);
                } else {
                    this.geometry = geometry;
                }
            }
        });
        this.activeSpatialInputActionDescription = spatialInputAction.description;
    },

    negateGeometry(geometry) {
        const worldExtent = new Extent({
            xmin: -180,
            ymin: -90,
            xmax: 180,
            ymax: 90,
            spatialReference: 4326
        });
        const params = new ProjectParameters();
        params.geometries = [worldExtent];
        params.outSpatialReference = geometry.spatialReference;
        const geometryService = this._geometryService;
        const promise = geometryService.project(params);
        return promise.then((projectedGeometries) => difference(projectedGeometries[0], geometry));
    },

    resetSpatialInput() {
        this.geometry = null;
        this.activeSpatialInputAction = null;
        this.activeSpatialInputActionDescription = null;
    },

    getActionFilter() {
        const allowedMethods = this.spatialInputActions;
        const all = !allowedMethods || allowedMethods[0] === "*";
        if (all) {
            return () => true;
        }
        const actionIdLookup = {};
        allowedMethods.forEach((id) => actionIdLookup[id] = true);
        return ({id}) => actionIdLookup[id];
    },

    getStoreDataFromMetadata() {
        const stores = this.stores;
        const storeIds = this.storeIds;
        const storeData = this._metadataAnalyzer.getStoreDataByIds(storeIds);
        return apprt_when(storeData, (data) => {
            if (storeIds.length <= 1) {
                data = this._metadataAnalyzer.getStoreData(stores);
            }
            this.storeData = data;
            if (!this.selectedStoreId) {
                this.selectedStoreId = data.length ? data[0].id : null;
            }
            this.getFieldData();
            return data;
        });
    },

    getFieldData(selectedStoreId) {
        const sortFieldData = this._getSelectedSortFieldData(selectedStoreId || this.selectedStoreId);
        return apprt_when(sortFieldData, (data) => {
            if (data) {
                this.sortFieldData = data;
                this.selectedSortFieldName = data[0].id;
            }
        });
    },

    search(selectedStoreId, linkOperator, spatialRelation, fieldQueries, tool, options, editable, layer) {
        const selectedStore = this.getSelectedStoreObj(selectedStoreId || this.selectedStoreId);
        const complexQuery = this.getComplexQuery(linkOperator || this.linkOperator,
            spatialRelation || this.spatialRelation, fieldQueries || this.fieldQueries);
        let sortOptions = [];
        const opts = Object.assign({}, this.defaultQueryOptions || {}, options || {}, {
            suggestContains: false
        });
        if (this.showSortSelectInUserMode && !editable && !layer) {
            sortOptions = this.getSortOptions();
            opts.sort = sortOptions;
        }
        this._queryController.query(selectedStore, complexQuery, opts, tool || this._tool, this, layer);
    },

    cancelSearch() {
        this._queryController.cancelQuery();
    },

    addFieldQuery(selectedStoreId = this.selectedStoreId, fieldQueries = this.fieldQueries) {
        this.loading = true;
        const fieldData = this._getSelectedFieldData(selectedStoreId);
        return apprt_when(fieldData, (fields) => {
            if (!fields) {
                return;
            }
            const firstField = fields[0];
            if (!firstField) {
                this.loading = false;
                return;
            }
            const addedFieldQuery = {
                fields: fields,
                not: false,
                selectedFieldId: firstField.id,
                relationalOperator: "$eq",
                value: (firstField.codedValues[0] && firstField.codedValues[0].code) || ""
            };
            fieldQueries.push(addedFieldQuery);
            if (firstField.loading) {
                const watcher = firstField.watch("loading", (loading) => {
                    if (!loading.value) {
                        addedFieldQuery.value = (firstField.codedValues[0] && firstField.codedValues[0].code) || "";
                        watcher.remove();
                    }
                });
            }
            this.loading = false;
        }, this);
    },

    addFieldQueries(fields, editFields, selectedStoreId, fieldQueries) {
        fields.forEach((field, i) => {
            const editOptions = editFields && editFields[i];
            let fieldId;
            let not;
            let relationalOperator;
            let value;
            if (field.$not) {
                not = true;
                ct_lang.forEachOwnProp(field.$not, function (v1, n1) {
                    fieldId = n1;
                    ct_lang.forEachOwnProp(v1, function (v2, n2) {
                        relationalOperator = n2;
                        value = v2;
                    });
                });
            } else {
                not = false;
                ct_lang.forEachOwnProp(field, function (v1, n1) {
                    fieldId = n1;
                    ct_lang.forEachOwnProp(v1, function (v2, n2) {
                        relationalOperator = n2;
                        value = v2;
                    });
                });
            }
            this.loading = true;
            const fieldData = this._getSelectedFieldData(selectedStoreId, true);
            apprt_when(fieldData, (fields) => {
                fieldQueries.push({
                    fields: fields,
                    not: not,
                    selectedFieldId: fieldId,
                    relationalOperator: relationalOperator,
                    value: value || "",
                    disableNot: !editOptions.not,
                    disableField: !editOptions.field,
                    disableRelationalOperator: !editOptions.relationalOperator,
                    disableValue: !editOptions.value
                });
                this.loading = false;
            }, this);
        }, this);
    },

    getDistinctValues(value, fieldData, selectedStoreId) {
        const selectedStore = this.getSelectedStoreObj(selectedStoreId || this.selectedStoreId);
        return apprt_when(this._metadataAnalyzer.getDistinctValues(value, fieldData, selectedStore),
            (distinctValues) => {
                const lang = Locale.getCurrent().getLanguage();
                const type = fieldData.type;
                const dValues = fieldData.distinctValues;
                if (lang === "de" && type === "number" && dValues && dValues.length) {
                    fieldData.distinctValues = dValues.map(distinctValue => {
                        if (typeof distinctValue === "number" && !Number.isInteger(distinctValue)) {
                            return distinctValue.toString().replace(".", ",");
                        } else {
                            return distinctValue;
                        }
                    });
                }
                return distinctValues;
            });
    },

    _getSelectedFieldData(selectedStoreId, editable) {
        let hiddenFields = null;
        if (editable) {
            hiddenFields = [];
        }
        if (this.hiddenFields) {
            hiddenFields = this.hiddenFields;
        } else {
            hiddenFields = [];
        }
        const hiddenFieldTypes = this.hiddenFieldTypes;
        return this._getFilteredFieldData(selectedStoreId, hiddenFields, hiddenFieldTypes);
    },

    _getSelectedSortFieldData(selectedStoreId) {
        let hiddenSortFields = null;
        if (this.hiddenSortFields) {
            hiddenSortFields = this.hiddenSortFields;
        } else {
            hiddenSortFields = [];
        }
        const hiddenFieldTypes = this.hiddenFieldTypes;
        return this._getFilteredFieldData(selectedStoreId, hiddenSortFields, hiddenFieldTypes);
    },

    _getFilteredFieldData(selectedStoreId, hiddenFields, hiddenFieldTypes) {
        const store = this.getSelectedStoreObj(selectedStoreId);
        if (!store) {
            return;
        }
        return apprt_when(this._metadataAnalyzer.getFields(store), (fieldData) =>
            fieldData.filter((field) => {
                const fieldNameAllowed = !hiddenFields.includes(field.id);
                const fieldTypeAllowed = !hiddenFieldTypes.includes(field.type);
                return fieldNameAllowed && fieldTypeAllowed;
            }));
    },

    getSelectedStoreObj(id) {
        return this.serviceResolver.getService("ct.api.Store", "(id=" + id + ")");
    },

    checkDecimalSeparator(value) {
        return typeof value === 'string' && value.includes(",") ? value.replace(",", ".") : value;
    },
    getComplexQuery(linkOperator, spatialRelation, fieldQueries) {
        const complexQuery = {};
        if (this.geometry) {
            complexQuery.geometry = {
                $intersects: this.geometry
            };
        } else if (spatialRelation === "current_extent") {
            const extent = this._mapWidgetModel.get("extent");
            complexQuery.geometry = {
                $intersects: extent
            };
        }
        complexQuery[linkOperator] = [];
        fieldQueries.forEach((fieldQuery) => {
            const fieldId = fieldQuery.selectedFieldId;
            const relationalOperator = fieldQuery.relationalOperator;
            const not = fieldQuery.not;
            let value = fieldQuery.value;
            const field = fieldQuery.fields.find((field) => field.id === fieldId);
            if (field.type === "number") {
                if (typeof value === "boolean") {
                    // do nothing
                } else if (Array.isArray(value)) {
                    value = value.map(subvalue => {
                        subvalue = this.checkDecimalSeparator(subvalue);
                        return parseFloat(subvalue);
                    });
                } else {
                    value = this.checkDecimalSeparator(value);
                    value = parseFloat(value);
                }
            }
            if (field.type === "date" && typeof value === "string") {
                value = new Date(value);
            }
            if (value === "" || value === null || value === undefined || value.length === 0) {
                return;
            }
            const obj1 = {};
            obj1[relationalOperator] = value;
            const obj2 = {};
            obj2[fieldId] = obj1;
            if (not) {
                const object = {$not: obj2};
                complexQuery[linkOperator].push(object);
            } else {
                complexQuery[linkOperator].push(obj2);
            }
        }, this);
        return complexQuery;
    },

    getSortOptions() {
        const attribute = this.selectedSortFieldName;
        return [
            {
                "attribute": attribute,
                "descending": this.sortDescending
            }
        ];
    },

    removeFieldQuery(fieldQuery, fieldQueries = this.fieldQueries) {
        const index = fieldQueries.indexOf(fieldQuery);
        if (index > -1) {
            fieldQueries.splice(index, 1);
        }
    },

    removeFieldQueries(fieldQueries = this.fieldQueries) {
        while (fieldQueries.length > 0) {
            fieldQueries.pop();
        }
    },

    addGraphicToView(geometry) {
        this.removeGraphicFromView();
        const view = this._mapWidgetModel.get("view");
        const symbol = this.getGraphicSymbol(geometry.type);
        const graphic = this.graphic = new Graphic({
            geometry: geometry,
            symbol: symbol
        });
        view.graphics.add(graphic);
    },

    removeGraphicFromView() {
        if (this.graphic) {
            const view = this._mapWidgetModel.get("view");
            view.graphics.remove(this.graphic);
        }
    },

    getGraphicSymbol(type) {
        switch (type) {
            case "polygon":
            case "extent":
                return this.symbols.polygon;
            case "point":
                return this.symbols.point;
        }
    },

    getSelectedStoreTitle(selectedStoreId) {
        const storeData = this.storeData.find((data) => data.id === selectedStoreId);
        return storeData?.text || null;
    },

    addStore(store, properties) {
        properties = properties || {};
        const id = store?.id;
        if (!id) {
            console.debug("Store has no id and will be ignored!");
            return;
        }
        const newStores = this.stores.slice(0);
        const index = newStores.findIndex((s) => s.id === id);
        if (index >= 0) {
            console.warn(`Store with id '${id}' was already registered! It is replaced by the new store.`);
            newStores.splice(index, 1);
        }
        newStores.push({
            id: id,
            title: store.title || properties.title || id,
            description: store.description || properties.description || ""
        });
        this.stores = newStores;
        return this.getStoreDataFromMetadata();
    },

    removeStore(store, properties) {
        properties = properties || {};
        const id = store?.id;
        if (!id) {
            return;
        }
        const stores = this.stores;
        const index = stores.findIndex((s) => s.id === id);
        if (index < 0) {
            return;
        }
        const newStores = stores.slice(0);
        newStores.splice(index, 1);
        this.stores = newStores;
        if (!this._selectedStoreStillAvailable(newStores)) {
            this.selectedStoreId = null;
        }
        this.getStoreDataFromMetadata();
    },

    _selectedStoreStillAvailable(stores) {
        return stores.find((store) => store.id === this.selectedStoreId);
    }
});
