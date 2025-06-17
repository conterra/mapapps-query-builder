/*
 * Copyright (C) 2025 con terra GmbH (info@conterra.de)
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

export default class QueryBuilderWidgetFactory {

    #vm = undefined;
    #queryBuilderWidgetModelBinding = undefined;
    #storeDataCountToToggleToolBinding = undefined;

    activate() {
        this._initComponent();
        this.#storeDataCountToToggleToolBinding = this.bindStoreDataCountToToggleTool();
    }

    deactivate() {
        this.#queryBuilderWidgetModelBinding.unbind();
        this.#queryBuilderWidgetModelBinding = undefined;
        this.#storeDataCountToToggleToolBinding.unbind();
        this.#storeDataCountToToggleToolBinding = undefined;
    }

    createInstance() {
        const model = this._queryBuilderWidgetModel;
        model.activeTool = true;
        const vm = this.#vm;
        const widget = VueDijit(this.#vm);
        widget.own({
            remove() {
                vm.$off();
            }
        });
        return widget;
    }

    _initComponent() {
        const vm = this.#vm = new Vue(QueryBuilderWidget);
        const model = this._queryBuilderWidgetModel;
        vm.i18n = this._i18n.get().ui;
        vm.visibleElements = {
            fieldInfos: model.visibleElements.defaultMode.fieldInfos,
            spatialRelation: model.visibleElements.defaultMode.spatialRelation,
            linkOperator: model.visibleElements.defaultMode.linkOperator,
            spatialInputActions: model.visibleElements.defaultMode.spatialInputActions,
            sortSelect: model.visibleElements.defaultMode.sortSelect,
            replaceOpenedTables: model.visibleElements.defaultMode.replaceOpenedTables,
            closeOnQueryCheckbox: model.visibleElements.defaultMode.closeOnQueryCheckbox
        };

        // listen to view model methods
        vm.$on('startup', () => {
            model.removeFieldQueries();
            model.addFieldQuery();
            model.getFieldData();
        });
        vm.$on('search', () => {
            model.search();
        });
        vm.$on('cancel-search', () => {
            model.cancelSearch();
        });
        vm.$on('getDistinctValues', (args) => {
            model.getDistinctValues(args.value, args.selectedField);
        });
        vm.$on('add', () => {
            model.addFieldQuery();
        });
        vm.$on('remove', (fieldQuery) => {
            model.removeFieldQuery(fieldQuery);
        });
        vm.$on('store-changed', (selectedStoreId) => {
            model.set("selectedStoreId", selectedStoreId);
        });
        vm.$on('selectSpatialInputAction', (id) => {
            model.selectSpatialInputAction(id);
        });
        vm.$on('reset-spatial-input', () => {
            model.resetSpatialInput();
        });

        this.#queryBuilderWidgetModelBinding = Binding.for(vm, model)
            .syncAll("selectedStoreId", "fieldQueries", "selectedSortFieldName",
                "sortDescending", "linkOperator", "spatialRelation",
                "activeSpatialInputAction", "allowMultipleSpatialInputs", "negateSpatialInput", "replaceOpenedTables", "closeOnQuery")
            .syncAllToLeft("locale", "storeData", "sortFieldData", "enableDistinctValues",
                "spatialInputActions", "activeSpatialInputActionDescription",
                "loading", "processing", "activeTool", "operators")
            .enable()
            .syncToLeftNow();
    }

    bindStoreDataCountToToggleTool() {
        const model = this._queryBuilderWidgetModel;
        const tool = this._tool;
        const binding = Binding.create()
            .syncToRight("storeData", "enabled", (storeData) => !!storeData.length);
        return binding.bindTo(model, tool).enable().syncToRightNow();
    }
}
