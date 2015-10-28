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
    "./UserQueryBuilderWidget"
], function (declare, d_array,
        UserQueryBuilderWidget) {
    return declare([], {
        constructor: function () {
            this._stores = [];
            this.inherited(arguments);
        },
        activate: function () {
            this.inherited(arguments);
            this._createWidget();
        },
        deactivate: function () {
            //this.widget._clear();
        },
        createInstance: function () {
            return this.widget;
        },
        /*addStores: function (store) {
            this._stores.push(store);
            if (this.widget)
                this.widget.onNewStores(this._stores);
        },
        removeStores: function (store) {
            var stores = [];
            d_array.forEach(this._stores, function (s, i) {
                if (s) {
                    if (store.id !== s.id) {
                        stores.push(s);
                    }
                }
            }, this);
            this._stores = stores;
            if (this.widget)
                this.widget.onNewStores(this._stores);
        },*/
        _createWidget: function () {
            var props = this._properties;
            var i18n = this._i18n.get();
            var tool = this._tool;
            var stores = this.stores;
            var mapState = this._mapState;
            var dataModel = this._dataModel;
            var replacer = this._replacer;
            var logService = this._logService;
            this.widget = new UserQueryBuilderWidget({
                properties: props,
                i18n: i18n.wizard,
                tool: tool,
                stores: stores,
                mapState: mapState,
                dataModel: dataModel,
                replacer: replacer,
                logService: logService
            });
        }
    });
});