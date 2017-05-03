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

        "dojo/text!./templates/QueryBuilderWidget.html",
        "./FieldWidget",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin",
        "dijit/registry",
        "dijit/form/Select",
        "dijit/form/FilteringSelect",
        "dijit/form/TextBox",
        "dijit/form/ValidationTextBox",
        "dijit/form/RadioButton",
        "dijit/form/Button",
        "dijit/layout/ContentPane",
        "dijit/layout/BorderContainer",

        "ct/_Connect",
        "ct/_when",
        "ct/array",
        "ct/util/css"
    ], function (declare, d_class, domConstruct, domProp, d_array, d_style, Memory,
                 templateStringContent, FieldWidget, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, d_registry, Select, FilteringSelect, TextBox, ValidationTextBox, RadioButton, Button, ContentPane, BorderContainer,
                 _Connect, ct_when, ct_array, ct_css) {
        return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Connect], {
            templateString: templateStringContent,
            postCreate: function () {
                this.inherited(arguments);
            },
            resize: function (dim) {
                if (dim && dim.h > 0) {
                    this._containerNode.resize({
                        w: dim.w,
                        h: dim.h
                    });
                }
            },
            getComplexQuery: function () {
                var match = this._matchRadioButtonAnd.checked ? "$and" : "$or";
                var customQuery = {};
                if (this._geometryRadioButton1.checked === false) {
                    var properties = this.properties;
                    if (properties.customquery && properties.customquery.geometry) {
                        customQuery.geometry = properties.customquery.geometry;
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
            _changeMatchVisibility: function () {
                if (this._queryNode.children.length > 1) {
                    ct_css.switchHidden(this._matchDiv, false);
                } else {
                    ct_css.switchHidden(this._matchDiv, true);
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
            _getSelectedStoreObj: function (id) {
                var store = ct_array.arraySearchFirst(this.stores, {id: id});
                if (!store) {
                    store = this.dataModel.filteredDatasource;
                }
                return store;
            },
            saveInputGeometry: function (event) {
                this._geometry = event.getProperty("geometry");
                this.querygeometryTool.set("active", false);
            }
        });
    }
)
;