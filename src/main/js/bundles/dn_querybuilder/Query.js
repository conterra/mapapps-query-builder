/*
 * Copyright (C) 2015 con terra GmbH (info@conterra.de)
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
    "dojo/json",
    "dojo/_base/array",
    "ct/store/Filter",
    "ct/_when",
    "ct/array",
    "./EditableQueryBuilderWidget",
    "./MemorySelectionStore"
], function (declare, JSON, d_array, Filter, ct_when, ct_array, EditableQueryBuilderWidget, MemorySelectionStore) {
    return declare([], {
        activate: function (componentContext) {
            this._bundleContext = componentContext.getBundleContext();
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
        // Surrounds a store with a Filter and fires a selection end event
        // If the result center is part of the app the store would be shown there
        // TODO: better integrate the filter code inside the SearchStoreTool of the result center?
        onQueryToolActivated: function (event) {
            var store = event.store;
            if (!store) {
                // ignore
                return;
            }
            var customquery = event.customquery;
            var topic = "ct/selection/SELECTION_END";
            var tool = this.tool = event.tool;
            if (event.options.editable === true) {
                var props = event._properties;
                var i18n = event._i18n.get();
                var replacer = this._replacer;
                var metadataAnalyzer = this._metadataAnalyzer;
                var queryBuilderProperties = this._queryBuilderProperties;
                var queryController = this._queryController;
                var widget = this.widget = new EditableQueryBuilderWidget({
                    properties: props,
                    i18n: i18n.wizard,
                    tool: tool,
                    store: store,
                    replacer: replacer,
                    metadataAnalyzer: metadataAnalyzer,
                    queryBuilderProperties: queryBuilderProperties,
                    queryController: queryController
                });
                var serviceProperties = {
                    "widgetRole": "editableQueryBuilderWidget"
                };
                var interfaces = ["dijit.Widget"];
                this._serviceregistration = this._bundleContext.registerService(interfaces, widget, serviceProperties);
            } else {
                this._setProcessing(tool, true);
                this._searchReplacer(customquery);
                var options = {};
                var count = event.options.count;
                if (count >= 0) {
                    options.count = count;
                }
                options.ignoreCase = event.options.ignoreCase;
                options.locale = event.options.locale;
                /*this._eventService.postEvent(topic, {
                 source: this,
                 store: customquery ? Filter(store, customquery, options) : store
                 });*/
                this._queryController.query(store, customquery, options, tool);
            }
        },
        _setProcessing: function (tool, processing) {
            if (tool) {
                tool.set("processing", processing);
            }
        },
        _searchReplacer: function (o) {
            for (var i in o) {
                var value = o[i];
                if (typeof(value) === "string") {
                    o[i] = this._replacer.replace(value);
                }
                if (value !== null && typeof(value) == "object") {
                    this._searchReplacer(value);
                }
            }
        }
    });
});
