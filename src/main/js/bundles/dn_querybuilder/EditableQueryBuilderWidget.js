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
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/EditableQueryBuilderWidget.html",
    "./config/FieldWidget",
    "dojo/html",
    "dijit/registry",
    "dijit/form/TextBox",
    "dijit/form/ValidationTextBox",
    "dijit/form/Select",
    "dijit/form/FilteringSelect",
    "dijit/form/Button",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "ct/_when",
    "ct/util/css"
], function (declare,
             d_class,
             domConstruct,
             d_array,
             _WidgetBase,
             _TemplatedMixin,
             _WidgetsInTemplateMixin,
             templateStringContent,
             FieldWidget,
             d_html,
             d_registry,
             TextBox,
             ValidationTextBox,
             Select,
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
            var storeData = this.storeData = this.metadataAnalyzer.getStoreDataByIds2([this.store.id]);
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

            //d_html.set(this._titleNode, this.properties.title);

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
            var store = this.store;
            var fieldData = this.metadataAnalyzer.getFields(store);
            ct_when(fieldData, function (storeData) {
                var fieldWidget = new FieldWidget({
                    source: this,
                    store: this.store,
                    storeData: storeData,
                    i18n: this.i18n.fields,
                    fieldId: fieldId,
                    relationalOperatorId: relationalOperatorId,
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
            var properties = this.properties;
            var customQuery = properties.customquery;
            var queryBuilderProperties = this.queryBuilderProperties._properties;
            var storeSelect = this._storeSelect = new Select({
                name: "stores",
                value: this.store.id,
                options: this.storeData,
                disabled: true
            }).placeAt(this._storeNode);
            d_class.add(storeSelect.domNode, "input-block");

            this._matchRadioButtonAnd.set("disabled", true);
            this._matchRadioButtonOr.set("disabled", true);

            this._geometryRadioButton1.set("disabled", true);
            this._geometryRadioButton2.set("disabled", true);
            this._geometryRadioButton3.set("disabled", true);
            ct_css.switchHidden(this._geometryLabel2, true);
        },
        _createGUIFields: function () {
            var properties = this.properties;
            var customQuery = properties.customquery;
            var match;
            if (customQuery.geometry) {
                this._geometryRadioButton3.set("checked", true);
            } else {
                this._geometryRadioButton3.set("checked", false);
            }
            if (customQuery.$and) {
                this._matchRadioButtonAnd.set("checked", true);
                match = "$and";
            } else if (customQuery.$or) {
                this._matchRadioButtonOr.set("checked", true);
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
            var match = this._matchRadioButtonAnd.checked ? "$and" : "$or";
            var customQuery = {};
            if (this._geometryRadioButton1.checked === false) {
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