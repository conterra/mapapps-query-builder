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
import d_array from "dojo/_base/array";

import d_registry from "dijit/registry";

import _Connect from "ct/_Connect";
import ct_array from "ct/array";
import ct_when from "ct/_when";
import ComplexMemoryStore from "ct/store/ComplexMemory";

import ToolsBuilderWidget from "./QueryToolsBuilderWidget";
import ToolsBuilderWizard from "./QueryToolsBuilderWizard";

const QueryToolsBuilder = declare([_Connect], {

    createInstance() {
        let configStore = this._getConfigStore();
        let properties = this._properties || {};
        let i18n = this.i18n = this._i18n.get();
        let i18nGRID = i18n.widget.grid;
        let opts = d_lang.mixin({
            configStore: configStore,
            toolbar: this._toolbar,
            i18n: i18nGRID
        }, properties.widgetProperties);
        let widget = this._widget = new ToolsBuilderWidget(opts);
        this.connect(widget, "onRemoveQueryTool", "_onRemoveQueryTool");
        this.connect(widget, "onCreateQueryTool", "_onCreateQueryTool");
        this.connect(widget, "onEditQueryTool", "_onEditQueryTool");
        this.connect(widget, "onCopyQueryTool", "_onCopyQueryTool");
        return widget;
    },

    destroyInstance(instance) {
        this.disconnect();
        this._configStore = null;
        let window = this._window;
        if (window) {
            window.close();
            this._window = null;
        }
        this._widget = null;
        instance.destroyRecursive();
    },

    _getConfigStore() {
        if (!this._configStore) {
            this._configStore = new ComplexMemoryStore({
                data: [],
                idProperty: "pid",
                metadata: {
                    displayField: "name",
                    fields: [
                        /*{
                         "title": "ID",
                         "name": "id",
                         "type": "string",
                         "identifier": true
                         },*/
                        {
                            "title": "Title",
                            "name": "title",
                            "type": "string"
                        },
                        {
                            "title": "IconClass",
                            "name": "iconClass",
                            "type": "string"
                        },
                        {
                            "title": "Store ID",
                            "name": "storeId",
                            "type": "string"
                        }/*,
                                 {
                                 "title": "Complex Query",
                                 "name": "complexQuery",
                                 "type": "string",
                                 "subtype": "prettyJson"
                                 }*/
                    ]
                }
            });
            this._initConfigStore();
        }
        return this._configStore;
    },

    _initConfigStore() {
        let configStore = this._configStore;
        let configAdminService = this._configAdminService;
        let properties = this._properties.widgetProperties;
        let data = configAdminService.getFactoryConfigurations(properties.pid, properties.bid);
        data = d_array.map(data, (config) => {
            let props = config.get("properties");
            props.pid = config.get("pid");
            return props;
        }, this);
        configStore.setData(data);
    },

    _applyConfig(properties) {
        properties = d_lang.clone(properties);
        let props = this._properties.widgetProperties;
        let config = this._configAdminService.createFactoryConfiguration(props.pid, props.bid);
        delete properties.pid;
        config.update(properties);
    },

    _updateConfig(properties) {
        properties = d_lang.clone(properties);
        let config = this._getConfiguration(properties.pid);
        delete properties.pid;
        config.update(properties);
    },

    _createWizard(properties) {
        // time & default icon
        let date = new Date();
        if (properties.id === undefined) {
            properties.id = "querybuilder_" + date.getTime();
            properties.title = "";
            properties.iconClass = "icon-custom-info";
            properties.complexQuery = {};
            properties.options = {};
        }
        let wizardI18n = this.i18n.widget.wizard;
        return new ToolsBuilderWizard({
            widget: this._widget,
            globalProperties: this._properties,
            properties: properties,
            i18n: wizardI18n,
            windowManager: this._windowManager,
            appCtx: this._appCtx,
            stores: this._stores,
            mapWidgetModel: this._mapWidgetModel,
            replacer: this._replacer,
            metadataAnalyzer: this._metadataAnalyzer,
            drawGeometryHandler: this._drawGeometryHandler,
            queryBuilderProperties: this._queryBuilderProperties
        });
    },

    _openWizardWindow(wizard, edit) {
        let properties = wizard.get("properties");
        let windowManager = this._windowManager;
        let i18n = this.i18n.widget.wizard;
        let title;
        if (edit === true) {
            title = i18n.windowtitleEdit;
        } else {
            title = i18n.windowtitleAdd;
        }
        let window = windowManager.createWindow({
            title: title,
            marginBox: {
                w: 840,
                h: 520
            },
            content: wizard,
            closable: true,
            attachToDom: this._appCtx.builderWindowRoot,
            resizable: false
        });
        window.show();
        this.connect(wizard, "_onReady", () => {
            if (edit) {
                this._updateConfig(properties);
            } else {
                this._applyConfig(properties);
            }
            this._updateGrid();
            wizard.disconnect();
            let children = wizard._queryNode.children;
            d_array.forEach(children, (child) => {
                let widget = d_registry.getEnclosingWidget(child);
                widget.disconnect();
            }, this);
            window.close();
        });
        this.connect(wizard, "_onCancel", () => {
            wizard.disconnect();
            let children = wizard._queryNode.children;
            d_array.forEach(children, (child) => {
                let widget = d_registry.getEnclosingWidget(child);
                widget.disconnect();
            }, this);
            window.close();
        });
    },

    _getConfiguration(pid) {
        let properties = this._properties.widgetProperties;
        let data = this._configAdminService.getFactoryConfigurations(properties.pid, properties.bid);
        return ct_array.arraySearchFirst(data, {
            pid: pid
        });
    },

    _onCreateQueryTool(event) {
        let wizard = this._createWizard({});
        this._openWizardWindow(wizard, false);
    },

    _onRemoveQueryTool(event) {
        let ids = event.ids || [];
        ct_when(this._windowManager.createInfoDialogWindow({
            message: this.i18n.widget.window.removeToolMessage,
            attachToDom: this._appCtx.builderWindowRoot
        }), () => {
            let store = this._getConfigStore();
            d_array.forEach(ids, (pid) => {
                let config = this._getConfiguration(pid);
                if (config) {
                    config.remove();
                }
                store.remove(pid);
            }, this);
            this._updateGrid();
        }, this);
    },

    _onEditQueryTool(event) {
        let store = this._getConfigStore();
        let config = store.get(event.id);
        let wizard = this._createWizard(config);
        this._openWizardWindow(wizard, true);
    },

    _onCopyQueryTool(event) {
        let ids = event.ids || [];
        d_array.forEach(ids, (pid) => {
            let store = this._getConfigStore();
            let config = store.get(pid);
            if (config) {
                let date = new Date();
                config.id = "querybuilder_" + date.getTime();
                this._applyConfig(config);
            }
        }, this);
        this._updateGrid();
    },

    _updateGrid() {
        this._initConfigStore();
        let widget = this._widget;
        widget.updateGrid();
    }
});

module.exports = QueryToolsBuilder;