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
import ct_array from "ct/array";
import ct_when from "ct/_when";
import ServiceResolver from "apprt/ServiceResolver";

class EditableQueryBuilderWidgetFactory {

    activate(componentContext) {
        let serviceResolver = this.serviceResolver = new ServiceResolver();
        let bundleCtx = componentContext.getBundleContext();
        serviceResolver.setBundleCtx(bundleCtx);
    }

    getWidget(properties, queryController, tool) {
        this.queryController = queryController;
        this.tool = tool;
        let storeData = this._metadataAnalyzer.getStoreDataByIds([properties.storeId]);
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

        const vm = this.vm = new Vue(QueryBuilderWidget);
        vm.i18n = this._i18n.get().ui;
        vm.editable = true;
        vm.storeData = storeData;
        vm.selectedStoreId = properties.storeId;
        vm.linkOperator = linkOperator;
        vm.disableLinkOperatorRadio = !editOptions.linkOperator;
        vm.spatialRelation = spatialRelation;
        vm.disableSpatialRelationRadio = !editOptions.spatialRelation;
        vm.fieldQueries = [];
        this.addFieldQueries(complexQuery[linkOperator], editOptions.editFields);

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

        return VueDijit(vm);
    }

    search() {
        let vm = this.vm;
        let selectedStoreId = vm.selectedStoreId;
        let selectedStore = this.getSelectedStoreObj(selectedStoreId);
        let linkOperator = vm.linkOperator;
        let spatialRelation = vm.spatialRelation;
        let fieldQueries = vm.fieldQueries;
        let complexQuery = this.getComplexQuery(linkOperator, spatialRelation, fieldQueries);
        this.queryController.query(selectedStore, complexQuery, {}, this.tool);
    }

    addFieldQueries(fields, editFields) {
        fields.forEach((field, i) => {
            let editOptions = editFields && editFields[i];
            let vm = this.vm;
            let storeId = vm.selectedStoreId;
            let store = this.getSelectedStoreObj(storeId);
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
            vm.loading = true;
            let fieldData = this._metadataAnalyzer.getFields(store);
            ct_when(fieldData, (fields) => {
                vm.fieldQueries.push({
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
                vm.loading = false;
            }, this);
        }, this);
    }

    getSelectedStoreObj(id) {
        return this.serviceResolver.getService("ct.api.Store", "(id=" + id + ")");
    }

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
    }
}

module.exports = EditableQueryBuilderWidgetFactory;