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
    "ct/array",
    "ct/util/css",
    "ct/request",
    "ct/store/ComplexMemory",
    "ct/ui/controls/dataview/DataViewModel",
    "ct/ui/controls/dataview/DataView",
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
], function (d_lang, declare, Deferred, parser, d_array, JSON, domStyle, _Connect, ct_when, ct_array, ct_css, ct_request, ComplexMemoryStore, DataViewModel, DataView, _BuilderWidget, FieldWidget, d_registry, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, template, TextBox, ValidationTextBox, NumberTextBox, FilteringSelect, Button, Memory, domConstruct, ContentPane) {

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
            var storeSelect = this._storeSelect = new FilteringSelect({
                name: "stores",
                value: this.properties.storeId || this.storeData[0].id,
                store: store,
                searchAttr: "name",
                style: "width: 250px;",
                maxHeight: this.maxComboBoxHeight
            }, this._filteringNode);
            storeSelect.startup();
            this._titleTextBox.set("value", this.properties.title);
            this._iconClassTextBox.set("value", this.properties.iconClass);
            var customQueryString = JSON.stringify(this.properties.customquery, "", "\t");
            this._customQueryTextArea.set("value", customQueryString);
            this._createOptionsGUI();
            var valid = this._validateCustomQuery(customQueryString);
            if (valid) {
                this._createBuilderGUI();
            } else {
                this._builderTab.set("disabled", true);
                this._manualTab.set("selected", true);
                this._builderTab.set("selected", false);
                if (this._titleTextBox.isValid() && this._iconClassTextBox.isValid()) {
                    this._doneButton.set("disabled", false);
                }
            }

            this._createPlaceholderGUI();
            this.connect(storeSelect, "onChange", this._onStoreChange);
            this.connect(this._titleTextBox, "onChange", this._checkValidation);
            this.connect(this._iconClassTextBox, "onChange", this._checkValidation);
            this.connect(this._customQueryTextArea, "onChange", this._onTextAreaInput);
            this.connect(this._builderTab, "onShow", this._onBuilderTab);
            this.connect(this._manualTab, "onShow", this._onManualTab);
            this.connect(this._optionsTab, "onShow", this._onOptionsTab);
            this.connect(this._placeholderTab, "onShow", this._onPlaceholderTab);
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
        _createWindow: function (url, title) {
            window.open(url, "_blank");
        },
        _iconClassHelp: function () {
            var url = this.globalProperties.webFontsGalleryUrl;
            this._createWindow(url, "WebFontsGallery");
        },
        _customQueryHelp: function () {
            var url = this.globalProperties.complexQueryDocUrl;
            this._createWindow(url, "Complex Query Documentation");
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
                var customQuery = this._getComplexQuery();
                this.properties.customquery = customQuery;
                this.properties.options.editable = this._editableSelect.value;
                if (this.properties.options.editable === true) {
                    this.properties.options.editOptions = [];
                    var children = this._queryNode.children;
                    d_array.forEach(children, function (child) {
                        var obj = {};
                        var widget = d_registry.getEnclosingWidget(child);
                        obj["not"] = widget.getNotCheckBoxValue();
                        obj["field"] = widget.getFieldCheckBoxValue();
                        obj["compare"] = widget.getCompareCheckBoxValue();
                        obj["value"] = widget.getValueCheckBoxValue();
                        this.properties.options.editOptions.push(obj);
                    }, this);
                } else {
                    if (this.properties.options.editOptions)
                        delete this.properties.options.editOptions;
                }
                def.resolve();
            } else {
                var customQueryString = this._customQueryTextArea.value;
                this.properties.customquery = this._getCustomQueryObj(customQueryString);
                def.resolve();
            }
            this.properties.title = this._titleTextBox.value;
            this.properties.iconClass = this._iconClassTextBox.value;
            this.properties.storeId = this._storeSelect.value;
            this.properties.options.count = this._countTextBox.value;
            this.properties.options.ignoreCase = this._ignoreCaseSelect.value;
            var localeId = this._localeSelect.value;
            var localeObj = this._localeStore.get(localeId);
            delete localeObj.id;
            this.properties.options.locale = localeObj;
            return def;
        },
        _getComplexQuery: function () {
            var match = this._matchSelect.value;
            var customQuery = {};
            var extent;
            if (this._extentSelect.value === true) {
                extent = this.mapState.getExtent();
                customQuery.geometry = {
                    $contains: extent
                };
            } else {
            }
            var children = this._queryNode.children;
            if (children.length > 0)
            {
                customQuery[match] = [];
            }
            d_array.forEach(children, function (child) {
                var widget = d_registry.getEnclosingWidget(child);
                var fieldId = widget.getSelectedField();
                var compareId = widget.getSelectedCompare();
                var not = widget.getSelectedNot();
                var value = widget.getValue();
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
            return customQuery;
        },
        _getCustomQueryObj: function (customQuery) {
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
        _validateCustomQuery: function (customQueryString) {
            var result = false;
            if (customQueryString) {
                try {
                    var customQueryObj = JSON.parse(customQueryString);
                } catch (e) {
                    return false;
                }
            } else {
                var customQueryObj = this.properties.customquery;
            }
            if (JSON.stringify(customQueryObj) === "{}")
                return true;
            var i = 0;
            var obj1 = [];
            var obj2 = [];
            for (var child in customQueryObj) {
                i++;
                obj1.push(customQueryObj[child]);
                obj2.push(child);
            }
            if (i === 1) {
                if (obj2[0] === "$and" || obj2[0] === "$or") {
                    var objects = obj1[0];
                    var results = 0;
                    d_array.forEach(objects, function (object, i) {
                        i = 0;
                        for (var child in object) {
                            for (var child in object[child]) {
                                i++;
                            }
                        }
                        if (i === 1) {
                            results++;
                        }
                    });
                    if (results === objects.length) {
                        result = true;
                    }
                }
            } else if (i === 2) {
                if (obj2[0] === "geometry") {
                    if (obj2[1] === "$and" || obj2[1] === "$or") {
                        var objects = obj1[0];
                        var results = 0;
                        d_array.forEach(objects, function (object, i) {
                            i = 0;
                            for (var child in object) {
                                for (var child in object[child]) {
                                    i++;
                                }
                            }
                            if (i === 1) {
                                results++;
                            }
                        });
                        if (results.length === objects.length) {
                            result = true;
                        }
                    }
                }
            }
            return result;
        },
        _onCancel: function () {
            //needed
        },
        _getSelectedStore: function (id) {
            var s;
            d_array.forEach(this.stores, function (store) {
                if (id === store.id) {
                    s = store;
                }
            }, this);
            return s;
        },
        _getFields: function () {
            var storeId = this._storeSelect.value;
            var store = this._getSelectedStore(storeId);
            //
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
                if (field.type !== "geometry") {
                    storeData.push({id: field.name, title: field.title + " (" + field.type + ") " + codedValueString, type: field.type, codedValues: codedValues});
                }
            });
            return storeData;
        },
        _addDataField: function (field, editOptions) {
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
            var storeId = this._storeSelect.value;
            var fieldWidget = new FieldWidget({
                source: this,
                store: this._getSelectedStore(storeId),
                storeData: storeData,
                i18n: this.i18n.fields,
                fieldId: fieldId,
                compareId: compareId,
                value: value,
                not: not,
                editOptions: editOptions,
                type: "admin"
            });
            domConstruct.place(fieldWidget.domNode, this._queryNode, "last");
            this._changeChildrenButtons();
        },
        _addField: function () {
            var storeId = this._storeSelect.value;
            var storeData = this._getFields();
            var fieldWidget = new FieldWidget({
                source: this,
                store: this._getSelectedStore(storeId),
                storeData: storeData,
                i18n: this.i18n.fields,
                type: "admin"
            });
            domConstruct.place(fieldWidget.domNode, this._queryNode, "last");
            this._changeChildrenButtons();
        },
        _removeLastField: function () {
            this._queryNode.removeChild(this._queryNode.lastChild);
            this._changeChildrenButtons();
        },
        _removeFields: function () {
            while (this._queryNode.firstChild) {
                this._queryNode.removeChild(this._queryNode.firstChild);
            }
        },
        _changeChildrenButtons: function () {
            var children = this._queryNode.children;
            d_array.forEach(children, function (child, i) {
                var widget = d_registry.getEnclosingWidget(child);
                if (i === 0 && children.length === 1) {
                    widget._changeButtons(true, false);
                } else if (i === children.length - 1 && children.length !== 1) {
                    widget._changeButtons(false, true);
                } else {
                    widget._changeButtons(false, false);
                }
            });
        },
        _createBuilderGUI: function (textAreaCustomQuery) {
            var ynStore = new Memory({
                data: [
                    {name: this.i18n.yes, id: true},
                    {name: this.i18n.no, id: false}
                ]
            });
            if (!this._extentSelect) {
                this._extentSelect = new FilteringSelect({
                    name: "extent",
                    value: false,
                    store: ynStore,
                    searchAttr: "name",
                    style: "width: 80px;",
                    required: true,
                    maxHeight: this.maxComboBoxHeight
                }, this._extentNode);
            }
            if (!this._editableSelect) {
                this._editableSelect = new FilteringSelect({
                    name: "editable",
                    value: false,
                    store: ynStore,
                    searchAttr: "name",
                    style: "width: 80px;",
                    required: true,
                    maxHeight: this.maxComboBoxHeight
                }, this._editableNode);
            }
            var matchStore = this._matchStore = new Memory({
                data: [
                    {name: this.i18n.and, id: "$and"},
                    {name: this.i18n.or, id: "$or"}]
            });
            if (!this._matchSelect) {
                this._matchSelect = new FilteringSelect({
                    name: "match",
                    value: "$and",
                    store: matchStore,
                    searchAttr: "name",
                    style: "width: 80px;",
                    required: true,
                    maxHeight: this.maxComboBoxHeight
                }, this._matchNode);
            }
            var properties = this.properties;
            if (textAreaCustomQuery) {
                var customQuery = textAreaCustomQuery;
            } else {
                var customQuery = properties.customquery;
            }
            if (properties.options.editable !== undefined) {
                var editable = properties.options.editable;
                this._editableSelect.set("value", editable);
            }
            if (customQuery.geometry) {
                this._extentSelect.set("value", true);
            } else {
                this._extentSelect.set("value", false);
            }
            var match;
            if (customQuery.$and) {
                this._matchSelect.set("value", "$and");
                match = "$and";
            } else if (customQuery.$or) {
                this._matchSelect.set("value", "$or");
                match = "$or";
            }
            var fields = customQuery[match];
            var editFields = this.properties.options.editOptions;
            this._removeFields();
            if (fields) {
                d_array.forEach(fields, function (field, i) {
                    var editOptions = editFields && editFields[i];
                    this._addDataField(field, editOptions);
                }, this);
            } else {
                this._addField();
            }
        },
        _createOptionsGUI: function () {
            this._countTextBox = new NumberTextBox({
                name: "count",
                value: this.properties.options.count || -1,
                style: "width: 140px;",
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
                ignoreCase = false;
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
        _createPlaceholderGUI: function () {
            var placeholderObj = this.replacer.get("placeholder");
            var placeholderArray = [];
            for (var placeholder in placeholderObj) {
                placeholderArray.push({id: placeholder, key: "${" + placeholder + "}", value: placeholderObj[placeholder]});
            }
            var store = new ComplexMemoryStore({
                data: placeholderArray,
                idProperty: "id",
                metadata: {
                    displayField: "label",
                    fields: [
                        {
                            "title": this.i18n.key,
                            "name": "key",
                            "type": "string",
                            "identifier": true
                        },
                        {
                            "title": this.i18n.value,
                            "name": "value",
                            "type": "string"
                        }
                    ]
                }
            });
            var model = this._viewModel = new DataViewModel({
                store: store
            });
            var dataView = this._dataView = new DataView({
                i18n: this.i18n,
                showFilter: true,
                filterDuringKeyUp: true,
                showPager: true,
                showViewButtons: false,
                itemsPerPage: 10,
                DGRID: {
                    checkboxSelection: false,
                    columns: [
                        {
                            matches: {
                                name: {
                                    $eq: "key"
                                }
                            }
                        },
                        {
                            matches: {
                                name: {
                                    $eq: "value"
                                }
                            }
                        }
                    ]
                }
            });
            this._placeholderNode.set("content", dataView);
            dataView.startup();
            dataView.set("model", model);
        },
        _onStoreChange: function () {
            this._removeFields();
            this._addField();
        },
        _onBuilderTab: function () {
            if (this._titleTextBox.isValid() && this._iconClassTextBox.isValid()) {
                this._doneButton.set("disabled", false);
            }
            var customQueryString = this._customQueryTextArea.get("value");
            if (this._validateCustomQuery(customQueryString)) {
                this._createBuilderGUI(JSON.parse(customQueryString));
            }
            ct_css.switchHidden(this._bottomNode.domNode, false);
        },
        _onOptionsTab: function () {
            ct_css.switchHidden(this._bottomNode.domNode, true);
        },
        _onPlaceholderTab: function () {
            ct_css.switchHidden(this._bottomNode.domNode, true);
        },
        _onManualTab: function () {
            if (this._titleTextBox.isValid() && this._iconClassTextBox.isValid()) {
                this._doneButton.set("disabled", false);
            }
            if (this._validateCustomQuery()) {
                var customQueryString = JSON.stringify(this._getComplexQuery(), "", "\t");
                this._customQueryTextArea.set("value", customQueryString);
            }
            ct_css.switchHidden(this._bottomNode.domNode, false);
        },
        _onTextAreaInput: function () {
            var that = this;
            var customQueryString = that._customQueryTextArea.get("value");
            var valid = that._validateCustomQuery(customQueryString);
            that._builderTab.set("disabled", !valid);
        }
    });
});
