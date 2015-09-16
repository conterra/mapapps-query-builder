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
    "dojo/dom-style",
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
    "dijit/form/NumberTextBox",
    "dijit/form/FilteringSelect",
    "dijit/form/Button",
    "dojo/store/Memory",
    "dojo/dom-construct",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer"
], function (d_lang, declare, Deferred, parser, d_array, JSON, domStyle, _Connect, ct_when, _BuilderWidget, FieldWidget, d_registry, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, template, TextBox, ValidationTextBox, NumberTextBox, FilteringSelect, Button, Memory, domConstruct, ContentPane) {

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
            domStyle.set(this._titleTextBox.domNode, "width", "250px");
            domStyle.set(this._iconClassTextBox.domNode, "width", "209px");
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

            this._createBuilderGUI();
            this._createOptionsGUI();

            this.connect(filteringSelect, "onChange", this._removeFields);
            this.connect(this._titleTextBox, "onChange", this._checkValidation);
            this.connect(this._titleTextBox, "onChange", this._checkSelectedTab);
            this.connect(this._iconClassTextBox, "onChange", this._checkValidation);
            this.connect(this._centerNode, "onClick", this._checkSelectedTab);
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
            if (!this.properties.options) {
                this.properties.options = {};
            }
            if (this._builderTab.get("selected")) {
                this.properties.options.mode = "builder";
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
                var children = this._queryNode.children;
                if (children.length > 0)
                {
                    customQuery[match] = [];
                }
                d_array.forEach(children, function (child) {
                    var widget = d_registry.getEnclosingWidget(child);
                    var fieldId = widget._getSelectedField();
                    var fieldType = widget._getSelectedFieldType();
                    var compareId = widget._getSelectedCompare();
                    var not = widget._getSelectedNot();
                    var value = widget._getValue();
                    if (fieldType === "number") {
                        value = Number(value);
                    }
                    var obj1 = {};
                    obj1[compareId] = value;
                    var obj2 = {};
                    obj2[fieldId] = obj1;
                    if (not) {
                        var object = {$not: obj2};
                        customQuery[match].push(object);
                    } else {
                        customQuery[match].push(obj2);
                    }
                }, this);
                this.properties.customquery = customQuery;
                this.properties.options.editable = this._editableSelect.get("value");
            } else {
                var customQuery = this._customQueryTextArea.value;
                if (this.properties.options.mode === "builder") {
                    var customQueryObj = this._getCustomQuery(customQuery);
                    ct_when(this.windowManager.createInfoDialogWindow({
                        message: this.i18n.changeToManual,
                        attachToDom: this.appCtx.builderWindowRoot
                    }), function () {
                        this.properties.customquery = customQueryObj;
                        this.properties.options.mode = "manual";
                        this.properties.options.editable = false;
                        def.resolve();
                    }, this);
                } else {
                    this.properties.customquery = this._getCustomQuery(customQuery);
                    def.resolve();
                }
            }
            this.properties.title = this._titleTextBox.value;
            this.properties.iconClass = this._iconClassTextBox.value;
            this.properties.storeId = this._filteringSelect.value;

            this.properties.options.count = this._countTextBox.value;
            this.properties.options.ignoreCase = this._ignoreCaseSelect.value;
            var localeId = this._localeSelect.value;
            var localeObj = this._localeStore.get(localeId);
            delete localeObj.id;
            this.properties.options.locale = localeObj;
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
            var storeId = this._filteringSelect.value;
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
            var fieldId;
            var compareId;
            var value;
            var not;
            if (field.$not) {
                not = true;
                for (var a in field.$not) {
                    fieldId = a;
                    for (var b in field.$not[fieldId]) {
                        compareId = b;
                        value = field.$not[fieldId][compareId];
                    }
                }
            } else {
                not = false;
                for (var a in field) {
                    fieldId = a;
                    for (var b in field[fieldId]) {
                        compareId = b;
                        value = field[fieldId][compareId];
                    }
                }
            }
            var storeData = this._getFields();
            var storeId = this._filteringSelect.value;
            var fieldWidget = new FieldWidget({
                store: this._getSelectedStore(storeId),
                storeData: storeData,
                i18n: this.i18n.fields,
                fieldId: fieldId,
                compareId: compareId,
                value: value, type: "admin"
            });
            domConstruct.place(fieldWidget.domNode, this._queryNode, "last");
        },
        _addField: function () {
            var storeId = this._filteringSelect.value;
            var storeData = this._getFields();
            var fieldWidget = new FieldWidget({
                store: this._getSelectedStore(storeId),
                storeData: storeData,
                i18n: this.i18n.fields,
                type: "admin"
            });
            domConstruct.place(fieldWidget.domNode, this._queryNode, "last");
        },
        _createBuilderGUI: function () {
            var ynStore = new Memory({
                data: [
                    {name: this.i18n.yes, id: "yes"},
                    {name: this.i18n.no, id: "no"}
                ]
            });
            var extentSelect = this._extentSelect = new FilteringSelect({
                name: "extent",
                value: "no",
                store: ynStore,
                searchAttr: "name",
                style: "width: 80px;",
                required: true,
                maxHeight: this.maxComboBoxHeight
            }, this._extentNode);
            var editableSelect = this._editableSelect = new FilteringSelect({
                name: "editable",
                value: "no",
                store: ynStore,
                searchAttr: "name",
                style: "width: 80px;",
                required: true,
                maxHeight: this.maxComboBoxHeight
            }, this._editableNode);
            var matchStore = this._matchStore = new Memory({
                data: [
                    {name: this.i18n.and, id: "$and"},
                    {name: this.i18n.or, id: "$or"}]
            });
            var matchSelect = this._matchSelect = new FilteringSelect({
                name: "match",
                value: "$and",
                store: matchStore,
                searchAttr: "name",
                style: "width: 80px;",
                required: true,
                maxHeight: this.maxComboBoxHeight
            }, this._matchNode);
            var properties = this.properties;
            var customQuery = properties.customquery;
            if (properties.options.editable) {
                var editable = properties.options.editable;
                this._editableSelect.set("value", editable);
            }
            var match;
            if (customQuery.geometry) {
                this._extentSelect.set("value", "yes");
            } else {
                this._extentSelect.set("value", "no");
            }
            if (customQuery.$and) {
                this._matchSelect.set("value", "$and");
                match = "$and";
            } else if (customQuery.$or) {
                this._matchSelect.set("value", "$or");
                match = "$or";
            }
            var fields = customQuery[match];
            d_array.forEach(fields, function (field) {
                this._addDataField(field);
            }, this);
        },
        _createOptionsGUI: function () {
            this._countTextBox = new NumberTextBox({
                name: "count",
                value: this.properties.options.count || -1, style: "width: 140px;",
                required: true,
                constraints: {min: -1}
            }, this._countNode);
            var ynStore = new Memory({
                data: [
                    {name: this.i18n.yes, id: false},
                    {name: this.i18n.no, id: true}
                ]
            });
            var ignoreCase;
            if (this.properties.options.ignoreCase === undefined) {
                ignoreCase = true;
            } else {
                ignoreCase = this.properties.options.ignoreCase;
            }
            this._ignoreCaseSelect = new FilteringSelect({
                name: "ignoreCase",
                value: ignoreCase,
                store: ynStore,
                searchAttr: "name",
                style: "width: 140px;",
                required: true,
                maxHeight: this.maxComboBoxHeight
            }, this._ignoreCaseNode);
            var localeStore = this._localeStore = new Memory({
                data: [
                    {language: "de", country: "DE", id: "de"}, {language: "en", country: "EN", id: "en"}
                ]
            });
            this._localeSelect = new FilteringSelect({
                name: "locale",
                value: this.properties.options.locale && this.properties.options.locale.language || "en",
                store: localeStore,
                searchAttr: "language",
                style: "width: 140px;",
                required: true,
                maxHeight: this.maxComboBoxHeight
            }, this._localeNode);
        },
        _addExpressionSet: function () {

        },
        _removeFields: function () {
            while (this._queryNode.firstChild) {
                this._queryNode.removeChild(this._queryNode.firstChild);
            }
        },
        _checkSelectedTab: function () {
            if (this._optionsTab.get("selected")) {
                this._doneButton.set("disabled", true);
            } else {
                if (this._titleTextBox.isValid() && this._iconClassTextBox.isValid()) {
                    this._doneButton.set("disabled", false);
                }
            }
        }
    });
});
