/*
 * Copyright (C) 2024 con terra GmbH (info@conterra.de)
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

const DELAY = 200;

export default class FilterQueryBuilderWidgetFactory {

    activate(componentContext) {
        this._bundleContext = componentContext.getBundleContext();
        this.i18n = this._i18n.get().ui;
    }

    deactivate() {
        this.hideWidget();
    }

    showFilter(layerTitle, layer) {
        let layerId = layer.id;
        if (layer?.layer) {
            layerId = layer.layer.id + "/" + layer.id;
        }
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
                if (this.widget) {
                    this.changeExistingWidget(this.widget, store, layer);
                } else {
                    this.showWidget(store, layer);
                }
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

    changeExistingWidget(widget, store, layer) {
        const window = ct_util.findEnclosingWindow(widget);
        if (window) {
            window.set("title", store.title);
        }
        const model = this._queryBuilderWidgetModel;
        const vm = this.widget.getVM();
        this.#listenToViewModelEvents(vm, layer, model);
        this.#initializeFilterUI(vm, store, model);
    }

    showWidget(store, layer) {
        this.hideWidget();
        const model = this._queryBuilderWidgetModel;
        const widget = this.widget = this.getWidget(store);
        const vm = widget.getVM();
        this.#listenToViewModelEvents(vm, layer, model);
        this.#initializeFilterUI(vm, store, model);
        const serviceProperties = {
            "widgetRole": "filterQueryBuilderWidget"
        };
        const interfaces = ["dijit.Widget"];
        this._widgetServiceregistration = this._bundleContext.registerService(interfaces, widget, serviceProperties);
        setTimeout(() => {
            const window = ct_util.findEnclosingWindow(widget);
            if (window) {
                window.set("title", store.title);
                window.on("Close", () => {
                    this.hideWidget();
                    this.unregisterStore();
                });
            }
        }, DELAY);
    }

    hideWidget() {
        this.widget = null;
        const registration = this._widgetServiceregistration;

        // clear the reference
        this._widgetServiceregistration = null;

        if (registration) {
            // call unregister
            registration.unregister();
        }
    }

    getWidget() {
        const model = this._queryBuilderWidgetModel;

        const vm = new Vue(QueryBuilderWidget);
        vm.i18n = this._i18n.get().ui;
        vm.filter = true;
        vm.fieldQueries = [];
        vm.linkOperator = model.defaultLinkOperator;
        vm.spatialRelation = "everywhere";
        vm.allowMultipleSpatialInputs = false;
        vm.enableDistinctValues = model.enableDistinctValues;
        vm.visibleElements = {
            fieldInfos: model.visibleElements.filterMode.fieldInfos,
            linkOperator: true,
            spatialRelation: model.visibleElements.filterMode.spatialRelation,
            spatialInputActions: false,
            sortSelect: false
        };

        const widget = VueDijit(vm);
        widget.own({
            remove() {
                vm.$off();
            }
        });
        return widget;
    }

    #listenToViewModelEvents(vm, layer, model) {
        vm.$off();
        // listen to view model methods
        vm.$on('search', () => {
            model.search(vm.selectedStoreId, vm.linkOperator,
                vm.spatialRelation, vm.fieldQueries, null, {}, false, layer);
        });
        vm.$on('cancel-search', () => {
            model.cancelSearch();
        });
        vm.$on('getDistinctValues', (args) => {
            model.getDistinctValues(args.value, args.selectedField, vm.selectedStoreId);
        });
        vm.$on('add', () => {
            model.addFieldQuery(vm.selectedStoreId, vm.fieldQueries);
        });
        vm.$on('remove', (fieldQuery) => {
            model.removeFieldQuery(fieldQuery, vm.fieldQueries);
        });
    }

    #initializeFilterUI(vm, store, model) {
        vm.selectedStoreId = store.id;
        vm.storeData = model.getStoreDataFromMetadata();
        vm.fieldQueries = [];
        model.addFieldQuery(store.id, vm.fieldQueries);
    }
}
