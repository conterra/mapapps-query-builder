/*
 * Copyright (C) 2025 con terra GmbH (info@conterra.de)
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
import declare from "dojo/_base/declare";
import Deferred from "dojo/_base/Deferred";
import d_array from "dojo/_base/array";
import JSON from "dojo/json";
import domStyle from "dojo/dom-style";
import domConstruct from "dojo/dom-construct";
import Memory from "dojo/store/Memory";

import _Connect from "ct/_Connect";
import apprt_when from "apprt-core/when";
import ct_lang from "ct/_lang";
import ct_css from "ct/util/css";
import { AsyncInMemoryStore } from "store-api/InMemoryStore";
import DataViewModel from "dataview/DataViewModel";
import DataView from "dataview/DataView";

import _BuilderWidget from "wizard/_BuilderWidget";
import FieldWidget from "./FieldWidget";

import d_registry from "dijit/registry";
import NumberTextBox from "dijit/form/NumberTextBox";
import FilteringSelect from "dijit/form/FilteringSelect";
import _TemplatedMixin from "dijit/_TemplatedMixin";
import _WidgetsInTemplateMixin from "dijit/_WidgetsInTemplateMixin";
import _CssStateMixin from "dijit/_CssStateMixin";
import templateStringContent from "dojo/text!./templates/QueryToolsBuilderWizard.html";

import "dijit/form/Button";
import "dijit/form/TextBox";
import "dijit/form/ValidationTextBox";
import "dijit/layout/ContentPane";
import "dijit/layout/BorderContainer";

export default declare([_BuilderWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, _Connect], {
    templateString: templateStringContent,
    baseClass: "queryBuilderWizard",
    constructor() {
        this.inherited(arguments);
    },
    destroyInstance(instance) {
        this.disconnect();
        instance.destroyRecursive();
    },
    destroy() {
        this.disconnect();
        this.inherited(arguments);
    },
    postCreate() {
        this.inherited(arguments);
        this.maxComboBoxHeight = 160;
        domStyle.set(this._titleTextBox.domNode, "width", "250px");
        domStyle.set(this._iconClassTextBox.domNode, "width", "209px");
        const storeData = this.metadataAnalyzer.getStoreData(this.stores);
        const store = new Memory({
            data: storeData
        });
        const storeSelect = this._storeSelect = new FilteringSelect({
            name: "stores",
            value: this.properties.storeId || storeData[0].id,
            store: store,
            searchAttr: "text",
            style: "width: 250px;",
            maxHeight: this.maxComboBoxHeight
        }).placeAt(this._storeNode, "replace");
        storeSelect.startup();
        this._titleTextBox.set("value", this.properties.title);
        this._iconClassTextBox.set("value", this.properties.iconClass);
        const complexQueryString = JSON.stringify(this.properties.complexQuery, "", "\t");
        this._complexQueryTextArea.set("value", complexQueryString);
        this._createOptionsGUI();
        const valid = this._validateComplexQuery(complexQueryString);
        if (!valid) {
            this._builderTab.set("disabled", true);
            this._manualTab.set("selected", true);
            this._builderTab.set("selected", false);
            if (this._titleTextBox.isValid() && this._iconClassTextBox.isValid()) {
                this._doneButton.set("disabled", false);
            }
        }

        this._createPlaceholderGUI();
        this.connect(storeSelect, "onChange", this._onStoreChange);
        this.connect(this._titleTextBox, "onChange", this._checkValidation);
        this.connect(this._iconClassTextBox, "onChange", this._checkValidation);
        this.connect(this._complexQueryTextArea, "onChange", this._onTextAreaInput);
        this.connect(this._builderTab, "onShow", this._onBuilderTab);
        this.connect(this._manualTab, "onShow", this._onManualTab);
        this.connect(this._optionsTab, "onShow", this._onOptionsTab);
        this.connect(this._placeholderTab, "onShow", this._onPlaceholderTab);
    },
    _checkValidation() {
        if (this._titleTextBox.isValid() && this._iconClassTextBox.isValid()) {
            this._doneButton.set('disabled', false);
        } else {
            this._doneButton.set('disabled', true);
        }
    },
    resize(dim) {
        if (dim && dim.h > 0) {
            this._containerNode.resize({
                w: dim.w,
                h: dim.h - this.getHeadingHeight()
            });
        }
    },
    _createWindow(url) {
        window.open(url, "_blank");
    },
    _iconClassHelp() {
        const url = this.globalProperties.webFontsGalleryUrl;
        this._createWindow(url, "WebFontsGallery");
    },
    _complexQueryHelp() {
        const url = this.globalProperties.complexQueryDocUrl;
        this._createWindow(url, "Complex Query Documentation");
    },
    _onDone() {
        if (this.drawGeometryHandler)
            this.drawGeometryHandler.clearGraphics();
        apprt_when(this._saveProperties(), this._onReady);
    },
    _onReady() {
    },
    _saveProperties() {
        const def = new Deferred();
        if (!this.properties.options) {
            this.properties.options = {};
        }
        if (this._builderTab.get("selected")) {
            this.properties.options.mode = "builder";
            this.properties.complexQuery = this._getComplexQuery();
            this.properties.options.editable = this._editableSelect.value;
            if (this.properties.options.editable === true) {
                this.properties.options.editOptions = {
                    spatialRelation: true,
                    linkOperator: true
                };
                this.properties.options.editOptions.editFields = [];
                const children = this._queryNode.children;
                d_array.forEach(children, (child) => {
                    const obj = {};
                    const widget = d_registry.getEnclosingWidget(child);
                    obj["field"] = widget.getFieldCheckBoxValue();
                    obj["relationalOperator"] = widget.getRelationalOperatorCheckBoxValue();
                    obj["value"] = widget.getValueCheckBoxValue();
                    this.properties.options.editOptions.editFields.push(obj);
                });
            } else {
                if (this.properties.options.editOptions)
                    delete this.properties.options.editOptions;
            }
            def.resolve();
        } else {
            const complexQueryString = this._complexQueryTextArea.value;
            this.properties.complexQuery = this._getComplexQueryObj(complexQueryString);
            def.resolve();
        }
        this.properties.title = this._titleTextBox.value;
        this.properties.iconClass = this._iconClassTextBox.value;
        this.properties.storeId = this._storeSelect.value;
        this.properties.options.count = this._countTextBox.value;
        this.properties.options.ignoreCase = this._ignoreCaseSelect.value;
        const localeId = this._localeSelect.value;
        const localeObj = this._localeStore.get(localeId);
        delete localeObj.id;
        this.properties.options.locale = localeObj;
        return def;
    },
    _getComplexQuery() {
        const match = this._matchSelect.value;
        const complexQuery = {};
        const extent = this.mapWidgetModel.get("extent").toJSON();
        if (this._spatialRelationSelect.value === "current_extent") {
            complexQuery.geometry = {
                $intersects: extent
            };
        }
        const children = this._queryNode.children;
        if (children.length > 0) {
            complexQuery[match] = [];
        }
        d_array.forEach(children, (child) => {
            const widget = d_registry.getEnclosingWidget(child);
            const fieldId = widget.getSelectedField();
            let relationalOperatorId = widget.getSelectedRelationalOperator();
            let not = false;
            const firstChar = relationalOperatorId.substring(0, 1);
            if (firstChar === "!") {
                relationalOperatorId = relationalOperatorId.substring(1);
                not = true;
            }
            const value = widget.getValue();
            const obj1 = {};
            const obj2 = {};
            obj1[relationalOperatorId] = value;
            if (not) {
                const notObj = {};
                notObj["$not"] = obj1;
                obj2[fieldId] = notObj;
            } else {
                obj2[fieldId] = obj1;
            }
            complexQuery[match].push(obj2);
        });
        return complexQuery;
    },
    _getComplexQueryObj(complexQuery) {
        let complexQueryObj;
        try {
            complexQueryObj = JSON.parse(complexQuery);
        } catch (e) {
            const windowManager = this.windowManager;
            const appCtx = this.appCtx;
            const errorMessage = e.toString();
            apprt_when(windowManager.createInfoDialogWindow({
                message: errorMessage,
                attachToDom: appCtx.builderWindowRoot
            }));
        }
        return complexQueryObj;
    },
    _validateComplexQuery(complexQueryString) {
        let result = false;
        let complexQueryObj;
        if (complexQueryString) {
            try {
                complexQueryObj = JSON.parse(complexQueryString);
            } catch (e) {
                return false;
            }
        } else {
            complexQueryObj = this.properties.complexQuery;
        }
        if (JSON.stringify(complexQueryObj) === "{}") {
            return true;
        }
        let i = 0;
        const obj1 = [];
        const obj2 = [];
        ct_lang.forEachOwnProp(complexQueryObj, function (value, name) {
            i++;
            obj1.push(value);
            obj2.push(name);
        });
        let objects;
        let results;
        if (i === 1) {
            if (obj2[0] === "$and" || obj2[0] === "$or") {
                objects = obj1[0];
                results = 0;
                d_array.forEach(objects, (object, i) => {
                    i = 0;
                    ct_lang.forEachOwnProp(object, function (v1) {
                        ct_lang.forEachOwnProp(v1, function () {
                            i++;
                        });
                    });
                    if (i === 1) {
                        results++;
                    }
                });
                if (results === objects.length) {
                    result = true;
                }
            }
        } else if (i === 2) {
            if (obj2[0] === "geometry") {
                if (obj2[1] === "$and" || obj2[1] === "$or") {
                    objects = obj1[0];
                    results = 0;
                    d_array.forEach(objects, (object, i) => {
                        i = 0;
                        ct_lang.forEachOwnProp(object, function (v1) {
                            ct_lang.forEachOwnProp(v1, function () {
                                i++;
                            });
                        });
                        if (i === 1) {
                            results++;
                        }
                    });
                    if (results.length === objects.length) {
                        result = true;
                    }
                }
            }
        }
        return result;
    },
    _onCancel() {
        if (this.drawGeometryHandler) {
            this.drawGeometryHandler.clearGraphics();
        }
    },
    _getSelectedStoreObj(id) {
        return this.stores.find((store) => store.id === id);
    },
    _addDataField(field, editFields) {
        let fieldId;
        let relationalOperatorId;
        let value;
        ct_lang.forEachOwnProp(field, function (v1, n1) {
            fieldId = n1;
            ct_lang.forEachOwnProp(v1, function (v2, n2) {
                if (n2 === "$not") {
                    relationalOperatorId = "!$eq";
                    value = v2["$eq"];
                } else {
                    relationalOperatorId = n2;
                    value = v2;
                }
            });
        });
        const storeId = this._storeSelect.value;
        const store = this._getSelectedStoreObj(storeId);
        const fieldData = this.metadataAnalyzer.getFields(store);

        apprt_when(fieldData, (storeData) => {
            const storeId = this._storeSelect.value;
            const fieldWidget = new FieldWidget({
                source: this,
                store: this._getSelectedStoreObj(storeId),
                storeData: storeData,
                i18n: this.i18n.fields,
                fieldId: fieldId,
                relationalOperatorId: relationalOperatorId,
                value: value,
                editFields: editFields,
                type: "admin",
                enableDistinctValues: this.queryBuilderWidgetModel.enableDistinctValues
            });
            domConstruct.place(fieldWidget.domNode, this._queryNode, "last");
            this._changeChildrenButtons();
        });
    },
    _addField() {
        const storeId = this._storeSelect.value;
        const store = this._getSelectedStoreObj(storeId);
        const fieldData = this.metadataAnalyzer.getFields(store);
        apprt_when(fieldData, (storeData) => {
            const fieldWidget = new FieldWidget({
                source: this,
                store: this._getSelectedStoreObj(storeId),
                storeData: storeData,
                i18n: this.i18n.fields,
                type: "admin",
                enableDistinctValues: this.queryBuilderWidgetModel.enableDistinctValues
            });
            domConstruct.place(fieldWidget.domNode, this._queryNode, "last");
            this._changeChildrenButtons();
        }, this);
    },
    _removeLastField() {
        this._queryNode.removeChild(this._queryNode.lastChild);
        this._changeChildrenButtons();
    },
    _removeFields() {
        while (this._queryNode.firstChild) {
            this._queryNode.removeChild(this._queryNode.firstChild);
        }
    },
    _changeChildrenButtons() {
        const children = this._queryNode.children;
        d_array.forEach(children, (child, i) => {
            const widget = d_registry.getEnclosingWidget(child);
            if (i === 0 && children.length === 1) {
                widget._changeButtons(true, false);
            } else if (i === children.length - 1 && children.length !== 1) {
                widget._changeButtons(false, true);
            } else {
                widget._changeButtons(false, false);
            }
        });
    },
    _createBuilderGUI(textAreaComplexQuery) {
        const queryBuilderWidgetModel = this.queryBuilderWidgetModel;
        const spatialRelationStore = new Memory({
            data: [
                {name: this.i18n.everywhere, id: "everywhere"},
                {name: this.i18n.extent, id: "current_extent"}
            ]
        });
        const ynStore = new Memory({
            data: [
                {name: this.i18n.yes, id: true},
                {name: this.i18n.no, id: false}
            ]
        });
        if (!this._spatialRelationSelect) {
            this._spatialRelationSelect = new FilteringSelect({
                name: "spatialRelation",
                value: "everywhere",
                store: spatialRelationStore,
                searchAttr: "name",
                style: "width: 80px;",
                required: true,
                maxHeight: this.maxComboBoxHeight
            }).placeAt(this._spatialRelationNode, "replace");
        }
        if (!this._editableSelect) {
            this._editableSelect = new FilteringSelect({
                name: "editable",
                value: false,
                store: ynStore,
                searchAttr: "name",
                style: "width: 80px;",
                required: true,
                maxHeight: this.maxComboBoxHeight
            }).placeAt(this._editableNode, "replace");
        }
        const matchStore = new Memory({
            data: [
                {name: this.i18n.and, id: "$and"},
                {name: this.i18n.or, id: "$or"}]
        });
        if (!this._matchSelect) {
            this._matchSelect = new FilteringSelect({
                name: "match",
                value: queryBuilderWidgetModel.defaultLinkOperator,
                store: matchStore,
                searchAttr: "name",
                style: "width: 80px;",
                required: true,
                maxHeight: this.maxComboBoxHeight
            }).placeAt(this._linkOperatorNode, "replace");
        }
        const properties = this.properties;
        let complexQuery;
        if (textAreaComplexQuery) {
            complexQuery = textAreaComplexQuery;
        } else {
            complexQuery = properties.complexQuery;
        }
        if (properties.options.editable !== undefined) {
            const editable = properties.options.editable;
            this._editableSelect.set("value", editable);
        }
        if (complexQuery.geometry) {
            this._spatialRelationSelect.set("value", "current_extent");
        }
        let match;
        if (complexQuery.$and) {
            this._matchSelect.set("value", "$and");
            match = "$and";
        } else if (complexQuery.$or) {
            this._matchSelect.set("value", "$or");
            match = "$or";
        }
        const fields = complexQuery[match];
        const editFields = this.properties.options.editOptions && this.properties.options.editOptions.editFields;
        this._removeFields();
        if (fields) {
            d_array.forEach(fields, (field, i) => {
                this._addDataField(field, editFields && editFields[i]);
            }, this);
        } else {
            this._addField();
        }
    },
    _createOptionsGUI() {
        this._countTextBox = new NumberTextBox({
            name: "count",
            value: this.properties.options.count || -1,
            style: "width: 140px;",
            required: true,
            constraints: {min: -1}
        }, this._countNode);
        const ynStore = new Memory({
            data: [
                {name: this.i18n.yes, id: false},
                {name: this.i18n.no, id: true}
            ]
        });
        let ignoreCase;
        if (this.properties.options.ignoreCase === undefined) {
            ignoreCase = false;
        } else {
            ignoreCase = this.properties.options.ignoreCase;
        }
        this._ignoreCaseSelect = new FilteringSelect({
            name: "ignoreCase",
            value: ignoreCase,
            store: ynStore,
            searchAttr: "name",
            style: "width: 140px;",
            required: true,
            maxHeight: this.maxComboBoxHeight
        }, this._ignoreCaseNode);
        const localeStore = this._localeStore = new Memory({
            data: [
                {language: "de", country: "DE", id: "de"}, {language: "en", country: "EN", id: "en"}
            ]
        });
        this._localeSelect = new FilteringSelect({
            name: "locale",
            value: this.properties.options.locale && this.properties.options.locale.language || "en",
            store: localeStore,
            searchAttr: "language",
            style: "width: 140px;",
            required: true,
            maxHeight: this.maxComboBoxHeight
        }, this._localeNode);
    },
    _createPlaceholderGUI() {
        const placeholderObj = this.replacer.placeholder;
        const placeholderArray = [];
        ct_lang.forEachOwnProp(placeholderObj, function (value, name) {
            placeholderArray.push({
                id: name,
                key: "${" + name + "}",
                value: value
            });
        });
        const store = new AsyncInMemoryStore({
            data: placeholderArray,
            idProperty: "id",
            metadata: {
                displayField: "label",
                fields: [
                    {
                        "title": this.i18n.key,
                        "name": "key",
                        "type": "string",
                        "identifier": true
                    },
                    {
                        "title": this.i18n.value,
                        "name": "value",
                        "type": "string"
                    }
                ]
            }
        });
        const model = this._viewModel = new DataViewModel({
            store: store
        });
        const dataView = this._dataView = new DataView({
            i18n: this.i18n,
            showFilter: true,
            filterDuringKeyUp: true,
            showPager: true,
            showViewButtons: false,
            itemsPerPage: 10,
            DGRID: {
                checkboxSelection: false,
                columns: [
                    {
                        matches: {
                            name: {
                                $eq: "key"
                            }
                        }
                    },
                    {
                        matches: {
                            name: {
                                $eq: "value"
                            }
                        }
                    }
                ]
            }
        });
        this._placeholderNode.set("content", dataView);
        dataView.startup();
        dataView.set("model", model);
    },
    _onStoreChange() {
        this._removeFields();
        this._addField();
    },
    _onBuilderTab() {
        if (this._titleTextBox.isValid() && this._iconClassTextBox.isValid()) {
            this._doneButton.set("disabled", false);
        }
        const complexQueryString = this._complexQueryTextArea.get("value");
        if (this._validateComplexQuery(complexQueryString)) {
            this._createBuilderGUI(JSON.parse(complexQueryString));
        }
        ct_css.switchHidden(this._bottomNode.domNode, false);
    },
    _onOptionsTab() {
        ct_css.switchHidden(this._bottomNode.domNode, true);
    },
    _onPlaceholderTab() {
        ct_css.switchHidden(this._bottomNode.domNode, true);
    },
    _onManualTab() {
        if (this._titleTextBox.isValid() && this._iconClassTextBox.isValid()) {
            this._doneButton.set("disabled", false);
        }
        if (this._validateComplexQuery()) {
            const complexQueryString = JSON.stringify(this._getComplexQuery(), "", "\t");
            this._complexQueryTextArea.set("value", complexQueryString);
        }
        ct_css.switchHidden(this._bottomNode.domNode, false);
    },
    _onTextAreaInput() {
        const that = this;
        const complexQueryString = that._complexQueryTextArea.get("value");
        const valid = that._validateComplexQuery(complexQueryString);
        that._builderTab.set("disabled", !valid);
    }
});
