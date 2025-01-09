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

export default class EditableQueryBuilderWidgetFactory {

    #queryBuilderWidgetModelBinding = undefined;

    getWidget(properties, tool) {
        const model = this._queryBuilderWidgetModel;
        const complexQuery = properties.complexQuery;
        const editOptions = properties.options.editOptions;
        let linkOperator;
        let spatialRelation;
        if (complexQuery.geometry) {
            spatialRelation = "current_extent";
        } else {
            spatialRelation = "everywhere";
        }
        if (complexQuery.$and) {
            linkOperator = "$and";
        } else if (complexQuery.$or) {
            linkOperator = "$or";
        }

        const options = {};
        const count = properties.options.count;
        if (count >= 0) {
            options.count = count;
        }
        options.ignoreCase = properties.options.ignoreCase;
        options.locale = properties.options.locale;
        options.sort = properties.options.sort || undefined;

        const vm = new Vue(QueryBuilderWidget);
        vm.i18n = this._i18n.get().ui;
        vm.editable = true;
        vm.storeData = model.storeData;
        vm.selectedStoreId = properties.storeId;
        vm.linkOperator = linkOperator;
        vm.disableLinkOperatorRadio = !editOptions.linkOperator;
        vm.spatialRelation = spatialRelation;
        vm.disableSpatialRelationRadio = !editOptions.spatialRelation;
        vm.fieldQueries = [];
        vm.visibleElements = {
            fieldInfos: model.visibleElements.predefinedMode.fieldInfos,
            spatialRelation: model.visibleElements.predefinedMode.spatialRelation,
            linkOperator: model.visibleElements.predefinedMode.linkOperator,
            spatialInputActions: false,
            sortSelect: model.visibleElements.predefinedMode.sortSelect,
            replaceOpenedTables: model.visibleElements.predefinedMode.replaceOpenedTables
        };
        vm.replaceOpenedTables = model.replaceOpenedTables;
        model.addFieldQueries(complexQuery[linkOperator], editOptions.editFields, properties.storeId, vm.fieldQueries);

        // listen to view model methods
        vm.$on('search', () => {
            model.search(vm.selectedStoreId, vm.linkOperator,
                vm.spatialRelation, vm.fieldQueries, tool, options, true, null);
        });
        vm.$on('cancel-search', () => {
            model.cancelSearch();
        });
        vm.$on('getDistinctValues', (args) => {
            model.getDistinctValues(args.value, args.selectedField, vm.selectedStoreId);
        });
        this.#queryBuilderWidgetModelBinding = Binding.for(vm, model)
            .syncAll("replaceOpenedTables", "operators")
            .enable()
            .syncToLeftNow();

        const widget = VueDijit(vm);
        widget.own({
            remove() {
                vm.$off();
            }
        });
        return widget;
    }
}
