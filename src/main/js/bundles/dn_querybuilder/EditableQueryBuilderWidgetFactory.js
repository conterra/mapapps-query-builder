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

class EditableQueryBuilderWidgetFactory {

    getWidget(properties, queryController, tool) {
        let queryBuilderProperties = this._queryBuilderProperties;
        let model = this._queryBuilderWidgetModel;
        this.tool = tool;
        let complexQuery = properties.complexQuery;
        let editOptions = properties.options.editOptions;
        let linkOperator, spatialRelation;
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

        const vm = new Vue(QueryBuilderWidget);
        vm.i18n = this._i18n.get().ui;
        vm.editable = true;
        vm.storeData = model.storeData;
        vm.selectedStoreId = properties.storeId;
        vm.title = properties.title;
        vm.showSearchSettings = queryBuilderProperties.showQuerySettingsInEditableMode;
        vm.linkOperator = linkOperator;
        vm.disableLinkOperatorRadio = !editOptions.linkOperator;
        vm.spatialRelation = spatialRelation;
        vm.disableSpatialRelationRadio = !editOptions.spatialRelation;
        vm.fieldQueries = [];
        model.addFieldQueries(vm.fieldQueries, complexQuery[linkOperator], editOptions.editFields, properties.storeId);

        // listen to view model methods
        vm.$on('search', () => {
            model.search(vm.selectedStoreId, vm.linkOperator, vm.spatialRelation, vm.fieldQueries, this.tool);
        });

        return VueDijit(vm);
    }
}

module.exports = EditableQueryBuilderWidgetFactory;
