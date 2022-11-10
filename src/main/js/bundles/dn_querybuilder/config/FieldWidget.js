/*
 * Copyright (C) 2021 con terra GmbH (info@conterra.de)
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
import d_lang from "dojo/_base/lang";
import d_class from "dojo/dom-class";
import d_array from "dojo/_base/array";
import d_number from "dojo/number";
import domConstruct from "dojo/dom-construct";
import Memory from "dojo/store/Memory";

import _Connect from "ct/_Connect";
import apprt_when from "apprt-core/when";
import apprt_request from "apprt-request";
import ct_css from "ct/util/css";

import {executeQueryJSON} from "esri/rest/query";

import _WidgetBase from "dijit/_WidgetBase";
import _TemplatedMixin from "dijit/_TemplatedMixin";
import _WidgetsInTemplateMixin from "dijit/_WidgetsInTemplateMixin";
import templateStringContent from "dojo/text!./templates/FieldWidget.html";

import TextBox from "dijit/form/TextBox";
import NumberTextBox from "dijit/form/NumberTextBox";
import ComboBox from "dijit/form/ComboBox";
import FilteringSelect from "dijit/form/FilteringSelect";
import Button from "dijit/form/Button";
import DateTextBox from "dijit/form/DateTextBox";
import CheckBox from "dijit/form/CheckBox";
import "dijit/layout/ContentPane";
import "dijit/layout/BorderContainer";

export default declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Connect], {

    templateString: templateStringContent,
    baseClass: "fieldWidget",

    postCreate() {
        this.inherited(arguments);
        this.queryMetadata(this.store.target).then((metadata) => {
            this._supportsDistincts = metadata.advancedQueryCapabilities?.supportsDistinct;
            if (this.type === "user") {
                this.fieldSelectDisabled = false;
                this.relationalOperatorSelectDisabled = false;
                this.valueSelectDisabled = false;
            } else if (this.type === "editing") {
                if (this.editFields) {
                    this.fieldSelectDisabled = !this.editFields.field;
                    this.relationalOperatorSelectDisabled = !this.editFields.relationalOperator;
                    this.valueSelectDisabled = !this.editFields.value;
                }
            } else {
                this.fieldSelectDisabled = false;
                this.relationalOperatorSelectDisabled = false;
                this.valueSelectDisabled = false;
            }
            this.maxComboBoxHeight = 200;
            this._createGUI();
            this._changeGUI();
            this.connect(this._fieldSelect, "onChange", this._changeGUI);
        });
    },

    deactivate() {
        this.disconnect();
    },

    resize(dim) {
        if (dim && dim.h > 0) {
            this._containerNode.resize({
                w: dim.w,
                h: dim.h - this.getHeadingHeight()
            });
        }
    },

    _changeButtons(first, last) {
        while (this._buttonNode.firstChild) {
            this._buttonNode.removeChild(this._buttonNode.firstChild);
        }
        if (this.type !== "editing") {
            if (first) {
                const firstAddButton = new Button({
                    iconClass: "icon-plus",
                    showLabel: false,
                    onClick: d_lang.hitch(this, () => {
                        this.source._addField();
                    })
                });
                domConstruct.place(firstAddButton.domNode, this._buttonNode, "last");
                firstAddButton.startup();
            } else if (last) {
                const lastRemoveButton = new Button({
                    iconClass: "icon-minus",
                    showLabel: false,
                    onClick: d_lang.hitch(this, () => {
                        this.source._removeLastField();
                    })
                });
                domConstruct.place(lastRemoveButton.domNode, this._buttonNode, "last");
                lastRemoveButton.startup();
                const addButton = new Button({
                    iconClass: "icon-plus",
                    showLabel: false,
                    onClick: d_lang.hitch(this, () => {
                        this.source._addField();
                    })
                });
                domConstruct.place(addButton.domNode, this._buttonNode, "last");
                addButton.startup();
            } else {
                const removeButton = new Button({
                    iconClass: "icon-minus",
                    showLabel: false,
                    onClick: d_lang.hitch(this, () => {
                        removeButton.domNode.parentNode.parentNode.remove();
                        this.source._changeChildrenButtons();
                        if (this.type === "user")
                            this.source._changeMatchVisibility();
                    })
                });
                domConstruct.place(removeButton.domNode, this._buttonNode, "last");
                removeButton.startup();
            }
        }
    },

    _createGUI() {
        const fieldData = this.storeData;
        const fieldStore = this._fieldStore = new Memory({
            data: fieldData
        });
        const fieldSelect = this._fieldSelect = new FilteringSelect({
            name: "fields",
            value: this.fieldId || fieldData[0].id,
            store: fieldStore,
            searchAttr: "titleAndInfos",
            maxHeight: this.maxComboBoxHeight,
            readOnly: false,
            disabled: this.fieldSelectDisabled
        });
        domConstruct.place(fieldSelect.domNode, this._fieldNode);
        d_class.add(this._fieldSelect.domNode, "fieldSelect");
        this._createCheckBoxes();
        if (this.type === "admin") {
            this.connect(this.source._editableSelect, "onChange", this._changeEditingVisibility);
        }
    },

    _changeGUI() {
        const fieldSelect = this._fieldSelect;
        const selectedField = fieldSelect.get("value");
        const type = this._fieldStore.get(selectedField).type;
        const codedValues = this._fieldStore.get(selectedField).codedValues;
        while (this._valueNode.firstChild) {
            this._valueNode.removeChild(this._valueNode.firstChild);
        }
        const relationalOperatorSelect = this._relationalOperatorSelect;
        let relationalOperatorStore;
        let valueSelect;
        if (codedValues.length > 0) {
            relationalOperatorStore = this._createCodedValueRelationalOperatorStore();
            if (this._relationalOperatorSelect) {
                relationalOperatorSelect.set("store", relationalOperatorStore);
                relationalOperatorSelect.set("value", this.relationalOperatorId || "$eq");
            } else {
                this._createRelationalOperatorSelect("$eq", relationalOperatorStore);
            }
            const codedValueData = [];
            d_array.forEach(codedValues, (codedValue) => {
                codedValueData.push({name: codedValue.name, id: codedValue.code});
            });
            const codedValueStore = new Memory({
                data: codedValueData
            });
            valueSelect = this._valueField = new FilteringSelect({
                name: "value",
                value: this.value || codedValueData[0].id,
                store: codedValueStore,
                searchAttr: "name",
                maxHeight: this.maxComboBoxHeight,
                queryExpr: "*${0}*",
                autoComplete: false
            });
            d_class.add(valueSelect.domNode, "valueField");
            domConstruct.place(valueSelect.domNode, this._valueNode);
            valueSelect.startup();
        } else {
            if (type === "string") {
                relationalOperatorStore = this._createStringRelationalOperatorStore();
                if (this._relationalOperatorSelect) {
                    relationalOperatorSelect.set("store", relationalOperatorStore);
                    relationalOperatorSelect.set("value", this.relationalOperatorId || "$eq");
                } else {
                    this._createRelationalOperatorSelect("$eq", relationalOperatorStore);
                }
            } else if (type === "number" || type === "integer" || type === "single" || type === "double") {
                relationalOperatorStore = this._createNumberRelationalOperatorStore();
                if (this._relationalOperatorSelect) {
                    relationalOperatorSelect.set("store", relationalOperatorStore);
                    relationalOperatorSelect.set("value", this.relationalOperatorId || "$eq");
                } else {
                    this._createRelationalOperatorSelect("$eq", relationalOperatorStore);
                }
            } else if (type === "boolean") {
                relationalOperatorStore = this._createBooleanRelationalOperatorStore();
                if (this._relationalOperatorSelect) {
                    relationalOperatorSelect.set("store", relationalOperatorStore);
                    relationalOperatorSelect.set("value", this.relationalOperatorId || "$eq");
                } else {
                    this._createRelationalOperatorSelect("$eq", relationalOperatorStore);
                }
            } else if (type === "date") {
                relationalOperatorStore = this._createDateRelationalOperatorStore();
                if (this._relationalOperatorSelect) {
                    relationalOperatorSelect.set("store", relationalOperatorStore);
                    relationalOperatorSelect.set("value", this.relationalOperatorId || "$lte");
                } else {
                    this._createRelationalOperatorSelect("$lte", relationalOperatorStore);
                }
            }
            if (this._supportsDistincts && this.enableDistinctValues && type !== "date") {
                const valueComboBox = this._valueField = new ComboBox({
                    name: "value",
                    searchAttr: "id",
                    maxHeight: this.maxComboBoxHeight,
                    required: true,
                    queryExpr: "*${0}*",
                    autoComplete: false
                });
                if (!this.valueSelectDisabled)
                    valueComboBox.set('disabled', true);
                domConstruct.place(valueComboBox.domNode, this._valueNode);
                valueComboBox.startup();
                apprt_when(this._getDistinctValues(selectedField), (result) => {
                    result.sort();
                    const distinctValueData = [];
                    d_array.forEach(result, (distinctValue) => {
                        if (typeof (distinctValue) === "number") {
                            distinctValueData.push({id: d_number.format(distinctValue)});
                        } else {
                            distinctValueData.push({id: distinctValue});
                        }
                    });
                    const distinctValueStore = new Memory({
                        data: distinctValueData
                    });
                    valueComboBox.set("store", distinctValueStore);
                    let value = distinctValueData[0] && distinctValueData[0].id;
                    if (this.fieldId === this.getSelectedField() && this.value !== undefined)
                        value = this.value;
                    valueComboBox.set("value", value);
                    if (!this.valueSelectDisabled)
                        valueComboBox.set('disabled', false);
                }, this);
                domConstruct.place(valueComboBox.domNode, this._valueNode);
                valueComboBox.startup();
            } else {
                let value;
                let i18n;
                let booleanStore;
                if (this.relationalOperatorId === "$exists") {
                    if (this.fieldId === this.getSelectedField()) {
                        value = this.value;
                    } else {
                        value = true;
                    }
                    i18n = this.i18n;
                    booleanStore = new Memory({
                        data: [
                            {id: true, name: i18n.yes},
                            {id: false, name: i18n.no}
                        ]
                    });
                    valueSelect = this._valueField = new FilteringSelect({
                        name: "value",
                        value: value,
                        store: booleanStore,
                        maxHeight: this.maxComboBoxHeight
                    });
                } else if (type === "date") {
                    if (this.fieldId === this.getSelectedField() && this.value instanceof Date) {
                        value = this.value;
                    } else {
                        value = new Date();
                    }
                    valueSelect = this._valueField = new DateTextBox({
                        name: "value",
                        value: value,
                        validator: this._validator,
                        intermediateChanges: true
                    });
                    if (valueSelect.value === null)
                        valueSelect.set("displayedValue", value);
                } else if (type === "number" || type === "integer" || type === "single" || type === "double") {
                    if (this.fieldId === this.getSelectedField()) {
                        value = this.value;
                    } else {
                        value = null;
                    }
                    valueSelect = this._valueField = new NumberTextBox({
                        name: "value",
                        value: value,
                        placeHolder: this.i18n.typeInValue,
                        intermediateChanges: true,
                        required: true
                    });
                } else if (type === "boolean") {
                    if (this.fieldId === this.getSelectedField()) {
                        value = this.value;
                    } else {
                        value = true;
                    }
                    i18n = this.i18n;
                    booleanStore = new Memory({
                        data: [
                            {id: true, name: i18n.yes},
                            {id: false, name: i18n.no}
                        ]
                    });
                    valueSelect = this._valueField = new FilteringSelect({
                        name: "value",
                        value: value,
                        store: booleanStore,
                        maxHeight: this.maxComboBoxHeight
                    });
                } else {
                    if (this.fieldId === this.getSelectedField()) {
                        value = this.value;
                    } else {
                        value = "";
                    }
                    valueSelect = this._valueField = new TextBox({
                        name: "value",
                        value: value,
                        placeHolder: this.i18n.typeInValue,
                        intermediateChanges: true,
                        required: true
                    });
                }
                domConstruct.place(valueSelect.domNode, this._valueNode);
            }
            d_class.add(this._valueField.domNode, "valueField");
        }
        if (this.relationalOperatorSelectDisabled)
            this._relationalOperatorSelect.set("disabled", this.relationalOperatorSelectDisabled);
        if (this.valueSelectDisabled)
            this._valueField.set("disabled", this.valueSelectDisabled);
    },

    _createRelationalOperatorSelect(value, relationalOperatorStore) {
        const relationalOperatorSelect = this._relationalOperatorSelect = new FilteringSelect({
            name: "relationalOperator",
            value: this.relationalOperatorId || value,
            store: relationalOperatorStore,
            searchAttr: "name",
            maxHeight: this.maxComboBoxHeight
        });
        domConstruct.place(relationalOperatorSelect.domNode, this._relationalOperatorNode);
        d_class.add(relationalOperatorSelect.domNode, "relationalOperatorSelect");
        relationalOperatorSelect.startup();
        this.connect(relationalOperatorSelect, "onChange", function (value) {
            if (value === "$exists") {
                while (this._valueNode.firstChild) {
                    this._valueNode.removeChild(this._valueNode.firstChild);
                }
                const i18n = this.i18n;
                const booleanStore = new Memory({
                    data: [
                        {id: true, name: i18n.yes},
                        {id: false, name: i18n.no}
                    ]
                });
                this._valueField = new FilteringSelect({
                    name: "value",
                    value: true,
                    store: booleanStore,
                    maxHeight: this.maxComboBoxHeight
                });
                domConstruct.place(this._valueField.domNode, this._valueNode);
            } else {
                this.relationalOperatorId = value;
                this._changeGUI();
            }
        });
    },

    _getDistinctValues(selectedField) {
        if (!this.store.target) {
            return [];
        }
        const query = {};
        query.where = "1=1";
        query.returnGeometry = false;
        query.outFields = [selectedField];
        query.returnDistinctValues = true;
        return executeQueryJSON(this.store.target, query).then((result) => {
            const distinctValues = [];
            const features = result.features;
            d_array.forEach(features, (feature) => {
                const value = feature.attributes[selectedField];
                if (value !== null) {
                    distinctValues.push(value);
                }
            });
            return distinctValues;
        });
    },

    _createCodedValueRelationalOperatorStore() {
        const i18n = this.i18n;
        return new Memory({
            data: [
                {id: "$eq", name: i18n.is},
                {id: "$gt", name: i18n.is_greater_than},
                {id: "$gte", name: i18n.is_greater_or_equal},
                {id: "$lt", name: i18n.is_less_than},
                {id: "$lte", name: i18n.is_less_or_equal},
                {id: "$exists", name: i18n.exists}
            ]
        });
    },

    _createBooleanRelationalOperatorStore() {
        const i18n = this.i18n;
        return new Memory({
            data: [
                {id: "$eq", name: i18n.is},
                {id: "$exists", name: i18n.exists}
            ]
        });
    },

    _createStringRelationalOperatorStore() {
        const i18n = this.i18n;
        return new Memory({
            data: [
                {id: "$eq", name: i18n.is},
                {id: "$eqw", name: i18n.eqw},
                {id: "$suggest", name: i18n.suggest},
                {id: "$exists", name: i18n.exists}
            ]
        });
    },

    _createNumberRelationalOperatorStore() {
        const i18n = this.i18n;
        return new Memory({
            data: [
                {id: "$eq", name: i18n.is},
                {id: "$gt", name: i18n.is_greater_than},
                {id: "$gte", name: i18n.is_greater_or_equal},
                {id: "$lt", name: i18n.is_less_than},
                {id: "$lte", name: i18n.is_less_or_equal},
                {id: "$exists", name: i18n.exists}
            ]
        });
    },

    _createDateRelationalOperatorStore() {
        const i18n = this.i18n;
        return new Memory({
            data: [
                {id: "$lte", name: i18n.before},
                {id: "$gte", name: i18n.after},
                {id: "$exists", name: i18n.exists}
            ]
        });
    },

    _createCheckBoxes() {
        let field = false;
        let relation = false;
        let value = false;
        if (this.editFields) {
            field = this.editFields.field;
            relation = this.editFields.relationalOperator;
            value = this.editFields.value;
        }
        this._fieldCheckBox = new CheckBox({
            name: "checkBox",
            checked: field
        }, this._fieldCheckBoxNode);
        this._relationalOperatorCheckBox = new CheckBox({
            name: "checkBox",
            checked: relation
        }, this._relationalOperatorCheckBoxNode);
        this._valueCheckBox = new CheckBox({
            name: "checkBox",
            checked: value
        }, this._valueCheckBoxNode);
        this._changeEditingVisibility();
    },

    _changeEditingVisibility() {
        let hidden;
        if (this.source._editableSelect) {
            hidden = !this.source._editableSelect.value;
        } else {
            hidden = true;
        }
        ct_css.switchHidden(this._fieldCheckBox.domNode, hidden);
        ct_css.switchHidden(this._relationalOperatorCheckBox.domNode, hidden);
        ct_css.switchHidden(this._valueCheckBox.domNode, hidden);
    },

    _removeFields(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    },

    getSelectedField() {
        return this._fieldSelect.value;
    },

    getSelectedFieldType() {
        const data = this._fieldSelect.store.data;
        let result = this._fieldSelect.type;
        d_array.forEach(data, (item) => {
            if (item.id === this._fieldSelect.value) {
                result = item.type;
            }
        }, this);
        return result;
    },

    getSelectedRelationalOperator() {
        return this._relationalOperatorSelect.value;
    },

    getFieldCheckBoxValue() {
        return this._fieldCheckBox.checked;
    },

    getRelationalOperatorCheckBoxValue() {
        return this._relationalOperatorCheckBox.checked;
    },

    getValueCheckBoxValue() {
        return this._valueCheckBox.checked;
    },

    getValue() {
        let result = this._valueField.value;
        const fieldType = this.getSelectedFieldType();
        if (fieldType === "date") {
            if (result === undefined || result === null) {
                result = this._valueField.displayedValue;
            } else {
                //result = d_locale.format(result, {datePattern: "yyyy-MM-dd", selector: 'date'});
            }
        } else if (fieldType === "string") {
            if (this.replacer) {
                result = this.replacer.replace(result);
            }
        } else if (fieldType === "number" || fieldType === "integer"
            || fieldType === "single" || fieldType === "double") {
            if (result === undefined || result === null) {
                result = this._valueField.displayedValue;
            } else if (typeof (result) === "string") {
                result = d_number.parse(result);
                if (isNaN(result)) {
                    result = undefined;
                }
            }
        }
        return result;
    },

    _validator() {
        return true;
    },

    queryMetadata(url) {
        return apprt_request(url,
            {
                query: {
                    f: 'json'
                },
                handleAs: 'json'
            });
    }
});
