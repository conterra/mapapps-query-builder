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
    "dojo/text!./templates/UserQueryBuilderWidget.html",
    "./config/FieldWidget",
    "./config/MetadataAnalyzer",
    "dojo/_base/lang",
    "dojo/json",
    "dojo/store/Memory",
    "dijit/registry",
    "dijit/form/TextBox",
    "dijit/form/ValidationTextBox",
    "dijit/form/FilteringSelect",
    "dijit/form/Button",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "ct/_Connect",
    "ct/async",
    "ct/_when",
    "ct/array",
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
        MetadataAnalyzer,
        d_lang,
        JSON,
        Memory,
        d_registry,
        TextBox,
        ValidationTextBox,
        FilteringSelect,
        Button,
        ContentPane,
        BorderContainer,
        _Connect,
        ct_async,
        ct_when,
        ct_array,
        Filter,
        ct_css) {
    return declare([_WidgetBase, _TemplatedMixin,
        _WidgetsInTemplateMixin, _Connect], {
        templateString: templateStringContent,
        baseClass: "userQueryBuilderWizard",
        postCreate: function () {
            this.inherited(arguments);
        },
        startup: function () {
            this.inherited(arguments);
            // search stores
            var stores = this.stores;
            var storesInfo = this.storesInfo;
            var metadataAnalyzer = new MetadataAnalyzer();
            var storeData = metadataAnalyzer.getStoreData(stores, storesInfo);
            return ct_when(storeData, function (storeData) {
                this.storeData = storeData;
                this._init();
                this._addField();
            }, this);
        },
        onNewStores: function (stores) {
            this.stores = stores;
            var storeData = this._getStoreData(stores);
            ct_when(storeData, function (storeData) {
                this.storeData = storeData;
                var store = new Memory({
                    data: this.storeData
                });
                if (this._filteringSelect)
                    this._filteringSelect.set("store", store);
            }, this);
        },
        _init: function () {

            this.maxComboBoxHeight = 160;
            var store = new Memory({
                data: this.storeData
            });
            var filteringSelect = this._filteringSelect = new FilteringSelect({
                name: "stores",
                value: this.storeData[0].id,
                store: store,
                searchAttr: "name",
                style: "width: 155px;",
                maxHeight: this.maxComboBoxHeight
            }, this._filteringNode);
            var extentStore = this._extentStore = new Memory({
                data: [
                    {name: this.i18n.userExtentYes, id: true},
                    {name: this.i18n.userExtentNo, id: false}
                ]
            });
            this._extentSelect = new FilteringSelect({
                name: "extent",
                value: false,
                store: extentStore,
                searchAttr: "name",
                style: "width: 155px;",
                required: true,
                maxHeight: this.maxComboBoxHeight
            }, this._extentNode);
            var matchStore = this._matchStore = new Memory({
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
                maxHeight: this.maxComboBoxHeight
            }, this._matchNode);
            this._changeMatchVisibility();
            this.connect(filteringSelect, "onChange", this._removeFields);
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
        _changeMatchVisibility: function () {
            if (this._queryNode.children.length > 1) {
                ct_css.switchHidden(this._matchDiv, false);
            } else {
                ct_css.switchHidden(this._matchDiv, true);
            }
        },
        _addField: function () {
            var storeId = this._filteringSelect.get("value");
            var store = this._getSelectedStoreObj(storeId);
            var metadataAnalyzer = new MetadataAnalyzer();
            var fieldData = metadataAnalyzer.getFields(store);
            ct_when(fieldData, function (storeData) {
                var fieldWidget = new FieldWidget({
                    source: this,
                    store: this._getSelectedStoreObj(storeId),
                    storeData: storeData,
                    i18n: this.i18n.fields,
                    type: "user"
                });
                domConstruct.place(fieldWidget.domNode, this._queryNode, "last");
                this._changeMatchVisibility();
                this._changeChildrenButtons();
            }, this);
        },
        _removeLastField: function () {
            this._queryNode.removeChild(this._queryNode.lastChild);
            this._changeChildrenButtons();
            this._changeMatchVisibility();
        },
        _removeFields: function () {
            while (this._queryNode.firstChild) {
                this._queryNode.removeChild(this._queryNode.firstChild);
                this._changeMatchVisibility();
            }
            this._addField();
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
        _getSelectedStoreObj: function (id) {
            return ct_array.arraySearchFirst(this.stores, {id: id});
        },
        _onDone: function () {
            this._setProcessing(true);
            var complexQuery = this._getComplexQuery();
            var geom;
            if (complexQuery.geometry) {
                geom = complexQuery.geometry;
            }
            var customQueryString = JSON.stringify(complexQuery);
            customQueryString = this.replacer.replace(customQueryString);
            complexQuery = JSON.parse(customQueryString);
            if (complexQuery.geometry) {
                complexQuery["geometry"] = geom;
            }
            var storeId = this._filteringSelect.get("value");
            var store = this._getSelectedStoreObj(storeId);
            var filter = new Filter(store, complexQuery/*, {ignoreCase: true}*/);
            ct_when(filter.query({}, {count: 0}).total, function (total) {
                if (total) {
                    this.dataModel.setDatasource(filter);
                    this._setProcessing(false);
                } else {
                    this.logService.warn({
                        id: 0,
                        message: this.i18n.no_results_error
                    });
                    this._setProcessing(false);
                }
            }, function (e) {
                this._setProcessing(false);
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
        }
    });
});