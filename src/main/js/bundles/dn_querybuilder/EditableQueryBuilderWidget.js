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
    "dojo/dom-construct",
    "dojo/_base/array",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/EditableQueryBuilderWidget.html",
    "./config/FieldWidget",
    "dojo/html",
    "dojo/store/Memory",
    "dijit/registry",
    "dijit/form/TextBox",
    "dijit/form/ValidationTextBox",
    "dijit/form/FilteringSelect",
    "dijit/form/Button",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "ct/_when",
    "ct/util/css"
], function (declare,
             domConstruct,
             d_array,
             _WidgetBase,
             _TemplatedMixin,
             _WidgetsInTemplateMixin,
             templateStringContent,
             FieldWidget,
             d_html,
             Memory,
             d_registry,
             TextBox,
             ValidationTextBox,
             FilteringSelect,
             Button,
             ContentPane,
             BorderContainer,
             ct_when,
             ct_css) {
    return declare([_WidgetBase, _TemplatedMixin,
        _WidgetsInTemplateMixin], {
        templateString: templateStringContent,
        baseClass: "editableQueryBuilderWidget",
        postCreate: function () {
            this.inherited(arguments);
        },
        startup: function () {
            this.inherited(arguments);
            var storeData = this.storeData;
            if (storeData.length > 0) {
                this._init();
                ct_css.switchHidden(this._errorNode, true);
            } else {
                ct_css.switchHidden(this._containerNode.domNode, true);
            }
        },
        resize: function (dim) {
            if (dim && dim.h > 0) {
                this._containerNode.resize({
                    w: dim.w,
                    h: dim.h
                });
            }
        },
        _init: function () {
            this.maxComboBoxHeight = 160;

            var store = new Memory({
                data: this.storeData
            });
            d_html.set(this._titleNode, this.properties.title);
            var storeId = this.store.id;
            var storeTitle = store.get(storeId).name;
            d_html.set(this._storeNode, storeTitle);

            this._createGUISettings();
            this._createGUIFields();
        },
        _setProcessing: function (processing) {
            var tool = this.tool;
            if (tool) {
                tool.set("processing", processing);
            }
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
            var store = this.store;
            var fieldData = this.metadataAnalyzer.getFields(store);
            ct_when(fieldData, function (storeData) {
                var fieldWidget = new FieldWidget({
                    source: this,
                    store: this.store,
                    storeData: storeData,
                    i18n: this.i18n.fields,
                    fieldId: fieldId,
                    compareId: compareId,
                    value: value,
                    not: not,
                    editOptions: editOptions,
                    type: "editing",
                    queryBuilderProperties: this.queryBuilderProperties
                });
                domConstruct.place(fieldWidget.domNode, this._queryNode, "last");
            }, this);
        },
        _createGUISettings: function () {
            var properties = this.queryBuilderProperties._properties;
            var geometryStore = new Memory({
                data: [
                    {name: this.i18n.userGeometryEverywhere, id: false},
                    {name: this.i18n.userGeometryEnhanced, id: true}
                ]
            });
            this._geometrySelect = new FilteringSelect({
                name: "geometry",
                value: false,
                store: geometryStore,
                searchAttr: "name",
                style: "width: 155px;",
                required: true,
                maxHeight: this.maxComboBoxHeight,
                disabled: true
            }, this._geometryNode);

            var matchStore = new Memory({
                data: [
                    {name: this.i18n.and, id: "$and"},
                    {name: this.i18n.or, id: "$or"}
                ]
            });
            this._matchSelect = new FilteringSelect({
                name: "match",
                value: properties.defaultMatchValue,
                store: matchStore,
                searchAttr: "name",
                style: "width: 155px;",
                required: true,
                maxHeight: this.maxComboBoxHeight,
                disabled: true
            }, this._matchNode);
        },
        _createGUIFields: function () {
            var properties = this.properties;
            var customQuery = properties.customquery;
            var match;
            if (customQuery.geometry) {
                this._geometrySelect.set("value", true);
            } else {
                this._geometrySelect.set("value", false);
            }
            if (customQuery.$and) {
                this._matchSelect.set("value", "$and");
                match = "$and";
            } else if (customQuery.$or) {
                this._matchSelect.set("value", "$or");
                match = "$or";
            }
            var fields = customQuery[match];
            var editFields = this.properties.options.editOptions;
            if (fields) {
                d_array.forEach(fields, function (field, i) {
                    var editOptions = editFields && editFields[i];
                    this._addDataField(field, editOptions);
                }, this);
            }
        },
        _onDone: function () {
            this._setProcessing(true);
            var customQuery = this._getComplexQuery();

            this._searchReplacer(customQuery);

            var store = this.store;
            var options = {};
            var count = this.properties.options.count;
            if (count >= 0) {
                options.count = count;
            }
            options.ignoreCase = this.properties.options.ignoreCase;
            options.locale = this.properties.options.locale;

            this.queryController.query(store, customQuery, options, this.tool);
        },
        _getComplexQuery: function () {
            var match = this._matchSelect.value;
            var customQuery = {};
            if (this._geometrySelect.value === true) {
                var properties = this.properties;
                customQuery.geometry = properties.customquery.geometry
            }
            var children = this._queryNode.children;
            if (children.length > 0) {
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
        _searchReplacer: function (o) {
            for (var i in o) {
                var value = o[i];
                if (typeof(value) === "string") {
                    o[i] = this.replacer.replace(value);
                }
                if (value !== null && typeof(value) == "object") {
                    this._searchReplacer(value);
                }
            }
        },
        deactivateTool: function () {
            this.tool.set("active", false);
        }
    });
});