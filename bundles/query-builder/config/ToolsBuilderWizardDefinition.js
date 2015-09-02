define([
    "dojo/_base/declare"
], function (declare) {

    return declare([], {
        constructor: function (opts) {

            this.properties = opts;
            this._ids = opts.ids || [];
            this._i18n = opts.i18n;
        },
        createDataformJson: function () {
            return {
                "dataform-version": "1.0.0",
                "type": "wizardpanel",
                "showCancel": true,
                "size": {
                    "w": 540,
                    "h": 280
                },
                "children": [
                    {
                        "type": "borderpanel",
                        "children": [
                            {
                                "type": "gridpanel",
                                "region": "center",
                                "children": [
                                    /*{
                                     "type": "textbox",
                                     "field": "id",
                                     "title": "ID",
                                     "required": true
                                     },*/
                                    {
                                        "type": "textbox",
                                        "field": "title",
                                        "title": "${title}",
                                        "required": true
                                    },
                                    {
                                        "type": "textbox",
                                        "field": "iconClass",
                                        "title": "${iconClass}",
                                        "required": true
                                    },
                                    {
                                        "type": "gridpanel",
                                        "showLabels": false,
                                        "cols": 1,
                                        "children": [
                                            {
                                                "type": "button",
                                                "label": "${iconClassHelp}",
                                                "showLabel": true,
                                                "tooltip": "${iconClassHelp}",
                                                "topic": "button_iconclass"
                                            }]},
                                    {
                                        "type": "selectbox",
                                        "useFirstValueAsDefault": true,
                                        "field": "storeIdForCustomQuery",
                                        "title": "StoreID",
                                        "values": this._ids,
                                        "required": true
                                    },
                                    {
                                        "type": "textarea",
                                        "field": "customquery",
                                        "title": "Custom Query",
                                        "isJson": true,
                                        "required": true,
                                        "resizeable": true,
                                        "size": {
                                            "w": 270,
                                            "h": 200
                                        }
                                    },
                                    {
                                        "type": "gridpanel",
                                        "showLabels": false,
                                        "cols": 1,
                                        "children": [
                                            {
                                                "type": "button",
                                                "label": "${complexQueryHelp}",
                                                "showLabel": true,
                                                "tooltip": "${complexQueryHelp}",
                                                "topic": "button_query"
                                            }]}
                                ]
                            }]
                    }]

            };

        }
    });
});