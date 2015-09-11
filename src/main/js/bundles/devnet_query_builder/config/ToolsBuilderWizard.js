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
    "dojo/_base/lang",
    "dojo/_base/declare",
    "dojo/_base/Deferred",
    "dojo/parser",
    "dojo/_base/array",
    "dojo/json",
    "ct/_Connect",
    "ct/_when",
    "wizard/_BuilderWidget",
    "./FieldWidget",
    "dijit/registry",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/_CssStateMixin",
    "dojo/text!./templates/ToolsBuilderWizard.html",
    "dijit/form/TextBox",
    "dijit/form/ValidationTextBox",
    "dijit/form/FilteringSelect",
    "dijit/form/Button",
    "dojo/store/Memory",
    "dojo/dom-construct",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer"
], function (d_lang, declare, Deferred, parser, d_array, JSON, _Connect, ct_when, _BuilderWidget, FieldWidget, d_registry, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, template, TextBox, ValidationTextBox, FilteringSelect, Button, Memory, domConstruct, ContentPane) {

    return declare([_BuilderWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, _Connect], {
        templateString: template,
        baseClass: "queryBuilderWizard",
        constructor: function (opts) {
        },
        destroyInstance: function (instance) {
            instance.destroyRecursive();
        },
        postCreate: function () {
            this.inherited(arguments);
            this.maxComboBoxHeight = 160;
            var store = new Memory({
                data: this.storeData
            });
            var filteringSelect = this._filteringSelect = new FilteringSelect({
                name: "stores",
                value: this.properties.storeId || this.storeData[0].id,
                store: store,
                searchAttr: "name",
                style: "width: 250px;",
                maxHeight: this.maxComboBoxHeight
            }, this._filteringNode);
            filteringSelect.startup();
            this._titleTextBox.set("value", this.properties.title);
            this._iconClassTextBox.set("value", this.properties.iconClass);
            var customQueryString = JSON.stringify(this.properties.customquery, "", "\t");
            this._customQueryTextArea.set("value", customQueryString);
            var extentStore = this._extentStore = new Memory({
                data: [
                    {name: this.i18n.yes, id: "yes"},
                    {name: this.i18n.no, id: "no"}
                ]
            });
            var extentSelect = this._extentSelect = new FilteringSelect({
                name: "extent",
                value: "no",
                store: extentStore,
                searchAttr: "name",
                style: "width: 80px;",
                required: true,
                maxHeight: this.maxComboBoxHeight
            });
            domConstruct.place(extentSelect.domNode, this._extentNode);
            var matchStore = this._matchStore = new Memory({
                data: [
                    {name: this.i18n.all, id: "$and"},
                    {name: this.i18n.any, id: "$or"}
                ]
            });
            var matchSelect = this._matchSelect = new FilteringSelect({
                name: "match",
                value: "$and",
                store: matchStore,
                searchAttr: "name",
                style: "width: 80px;",
                required: true,
                maxHeight: this.maxComboBoxHeight
            });
            domConstruct.place(matchSelect.domNode, this._matchNode);
            var wizardGUI = this.properties._wizardGUI;
            if (wizardGUI) {
                if (wizardGUI.mode === "builder") {
                    this._createGUI(wizardGUI);
                    this._builderTab.set("selected", true);
                    //this._manualTab.set("selected", false);
                    //this._manualTab.set("disabled", true);
                } else if (wizardGUI.mode === "manual") {
                    this._manualTab.set("selected", true);
                    this._builderTab.set("selected", false);
                    this._builderTab.set("disabled", true);
                }
            }

            this.connect(filteringSelect, "onChange", this._removeFields);
            this.connect(this._titleTextBox, "onChange", this._checkValidation);
            this.connect(this._iconClassTextBox, "onChange", this._checkValidation);
        },
        _checkValidation: function () {
            if (this._titleTextBox.isValid() && this._iconClassTextBox.isValid()) {
                this._doneButton.set('disabled', false);
            } else {
                this._doneButton.set('disabled', true);
            }
        },
        resize: function (dim) {
            if (dim && dim.h > 0) {
                this._containerNode.resize({
                    w: dim.w,
                    h: dim.h - this.getHeadingHeight()
                });
            }
        },
        createContent: function () {
        },
        _iconClassHelp: function () {
            var winURL = 'http://www.mapapps.de/mapapps/resources/jsregistry/root/themes/3.2.1/themes/webFontsGallery.html';
            var winName = 'win1';
            var winSize = 'width=800,height=600,scrollbars=yes';
            var ref = window.open(winURL, winName, winSize);
        },
        _customQueryHelp: function () {
            var winURL = 'http://developernetwork.conterra.de/de/documentation/mapapps/32/developers-documentation/complex-query-dojostore';
            var winName = 'win2';
            var winSize = 'width=800,height=600,scrollbars=yes';
            var ref = window.open(winURL, winName, winSize);
        },
        _onDone: function () {
            ct_when(this._saveProperties(), this._onReady);
        },
        _onReady: function () {
        },
        _saveProperties: function () {
            var def = new Deferred();
            if (!this.properties._wizardGUI) {
                this.properties._wizardGUI = {};
            }
            if (this._builderTab.get("selected")) {
                this.properties._wizardGUI.mode = "builder";
                var match = this._matchSelect.value;
                var customQuery = {};
                var extent;
                if (this._extentSelect.value === "yes") {
                    extent = this.mapState.getExtent();
                    customQuery.geometry = {
                        $contains: extent
                    };
                    def.resolve();
                } else {
                    /*var children = this.mapModel.getBaseLayer().get("children");
                     d_array.forEach(children, function (child) {
                     if (child.enabled) {
                     ct_when(this.coordinateTransformer.transform(child.fullExtent, this.mapState.getSpatialReference().wkid),
                     function (transformedGeometry) {
                     extent = transformedGeometry;
                     def.resolve();
                     }, this);
                     }
                     }, this);
                     customQuery.geometry = {
                     $contains: extent
                     };*/
                    def.resolve();
                }
                this.properties._wizardGUI.match = this._matchSelect.value;
                this.properties._wizardGUI.extent = this._extentSelect.value;
                var children = this._queryNode.children;
                if (children.length > 0)
                {
                    customQuery[match] = [];
                }
                this.properties._wizardGUI.fields = [];
                d_array.forEach(children, function (child, i) {
                    var widget = d_registry.getEnclosingWidget(child);
                    var fieldId = widget._getSelectedField().id;
                    var compareId = widget._getSelectedCompare().id;
                    var compareValue = widget._getSelectedCompare().value;
                    var value = widget._getValue();
                    this.properties._wizardGUI.fields.push({fieldId: fieldId, compareId: compareId, value: value});
                    switch (compareId) {
                        case "is":
                            var obj = {};
                            obj[fieldId] = {$eq: value};
                            customQuery[match].push(obj);
                            break;
                        case "is_not":
                            var obj = {};
                            obj[fieldId] = {$not: {$eq: value}};
                            customQuery[match].push(obj);
                            break;
                        case "contains":
                            var obj = {};
                            obj[fieldId] = {$eqw: "*" + value + "*"};
                            customQuery[match].push(obj);
                            break;
                        case "contains_not":
                            var obj = {};
                            obj[fieldId] = {$not: {$eqw: "*" + value + "*"}};
                            customQuery[match].push(obj);
                            break;
                        case "starts_with":
                            var obj = {};
                            obj[fieldId] = {$eqw: value + "*"};
                            customQuery[match].push(obj);
                            break;
                        case "ends_with":
                            var obj = {};
                            obj[fieldId] = {$eqw: "*" + value};
                            customQuery[match].push(obj);
                            break;
                        case "is_number":
                            var obj = {};
                            obj[fieldId] = {$eq: parseFloat(value)};
                            customQuery[match].push(obj);
                            break;
                        case "is_not_number":
                            var obj = {};
                            obj[fieldId] = {$not: {$eq: parseFloat(value)}};
                            customQuery[match].push(obj);
                            break;
                        case "is_greater_number":
                            var obj = {};
                            obj[fieldId] = {$gt: parseFloat(value)};
                            customQuery[match].push(obj);
                            break;
                        case "is_greater_or_equal_number":
                            var obj = {};
                            obj[fieldId] = {$gte: parseFloat(value)};
                            customQuery[match].push(obj);
                            break;
                        case "is_less_number":
                            var obj = {};
                            obj[fieldId] = {$lt: parseFloat(value)};
                            customQuery[match].push(obj);
                            break;
                        case "is_less_or_equal_number":
                            var obj = {};
                            obj[fieldId] = {$lte: parseFloat(value)};
                            customQuery[match].push(obj);
                            break;
                        case "before":
                            var date = new Date(value);
                            var day = ("0" + date.getDate()).slice(-2);
                            var month = ("0" + (date.getMonth() + 1)).slice(-2);
                            var year = date.getFullYear();
                            var value = year + "-" + month + "-" + day + " 00:00:00";
                            var obj = {};
                            var obj2 = {};
                            obj2[compareValue] = "timestamp '" + value + "'";
                            obj[fieldId] = obj2;
                            customQuery[match].push(obj);
                            break;
                        case "after":
                            value = new Date(value).getTime();
                            customQuery += "{\"" + fieldId + "\":{\"" + compareValue + "\":\"" + value + "\"}}";
                            break;
                        default:
                            var obj = {};
                            var obj2 = {};
                            obj2[compareValue] = value;
                            obj[fieldId] = obj2;
                            customQuery[match].push(obj);
                    }
                }, this);
                this.properties.customquery = customQuery;
            } else {
                var customQuery = this._customQueryTextArea.get("value");
                if (this.properties._wizardGUI.mode === "builder") {
                    var customQueryObj = this._getCustomQuery(customQuery);
                    ct_when(this.windowManager.createInfoDialogWindow({
                        message: this.i18n.changeToManual,
                        attachToDom: this.appCtx.builderWindowRoot
                    }), function () {
                        this.properties.customquery = customQueryObj;
                        this.properties._wizardGUI.mode = "manual";
                        def.resolve();
                    }, this);
                } else {
                    this.properties.customquery = this._getCustomQuery(customQuery);
                    def.resolve();
                }
            }
            this.properties.title = this._titleTextBox.get("value");
            this.properties.iconClass = this._iconClassTextBox.get("value");
            this.properties.storeId = this._filteringSelect.get("value");

            return def;
        },
        _getCustomQuery: function (customQuery) {
            try {
                var customQueryObj = JSON.parse(customQuery);
            } catch (e) {
                var windowManager = this.windowManager;
                var appCtx = this.appCtx;
                var errorMessage = e.toString();
                ct_when(windowManager.createInfoDialogWindow({
                    message: errorMessage,
                    attachToDom: appCtx.builderWindowRoot
                }));
            }
            return customQueryObj;
        },
        _onCancel: function () {
        },
        _getSelectedStore: function (id) {
            var s;
            d_array.forEach(this.agsstores, function (store) {
                if (id === store.id) {
                    s = store;
                }
            }, this);
            return s;
        },
        _getFields: function () {
            var storeId = this._filteringSelect.get("value");
            var store = this._getSelectedStore(storeId);
            var metadata = store.getMetadata();
            var fields = metadata.fields;
            var storeData = [];
            d_array.forEach(fields, function (field) {
                var codedValues = [];
                if (field.domain) {
                    codedValues = field.domain.codedValues;
                }
                var codedValueString = "";
                if (codedValues.length > 0) {
                    codedValueString = "[CV]";
                }
                if (field.type !== "geometry" && field.type !== "date") {
                    storeData.push({id: field.name, title: field.title + " (" + field.type + ") " + codedValueString, type: field.type, codedValues: codedValues});
                }
            });
            return storeData;
        },
        _addDataField: function (field) {
            var storeData = this._getFields();
            var storeId = this._filteringSelect.get("value");
            var fieldWidget = new FieldWidget({
                store: this._getSelectedStore(storeId),
                storeData: storeData,
                i18n: this.i18n.fields,
                fieldId: field.fieldId,
                compareId: field.compareId,
                value: field.value,
                type: "admin"
            });
            domConstruct.place(fieldWidget.domNode, this._queryNode, "last");
        },
        _addField: function () {
            var storeId = this._filteringSelect.get("value");
            var storeData = this._getFields();
            var fieldWidget = new FieldWidget({
                store: this._getSelectedStore(storeId),
                storeData: storeData,
                i18n: this.i18n.fields,
                type: "admin"
            });
            domConstruct.place(fieldWidget.domNode, this._queryNode, "last");
        },
        _createGUI: function (wizardGUI) {
            var match = wizardGUI.match;
            this._matchSelect.set("value", match);
            var extent = wizardGUI.extent;
            this._extentSelect.set("value", extent);
            var fields = wizardGUI.fields;
            d_array.forEach(fields, function (field) {
                this._addDataField(field);
            }, this);
        },
        _addExpressionSet: function () {

        },
        _removeFields: function () {
            while (this._queryNode.firstChild) {
                this._queryNode.removeChild(this._queryNode.firstChild);
            }
        }
    });
});
