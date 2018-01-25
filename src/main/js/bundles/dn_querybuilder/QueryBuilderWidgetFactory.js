/*
 * Copyright (C) 2017 con terra GmbH (info@conterra.de)
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
import QueryBuilderWidget from "./QueryBuilderWidget.vue";
import Vue from "apprt-vue/Vue";
import VueDijit from "apprt-vue/VueDijit";
import Binding from "apprt-binding/Binding";
import ct_array from "ct/array";
import ct_when from "ct/_when";
import ServiceResolver from "apprt/ServiceResolver";

class QueryBuilderWidgetFactory {

    activate(componentContext) {
        let serviceResolver = this.serviceResolver = new ServiceResolver();
        let bundleCtx = componentContext.getBundleContext();
        serviceResolver.setBundleCtx(bundleCtx);
        this._initComponent();
    }

    createInstance() {
        return VueDijit(this.queryBuilderWidget);
    }

    _initComponent() {
        let stores = this._stores;
        let storeIds = this._properties.storeIds;
        let storeData = this._metadataAnalyzer.getStoreDataByIds(storeIds);
        if (storeData.length === 0) {
            storeData = this._metadataAnalyzer.getStoreData(stores);
        }

        let queryBuilderProperties = this._queryBuilderProperties;
        const vm = this.vm = this.queryBuilderWidget = new Vue(QueryBuilderWidget);
        vm.i18n = this._i18n.get().ui;
        vm.storeData = storeData;
        vm.selectedStoreId = stores[0].id;
        vm.linkOperator = queryBuilderProperties.defaultLinkOperator;
        vm.spatialRelation = queryBuilderProperties.defaultSpatialRelation;
        vm.enableNegation = queryBuilderProperties.allowNegation;
        vm.fieldQueries = [];

        this.addFieldQuery();

        // listen to view model methods
        vm.$on('search', () => {
            this.search();
        });
        vm.$on('add', () => {
            this.addFieldQuery()
        });
        vm.$on('remove', (fieldQuery) => {
            ct_array.arrayRemove(this.vm.fieldQueries, fieldQuery);
        });
        vm.$on('storeChanged', (selectedStoreId) => {
            while (this.vm.fieldQueries.length > 0) {
                this.vm.fieldQueries.pop();
            }
            this.addFieldQuery(selectedStoreId);
        });

        Binding
            .create()
            .bindTo(vm)
            .syncAll("selectedStoreId", "matchValue", "searchEverywhere", "fieldQueries")
            .enable();
    }

    search() {
        let vm = this.vm;
        let selectedStoreId = vm.selectedStoreId;
        let selectedStore = this.getSelectedStoreObj(selectedStoreId);
        let linkOperator = vm.linkOperator;
        let spatialRelation = vm.spatialRelation;
        let fieldQueries = vm.fieldQueries;
        let complexQuery = this.getComplexQuery(linkOperator, spatialRelation, fieldQueries);
        this._queryController.query(selectedStore, complexQuery, {}, this._tool);
    }

    addFieldQuery(selectedStoreId) {
        let vm = this.vm;
        let storeId = selectedStoreId || vm.selectedStoreId;
        let store = this.getSelectedStoreObj(storeId);
        vm.loading = true;
        let fieldData = this._metadataAnalyzer.getFields(store);
        ct_when(fieldData, (fields) => {
            vm.fieldQueries.push({
                fields: fields,
                not: false,
                selectedFieldId: fields[0].id,
                relationalOperator: "$eq",
                value: (fields[0].codedValues[0] && fields[0].codedValues[0].code) || fields[0].distinctValues[0] || ""
            });
            vm.loading = false;
        }, this);
    }

    getSelectedStoreObj(id) {
        return this.serviceResolver.getService("ct.api.Store", "(id=" + id + ")");
    }

    getComplexQuery(linkOperator, spatialRelation, fieldQueries) {
        let complexQuery = {};
        if (spatialRelation === "current_extent") {
            let extent = this.mapState.getExtent();
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
    }
}

module.exports = QueryBuilderWidgetFactory;