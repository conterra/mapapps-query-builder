/*
 * Copyright (C) 2021 con terra GmbH (info@conterra.de)
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
import ct_util from "ct/ui/desktop/util";

const DELAY = 1000;

export default class FilterQueryBuilderWidgetFactory {

    activate(componentContext) {
        this._bundleContext = componentContext.getBundleContext();
        this.i18n = this._i18n.get().ui;
    }

    deactivate() {
        this.hideWidget();
    }

    showFilter(layerId, layerTitle) {
        const filterTitle = this.i18n.filterTitle + " " + layerTitle;
        const storeProps = {
            id: "filter_store_" + new Date().getTime(),
            layerId: layerId
        };

        this._agsStoreFactory.createStore(storeProps).then((store) => {
            store.title = filterTitle;
            store.useIn = ["querybuilder"];
            store.load().then(() => {
                this.registerStore(store);
                this.showWidget(store, layerTitle);
            });
        });
    }

    registerStore(store) {
        const serviceProps = Object.assign({}, store);
        this._storeServiceregistration = this._bundleContext.registerService(["ct.api.Store"], store, serviceProps);
    }

    unregisterStore() {
        const registration = this._storeServiceregistration;

        // clear the reference
        this._storeServiceregistration = null;

        if (registration) {
            // call unregister
            registration.unregister();
        }
    }

    showWidget(store) {
        this.hideWidget();
        const widget = this.getWidget(store);
        const serviceProperties = {
            "widgetRole": "editableQueryBuilderWidget"
        };
        const interfaces = ["dijit.Widget"];
        this._widgetServiceregistration = this._bundleContext.registerService(interfaces, widget, serviceProperties);
        setTimeout(() => {
            const window = ct_util.findEnclosingWindow(widget);
            window?.on("Close", () => {
                this.hideWidget();
            });
        }, DELAY);
    }

    hideWidget() {
        const registration = this._widgetServiceregistration;

        // clear the reference
        this._widgetServiceregistration = null;

        if (registration) {
            // call unregister
            registration.unregister();
        }
    }

    getWidget(store) {
        const queryBuilderProperties = this._queryBuilderProperties;
        const model = this._queryBuilderWidgetModel;

        const vm = new Vue(QueryBuilderWidget);
        vm.i18n = this._i18n.get().ui;
        vm.filter = true;
        vm.selectedStoreId = store.id;
        vm.title = store.title;
        vm.fieldQueries = [];
        vm.linkOperator = queryBuilderProperties.defaultLinkOperator;
        vm.spatialRelation = queryBuilderProperties.defaultSpatialRelation;
        vm.showSpatialInputActions = queryBuilderProperties.showSpatialInputActions;
        vm.allowNegation = queryBuilderProperties.allowNegation;
        vm.allowMultipleSpatialInputs = queryBuilderProperties.allowMultipleSpatialInputs;
        vm.enableDistinctValues = queryBuilderProperties.enableDistinctValues;

        model.getStoreDataFromMetadata().then((storeData)=>{
            vm.storeData = storeData;
            model.addFieldQuery(store.id, vm.fieldQueries);
        });

        // listen to view model methods
        vm.$on('search', () => {
            model.search(vm.selectedStoreId, vm.linkOperator,
                vm.spatialRelation, vm.fieldQueries, null, {}, false, true);
        });
        vm.$on('cancel-search', () => {
            model.cancelSearch();
        });
        vm.$on('getDistinctValues', (args) => {
            model.getDistinctValues(args.value, args.fieldQuery, vm.selectedStoreId);
        });
        vm.$on('add', () => {
            model.addFieldQuery(vm.selectedStoreId, vm.fieldQueries);
        });
        vm.$on('remove', (fieldQuery) => {
            model.removeFieldQuery(fieldQuery, vm.fieldQueries);
        });

        const widget = VueDijit(vm);
        widget.own({
            remove() {
                vm.$off();
            }
        });
        return widget;
    }
}
