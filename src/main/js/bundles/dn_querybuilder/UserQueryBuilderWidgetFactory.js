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
    "./UserQueryBuilderWidget"
], function (declare,
             UserQueryBuilderWidget) {
    return declare([], {
        constructor: function () {
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
            var mapState = this._mapState;
            var dataModel = this._dataModel;
            var replacer = this._replacer;
            var metadataAnalyzer = this._metadataAnalyzer;
            var queryBuilderProperties = this._queryBuilderProperties;
            var queryController = this._queryController;
            var querygeometryTool = this.querygeometryTool;
            var drawGeometryHandler = this.drawGeometryHandler;
            this.widget = new UserQueryBuilderWidget({
                properties: props,
                i18n: i18n.wizard,
                tool: tool,
                stores: stores,
                mapState: mapState,
                dataModel: dataModel,
                replacer: replacer,
                metadataAnalyzer: metadataAnalyzer,
                queryBuilderProperties: queryBuilderProperties,
                queryController: queryController,
                drawGeometryHandler: drawGeometryHandler,
                querygeometryTool: querygeometryTool
            });
        },
        setDrawGeometryHandler: function (service) {
            if (this.widget)
                this.widget.drawGeometryHandler = service;
        },
        setQueryGeometryTool: function (service) {
            if (this.widget)
                this.widget.querygeometryTool = service;
        }
    });
});