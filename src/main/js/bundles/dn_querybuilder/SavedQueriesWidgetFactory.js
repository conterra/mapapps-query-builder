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
import SavedQueries from "./SavedQueries.vue";
import Vue from "apprt-vue/Vue";
import VueDijit from "apprt-vue/VueDijit";
import ct_util from "ct/ui/desktop/util";
import Binding from "apprt-binding/Binding";

const DELAY = 1000;

export default class SavedQueriesWidgetFactory {

    #bundleContext = undefined;
    #serviceRegistration = undefined;
    #binding = undefined;

    activate(componentContext) {
        this.#bundleContext = componentContext.getBundleContext();
        this.i18n = this._i18n.get().ui;
    }

    deactivate() {
        this.hideWindow();
    }

    showSavedQueriesWidget() {
        const widget = this._getWidget();
        const serviceProperties = {
            "widgetRole": "savedQueriesWidget"
        };
        const interfaces = ["dijit.Widget"];
        this.hideWindow();
        this.#serviceRegistration = this.#bundleContext.registerService(interfaces, widget, serviceProperties);
        setTimeout(() => {
            const window = ct_util.findEnclosingWindow(widget);
            window?.on("Close", () => {
                this.hideWindow();
                widget.destroyRecursive();
            });
        }, DELAY);
    }

    hideWindow() {
        const registration = this.#serviceRegistration;

        // clear the reference
        this.#serviceRegistration = undefined;

        if (registration) {
            // call unregister
            registration.unregister();
        }
    }

    _getWidget() {
        const model = this._queryBuilderWidgetModel;
        const vm = new Vue(SavedQueries);
        vm.i18n = this._i18n.get().ui;

        vm.$on("load", (query) => {
            model.loadQuery(query);
        })

        this.#binding = Binding.for(vm, model)
            .syncAllToLeft("savedQueries")
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
