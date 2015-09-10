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
    "dojo/on",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/UserQueryBuilderWidget.html",
    "./config/FieldWidget",
    "dojo/_base/lang",
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
    "ct/store/Filter"
], function (declare,
        domConstruct,
        d_array,
        on,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        templateStringContent,
        FieldWidget,
        d_lang,
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
        Filter) {
    return declare([_WidgetBase, _TemplatedMixin,
        _WidgetsInTemplateMixin], {
        templateString: templateStringContent,
        baseClass: "userQueryBuilderWizard",
        postCreate: function () {
            this.inherited(arguments);
        },
        startup: function () {
            this.inherited(arguments);
            // search stores
            var stores = this.stores;
            var storeData = this._getStoreData(stores);
            return ct_when(storeData, function (storeData) {
                this.storeData = storeData;
                this._init();
            }, this);
        },
        _init: function () {
            var store = new Memory({
                data: this.storeData
            });
            var filteringSelect = this._filteringSelect = new FilteringSelect({
                name: "stores",
                value: this.storeData[0].id,
                store: store,
                searchAttr: "name",
                style: "width: 155px;"
            }, this._filteringNode);
            filteringSelect.startup();

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
                style: "width: 155px;",
                required: true
            }, this._extentNode);
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
                style: "width: 155px;",
                required: true
            }, this._matchNode);

            this.connect(filteringSelect, "onChange", this._removeFields);
            //on(filteringSelect, "onChange", this._removeFields);
        },
        resize: function (dim) {
            if (dim && dim.h > 0) {
                this._containerNode.resize({
                    w: dim.w,
                    h: dim.h
                });
            }
        },
        _setProcessing: function (processing) {
            var tool = this.tool;
            if (tool) {
                tool.set("processing", processing);
            }
        },
        _iconClassHelp: function () {
            var winURL = 'http://www.mapapps.de/mapapps/resources/jsregistry/root/themes/3.2.1/themes/webFontsGallery.html';
            var winName = 'win1';
            var winSize = 'width=800,height=600,scrollbars=yes';
            var ref = window.open(winURL, winName, winSize);
        },
        _addField: function () {
            var storeId = this._filteringSelect.get("value");
            var storeData = this._getFields();
            var fieldWidget = new FieldWidget({
                store: this._getSelectedStore(storeId),
                storeData: storeData,
                i18n: this.i18n.fields,
                type: "user"
            });
            domConstruct.place(fieldWidget.domNode, this._queryNode, "last");
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
        _getStoreData: function (stores) {
            return ct_async.join(d_array.map(stores, function (s) {
                return s.getMetadata();
            })).then(function (metadata) {
                return d_array.map(metadata, function (metadata, index) {
                    var id = stores[index].id;
                    var title = metadata.title || id;
                    return {name: title, id: id};
                });
            });
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
        _removeFields: function () {
            while (this._queryNode.firstChild) {
                this._queryNode.removeChild(this._queryNode.firstChild);
            }
        },
        _onDone: function () {
            var complexQuery = this._getComplexQuery();
            var storeId = this._filteringSelect.get("value");
            var store = this._getSelectedStore(storeId);
            var filter = new Filter(store, complexQuery);
            this.dataModel.setDatasource(filter);
        },
        _getComplexQuery: function () {
            var match = this._matchSelect.value;
            var customQuery = {};
            var extent;
            if (this._extentSelect.value === "yes") {
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
                var fieldId = widget._getSelectedField().id;
                var compareId = widget._getSelectedCompare().id;
                var compareValue = widget._getSelectedCompare().value;
                var value = widget._getValue();
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
                    default:
                        var obj = {};
                        var obj2 = {};
                        obj2[compareValue] = value;
                        obj[fieldId] = obj2;
                        customQuery[match].push(obj);
                }
            }, this);
            debugger
            return customQuery;
        }
    });
});