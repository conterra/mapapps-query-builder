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
import QueryBuilderWidget from "./QueryBuilderWidget.vue";
import Vue from "apprt-vue/Vue";
import VueDijit from "apprt-vue/VueDijit";
import Binding from "apprt-binding/Binding";

class QueryBuilderWidgetFactory {

    activate(componentContext) {
        this._initComponent();
    }

    createInstance() {
        return VueDijit(this.queryBuilderWidget);
    }

    _initComponent() {
        const vm = this.queryBuilderWidget = new Vue(QueryBuilderWidget);
        let model = this._queryBuilderWidgetModel;
        vm.i18n = this._i18n.get().ui;
        vm.storeData = model.storeData;
        vm.selectedStoreId = model.selectedStoreId;
        vm.linkOperator = model.linkOperator;
        vm.spatialRelation = model.spatialRelation;
        vm.enableNegation = model.allowNegation;
        vm.fieldQueries = model.fieldQueries;
        vm.loading = model.loading;

        // listen to view model methods
        vm.$on('startup', () => {
            model.addFieldQuery();
        });
        vm.$on('search', () => {
            model.search();
        });
        vm.$on('add', () => {
            model.addFieldQuery()
        });
        vm.$on('remove', (fieldQuery) => {
            model.removeFieldQuery(fieldQuery);
        });
        vm.$on('storeChanged', (selectedStoreId) => {
            model.removeFieldQueries();
            model.addFieldQuery(selectedStoreId);
        });

        Binding
            .create()
            .bindTo(vm, model)
            .syncAll("selectedStoreId", "linkOperator", "spatialRelation", "fieldQueries", "loading", "processing", "storeData")
            .enable();
    }

}

module.exports = QueryBuilderWidgetFactory;