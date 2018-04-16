/*
 * Copyright (C) 2018 con terra GmbH (info@conterra.de)
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
import ct_when from "ct/_when";
import ServiceResolver from "apprt/ServiceResolver";

const QueryBuilderWidgetModel = declare({

    stores: [],
    storeData: [],
    selectedStoreId: null,
    linkOperator: null,
    spatialRelation: null,
    enableNegation: null,
    fieldQueries: [],
    loading: false,
    processing: false,

    activate(componentContext) {
        let serviceResolver = this.serviceResolver = new ServiceResolver();
        let bundleCtx = componentContext.getBundleContext();
        serviceResolver.setBundleCtx(bundleCtx);

        let queryBuilderProperties = this._queryBuilderProperties;
        this.getStoreData();
        this.linkOperator = queryBuilderProperties.defaultLinkOperator;
        this.spatialRelation = queryBuilderProperties.defaultSpatialRelation;
        this.enableNegation = queryBuilderProperties.allowNegation;
        this.fieldQueries = [];
    },

    getStoreData() {
        let stores = this.stores;
        let storeIds = this._properties.storeIds;
        let storeData = this._metadataAnalyzer.getStoreDataByIds(storeIds);
        ct_when(storeData, (data) => {
            if (data.length === 0) {
                data = this._metadataAnalyzer.getStoreData(stores);
            }
            this.storeData = data;
            this.selectedStoreId = data[0].id;
        });
    },

    search(selectedStoreId, linkOperator, spatialRelation, fieldQueries, tool) {
        let selectedStore = this.getSelectedStoreObj(selectedStoreId || this.selectedStoreId);
        let complexQuery = this.getComplexQuery(linkOperator || this.linkOperator, spatialRelation || this.spatialRelation, fieldQueries || this.fieldQueries);
        this._queryController.query(selectedStore, complexQuery, {}, tool || this._tool, this);
    },

    addFieldQuery(selectedStoreId) {
        let storeId = selectedStoreId || this.selectedStoreId;
        let store = this.getSelectedStoreObj(storeId);
        this.loading = true;
        let fieldData = this._metadataAnalyzer.getFields(store);
        ct_when(fieldData, (fields) => {
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
            let editOptions = editFields && editFields[i];
            let store = this.getSelectedStoreObj(selectedStoreId);
            let fieldId, not, relationalOperator, value;
            if (field.$not) {
                not = true;
                for (let a in field.$not) {
                    fieldId = a;
                    for (let b in field.$not[fieldId]) {
                        relationalOperator = b;
                        value = field.$not[fieldId][relationalOperator];
                    }
                }
            } else {
                not = false;
                for (let a in field) {
                    fieldId = a;
                    for (let b in field[fieldId]) {
                        relationalOperator = b;
                        value = field[fieldId][relationalOperator];
                    }
                }
            }
            this.loading = true;
            let fieldData = this._metadataAnalyzer.getFields(store);
            ct_when(fieldData, (fields) => {
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

    getSelectedStoreObj(id) {
        return this.serviceResolver.getService("ct.api.Store", "(id=" + id + ")");
    },

    getComplexQuery(linkOperator, spatialRelation, fieldQueries) {
        let complexQuery = {};
        if (spatialRelation === "current_extent") {
            let extent = this._mapWidgetModel.get("extent");
            complexQuery.geometry = {
                $contains: extent
            };
        }
        complexQuery[linkOperator] = [];
        fieldQueries.forEach((fieldQuery) => {
            let fieldId = fieldQuery.selectedFieldId;
            let relationalOperator = fieldQuery.relationalOperator;
            let not = fieldQuery.not;
            let value = fieldQuery.value;
            if (value === "") {
                return;
            }
            let obj1 = {};
            obj1[relationalOperator] = value;
            let obj2 = {};
            obj2[fieldId] = obj1;
            if (not) {
                let object = {$not: obj2};
                complexQuery[linkOperator].push(object);
            } else {
                complexQuery[linkOperator].push(obj2);
            }
        }, this);
        return complexQuery;
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
    }

});

module.exports = QueryBuilderWidgetModel;