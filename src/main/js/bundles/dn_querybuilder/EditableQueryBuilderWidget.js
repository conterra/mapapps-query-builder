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
    "dojo/dom-construct",
    "dojo/_base/array",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/EditableQueryBuilderWidget.html",
    "./config/FieldWidget",
    "dojo/_base/lang",
    "dojo/html",
    "dojo/json",
    "dojo/store/Memory",
    "dijit/registry",
    "dijit/form/TextBox",
    "dijit/form/ValidationTextBox",
    "dijit/form/FilteringSelect",
    "dijit/form/Button",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "ct/async",
    "ct/_when",
    "ct/store/Filter",
    "ct/util/css"
], function (declare,
             Deferred,
             domConstruct,
             d_array,
             _WidgetBase,
             _TemplatedMixin,
             _WidgetsInTemplateMixin,
             templateStringContent,
             FieldWidget,
             d_lang,
             d_html,
             JSON,
             Memory,
             d_registry,
             TextBox,
             ValidationTextBox,
             FilteringSelect,
             Button,
             ContentPane,
             BorderContainer,
             ct_async,
             ct_when,
             Filter,
             ct_css) {
    return declare([_WidgetBase, _TemplatedMixin,
        _WidgetsInTemplateMixin], {
        templateString: templateStringContent,
        baseClass: "editableQueryBuilderWizard",
        postCreate: function () {
            this.inherited(arguments);
        },
        startup: function () {
            this.inherited(arguments);
            var stores = [this.store];
            var storesInfo = [this.storesInfo];
            var storeData = this.metadataAnalyzer.getStoreData(stores, storesInfo);
            return ct_when(storeData, function (storeData) {
                this.storeData = storeData;
                if (storeData.length > 0) {
                    this._init();
                    ct_css.switchHidden(this._errorNode, true);
                } else {
                    ct_css.switchHidden(this._containerNode.domNode, true);
                }
            }, this);
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
        _setProcessing: function (tool, processing) {
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
                    type: "editing"
                });
                domConstruct.place(fieldWidget.domNode, this._queryNode, "last");
            }, this);
        },
        _createGUISettings: function () {
            var extentStore = new Memory({
                data: [
                    {name: this.i18n.userExtentEverywhere, id: false},
                    {name: this.i18n.userExtentCurrent, id: true}
                ]
            });
            this._extentSelect = new FilteringSelect({
                name: "extent",
                value: false,
                store: extentStore,
                searchAttr: "name",
                style: "width: 155px;",
                required: true,
                maxHeight: this.maxComboBoxHeight,
                disabled: true
            }, this._extentNode);

            var matchStore = new Memory({
                data: [
                    {name: this.i18n.and, id: "$and"},
                    {name: this.i18n.or, id: "$or"}
                ]
            });
            this._matchSelect = new FilteringSelect({
                name: "match",
                value: "$and",
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
                this._extentSelect.set("value", true);
            } else {
                this._extentSelect.set("value", false);
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
            var tool = this.tool;
            this._setProcessing(tool, true);
            var complexQuery = this._getComplexQuery();

            this._searchReplacer(complexQuery);

            var store = this.store;
            var options = {};
            var count = this.properties.options.count;
            if (count >= 0) {
                options.count = count;
            }
            options.ignoreCase = this.properties.options.ignoreCase;
            options.locale = this.properties.options.locale;
            var filter = new Filter(store, complexQuery, options);

            ct_when(filter.query({}, {count: 0}).total, function (total) {
                if (total) {
                    this.dataModel.setDatasource(filter);
                    this._setProcessing(tool, false);
                } else {
                    this.logService.warn({
                        id: 0,
                        message: this.i18n.no_results_error
                    });
                    this._setProcessing(tool, false);
                }
            }, function (e) {
                this._setProcessing(tool, false);
                this.logService.warn({
                    id: e.code,
                    message: e
                });
            }, this);
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