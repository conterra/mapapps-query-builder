define([
    "dojo/_base/lang",
    "dojo/_base/declare",
    "dojo/parser",
    "dojo/_base/array",
    "ct/_Connect",
    "ct/_when",
    "wizard/_BuilderWidget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/FieldWidget.html",
    "dijit/form/TextBox",
    "dijit/form/ValidationTextBox",
    "dijit/form/ComboBox",
    "dijit/form/FilteringSelect",
    "dijit/form/Button",
    "dijit/form/DateTextBox",
    "dojo/store/Memory",
    "dojo/dom-construct",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer"
], function (d_lang, declare, parser, d_array, _Connect, ct_when, _BuilderWidget, _TemplatedMixin, _WidgetsInTemplateMixin, template, TextBox, ValidationTextBox, ComboBox, FilteringSelect, Button, DateTextBox, Memory, domConstruct, ContentPane) {

    return declare([_BuilderWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _Connect], {
        templateString: template,
        constructor: function (opts) {
            this._storeData = opts.storeData;
            this._i18n = opts.i18n;
            this._fieldId = opts.fieldId;
            this._compareId = opts.compareId;
            this._value = opts.value;
        },
        postCreate: function () {
            this.inherited(arguments);
            var fieldData = this._storeData;
            var fieldStore = this._fieldStore = new Memory({
                data: fieldData
            });
            var fieldSelect = this._fieldSelect = new FilteringSelect({
                name: "fields",
                value: fieldData[0].id,
                store: fieldStore,
                searchAttr: "title",
                style: "width: 180px;"
            }, this._fieldNode);
            fieldSelect.startup();
            this._createCompareSelect();
            this.connect(fieldSelect, "onChange", this._changeCompareSelect);

            var myButton = new Button({
                label: "-",
                onClick: function () {
                    myButton.domNode.parentNode.remove();
                }
            });
            domConstruct.place(myButton.domNode, this._buttonNode, "replace");
            myButton.startup();

            if (this._fieldId) {
                this._fieldSelect.set("value", this._fieldId);
            }
        },
        resize: function (dim) {
            if (dim && dim.h > 0) {
                this._containerNode.resize({
                    w: dim.w,
                    h: dim.h - this.getHeadingHeight()
                });
            }
        },
        _createCompareSelect: function () {
            var fieldSelect = this._fieldSelect;
            var selectedField = fieldSelect.get("value");
            var type = this._fieldStore.get(selectedField).type;
            var codedValues = this._fieldStore.get(selectedField).codedValues;
            var compareSelect;
            if (codedValues.length > 0) {
                var compareStore = this._compareStore = this._createCodedValueStore();
                compareSelect = this._compareSelect = new FilteringSelect({
                    name: "compares",
                    value: this._compareId || "is",
                    store: compareStore,
                    searchAttr: "name",
                    style: "width: 120px;"
                }, this._compareNode);
                compareSelect.startup();

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
                    style: "width: 200px;"
                });
                domConstruct.place(valueSelect.domNode, this._valueNode);
                valueSelect.startup();
            } else {
                if (type === "string") {
                    var compareStore = this._compareStore = this._createStringStore();
                    compareSelect = this._compareSelect = new FilteringSelect({
                        name: "compares",
                        value: this._compareId || "is",
                        store: compareStore,
                        searchAttr: "name",
                        style: "width: 120px;"
                    }, this._compareNode);
                } else if (type === "number" || type === "integer" || type === "double") {
                    var compareStore = this._compareStore = this._createNumberStore();
                    compareSelect = this._compareSelect = new FilteringSelect({
                        name: "compares",
                        value: this._compareId || "is_number",
                        store: compareStore,
                        searchAttr: "name",
                        style: "width: 120px;"
                    }, this._compareNode);
                } else if (type === "date") {
                    var compareStore = this._compareStore = this._createDateStore();
                    compareSelect = this._compareSelect = new FilteringSelect({
                        name: "compares",
                        value: this._compareId || "before",
                        store: compareStore,
                        searchAttr: "name",
                        style: "width: 120px;"
                    }, this._compareNode);
                }
                compareSelect.startup();
                if (type === "date") {
                    var valueSelect = this._valueField = new DateTextBox({
                        name: "value",
                        value: this._value || new Date(),
                        style: "width: 200px;"
                    });
                } else {
                    var valueSelect = this._valueField = new TextBox({
                        name: "value",
                        value: this._value || "",
                        placeHolder: this._i18n.typeInValue,
                        style: "width: 200px;"
                    });
                }
                domConstruct.place(valueSelect.domNode, this._valueNode);
            }
        },
        _changeCompareSelect: function (type, value) {
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
                compareSelect.set("store", compareStore);
                compareSelect.set("value", this._compareId || "is");

                var codedValueData = [];
                d_array.forEach(codedValues, function (codedValue) {
                    codedValueData.push({name: codedValue.name, id: codedValue.code});
                });
                var codedValueStore = new Memory({
                    data: codedValueData
                });
                var valueSelect = this._valueField = new FilteringSelect({
                    name: "value",
                    value: this._value || codedValueData[0].id,
                    store: codedValueStore,
                    searchAttr: "name",
                    style: "width: 200px;"
                });
                domConstruct.place(valueSelect.domNode, this._valueNode);
                valueSelect.startup();
            } else {
                if (type === "string") {
                    var compareStore = this._compareStore = this._createStringStore();
                    compareSelect.set("store", compareStore);
                    compareSelect.set("value", this._compareId || "is");
                } else if (type === "number" || type === "integer" || type === "double") {
                    var compareStore = this._compareStore = this._createNumberStore();
                    compareSelect.set("store", compareStore);
                    compareSelect.set("value", this._compareId || "is_number");
                } else if (type === "date") {
                    var compareStore = this._compareStore = this._createDateStore();
                    compareSelect.set("store", compareStore);
                    compareSelect.set("value", this._compareId || "before");
                }
                if (type === "date") {
                    var valueSelect = this._valueField = new DateTextBox({
                        name: "value",
                        value: this._value || new Date(),
                        style: "width: 200px;"
                    });
                } else {
                    var valueSelect = this._valueField = new TextBox({
                        name: "value",
                        value: this._value || "",
                        placeHolder: this._i18n.typeInValue,
                        style: "width: 200px;"
                    });
                }
                domConstruct.place(valueSelect.domNode, this._valueNode);
            }
            //compareSelect.startup();
        },
        _createCodedValueStore: function () {
            var i18n = this._i18n;
            var store = new Memory({
                data: [
                    {id: "is", name: i18n.is},
                    {id: "is_not", name: i18n.is_not}
                ]
            });
            return store;
        },
        _createStringStore: function () {
            var i18n = this._i18n;
            var store = new Memory({
                data: [
                    {id: "is", name: i18n.is},
                    {id: "is_not", name: i18n.is_not},
                    {id: "contains", name: i18n.contains},
                    {id: "contains_not", name: i18n.contains_not},
                    {id: "starts_with", name: i18n.starts_with},
                    {id: "ends_with", name: i18n.ends_with}
                ]
            });
            return store;
        },
        _createNumberStore: function () {
            var i18n = this._i18n;
            var store = new Memory({
                data: [
                    {id: "is_number", name: i18n.is},
                    {id: "is_not_number", name: i18n.is_not},
                    {id: "is_greater_number", name: i18n.is_greater_than},
                    {id: "is_greater_or_equal_number", name: i18n.is_greater_or_equal},
                    {id: "is_less_number", name: i18n.is_less_than},
                    {id: "is_less_or_equal_number", name: i18n.is_less_or_equal}
                ]
            });
            return store;
        },
        _createDateStore: function () {
            var i18n = this._i18n;
            var store = new Memory({
                data: [
                    {id: "before", name: i18n.before},
                    {id: "after", name: i18n.after}
                ]
            });
            return store;
        },
        _getSelectedField: function () {
            var id = this._fieldSelect.value;
            var store = this._fieldStore;
            var result = store.get(id);
            return result;

        },
        _getSelectedCompare: function () {
            var id = this._compareSelect.value;
            var store = this._compareStore;
            var result = store.get(id);
            return result;
        },
        _getValue: function () {
            var result = this._valueField.value;
            return result;
        }
    });
});