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
            var storeData = this.metadataAnalyzer.getStoreData(stores, storesInfo);
            return ct_when(storeData, function (storeData) {
                this.storeData = storeData;
                this._init();
                this._addField();
                this.connect(this.dataModel, "onDatasourceChanged", function (arguments) {
                    var datasource = arguments.filteredDatasource;
                    var index = ct_array.arrayFirstIndexOf(this._filteringSelect.store.data, {id: "resultcenterDatasource"});
                    if (datasource) {
                        if (index === -1) {
                            this._filteringSelect.store.add({
                                id: "resultcenterDatasource",
                                name: this.i18n.userSelectedFeatures
                            });
                        }
                    } else {
                        if (index > -1)
                            this._filteringSelect.store.remove("resultcenterDatasource");
                        this._filteringSelect.set("value", this._filteringSelect.store.data[0].id);
                    }
                });
            }, this);
        },
        _init: function () {
            ct_css.switchHidden(this._geometryButton.domNode, true);
            ct_css.switchHidden(this._spatialRelationDiv, true);
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
            if (this.querygeometryTool) {
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
                    maxHeight: this.maxComboBoxHeight
                }, this._geometryNode);
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
            } else {
                var geometryStore = new Memory({
                    data: [
                        {name: this.i18n.userGeometryEverywhere, id: false},
                        {name: this.i18n.userGeometryExtent, id: true}
                    ]
                });
                this._geometrySelect = new FilteringSelect({
                    name: "geometry",
                    value: false,
                    store: geometryStore,
                    searchAttr: "name",
                    style: "width: 155px;",
                    required: true,
                    maxHeight: this.maxComboBoxHeight
                }, this._geometryNode);
            }
            var spatialRelationStore = new Memory({
                data: [
                    {name: this.i18n.spatialRelations.contains, id: "contains"},
                    {name: this.i18n.spatialRelations.within, id: "within"},
                    {name: this.i18n.spatialRelations.intersects, id: "intersects"},
                    {name: this.i18n.spatialRelations.crosses, id: "crosses"}
                ]
            });
            this._spatialRelationSelect = new FilteringSelect({
                name: "spatialRelation",
                value: "contains",
                store: spatialRelationStore,
                searchAttr: "name",
                style: "width: 155px;",
                required: true,
                maxHeight: this.maxComboBoxHeight
            }, this._spatialRelationNode);
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
                maxHeight: this.maxComboBoxHeight
            }, this._matchNode);
            this._changeMatchVisibility();
            this.connect(filteringSelect, "onChange", this._removeFields);
            this.connect(this.tool, "onActivate", function () {
                if (this._geometry)
                    this.drawGeometryHandler.drawGeometry(this._geometry);
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
        _setProcessing: function (processing) {
            var tool = this.tool;
            if (tool) {
                tool.set("processing", processing);
            }
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
            var fieldData = this.metadataAnalyzer.getFields(store);
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
            var store = ct_array.arraySearchFirst(this.stores, {id: id});
            if(!store) {
                store = this.dataModel.filteredDatasource;
            }
            return store;
        },
        _onDone: function () {
            this._setProcessing(true);
            var complexQuery = this._getComplexQuery();

            this._searchReplacer(complexQuery);

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
        _onChooseGeometry: function () {
            this.querygeometryTool.set("active", true);
        },
        _getComplexQuery: function () {
            var match = this._matchSelect.value;
            var customQuery = {};
            if (this._geometrySelect.value === true) {
                if (this.querygeometryTool) {
                    var geometry = this._geometry;
                    if (geometry) {
                        var spatialRelation = this._spatialRelationSelect.value;
                        var operator = "$" + spatialRelation;
                        customQuery.geometry = {};
                        customQuery.geometry[operator] = geometry;
                    }
                } else {
                    var extent = this.mapState.getExtent();
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
                if (typeof(value) === "string")
                    if (value.substring(0, 1) === "$")
                        o[i] = this.replacer.replace(value);
                if (value !== null && typeof(value) == "object") {
                    this._searchReplacer(value);
                }
            }
        },
        saveInputGeometry: function (event) {
            this._geometry = event.getProperty("geometry");
            this.querygeometryTool.set("active", false);
            //this.tool.set("active", true);
        }
    });
});