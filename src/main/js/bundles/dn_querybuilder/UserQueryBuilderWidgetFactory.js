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
    "dojo/_base/array",
    "./UserQueryBuilderWidget",
    "ct/_Connect"
], function (declare, d_array,
             UserQueryBuilderWidget, _Connect) {
    return declare([_Connect], {
        constructor: function () {
            //this._stores = [];
            this.inherited(arguments);
        },
        activate: function () {
            this.inherited(arguments);
            this._createWidget();
        },
        deactivate: function () {
            this.disconnect();
        },
        createInstance: function () {
            return this.widget;
        },
        _createWidget: function () {
            var props = this._properties;
            var i18n = this._i18n.get();
            var tool = this._tool;
            var stores = this.stores;
            var storesInfo = this.stores_info;
            var mapState = this._mapState;
            var dataModel = this._dataModel;
            var replacer = this._replacer;
            var logService = this._logService;
            var metadataAnalyzer = this._metadataAnalyzer;
            var querygeometryTool = this.querygeometryTool;
            var drawGeometryHandler = this.drawGeometryHandler;
            this.widget = new UserQueryBuilderWidget({
                properties: props,
                i18n: i18n.wizard,
                tool: tool,
                stores: stores,
                storesInfo: storesInfo,
                mapState: mapState,
                dataModel: dataModel,
                replacer: replacer,
                logService: logService,
                metadataAnalyzer: metadataAnalyzer,
                querygeometryTool: querygeometryTool,
                drawGeometryHandler: drawGeometryHandler
            });
        },
        setDrawGeometryHandler: function (service) {
            if (this.widget)
                this.widget.drawGeometryHandler = service;
            this.connect(this._tool, "onDeactivate", function () {
                service.clearGraphics();
            }, this);
        },
        setQueryGeometryTool: function (service) {
            if (this.widget)
                this.widget.querygeometryTool = service;
        }
    });
});