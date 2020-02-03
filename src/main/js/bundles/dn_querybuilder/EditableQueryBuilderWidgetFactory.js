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
import QueryBuilderWidget from "./QueryBuilderWidget.vue";
import Vue from "apprt-vue/Vue";
import VueDijit from "apprt-vue/VueDijit";
import Binding from "apprt-binding/Binding";

const _spatialInputActionServiceBinding = Symbol("_spatialInputActionServiceBinding");

export default class EditableQueryBuilderWidgetFactory {

    deactivate() {
        this[_spatialInputActionServiceBinding].unbind();
        this[_spatialInputActionServiceBinding] = undefined;
    }

    getWidget(properties, queryController, tool) {
        const queryBuilderProperties = this._queryBuilderProperties;
        const model = this._queryBuilderWidgetModel;
        const spatialInputActionService = this._spatialInputActionService;
        this.tool = tool;
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

        const vm = new Vue(QueryBuilderWidget);
        vm.i18n = this._i18n.get().ui;
        vm.editable = true;
        vm.storeData = model.storeData;
        vm.selectedStoreId = properties.storeId;
        vm.title = properties.title;
        vm.showQuerySettings = queryBuilderProperties.showQuerySettingsInEditableMode;
        vm.showSpatialInputActions = queryBuilderProperties.showSpatialInputActions;
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

        vm.$on('selectSpatialInputAction', (id) => {
            spatialInputActionService.getById(id).trigger({queryBuilderSelection: true}).then((geometry) => {
                vm.activeSpatialInputAction = null;
                model.geometry = geometry;
            }, (error) => {
                vm.activeSpatialInputAction = null;
            });
        });

        this[_spatialInputActionServiceBinding] = Binding.for(vm, spatialInputActionService)
            .syncToLeft("actions", "spatialInputActions",
                (actions) => actions.map(({id, title, description, iconClass}) => {
                    return {
                        id,
                        title,
                        description,
                        iconClass
                    }
                }))
            .enable()
            .syncToLeftNow();

        return VueDijit(vm);
    }
}
