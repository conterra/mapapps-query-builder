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
    "dojo/_base/array",

    "ct/util/css",

    "./QueryBuilderWidget",

    "dijit/form/Select"
], function (declare, d_class, d_array,
             ct_css,
             QueryBuilderWidget,
             Select) {
    return declare([QueryBuilderWidget], {
        baseClass: "editableQueryBuilderWidget",
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
        _init: function () {
            this.maxComboBoxHeight = 160;

            this._createGUISettings();
            this._createGUIFields();
        },
        _setProcessing: function (processing) {
            var tool = this.tool;
            if (tool) {
                tool.set("processing", processing);
            }
        },
        _createGUISettings: function () {
            var properties = this.properties;
            var customQuery = properties.customquery;
            var queryBuilderProperties = this.queryBuilderProperties._properties;
            ct_css.switchHidden(this._geometryButton.domNode, true);
            ct_css.switchHidden(this._spatialRelationDiv, true);
            ct_css.switchHidden(this._useOnlyGeometryDiv, true);
            var storeSelect = this._storeSelect = new Select({
                name: "stores",
                value: this.store.id,
                options: this.storeData,
                disabled: true
            }).placeAt(this._storeNode);
            d_class.add(storeSelect.domNode, "input-block");

            this._matchRadioButtonAnd.set("disabled", true);
            this._matchRadioButtonOr.set("disabled", true);

            this._geometryRadioButtonEverywhere.set("disabled", true);
            this._geometryRadioButtonExtent.set("disabled", true);
            this._geometryRadioButtonEnhanced.set("disabled", true);
            ct_css.switchHidden(this._geometryLabelExtent, true);
        },
        _createGUIFields: function () {
            var properties = this.properties;
            var customQuery = properties.customquery;
            var match;
            if (customQuery.geometry) {
                this._geometryRadioButtonEnhanced.set("checked", true);
            } else {
                this._geometryRadioButtonEnhanced.set("checked", false);
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
            var customQuery = this.getComplexQuery();

            this.queryController.searchReplacer(customQuery);
            if (customQuery.geometry && this.queryBuilderProperties.useUserExtent) {
                var extent = this.mapState.getExtent();
                customQuery.geometry = {
                    $contains: extent
                };
            }

            var store = this.store;
            var options = {};
            var count = this.properties.options.count;
            if (count >= 0) {
                options.count = count;
            }
            options.ignoreCase = this.properties.options.ignoreCase;
            options.locale = this.properties.options.locale;
            options.sort = event.options.sort || [];
            options.suggestContains = true;

            this.queryController.query(store, customQuery, options, this.tool, this);
        },
        deactivateTool: function () {
            this.tool.set("active", false);
        }
    });
});