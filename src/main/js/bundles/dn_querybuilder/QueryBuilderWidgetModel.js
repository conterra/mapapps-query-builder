/*
 * Copyright (C) 2019 con terra GmbH (info@conterra.de)
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
import ct_array from "ct/array";
import apprt_when from "apprt-core/when";
import ct_lang from "ct/_lang";
import ServiceResolver from "apprt/ServiceResolver";
import Locale from "ct/Locale";
import Connect from "ct/_Connect";

export default declare({

    locale: "en",
    stores: [],
    storeData: [],
    fieldData: [],
    selectedStoreId: null,
    selectedSortFieldName: null,
    sortDescending: false,
    linkOperator: null,
    spatialRelation: null,
    enableNegation: null,
    fieldQueries: [],
    loading: false,
    processing: false,
    showSortSelectInUserMode: false,
    activeTool: false,

    activate(componentContext) {
        this.locale = Locale.getCurrent().getLanguage();
        const serviceResolver = this.serviceResolver = new ServiceResolver();
        const bundleCtx = componentContext.getBundleContext();
        serviceResolver.setBundleCtx(bundleCtx);

        const queryBuilderProperties = this._queryBuilderProperties;
        this.getStoreData();
        this.linkOperator = queryBuilderProperties.defaultLinkOperator;
        this.spatialRelation = queryBuilderProperties.defaultSpatialRelation;
        this.enableNegation = queryBuilderProperties.allowNegation;
        this.showSortSelectInUserMode = queryBuilderProperties.showSortSelectInUserMode;
        this.fieldQueries = [];

        const connect = new Connect();
        connect.connect(this._tool, "onActivate", () => {
            this.activeTool = true;
            this.getStoreData();
        });
        connect.connect(this._tool, "onDeactivate", () => {
            this.activeTool = false;
        });
    },

    getStoreData() {
        const stores = this.stores;
        const storeIds = this._properties.storeIds;
        const storeData = this._metadataAnalyzer.getStoreDataByIds(storeIds);
        apprt_when(storeData, (data) => {
            if (data.length === 0) {
                data = this._metadataAnalyzer.getStoreData(stores);
            }
            this.storeData = data;
            this.selectedStoreId = data[0].id;
            this.getFieldData();
        });
    },

    getFieldData(selectedStoreId) {
        const fieldData = this._getSelectedFieldData(selectedStoreId || this.selectedStoreId);
        apprt_when(fieldData, (data) => {
            this.fieldData = data;
            this.selectedSortFieldName = data[0].id;
        });
    },

    search(selectedStoreId, linkOperator, spatialRelation, fieldQueries, tool) {
        const selectedStore = this.getSelectedStoreObj(selectedStoreId || this.selectedStoreId);
        const complexQuery = this.getComplexQuery(linkOperator || this.linkOperator, spatialRelation || this.spatialRelation, fieldQueries || this.fieldQueries);
        let sortOptions = [];
        const options = {
            suggestContains: false
        };
        if (this._queryBuilderProperties.showSortSelectInUserMode) {
            sortOptions = this.getSortOptions();
            options.sort = sortOptions;
        }
        this._queryController.query(selectedStore, complexQuery, options, tool || this._tool, this);
    },

    addFieldQuery(selectedStoreId) {
        this.loading = true;
        const fieldData = this._getSelectedFieldData(selectedStoreId);
        apprt_when(fieldData, (fields) => {
            this.fieldQueries.push({
                fields: fields,
                not: false,
                selectedFieldId: fields[0].id,
                relationalOperator: "$eq",
                value: (fields[0].codedValues[0] && fields[0].codedValues[0].code) || fields[0].distinctValues[0] || ""
            });
            this.loading = false;
        }, this);
    },

    addFieldQueries(fieldQueries, fields, editFields, selectedStoreId) {
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
            const fieldData = this._getSelectedFieldData(selectedStoreId);
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

    _getSelectedFieldData(selectedStoreId) {
        const storeId = selectedStoreId || this.selectedStoreId;
        const store = this.getSelectedStoreObj(storeId);
        if (!store) {
            return;
        }
        return this._metadataAnalyzer.getFields(store);
    },

    getSelectedStoreObj(id) {
        return this.serviceResolver.getService("ct.api.Store", "(id=" + id + ")");
    },

    getComplexQuery(linkOperator, spatialRelation, fieldQueries) {
        const complexQuery = {};
        if (spatialRelation === "current_extent") {
            const extent = this._mapWidgetModel.get("extent");
            complexQuery.geometry = {
                $contains: extent
            };
        }
        complexQuery[linkOperator] = [];
        fieldQueries.forEach((fieldQuery) => {
            const fieldId = fieldQuery.selectedFieldId;
            const relationalOperator = fieldQuery.relationalOperator;
            const not = fieldQuery.not;
            const value = fieldQuery.value;
            if (value === "" || value === null) {
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

    removeFieldQuery(fieldQuery) {
        ct_array.arrayRemove(this.fieldQueries, fieldQuery);
    },

    removeFieldQueries() {
        while (this.fieldQueries.length > 0) {
            this.fieldQueries.pop();
        }
    },

    addStores(store) {
        this.stores.push(store);
        this.getStoreData();
    },

    removeStores(store) {
        this.stores.splice(this.stores.indexOf(store), 1);
        this.getStoreData();
    }
});
