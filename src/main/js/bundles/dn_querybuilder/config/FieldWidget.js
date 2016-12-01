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
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/_base/declare",
    "dojo/_base/Deferred",
    "dojo/parser",
    "dojo/_base/array",
    "dojo/number",
    "ct/_Connect",
    "ct/_when",
    "ct/util/css",
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/FieldWidget.html",
    "dijit/form/TextBox",
    "dijit/form/NumberTextBox",
    "dijit/form/ValidationTextBox",
    "dijit/form/ComboBox",
    "dijit/form/FilteringSelect",
    "dijit/form/Select",
    "dijit/form/Button",
    "dijit/form/DateTextBox",
    "dijit/form/CheckBox",
    "dojo/store/Memory",
    "dojo/dom-construct",
    "dojo/date/locale",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer"
], function (d_lang,
             d_class,
             declare,
             Deferred,
             parser,
             d_array,
             d_number,
             _Connect,
             ct_when,
             ct_css,
             Query,
             QueryTask,
             _WidgetBase,
             _TemplatedMixin,
             _WidgetsInTemplateMixin,
             template,
             TextBox,
             NumberTextBox,
             ValidationTextBox,
             ComboBox,
             FilteringSelect,
             Select,
             Button,
             DateTextBox,
             CheckBox,
             Memory,
             domConstruct,
             d_locale,
             ContentPane,
             BorderContainer) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Connect], {
        templateString: template,
        baseClass: "fieldWidget",
        postCreate: function () {
            this.inherited(arguments);
            ct_when(this.store.getMetadata(), function (metadata) {
                this._supportsDistincts = metadata.advancedQueryCapabilities && metadata.advancedQueryCapabilities.supportsDistinct;
                this._enableDistinctValues = this.queryBuilderProperties._properties.enableDistinctValues;
                if (this.type === "user") {
                    this.notSelectDisabled = false;
                    this.fieldSelectDisabled = false;
                    this.relationalOperatorSelectDisabled = false;
                    this.valueSelectDisabled = false;
                } else if (this.type === "editing") {
                    if (this.editOptions) {
                        this.notSelectDisabled = !this.editOptions.not;
                        this.fieldSelectDisabled = !this.editOptions.field;
                        this.relationalOperatorSelectDisabled = !this.editOptions.compare;
                        this.valueSelectDisabled = !this.editOptions.value;
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
            }, this);
        },
        deactivate: function () {
            this.disconnect();
        },
        resize: function (dim) {
            if (dim && dim.h > 0) {
                this._containerNode.resize({
                    w: dim.w,
                    h: dim.h - this.getHeadingHeight()
                });
            }
        },
        _changeButtons: function (first, last) {
            while (this._buttonNode.firstChild) {
                this._buttonNode.removeChild(this._buttonNode.firstChild);
            }
            if (this.type !== "editing") {
                if (first) {
                    var firstAddButton = new Button({
                        iconClass: "icon-plus",
                        showLabel: false,
                        onClick: d_lang.hitch(this, function () {
                            this.source._addField();
                        })
                    });
                    domConstruct.place(firstAddButton.domNode, this._buttonNode, "last");
                    firstAddButton.startup();
                } else if (last) {
                    var lastRemoveButton = new Button({
                        iconClass: "icon-minus",
                        showLabel: false,
                        onClick: d_lang.hitch(this, function () {
                            this.source._removeLastField();
                        })
                    });
                    domConstruct.place(lastRemoveButton.domNode, this._buttonNode, "last");
                    lastRemoveButton.startup();
                    var addButton = new Button({
                        iconClass: "icon-plus",
                        showLabel: false,
                        onClick: d_lang.hitch(this, function () {
                            this.source._addField();
                        })
                    });
                    domConstruct.place(addButton.domNode, this._buttonNode, "last");
                    addButton.startup();
                } else {
                    var removeButton = new Button({
                        iconClass: "icon-minus",
                        showLabel: false,
                        onClick: d_lang.hitch(this, function () {
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
        _createGUI: function () {
            var fieldData = this.storeData;
            var fieldStore = this._fieldStore = new Memory({
                data: fieldData
            });
            this._fieldSelect = new FilteringSelect({
                name: "fields",
                value: this.fieldId || fieldData[0].id,
                store: fieldStore,
                searchAttr: "title",
                maxHeight: this.maxComboBoxHeight,
                readOnly: false,
                disabled: this.fieldSelectDisabled
            }, this._fieldNode);
            d_class.add(this._fieldSelect.domNode, "fieldSelect");
            var i18n = this.i18n;
            var notStore = new Memory({
                data: [
                    {id: false, name: i18n.shouldBeTrue},
                    {id: true, name: i18n.shouldBeFalse}
                ]
            });
            var not = false;
            if (this.not !== undefined) {
                not = this.not;
            }
            var notSelect = this._notSelect = new FilteringSelect({
                name: "not",
                value: not,
                store: notStore,
                searchAttr: "name",
                maxHeight: this.maxComboBoxHeight,
                disabled: this.notSelectDisabled
            });
            d_class.add(notSelect.domNode, "notSelect");
            domConstruct.place(notSelect.domNode, this._notNode, "first");
            notSelect.startup();
            this._createCheckBoxes();
            if (this.type === "admin") {
                this.connect(this.source._editableSelect, "onChange", this._changeEditingVisibility);
            }
        },
        _changeGUI: function () {
            var fieldSelect = this._fieldSelect;
            var selectedField = fieldSelect.get("value");
            var type = this._fieldStore.get(selectedField).type;
            var codedValues = this._fieldStore.get(selectedField).codedValues;
            while (this._valueNode.firstChild) {
                this._valueNode.removeChild(this._valueNode.firstChild);
            }
            var relationalOperatorSelect = this._relationalOperatorSelect;
            var relationalOperatorStore, valueSelect;
            if (codedValues.length > 0) {
                relationalOperatorStore = this._createCodedValueRelationalOperatorStore();
                if (this._relationalOperatorSelect) {
                    relationalOperatorSelect.set("store", relationalOperatorStore);
                    relationalOperatorSelect.set("value", this.relationalOperatorId || "$eq");
                } else {
                    this._createRelationalOperatorSelect("$eq", relationalOperatorStore);
                }
                var codedValueData = [];
                d_array.forEach(codedValues, function (codedValue) {
                    codedValueData.push({name: codedValue.name, id: codedValue.code});
                });
                var codedValueStore = new Memory({
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
                    var valueComboBox = this._valueField = new ComboBox({
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
                    ct_when(this._getDistinctValues(selectedField), function (result) {
                        result.sort();
                        var distinctValueData = [];
                        d_array.forEach(result, function (distinctValue) {
                            if (typeof(distinctValue) === "number") {
                                distinctValueData.push({id: d_number.format(distinctValue)});
                            } else {
                                distinctValueData.push({id: distinctValue});
                            }
                        });
                        var distinctValueStore = new Memory({
                            data: distinctValueData
                        });
                        valueComboBox.set("store", distinctValueStore);
                        var value = distinctValueData[0] && distinctValueData[0].id;
                        if (this.fieldId === this.getSelectedField() && this.value !== undefined)
                            value = this.value;
                        valueComboBox.set("value", value);
                        if (!this.valueSelectDisabled)
                            valueComboBox.set('disabled', false);
                    }, this);
                } else {
                    if (type === "date") {
                        var value;
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
        _createRelationalOperatorSelect: function (value, compareStore) {
            var relationalOperatorSelect = this._relationalOperatorSelect = new FilteringSelect({
                name: "compares",
                value: this.relationalOperatorId || value,
                store: compareStore,
                searchAttr: "name",
                maxHeight: this.maxComboBoxHeight
            }, this._compareNode);
            d_class.add(relationalOperatorSelect.domNode, "relationalOperatorSelect");
            relationalOperatorSelect.startup();
        },
        _getDistinctValues: function (selectedField) {
            if (!this.store.target) {
                return [];
            }
            var query = new Query();
            var queryTask = new QueryTask(this.store.target);
            query.where = "1=1";
            query.returnGeometry = false;
            query.outFields = [selectedField];
            query.returnDistinctValues = true;
            return ct_when(queryTask.execute(query), function (result) {
                var distinctValues = [];
                var features = result.features;
                d_array.forEach(features, function (feature) {
                    var value = feature.attributes[selectedField];
                    if (value !== null) {
                        distinctValues.push(value);
                    }
                }, this);
                return distinctValues;
            }, this);
        },
        _createCodedValueRelationalOperatorStore: function () {
            var i18n = this.i18n;
            return new Memory({
                data: [
                    {id: "$eq", name: i18n.is},
                    {id: "$gt", name: i18n.is_greater_than},
                    {id: "$gte", name: i18n.is_greater_or_equal},
                    {id: "$lt", name: i18n.is_less_than},
                    {id: "$lte", name: i18n.is_less_or_equal}
                ]
            });
        },
        _createBooleanRelationalOperatorStore: function () {
            var i18n = this.i18n;
            return new Memory({
                data: [
                    {id: "$eq", name: i18n.is}
                ]
            });
        },
        _createStringRelationalOperatorStore: function () {
            var i18n = this.i18n;
            return new Memory({
                data: [
                    {id: "$eq", name: i18n.is},
                    {id: "$eqw", name: i18n.eqw},
                    {id: "$suggest", name: i18n.suggest}
                ]
            });
        },
        _createNumberRelationalOperatorStore: function () {
            var i18n = this.i18n;
            return new Memory({
                data: [
                    {id: "$eq", name: i18n.is},
                    {id: "$gt", name: i18n.is_greater_than},
                    {id: "$gte", name: i18n.is_greater_or_equal},
                    {id: "$lt", name: i18n.is_less_than},
                    {id: "$lte", name: i18n.is_less_or_equal}
                ]
            });
        },
        _createDateRelationalOperatorStore: function () {
            var i18n = this.i18n;
            return new Memory({
                data: [
                    {id: "$lte", name: i18n.before},
                    {id: "$gte", name: i18n.after}
                ]
            });
        },
        _createCheckBoxes: function () {
            var not = false;
            var field = false;
            var compare = false;
            var value = false;
            if (this.editOptions) {
                not = this.editOptions.not;
                field = this.editOptions.field;
                compare = this.editOptions.compare;
                value = this.editOptions.value;
            }
            this._notCheckBox = new CheckBox({
                name: "checkBox",
                checked: not
            }, this._notCheckBoxNode);
            this._fieldCheckBox = new CheckBox({
                name: "checkBox",
                checked: field
            }, this._fieldCheckBoxNode);
            this._compareCheckBox = new CheckBox({
                name: "checkBox",
                checked: compare
            }, this._compareCheckBoxNode);
            this._valueCheckBox = new CheckBox({
                name: "checkBox",
                checked: value
            }, this._valueCheckBoxNode);
            this._changeEditingVisibility();
        },
        _changeEditingVisibility: function () {
            if (this.source._editableSelect) {
                var hidden = !this.source._editableSelect.value;
            } else {
                hidden = true;
            }
            ct_css.switchHidden(this._notCheckBox.domNode, hidden);
            ct_css.switchHidden(this._fieldCheckBox.domNode, hidden);
            ct_css.switchHidden(this._compareCheckBox.domNode, hidden);
            ct_css.switchHidden(this._valueCheckBox.domNode, hidden);
        },
        _removeFields: function (node) {
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
        },
        getSelectedField: function () {
            return this._fieldSelect.value;
        },
        getSelectedFieldType: function () {
            var data = this._fieldSelect.store.data;
            var result = this._fieldSelect.type;
            d_array.forEach(data, function (item) {
                if (item.id === this._fieldSelect.value) {
                    result = item.type;
                }
            }, this);
            return result;
        },
        getSelectedRelationalOperator: function () {
            return this._relationalOperatorSelect.value;
        },
        getSelectedNot: function () {
            return this._notSelect.value;
        },
        getNotCheckBoxValue: function () {
            return this._notCheckBox.checked;
        },
        getFieldCheckBoxValue: function () {
            return this._fieldCheckBox.checked;
        },
        getCompareCheckBoxValue: function () {
            return this._compareCheckBox.checked;
        },
        getValueCheckBoxValue: function () {
            return this._valueCheckBox.checked;
        },
        getValue: function () {
            var result = this._valueField.value;
            var fieldType = this.getSelectedFieldType();
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
                }
            }
            return result;
        },
        _validator: function () {
            return true;
        }
    });
});
