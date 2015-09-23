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
    "dojo/_base/declare",
    "dojo/_base/Deferred",
    "dojo/parser",
    "dojo/_base/array",
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
    "dijit/form/Button",
    "dijit/form/DateTextBox",
    "dijit/form/CheckBox",
    "dojo/store/Memory",
    "dojo/dom-construct",
    "dojo/date/locale",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer"
], function (d_lang,
        declare,
        Deferred,
        parser,
        d_array,
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
        postCreate: function () {
            this.inherited(arguments);
            ct_when(this.store.getMetadata(), function (metadata) {
                this._supportsDistincts = metadata.advancedQueryCapabilities && metadata.advancedQueryCapabilities.supportsDistinct;
                if (this.type === "user") {
                    this._fieldSelectWidth = "width: 140px;";
                    this._valueSelectWidth = "width: 120px;";
                    this._compareSelectWidth = "width: 120px;";
                    this._notSelectWidth = "width: 100px;";
                } else if (this.type === "editing") {
                    this._fieldSelectWidth = "width: 140px;";
                    this._valueSelectWidth = "width: 120px;";
                    this._compareSelectWidth = "width: 120px;";
                    this._notSelectWidth = "width: 100px;";
                    if (this.editOptions) {
                        this.notSelectDisabled = !this.editOptions.not;
                        this.fieldSelectDisabled = !this.editOptions.field;
                        this.compareSelectDisabled = !this.editOptions.compare;
                        this.valueSelectDisabled = !this.editOptions.value;
                    }
                } else {
                    this._fieldSelectWidth = "width: 180px;";
                    this._valueSelectWidth = "width: 200px;";
                    this._compareSelectWidth = "width: 120px;";
                    this._notSelectWidth = "width: 100px;";
                }
                this.maxComboBoxHeight = 200;
                var fieldData = this.storeData;
                var fieldStore = this._fieldStore = new Memory({
                    data: fieldData
                });
                var fieldSelect = this._fieldSelect = new FilteringSelect({
                    name: "fields",
                    value: this.fieldId || fieldData[0].id,
                    store: fieldStore,
                    searchAttr: "title",
                    style: this._fieldSelectWidth,
                    maxHeight: this.maxComboBoxHeight,
                    disabled: this.fieldSelectDisabled
                }, this._fieldNode);
                fieldSelect.startup();
                var i18n = this.i18n;
                var notStore = this._notStore = new Memory({
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
                    style: this._notSelectWidth,
                    maxHeight: this.maxComboBoxHeight,
                    disabled: this.notSelectDisabled
                });
                domConstruct.place(notSelect.domNode, this._notNode, "first");
                notSelect.startup();

                this._createCheckBoxes();
                if (this.type === "admin") {
                    this.connect(this.source._editableSelect, "onChange", this._changeEditingVisibility);
                }
                this._changeGUI();
                this.connect(fieldSelect, "onChange", this._changeGUI);
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
                    var addButton = new Button({
                        label: "+",
                        onClick: d_lang.hitch(this, function () {
                            this.source._addField();
                        })
                    });
                    domConstruct.place(addButton.domNode, this._buttonNode, "last");
                    addButton.startup();
                } else if (last) {
                    var removeButton = new Button({
                        label: "-",
                        onClick: d_lang.hitch(this, function () {
                            this.source._removeLastField();
                        })
                    });
                    domConstruct.place(removeButton.domNode, this._buttonNode, "last");
                    removeButton.startup();
                    var addButton = new Button({
                        label: "+",
                        onClick: d_lang.hitch(this, function () {
                            this.source._addField();
                        })
                    });
                    domConstruct.place(addButton.domNode, this._buttonNode, "last");
                    addButton.startup();
                } else {
                    var removeButton = new Button({
                        label: "-",
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
        _changeGUI: function () {
            var fieldSelect = this._fieldSelect;
            var selectedField = fieldSelect.get("value");
            var type = this._fieldStore.get(selectedField).type;
            var codedValues = this._fieldStore.get(selectedField).codedValues;
            while (this._valueNode.firstChild) {
                this._valueNode.removeChild(this._valueNode.firstChild);
            }
            var compareSelect = this._compareSelect;
            if (codedValues.length > 0) {
                var compareStore = this._compareStore = this._createCodedValueStore();
                if (this._compareSelect) {
                    compareSelect.set("store", compareStore);
                    compareSelect.set("value", this.compareId || "$eq");
                } else {
                    this._createCompareSelect("$eq", compareStore);
                }
                var codedValueData = [];
                d_array.forEach(codedValues, function (codedValue) {
                    codedValueData.push({name: codedValue.name, id: codedValue.code});
                });
                var codedValueStore = new Memory({
                    data: codedValueData
                });
                var valueSelect = this._valueField = new FilteringSelect({
                    name: "value",
                    value: this.value || codedValueData[0].id,
                    store: codedValueStore,
                    searchAttr: "name",
                    style: this._valueSelectWidth,
                    maxHeight: this.maxComboBoxHeight
                });
                domConstruct.place(valueSelect.domNode, this._valueNode);
                valueSelect.startup();
            } else {
                if (type === "string") {
                    var compareStore = this._compareStore = this._createStringStore();
                    if (this._compareSelect) {
                        compareSelect.set("store", compareStore);
                        compareSelect.set("value", this.compareId || "$eq");
                    } else {
                        this._createCompareSelect("$eq", compareStore);
                    }
                } else if (type === "number" || type === "integer" || type === "double") {
                    var compareStore = this._compareStore = this._createNumberStore();
                    if (this._compareSelect) {
                        compareSelect.set("store", compareStore);
                        compareSelect.set("value", this.compareId || "$eq");
                    } else {
                        this._createCompareSelect("$eq", compareStore);
                    }
                } else if (type === "boolean") {
                    var compareStore = this._compareStore = this._createBooleanStore();
                    if (this._compareSelect) {
                        compareSelect.set("store", compareStore);
                        compareSelect.set("value", this.compareId || "$eq");
                    } else {
                        this._createCompareSelect("$eq", compareStore);
                    }
                } else if (type === "date") {
                    var compareStore = this._compareStore = this._createDateStore();
                    if (this._compareSelect) {
                        compareSelect.set("store", compareStore);
                        compareSelect.set("value", this.compareId || "$lte");
                    } else {
                        this._createCompareSelect("$lte", compareStore);
                    }
                }
                if (this._supportsDistincts === true && type !== "date") {
                    var valueComboBox = this._valueField = new ComboBox({
                        name: "value",
                        searchAttr: "id",
                        style: this._valueSelectWidth,
                        maxHeight: this.maxComboBoxHeight
                    });
                    if (!this.valueSelectDisabled)
                        valueComboBox.set('disabled', true);
                    domConstruct.place(valueComboBox.domNode, this._valueNode);
                    valueComboBox.startup();
                    ct_when(this._getDistinctValues(selectedField), function (result) {
                        result.sort();
                        var distinctValueData = [];
                        d_array.forEach(result, function (distinctValue) {
                            distinctValueData.push({id: distinctValue});
                        });
                        var distinctValueStore = new Memory({
                            data: distinctValueData
                        });
                        valueComboBox.set("store", distinctValueStore);
                        var value = value = distinctValueData[0] && distinctValueData[0].id;
                        if (this.fieldId === this._getSelectedField() && this.value !== undefined) {
                            value = this.value;
                        }
                        valueComboBox.set("value", value);
                        if (!this.valueSelectDisabled)
                            valueComboBox.set('disabled', false);
                    }, this);
                } else {
                    var valueSelect;
                    if (type === "date") {
                        var value;
                        if (this.fieldId === this._getSelectedField()) {
                            value = this.value;
                        } else {
                            value = new Date();
                        }
                        valueSelect = this._valueField = new DateTextBox({
                            name: "value",
                            value: value,
                            style: this._valueSelectWidth,
                            validator: this._validator,
                            intermediateChanges: true
                        });
                    } else if (type === "number" || type === "integer" || type === "double") {
                        if (this.fieldId === this._getSelectedField()) {
                            value = this.value;
                        } else {
                            value = null;
                        }
                        valueSelect = this._valueField = new NumberTextBox({
                            name: "value",
                            value: value,
                            style: this._valueSelectWidth,
                            intermediateChanges: true
                        });
                    } else {
                        if (this.fieldId === this._getSelectedField()) {
                            value = this.value;
                        } else {
                            value = "";
                        }
                        valueSelect = this._valueField = new TextBox({
                            name: "value",
                            value: value,
                            placeHolder: this.i18n.typeInValue,
                            style: this._valueSelectWidth,
                            intermediateChanges: true
                        });
                    }
                    domConstruct.place(valueSelect.domNode, this._valueNode);
                }
            }
            if (this.compareSelectDisabled)
                this._compareSelect.set("disabled", this.compareSelectDisabled);
            if (this.valueSelectDisabled)
                this._valueField.set("disabled", this.valueSelectDisabled);
            //this.connect(this._valueField, "onChange", this._onEdit);
        },
        _createCompareSelect: function (value, compareStore) {
            var compareSelect = this._compareSelect = new FilteringSelect({
                name: "compares",
                value: this.compareId || value,
                store: compareStore,
                searchAttr: "name",
                style: this._compareSelectWidth,
                maxHeight: this.maxComboBoxHeight
            }, this._compareNode);
            compareSelect.startup();
        },
        _getDistinctValues: function (selectedField) {
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
        _createCodedValueStore: function () {
            var i18n = this.i18n;
            var store = new Memory({
                data: [
                    {id: "$eq", name: i18n.is}
                ]
            });
            return store;
        },
        _createBooleanStore: function () {
            var i18n = this.i18n;
            var store = new Memory({
                data: [
                    {id: "$eq", name: i18n.is}
                ]
            });
            return store;
        },
        _createStringStore: function () {
            var i18n = this.i18n;
            var store = new Memory({
                data: [
                    {id: "$eq", name: i18n.is},
                    {id: "$eqw", name: i18n.eqw},
                    {id: "$suggest", name: i18n.suggest}
                ]
            });
            return store;
        },
        _createNumberStore: function () {
            var i18n = this.i18n;
            var store = new Memory({
                data: [
                    {id: "$eq", name: i18n.is},
                    {id: "$gt", name: i18n.is_greater_than},
                    {id: "$gte", name: i18n.is_greater_or_equal},
                    {id: "$lt", name: i18n.is_less_than},
                    {id: "$lte", name: i18n.is_less_or_equal}
                ]
            });
            return store;
        },
        _createDateStore: function () {
            var i18n = this.i18n;
            var store = new Memory({
                data: [
                    {id: "$lte", name: i18n.before},
                    {id: "$gte", name: i18n.after}
                ]
            });
            return store;
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
        _getSelectedField: function () {
            var result = this._fieldSelect.value;
            return result;
        },
        _getSelectedFieldType: function () {
            var data = this._fieldSelect.store.data;
            var result = this._fieldSelect.type;
            d_array.forEach(data, function (item) {
                if (item.id === this._fieldSelect.value) {
                    result = item.type;
                }
            }, this);
            return result;
        },
        _getSelectedCompare: function () {
            var result = this._compareSelect.value;
            return result;
        },
        _getSelectedNot: function () {
            var result = this._notSelect.value;
            return result;
        },
        _getNotCheckBoxValue: function () {
            var result = this._notCheckBox.checked;
            return result;
        },
        _getFieldCheckBoxValue: function () {
            var result = this._fieldCheckBox.checked;
            return result;
        },
        _getCompareCheckBoxValue: function () {
            var result = this._compareCheckBox.checked;
            return result;
        },
        _getValueCheckBoxValue: function () {
            var result = this._valueCheckBox.checked;
            return result;
        },
        _getValue: function () {
            var result = this._valueField.value;
            if (this._getSelectedFieldType() === "date") {
                if (result === undefined) {
                    result = this.replacer.replace(this._valueField.displayedValue);
                } else {
                    result = d_locale.format(result, {datePattern: "yyy-MM-dd", selector: 'date'});
                }
            } else if (this._getSelectedFieldType() === "string") {
                if (this.replacer) {
                    result = this.replacer.replace(result);
                }
            }
            return result;
        },
        _onEdit: function () {
            if (this._getSelectedFieldType() === "string" || this._getSelectedFieldType() === "date") {
                if (this.replacer) {
                    var result = this._valueField.value;
                    result = this.replacer.replace(result);
                    this._valueField.set("value", result);
                }
            }
        },
        _validator: function (a, b) {
            return true;
            /*return RegExp("^(?:" + this._computeRegexp(b) + ")" + (this.required ?
             "" : "?") + "$").test(a) && (!this.required || !this._isEmpty(a)) && (this._isEmpty(a) || void 0 !== this.parse(a, b));*/
        }
    });
});
