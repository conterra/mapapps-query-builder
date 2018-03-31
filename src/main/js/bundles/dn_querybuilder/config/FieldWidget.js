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
import declare from "dojo/_base/declare";
import d_lang from "dojo/_base/lang";
import d_class from "dojo/dom-class";
import d_array from "dojo/_base/array";
import d_number from "dojo/number";
import domConstruct from "dojo/dom-construct";
import Memory from "dojo/store/Memory";

import _Connect from "ct/_Connect";
import ct_when from "ct/_when";
import ct_css from "ct/util/css";
import SuggestQueryStore from "ct/store/SuggestQueryStore";
import Filter from "ct/store/Filter";
import MapServerLayerStore from "ct/mapping/store/MapServerLayerStore";

import Query from "esri/tasks/support/Query";
import QueryTask from "esri/tasks/QueryTask";

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

const FieldWidget = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Connect], {

    templateString: templateStringContent,
    baseClass: "fieldWidget",

    postCreate() {
        this.inherited(arguments);
        ct_when(this.store.getMetadata(), (metadata) => {
            this._supportsDistincts = metadata.advancedQueryCapabilities && metadata.advancedQueryCapabilities.supportsDistinct;
            this._enableDistinctValues = this.queryBuilderProperties._properties.enableDistinctValues;
            if (this.type === "user") {
                this.notSelectDisabled = false;
                this.fieldSelectDisabled = false;
                this.relationalOperatorSelectDisabled = false;
                this.valueSelectDisabled = false;
            } else if (this.type === "editing") {
                if (this.editFields) {
                    this.notSelectDisabled = !this.editFields.not;
                    this.fieldSelectDisabled = !this.editFields.field;
                    this.relationalOperatorSelectDisabled = !this.editFields.relation;
                    this.valueSelectDisabled = !this.editFields.value;
                }
            } else {
                this.notSelectDisabled = false;
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
                let firstAddButton = new Button({
                    iconClass: "icon-plus",
                    showLabel: false,
                    onClick: d_lang.hitch(this, () => {
                        this.source._addField();
                    })
                });
                domConstruct.place(firstAddButton.domNode, this._buttonNode, "last");
                firstAddButton.startup();
            } else if (last) {
                let lastRemoveButton = new Button({
                    iconClass: "icon-minus",
                    showLabel: false,
                    onClick: d_lang.hitch(this, () => {
                        this.source._removeLastField();
                    })
                });
                domConstruct.place(lastRemoveButton.domNode, this._buttonNode, "last");
                lastRemoveButton.startup();
                let addButton = new Button({
                    iconClass: "icon-plus",
                    showLabel: false,
                    onClick: d_lang.hitch(this, () => {
                        this.source._addField();
                    })
                });
                domConstruct.place(addButton.domNode, this._buttonNode, "last");
                addButton.startup();
            } else {
                let removeButton = new Button({
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
        let fieldData = this.storeData;
        let fieldStore = this._fieldStore = new Memory({
            data: fieldData
        });
        let fieldSelect = this._fieldSelect = new FilteringSelect({
            name: "fields",
            value: this.fieldId || fieldData[0].id,
            store: fieldStore,
            searchAttr: "text",
            maxHeight: this.maxComboBoxHeight,
            readOnly: false,
            disabled: this.fieldSelectDisabled
        });
        domConstruct.place(fieldSelect.domNode, this._fieldNode);
        d_class.add(this._fieldSelect.domNode, "fieldSelect");
        let i18n = this.i18n;
        let notStore = new Memory({
            data: [
                {id: false, name: i18n.shouldBeTrue},
                {id: true, name: i18n.shouldBeFalse}
            ]
        });
        let not = false;
        if (this.not) {
            not = this.not;
        }
        let notSelect = this._notSelect = new FilteringSelect({
            name: "not",
            value: not,
            store: notStore,
            searchAttr: "name",
            maxHeight: this.maxComboBoxHeight,
            disabled: this.notSelectDisabled
        });
        d_class.add(notSelect.domNode, "notSelect");
        domConstruct.place(notSelect.domNode, this._notNode);
        notSelect.startup();
        this._createCheckBoxes();
        if (this.type === "admin") {
            this.connect(this.source._editableSelect, "onChange", this._changeEditingVisibility);
        }
    },

    _changeGUI() {
        let fieldSelect = this._fieldSelect;
        let selectedField = fieldSelect.get("value");
        let type = this._fieldStore.get(selectedField).type;
        let codedValues = this._fieldStore.get(selectedField).codedValues;
        while (this._valueNode.firstChild) {
            this._valueNode.removeChild(this._valueNode.firstChild);
        }
        let relationalOperatorSelect = this._relationalOperatorSelect;
        let relationalOperatorStore, valueSelect;
        if (codedValues.length > 0) {
            relationalOperatorStore = this._createCodedValueRelationalOperatorStore();
            if (this._relationalOperatorSelect) {
                relationalOperatorSelect.set("store", relationalOperatorStore);
                relationalOperatorSelect.set("value", this.relationalOperatorId || "$eq");
            } else {
                this._createRelationalOperatorSelect("$eq", relationalOperatorStore);
            }
            let codedValueData = [];
            d_array.forEach(codedValues, (codedValue) => {
                codedValueData.push({name: codedValue.name, id: codedValue.code});
            });
            let codedValueStore = new Memory({
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
            if (this._supportsDistincts && this._enableDistinctValues && type !== "date") {
                let valueComboBox = this._valueField = new ComboBox({
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
                ct_when(this._getDistinctValues(selectedField), (result) => {
                    result.sort();
                    let distinctValueData = [];
                    d_array.forEach(result, (distinctValue) => {
                        if (typeof(distinctValue) === "number") {
                            distinctValueData.push({id: d_number.format(distinctValue)});
                        } else {
                            distinctValueData.push({id: distinctValue});
                        }
                    });
                    let distinctValueStore = new Memory({
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
                let value, i18n, booleanStore;
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
                    if (this.fieldId === this.getSelectedField()) {
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
        let relationalOperatorSelect = this._relationalOperatorSelect = new FilteringSelect({
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
                let i18n = this.i18n;
                let booleanStore = new Memory({
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
                this._changeGUI();
            }
        });
    },

    _getDistinctValues(selectedField) {
        if (!this.store.target) {
            return [];
        }
        let query = new Query();
        let queryTask = new QueryTask(this.store.target);
        query.where = "1=1";
        query.returnGeometry = false;
        query.outFields = [selectedField];
        query.returnDistinctValues = true;
        return ct_when(queryTask.execute(query), (result) => {
            let distinctValues = [];
            let features = result.features;
            d_array.forEach(features, (feature) => {
                let value = feature.attributes[selectedField];
                if (value !== null) {
                    distinctValues.push(value);
                }
            });
            return distinctValues;
        }, this);
    },

    _createCodedValueRelationalOperatorStore() {
        let i18n = this.i18n;
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
        let i18n = this.i18n;
        return new Memory({
            data: [
                {id: "$eq", name: i18n.is},
                {id: "$exists", name: i18n.exists}
            ]
        });
    },

    _createStringRelationalOperatorStore() {
        let i18n = this.i18n;
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
        let i18n = this.i18n;
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
        let i18n = this.i18n;
        return new Memory({
            data: [
                {id: "$lte", name: i18n.before},
                {id: "$gte", name: i18n.after},
                {id: "$exists", name: i18n.exists}
            ]
        });
    },

    _createCheckBoxes() {
        let not = false;
        let field = false;
        let relation = false;
        let value = false;
        if (this.editFields) {
            not = this.editFields.not;
            field = this.editFields.field;
            relation = this.editFields.relation;
            value = this.editFields.value;
        }
        this._notCheckBox = new CheckBox({
            name: "checkBox",
            checked: not
        }, this._notCheckBoxNode);
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
        ct_css.switchHidden(this._notCheckBox.domNode, hidden);
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
        let data = this._fieldSelect.store.data;
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

    getSelectedNot() {
        return this._notSelect.value;
    },

    getNotCheckBoxValue() {
        return this._notCheckBox.checked;
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
        let fieldType = this.getSelectedFieldType();
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
        } else if (fieldType === "number" || fieldType === "integer" || fieldType === "single" || fieldType === "double") {
            if (result === undefined || result === null) {
                result = this._valueField.displayedValue;
            }
            else if (typeof(result) === "string") {
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
    }
});

module.exports = FieldWidget;