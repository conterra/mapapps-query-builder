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
import Extent from "esri/geometry/Extent";

export default class QueryToolController {
    activate(componentContext) {
        this._bundleContext = componentContext.getBundleContext();
        this.i18n = this._i18n.get().ui;
    }

    deactivate() {
        this.hideWindow();
    }

    hideWindow() {
        let registration = this._serviceregistration;

        // clear the reference
        this._serviceregistration = null;

        if (registration) {
            // call unregister
            registration.unregister();
        }
    }

    onQueryToolActivated(event) {
        let store = event.store;
        if (!store) {
            // ignore
            return;
        }
        let complexQuery = event.complexQuery;
        let tool = this.tool = event.tool;

        if (event.options.editable === true) {
            let widget = this._editableQueryBuilderWidgetFactory.getWidget(event._properties, this, tool);
            let serviceProperties = {
                "widgetRole": "editableQueryBuilderWidget"
            };
            let interfaces = ["dijit.Widget"];
            this._serviceregistration = this._bundleContext.registerService(interfaces, widget, serviceProperties);
        } else {
            if (complexQuery.geometry) {
                let extent;
                if (this._queryBuilderProperties.useUserExtent) {
                    extent = this._mapWidgetModel.get("extent");
                    complexQuery.geometry = {
                        $contains: extent
                    };
                } else if (!complexQuery.geometry.$contains.type) {
                    extent = new Extent(complexQuery.geometry.$contains);
                    complexQuery.geometry = {
                        $contains: extent
                    };
                }
            }
            let options = {};
            if (event.options) {
                let count = event.options.count || -1;
                if (count >= 0) {
                    options.count = count;
                }
                options.ignoreCase = event.options.ignoreCase || false;
                options.locale = event.options.locale || {
                    "language": "en",
                    "country": "EN"
                };
                options.sort = event.options.sort || [];
                options.suggestContains = true;
            }

            this._queryController.query(store, complexQuery, options, tool);
        }
    }
}
