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
define([
    "dojo/_base/declare",
    "dojo/_base/array",

    "ct/_when",
    "ct/store/Filter",

    "./MemorySelectionStore",
    "./EditableQueryBuilderWidget"
], function (declare, d_array,
             ct_when, Filter,
             MemorySelectionStore, EditableQueryBuilderWidget) {
    return declare([], {
        activate: function (componentContext) {
            this.inherited(arguments);
            this._bundleContext = componentContext.getBundleContext();
            this.i18n = this._i18n.get().wizard;
        },
        deactivate: function () {
            var registration = this._serviceregistration;

            // clear the reference
            this._serviceregistration = null;

            if (registration) {
                // call unregister
                registration.unregister();
            }
        },
        onQueryToolActivated: function (event) {
            var store = event.store;
            if (!store) {
                // ignore
                return;
            }
            var customquery = event.customquery;
            var tool = this.tool = event.tool;
            if (event.options && event.options.editable === true) {
                var props = event._properties;
                var i18n = event._i18n.get();
                var replacer = this._replacer;
                var metadataAnalyzer = this._metadataAnalyzer;
                var queryBuilderProperties = this._queryBuilderProperties;
                var widget = this.widget = new EditableQueryBuilderWidget({
                    properties: props,
                    i18n: i18n.wizard,
                    tool: tool,
                    store: store,
                    replacer: replacer,
                    metadataAnalyzer: metadataAnalyzer,
                    queryBuilderProperties: queryBuilderProperties,
                    mapState: this._mapState,
                    queryController: this
                });
                var serviceProperties = {
                    "widgetRole": "editableQueryBuilderWidget"
                };
                var interfaces = ["dijit.Widget"];
                this._serviceregistration = this._bundleContext.registerService(interfaces, widget, serviceProperties);
            } else {
                this.searchReplacer(customquery);
                if (customquery.geometry && this._queryBuilderProperties.useUserExtent) {
                    var extent = this._mapState.getExtent();
                    customquery.geometry = {
                        $contains: extent
                    };
                }
                var options = {};
                if (event.options) {
                    var count = event.options.count || -1;
                    if (count >= 0) {
                        options.count = count;
                    } else {
                        options.count = -1;
                    }
                    options.ignoreCase = event.options.ignoreCase || false;
                    options.locale = event.options.locale || {
                        "language": "en",
                        "country": "EN"
                    };
                    options.sort = event.options.sort || [];
                }

                this.query(store, customquery, options, tool);
            }
        },
        query: function (store, customquery, options, tool, widget) {
            var queryBuilderProperties = this._queryBuilderProperties;
            if (queryBuilderProperties.useMemorySelectionStore) {
                this.memorySelectionQuery(store, customquery, options, tool, widget);
            } else {
                this.defaultQuery(store, customquery, options, tool, widget);
            }
        },
        memorySelectionQuery: function (store, customQuery, options, tool, widget) {
            this._setProcessing(tool, true, widget);
            options.fields = {geometry: 1};
            ct_when(store.query(customQuery, options), function (result) {
                if (result.total > 0) {
                    var wkid = this._mapState.getSpatialReference().wkid;
                    var geometries = d_array.map(result, function (item) {
                        return item.geometry;
                    });

                    if (geometries[0]) {
                        ct_when(this._coordinateTransformer.transform(geometries, wkid), function (transformedGeometries) {
                            d_array.forEach(transformedGeometries, function (tg, index) {
                                result[index].geometry = tg;
                            });
                        }, this);
                    }

                    var memorySelectionStore = new MemorySelectionStore({
                        id: "querybuilder_" + store.id,
                        masterStore: store,
                        metadata: store.getMetadata,
                        data: result,
                        idProperty: store.idProperty
                    });

                    this._dataModel.setDatasource(memorySelectionStore);
                    this._setProcessing(tool, false, widget);

                } else {
                    this._logService.warn({
                        id: 0,
                        message: this.i18n.no_results_error
                    });
                    this._setProcessing(tool, false, widget);
                }
            }, function (e) {
                this._logService.error({
                    id: e.code,
                    message: e
                });
                this._setProcessing(tool, false, widget);
            }, this);
        },
        defaultQuery: function (store, customQuery, options, tool, widget) {
            this._setProcessing(tool, true, widget);
            var filter = new Filter(store, customQuery, options);
            ct_when(filter.query({}, {count: 0}).total, function (total) {
                if (total) {
                    this._dataModel.setDatasource(filter);
                    this._setProcessing(tool, false, widget);
                } else {
                    this._logService.warn({
                        id: 0,
                        message: this.i18n.no_results_error
                    });
                    this._setProcessing(tool, false, widget);
                }
            }, function (e) {
                this._setProcessing(tool, false, widget);
                this._logService.error({
                    id: e.code,
                    message: e
                });
            }, this);
        },
        searchReplacer: function (o) {
            for (var i in o) {
                var value = o[i];
                if (typeof (value) === "string") {
                    o[i] = this._replacer.replace(value);
                }
                if (value !== null && typeof (value) === "object") {
                    this.searchReplacer(value);
                }
            }
        },
        _setProcessing: function (tool, processing, widget) {
            if (tool) {
                tool.set("processing", processing);
            }
            if (widget) {
                if (processing) {
                    widget._doneButton.set("iconClass", "icon-spinner");
                } else {
                    widget._doneButton.set("iconClass", "icon-magnifier");
                }
            }
        }
    });
});
