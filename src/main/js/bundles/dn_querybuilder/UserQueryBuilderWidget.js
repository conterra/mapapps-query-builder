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
    "dojo/dom-prop",
    "dojo/_base/array",
    "dojo/dom-style",
    "dojo/store/Memory",

    "dojo/text!./templates/UserQueryBuilderWidget.html",
    "./QueryBuilderWidget",
    "./config/FieldWidget",

    "dijit/registry",
    "dijit/form/TextBox",
    "dijit/form/ValidationTextBox",
    "dijit/form/RadioButton",
    "dijit/form/Select",
    "dijit/form/FilteringSelect",
    "dijit/form/Button",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",

    "ct/_Connect",
    "ct/async",
    "ct/_when",
    "ct/array",
    "ct/util/css"
], function (declare, d_class, domConstruct, domProp, d_array, d_style, Memory,
             templateStringContent, QueryBuilderWidget, FieldWidget,
             d_registry, TextBox, ValidationTextBox, RadioButton, Select, FilteringSelect, Button, ContentPane, BorderContainer,
             _Connect, ct_async, ct_when, ct_array, ct_css) {
    return declare([QueryBuilderWidget, _Connect], {
        templateString: templateStringContent,
        baseClass: "userQueryBuilderWidget",
        startup: function () {
            this.inherited(arguments);
            var stores = this.stores;
            var storeIds = this.properties.storeIds;
            this.storeData = this.metadataAnalyzer.getStoreDataByIds(storeIds);
            if (this.storeData.length === 0)
                this.storeData = this.metadataAnalyzer.getStoreData(stores);
            this._init();
            this._addField();
        },
        destroy: function () {
            this.disconnect();
            this.inherited(arguments);
        },
        _init: function () {
            var queryBuilderProperties = this.queryBuilderProperties._properties;
            ct_css.switchHidden(this._geometryButton.domNode, true);
            ct_css.switchHidden(this._spatialRelationDiv, true);
            ct_css.switchHidden(this._useOnlyGeometryDiv, true);
            this.maxComboBoxHeight = 160;
            var store = new Memory({
                data: this.storeData
            });
            var storeSelect = this._storeSelect = new FilteringSelect({
                name: "stores",
                value: this.storeData[0].id,
                store: store,
                searchAttr: "name",
                maxHeight: this.maxComboBoxHeight
            }).placeAt(this._storeNode);
            d_class.add(storeSelect.domNode, "input-block");
            if (queryBuilderProperties.defaultRelationalOperator === "$and") {
                this._matchRadioButtonAnd.set("checked", true);
            } else {
                this._matchRadioButtonOr.set("checked", true);
            }
            ct_css.switchHidden(this._geometryLabel3, true);
            if (this.querygeometryTool) {
                ct_css.switchHidden(this._geometryLabel2, true);
                ct_css.switchHidden(this._geometryLabel3, false);
                this.connect(this._geometryRadioButton1, "onChange", function (value) {
                    if (value === false) {
                        ct_css.switchHidden(this._geometryButton.domNode, false);
                        ct_css.switchHidden(this._spatialRelationDiv, false);
                        //ct_css.switchHidden(this._useOnlyGeometryDiv, false);
                    } else {
                        this.drawGeometryHandler.clearGraphics();
                        ct_css.switchHidden(this._geometryButton.domNode, true);
                        ct_css.switchHidden(this._spatialRelationDiv, true);
                        ct_css.switchHidden(this._useOnlyGeometryDiv, true);
                    }
                });
            }
            this._spatialRelationSelect = new Select({
                name: "spatialRelation",
                value: "contains",
                options: [
                    {label: this.i18n.spatialRelations.contains, value: "contains"},
                    {label: this.i18n.spatialRelations.within, value: "within"},
                    {label: this.i18n.spatialRelations.intersects, value: "intersects"},
                    {label: this.i18n.spatialRelations.crosses, value: "crosses"}
                ]
            }).placeAt(this._spatialRelationNode);
            d_class.add(this._spatialRelationSelect.domNode, "input-block");
            this._changeMatchVisibility();
            if (this.dataModel.filteredDatasource) {
                this._storeSelect.store.add({
                    id: "resultcenterDatasource",
                    name: this.i18n.userSelectedFeatures
                });
            }
            this.connect(this.dataModel, "onDatasourceChanged", function (args) {
                var datasource = args.filteredDatasource;
                var index = ct_array.arrayFirstIndexOf(this._storeSelect.store.data, {id: "resultcenterDatasource"});
                if (datasource) {
                    if (index === -1) {
                        this._storeSelect.store.add({
                            id: "resultcenterDatasource",
                            name: this.i18n.userSelectedFeatures
                        });
                    }
                } else {
                    if (index > -1)
                        this._storeSelect.store.remove("resultcenterDatasource");
                    this._storeSelect.set("value", this._storeSelect.store.data[0].id);
                }
            });
            this.connect(storeSelect, "onChange", this._removeFields);
            this.connect(this.tool, "onActivate", function () {
                if (this._geometry && this.drawGeometryHandler)
                    this.drawGeometryHandler.drawGeometry(this._geometry);
            }, this);
            this.connect(this.tool, "onDeactivate", function () {
                if (this.drawGeometryHandler)
                    this.drawGeometryHandler.clearGraphics();
            }, this);
        },
        _changeMatchVisibility: function () {
            if (this._queryNode.children.length > 1) {
                ct_css.switchHidden(this._matchDiv, false);
            } else {
                ct_css.switchHidden(this._matchDiv, true);
            }
        },
        _addField: function () {
            var storeId = this._storeSelect.get("value");
            var store = this._getSelectedStoreObj(storeId);
            var fieldData = this.metadataAnalyzer.getFields(store);
            ct_when(fieldData, function (storeData) {
                var fieldWidget = new FieldWidget({
                    source: this,
                    store: this._getSelectedStoreObj(storeId),
                    storeData: storeData,
                    i18n: this.i18n.fields,
                    type: "user",
                    queryBuilderProperties: this.queryBuilderProperties
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
            if (!store) {
                store = this.dataModel.filteredDatasource;
            }
            return store;
        },
        _onDone: function () {
            this.setProcessing(true);
            var customQuery = {};
            var checkBox = this._useOnlyGeometry;
            if (!checkBox.checked) {
                customQuery = this._getComplexQuery()
            } else {
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

            this.queryController.searchReplacer(customQuery);

            var storeId = this._storeSelect.get("value");
            var store = this._getSelectedStoreObj(storeId);
            var options = {}/*{ignoreCase: true}*/;

            this.queryController.query(store, customQuery, options, this.tool);
        },
        _onChooseGeometry: function () {
            this.querygeometryTool.set("active", true);
        },
        _onUseOnlyGeometry: function (value) {
            if (value) {
                ct_css.switchHidden(this._centerNode.domNode, true);
            } else {
                ct_css.switchHidden(this._centerNode.domNode, false);
            }
        },
        _getComplexQuery: function () {
            var match = this._matchRadioButtonAnd.checked ? "$and" : "$or";
            var customQuery = {};
            if (this._geometryRadioButton1.checked === false) {
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
        saveInputGeometry: function (event) {
            this._geometry = event.getProperty("geometry");
            this.querygeometryTool.set("active", false);
        }
    });
})
;