/*
 * Copyright (C) 2020 con terra GmbH (info@conterra.de)
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

const _queryBuilderWidgetModelBinding = Symbol("_queryBuilderWidgetModelBinding");
const _storeCountToToggleToolBinding = Symbol("_storeCountToToggleToolBinding");

export default class QueryBuilderWidgetFactory {

    activate() {
        this._initComponent();
        this[_storeCountToToggleToolBinding] = this.bindStoreCountToToggleTool();
    }

    deactivate() {
        this[_queryBuilderWidgetModelBinding].unbind();
        this[_queryBuilderWidgetModelBinding] = undefined;
        this[_storeCountToToggleToolBinding].unbind();
        this[_storeCountToToggleToolBinding] = undefined;
    }

    createInstance() {
        const model = this._queryBuilderWidgetModel;
        model.activeTool = true;
        return VueDijit(this.queryBuilderWidget);
    }

    _initComponent() {
        const vm = this.queryBuilderWidget = new Vue(QueryBuilderWidget);
        const model = this._queryBuilderWidgetModel;
        vm.i18n = this._i18n.get().ui;

        // listen to view model methods
        vm.$on('startup', () => {
            model.addFieldQuery();
            model.getFieldData();
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
            model.getFieldData(selectedStoreId);
        });
        vm.$on('selectSpatialInputAction', (id) => {
            model.selectSpatialInputAction(id);
        });
        vm.$on('resetSpatialInput', () => {
            model.resetSpatialInput();
        });

        this[_queryBuilderWidgetModelBinding] = Binding.for(vm, model)
            .syncAll("selectedStoreId", "fieldQueries", "selectedSortFieldName", "sortDescending", "linkOperator", "spatialRelation", "activeSpatialInputAction", "allowMultipleSpatialInputs")
            .syncAllToLeft("locale", "storeData", "sortFieldData", "showSpatialInputActions", "spatialInputActions",
                "activeSpatialInputActionDescription", "showSortSelectInUserMode", "allowNegation", "loading", "processing", "activeTool")
            .enable()
            .syncToLeftNow();
    }

    bindStoreCountToToggleTool() {
        const model = this._queryBuilderWidgetModel;
        const tool = this._tool;
        const binding = Binding.create()
            .syncToRight("stores", "enabled", (stores) => {
                return !!stores.length;
            });
        return binding.bindTo(model, tool).enable().syncToRightNow();
    }
}
