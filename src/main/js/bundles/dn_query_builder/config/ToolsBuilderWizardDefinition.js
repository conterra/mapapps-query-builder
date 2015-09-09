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
    "dojo/_base/declare"
], function (declare) {

    return declare([], {
        constructor: function (opts) {

            this.properties = opts;
            this._ids = opts.ids || [];
            this._i18n = opts.i18n;
        },
        createDataformJson: function () {
            return {
                "dataform-version": "1.0.0",
                "type": "wizardpanel",
                "showCancel": true,
                "size": {
                    "w": 540,
                    "h": 280
                },
                "children": [
                    {
                        "type": "borderpanel",
                        "children": [
                            {
                                "type": "gridpanel",
                                "region": "center",
                                "children": [
                                    /*{
                                     "type": "textbox",
                                     "field": "id",
                                     "title": "ID",
                                     "required": true
                                     },*/
                                    {
                                        "type": "textbox",
                                        "field": "title",
                                        "title": "${title}",
                                        "required": true
                                    },
                                    {
                                        "type": "textbox",
                                        "field": "iconClass",
                                        "title": "${iconClass}",
                                        "required": true
                                    },
                                    {
                                        "type": "gridpanel",
                                        "showLabels": false,
                                        "cols": 1,
                                        "children": [
                                            {
                                                "type": "button",
                                                "label": "${iconClassHelp}",
                                                "showLabel": true,
                                                "tooltip": "${iconClassHelp}",
                                                "topic": "button_iconclass"
                                            }]},
                                    {
                                        "type": "selectbox",
                                        "useFirstValueAsDefault": true,
                                        "field": "storeId",
                                        "title": "StoreID",
                                        "values": this._ids,
                                        "required": true
                                    },
                                    {
                                        "type": "textarea",
                                        "field": "customquery",
                                        "title": "Custom Query",
                                        "isJson": true,
                                        "required": true,
                                        "resizeable": true,
                                        "size": {
                                            "w": 270,
                                            "h": 200
                                        }
                                    },
                                    {
                                        "type": "gridpanel",
                                        "showLabels": false,
                                        "cols": 1,
                                        "children": [
                                            {
                                                "type": "button",
                                                "label": "${complexQueryHelp}",
                                                "showLabel": true,
                                                "tooltip": "${complexQueryHelp}",
                                                "topic": "button_query"
                                            }]}
                                ]
                            }]
                    }]

            };

        }
    });
});
