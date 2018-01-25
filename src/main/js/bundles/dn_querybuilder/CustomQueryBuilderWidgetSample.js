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
    "ct/_Connect",
    "./CustomQueryBuilderWidget"
], function (declare,
             _Connect,
             CustomQueryBuilderWidget) {
    return declare([_Connect], {
        activate: function (componentContext) {
            this._bundleContext = componentContext.getBundleContext();
        },
        activateWindow: function () {
            var store = this.store;
            var props = this._properties;
            var i18n = this._i18n.get();
            var storesInfo = this.stores_info;
            var mapState = this._mapState;
            var dataModel = this._dataModel;
            var replacer = this._replacer;
            var metadataAnalyzer = this._metadataAnalyzer;
            var querygeometryTool = this._querygeometryTool;
            var drawGeometryHandler = this._drawGeometryHandler;
            var queryBuilderProperties = this._queryBuilderProperties;
            var queryController = this._queryController;
            var customQueryBuilderWidget = new CustomQueryBuilderWidget({
                properties: props,
                i18n: i18n.wizard,
                storesInfo: storesInfo,
                mapState: mapState,
                dataModel: dataModel,
                replacer: replacer,
                metadataAnalyzer: metadataAnalyzer,
                queryController: queryController,
                querygeometryTool: querygeometryTool,
                drawGeometryHandler: drawGeometryHandler,
                queryBuilderProperties: queryBuilderProperties
            });
            var serviceProperties = {
                "widgetRole": "customQueryBuilderWidget"
            };
            var interfaces = ["dijit.Widget"];
            this._serviceregistration = this._bundleContext.registerService(interfaces, customQueryBuilderWidget, serviceProperties);
            customQueryBuilderWidget.setStores([store], [{
                name: "Stoerungen",
                id: "stoerungen"
            }]);
            this.connect(customQueryBuilderWidget, "_onQueryReady", function (customQuery) {
                // do something
            });
        }
    });
});