/*
 * Copyright (C) 2018 con terra GmbH (info@conterra.de)
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
    "dojo/store/Memory",

    "ct/util/css",
    "ct/array",

    "./QueryBuilderWidget",

    "dijit/form/Select",
    "dijit/form/FilteringSelect"
], function (declare, d_class, Memory,
             ct_css, ct_array,
             QueryBuilderWidget,
             Select, FilteringSelect) {
    return declare([QueryBuilderWidget], {
        baseClass: "userQueryBuilderWidget",
        startup: function () {
            this.inherited(arguments);
            var stores = this.stores;
            var storeIds = this.properties.storeIds;
            this.storeData = this.metadataAnalyzer.getStoreDataByIds(storeIds);
            if (this.storeData.length === 0)
                this.storeData = this.metadataAnalyzer.getStoreData(stores);
            ct_css.switchHidden(this._errorNode, true);
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
            if (!queryBuilderProperties.searchEverywhereAsDefault) {
                this._geometryRadioButtonExtent.set("checked", true);
            }
            ct_css.switchHidden(this._geometryLabelEnhanced, true);
            if (this.querygeometryTool) {
                ct_css.switchHidden(this._geometryLabelExtent, true);
                ct_css.switchHidden(this._geometryLabelEnhanced, false);
                if (!queryBuilderProperties.searchEverywhereAsDefault) {
                    this._geometryRadioButtonEnhanced.set("checked", true);
                    this._geometryRadioButtonExtent.set("checked", false);
                }
                this.connect(this._geometryRadioButtonEverywhere, "onChange", function (value) {
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
        _onDone: function () {
            var customQuery = {};
            var checkBox = this._useOnlyGeometry;
            if (!checkBox.checked) {
                customQuery = this.getComplexQuery()
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
        }
    });
});