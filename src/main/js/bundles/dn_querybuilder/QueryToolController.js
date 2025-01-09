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
import Extent from "esri/geometry/Extent";
import ct_util from "ct/ui/desktop/util";

const DELAY = 200;

export default class QueryToolController {
    activate(componentContext) {
        this._bundleContext = componentContext.getBundleContext();
        this.i18n = this._i18n.get().ui;
    }

    deactivate() {
        this.hideWindow();
    }

    hideWindow() {
        const registration = this._serviceregistration;

        // clear the reference
        this._serviceregistration = null;

        if (registration) {
            // call unregister
            registration.unregister();
        }
    }

    onQueryToolActivated(event) {
        const store = event.store;
        if (!store) {
            // ignore
            return;
        }
        const complexQuery = Object.assign({}, event.complexQuery);
        const tool = this.tool = event.tool;

        if (event.options && event.options.editable === true) {
            this.hideWindow();
            const widget = this._editableQueryBuilderWidgetFactory.getWidget(event, tool);
            const serviceProperties = {
                "widgetRole": "editableQueryBuilderWidget"
            };
            const interfaces = ["dijit.Widget"];
            this._serviceregistration = this._bundleContext.registerService(interfaces, widget, serviceProperties);
            setTimeout(() => {
                const window = ct_util.findEnclosingWindow(widget);
                if (window) {
                    window.set("title", tool.title);
                    window.on("Close", () => {
                        this.hideWindow();
                    });
                }
            }, DELAY);
        } else {
            if (complexQuery.geometry) {
                let extent;
                if (this._queryBuilderWidgetModel.useCurrentMapExtent) {
                    extent = this._mapWidgetModel.get("extent");
                    complexQuery.geometry = {
                        $intersects: extent
                    };
                } else if (complexQuery.geometry.$intersects) {
                    extent = new Extent(complexQuery.geometry.$intersects);
                    complexQuery.geometry = {
                        $intersects: extent
                    };
                } else if (complexQuery.geometry.$contains) {
                    extent = new Extent(complexQuery.geometry.$contains);
                    complexQuery.geometry = {
                        $contains: extent
                    };
                }
            }
            const options = {};
            if (event.options) {
                const count = event.options && event.options.count || -1;
                if (count >= 0) {
                    options.count = count;
                }
                options.ignoreCase = event.options.ignoreCase || false;
                options.locale = event.options.locale || {
                    "language": "en",
                    "country": "EN"
                };
                if (event.options.sort) {
                    options.sort = event.options.sort;
                }
                options.suggestContains = true;
            }

            this._queryController.query(store, complexQuery, options, tool, this._queryBuilderWidgetModel);
        }
    }
}
