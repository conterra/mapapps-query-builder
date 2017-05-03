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
    "dojo/_base/Deferred",
    "dojo/_base/array",
    "dojo/json",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/store/Memory",

    "ct/_Connect",
    "ct/_when",
    "ct/array",
    "ct/util/css",
    "ct/request",
    "ct/store/ComplexMemory",
    "ct/ui/controls/dataview/DataViewModel",
    "ct/ui/controls/dataview/DataView",

    "wizard/_BuilderWidget",
    "dn_querybuilder/FieldWidget",

    "dijit/registry",
    "dijit/form/NumberTextBox",
    "dijit/form/FilteringSelect",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/_CssStateMixin",
    "dojo/text!./templates/ToolsBuilderWizard.html",
    "dijit/form/Button",
    "dijit/form/TextBox",
    "dijit/form/ValidationTextBox",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer"
], function (declare, Deferred, d_array, JSON, domStyle, domConstruct, Memory,
             _Connect, ct_when, ct_array, ct_css, ct_request, ComplexMemoryStore, DataViewModel, DataView,
             _BuilderWidget, FieldWidget,
             d_registry, NumberTextBox, FilteringSelect, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, templateStringContent) {

    return declare([_BuilderWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, _Connect], {
        templateString: templateStringContent,
        baseClass: "queryBuilderWizard",
        constructor: function (opts) {
            this.inherited(arguments);
        },
        destroyInstance: function (instance) {
            this.disconnect();
            instance.destroyRecursive();
        },
        destroy: function () {
            this.disconnect();
            this.inherited(arguments);
        },
        postCreate: function () {
            this.inherited(arguments);
            this.maxComboBoxHeight = 160;
            domStyle.set(this._titleTextBox.domNode, "width", "250px");
            domStyle.set(this._iconClassTextBox.domNode, "width", "209px");
            var storeData = this.metadataAnalyzer.getStoreData(this.stores);
            var store = new Memory({
                data: storeData
            });
            var storeSelect = this._storeSelect = new FilteringSelect({
                name: "stores",
                value: this.properties.storeId || storeData[0].id,
                store: store,
                searchAttr: "name",
                style: "width: 250px;",
                maxHeight: this.maxComboBoxHeight
            }).placeAt(this._storeNode, "replace");
            storeSelect.startup();
            this._titleTextBox.set("value", this.properties.title);
            this._iconClassTextBox.set("value", this.properties.iconClass);
            var customQueryString = JSON.stringify(this.properties.customquery, "", "\t");
            this._customQueryTextArea.set("value", customQueryString);
            ct_css.switchHidden(this._geometryButton.domNode, true);
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
            if (this.drawGeometryHandler)
                this.drawGeometryHandler.clearGraphics();
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
                this.properties.customquery = this._getComplexQuery();
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
            var extent = this.mapState.getExtent();
            if (this._geometrySelect.value === true) {
                if (this.querygeometryTool) {
                    var geometry = this.widget._geometry;
                    if (geometry) {
                        var spatialRelation = this._spatialRelationSelect.value;
                        var operator = "$" + spatialRelation;
                        customQuery.geometry = {};
                        customQuery.geometry[operator] = geometry;
                    } else {
                        customQuery.geometry = {
                            $contains: extent
                        };
                    }
                } else {
                    customQuery.geometry = {
                        $contains: extent
                    };
                }
            }
            var children = this._queryNode.children;
            if (children.length > 0) {
                customQuery[match] = [];
            }
            d_array.forEach(children, function (child) {
                var widget = d_registry.getEnclosingWidget(child);
                var fieldId = widget.getSelectedField();
                var relationalOperatorId = widget.getSelectedRelationalOperator();
                var not = widget.getSelectedNot();
                var value = widget.getValue();
                var obj1 = {};
                obj1[relationalOperatorId] = value;
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
            var customQueryObj;
            if (customQueryString) {
                try {
                    customQueryObj = JSON.parse(customQueryString);
                } catch (e) {
                    return false;
                }
            } else {
                customQueryObj = this.properties.customquery;
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
            var objects, results;
            if (i === 1) {
                if (obj2[0] === "$and" || obj2[0] === "$or") {
                    objects = obj1[0];
                    results = 0;
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
                        objects = obj1[0];
                        results = 0;
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
            if (this.drawGeometryHandler)
                this.drawGeometryHandler.clearGraphics();
        },
        _getSelectedStoreObj: function (id) {
            return ct_array.arraySearchFirst(this.stores, {id: id});
        },
        _addDataField: function (field, editOptions) {
            var fieldId;
            var relationalOperatorId;
            var value;
            var not;
            if (field.$not) {
                not = true;
                for (var a in field.$not) {
                    fieldId = a;
                    for (var b in field.$not[fieldId]) {
                        relationalOperatorId = b;
                        value = field.$not[fieldId][relationalOperatorId];
                    }
                }
            } else {
                not = false;
                for (var a in field) {
                    fieldId = a;
                    for (var b in field[fieldId]) {
                        relationalOperatorId = b;
                        value = field[fieldId][relationalOperatorId];
                    }
                }
            }
            var storeId = this._storeSelect.value;
            var store = this._getSelectedStoreObj(storeId);
            var fieldData = this.metadataAnalyzer.getFields(store);

            ct_when(fieldData, function (storeData) {
                var storeId = this._storeSelect.value;
                var fieldWidget = new FieldWidget({
                    source: this,
                    store: this._getSelectedStoreObj(storeId),
                    storeData: storeData,
                    i18n: this.i18n.fields,
                    fieldId: fieldId,
                    relationalOperatorId: relationalOperatorId,
                    value: value,
                    not: not,
                    editOptions: editOptions,
                    type: "admin",
                    queryBuilderProperties: this.queryBuilderProperties
                });
                domConstruct.place(fieldWidget.domNode, this._queryNode, "last");
                this._changeChildrenButtons();
            }, this);
        },
        _addField: function () {
            var storeId = this._storeSelect.value;
            var store = this._getSelectedStoreObj(storeId);
            var fieldData = this.metadataAnalyzer.getFields(store);
            ct_when(fieldData, function (storeData) {
                var fieldWidget = new FieldWidget({
                    source: this,
                    store: this._getSelectedStoreObj(storeId),
                    storeData: storeData,
                    i18n: this.i18n.fields,
                    type: "admin",
                    queryBuilderProperties: this.queryBuilderProperties
                });
                domConstruct.place(fieldWidget.domNode, this._queryNode, "last");
                this._changeChildrenButtons();
            }, this);
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
            var queryBuilderProperties = this.queryBuilderProperties._properties;
            ct_css.switchHidden(this._spatialRelationDiv, true);
            var geometryStore = new Memory({
                data: [
                    {name: this.i18n.yes, id: true},
                    {name: this.i18n.no, id: false}
                ]
            });
            var ynStore = new Memory({
                data: [
                    {name: this.i18n.yes, id: true},
                    {name: this.i18n.no, id: false}
                ]
            });
            var spatialRelationStore = new Memory({
                data: [
                    {name: this.i18n.spatialRelations.contains, id: "contains"},
                    {name: this.i18n.spatialRelations.within, id: "within"},
                    {name: this.i18n.spatialRelations.intersects, id: "intersects"},
                    {name: this.i18n.spatialRelations.crosses, id: "crosses"}
                ]
            });
            if (!this._geometrySelect) {
                this._geometrySelect = new FilteringSelect({
                    name: "geometry",
                    value: false,
                    store: geometryStore,
                    searchAttr: "name",
                    style: "width: 80px;",
                    required: true,
                    maxHeight: this.maxComboBoxHeight
                }).placeAt(this._geometrySelectNode, "replace");
            }
            if (this.querygeometryTool) {
                this._geometryLabel.innerHTML = this.i18n.useGeometry;
                this.connect(this._geometrySelect, "onChange", function (value) {
                    if (value === true) {
                        ct_css.switchHidden(this._geometryButton.domNode, false);
                        ct_css.switchHidden(this._spatialRelationDiv, false);
                    } else {
                        this.drawGeometryHandler.clearGraphics();
                        ct_css.switchHidden(this._geometryButton.domNode, true);
                        ct_css.switchHidden(this._spatialRelationDiv, true);
                    }
                });
            }
            if (!this._spatialRelationSelect) {
                this._spatialRelationSelect = new FilteringSelect({
                    name: "spatialRelation",
                    value: "contains",
                    store: spatialRelationStore,
                    searchAttr: "name",
                    style: "width: 80px;",
                    required: true,
                    maxHeight: this.maxComboBoxHeight
                }).placeAt(this._spatialRelationNode, "replace");
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
                }).placeAt(this._editableNode, "replace");
            }
            var matchStore = new Memory({
                data: [
                    {name: this.i18n.and, id: "$and"},
                    {name: this.i18n.or, id: "$or"}]
            });
            if (!this._matchSelect) {
                this._matchSelect = new FilteringSelect({
                    name: "match",
                    value: queryBuilderProperties.defaultRelationalOperator,
                    store: matchStore,
                    searchAttr: "name",
                    style: "width: 80px;",
                    required: true,
                    maxHeight: this.maxComboBoxHeight
                }).placeAt(this._matchNode, "replace");
            }
            var properties = this.properties;
            var customQuery;
            if (textAreaCustomQuery) {
                customQuery = textAreaCustomQuery;
            } else {
                customQuery = properties.customquery;
            }
            if (properties.options.editable !== undefined) {
                var editable = properties.options.editable;
                this._editableSelect.set("value", editable);
            }
            if (customQuery.geometry) {
                this._geometrySelect.set("value", true);
                if (this.querygeometryTool) {
                    ct_css.switchHidden(this._spatialRelationDiv, false);
                    var spatialRelation = Object.keys(customQuery.geometry)[0];
                    var geom = customQuery.geometry[spatialRelation];
                    this.widget._geometry = geom;
                    if (!textAreaCustomQuery)
                        this.drawGeometryHandler.drawGeometry(geom);
                    try {
                        this.mapState.setExtent(geom.getExtent());
                    } catch (e) {
                    }
                    spatialRelation = spatialRelation.substr(1, spatialRelation.length - 1);
                    this._spatialRelationSelect.set("value", spatialRelation);
                }
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
                placeholderArray.push({
                    id: placeholder,
                    key: "${" + placeholder + "}",
                    value: placeholderObj[placeholder]
                });
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
        },
        _onChooseGeometry: function () {
            this.querygeometryTool.set("active", true);
        }
    });
});
