/*
 * Copyright (C) 2020 con terra GmbH (info@conterra.de)
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
import apprt_when from "apprt-core/when";
import ComplexMemoryStore from "ct/store/ComplexMemory";

import ToolsBuilderWidget from "./QueryToolsBuilderWidget";
import ToolsBuilderWizard from "./QueryToolsBuilderWizard";

export default declare([_Connect], {

    createInstance() {
        const configStore = this._getConfigStore();
        const properties = this._properties || {};
        const i18n = this.i18n = this._i18n.get();
        const i18nGRID = i18n.widget.grid;
        const opts = d_lang.mixin({
            configStore: configStore,
            toolbar: this._toolbar,
            i18n: i18nGRID
        }, properties.widgetProperties);
        const widget = this._widget = new ToolsBuilderWidget(opts);
        this.connect(widget, "onRemoveQueryTool", "_onRemoveQueryTool");
        this.connect(widget, "onCreateQueryTool", "_onCreateQueryTool");
        this.connect(widget, "onEditQueryTool", "_onEditQueryTool");
        this.connect(widget, "onCopyQueryTool", "_onCopyQueryTool");
        return widget;
    },

    destroyInstance(instance) {
        this.disconnect();
        this._configStore = null;
        const window = this._window;
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
        const configStore = this._configStore;
        const configAdminService = this._configAdminService;
        const properties = this._properties.widgetProperties;
        let data = configAdminService.getFactoryConfigurations(properties.pid, properties.bid);
        data = d_array.map(data, (config) => {
            const props = config.get("properties");
            props.pid = config.get("pid");
            return props;
        }, this);
        configStore.setData(data);
    },

    _applyConfig(properties) {
        properties = d_lang.clone(properties);
        const props = this._properties.widgetProperties;
        const config = this._configAdminService.createFactoryConfiguration(props.pid, props.bid);
        delete properties.pid;
        config.update(properties);
    },

    _updateConfig(properties) {
        properties = d_lang.clone(properties);
        const config = this._getConfiguration(properties.pid);
        delete properties.pid;
        config.update(properties);
    },

    _createWizard(properties) {
        // time & default icon
        const date = new Date();
        if (properties.id === undefined) {
            properties.id = "querybuilder_" + date.getTime();
            properties.title = "";
            properties.iconClass = "icon-custom-info";
            properties.complexQuery = {};
            properties.options = {};
        }
        const wizardI18n = this.i18n.widget.wizard;
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
        const properties = wizard.get("properties");
        const windowManager = this._windowManager;
        const i18n = this.i18n.widget.wizard;
        let title;
        if (edit === true) {
            title = i18n.windowtitleEdit;
        } else {
            title = i18n.windowtitleAdd;
        }
        const window = windowManager.createWindow({
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
            const children = wizard._queryNode.children;
            d_array.forEach(children, (child) => {
                const widget = d_registry.getEnclosingWidget(child);
                widget.disconnect();
            }, this);
            window.close();
        });
        this.connect(wizard, "_onCancel", () => {
            wizard.disconnect();
            const children = wizard._queryNode.children;
            d_array.forEach(children, (child) => {
                const widget = d_registry.getEnclosingWidget(child);
                widget.disconnect();
            }, this);
            window.close();
        });
    },

    _getConfiguration(pid) {
        const properties = this._properties.widgetProperties;
        const data = this._configAdminService.getFactoryConfigurations(properties.pid, properties.bid);
        return ct_array.arraySearchFirst(data, {
            pid: pid
        });
    },

    _onCreateQueryTool(event) {
        const wizard = this._createWizard({});
        this._openWizardWindow(wizard, false);
    },

    _onRemoveQueryTool(event) {
        const ids = event.ids || [];
        apprt_when(this._windowManager.createInfoDialogWindow({
            message: this.i18n.widget.window.removeToolMessage,
            attachToDom: this._appCtx.builderWindowRoot
        }), () => {
            const store = this._getConfigStore();
            d_array.forEach(ids, (pid) => {
                const config = this._getConfiguration(pid);
                if (config) {
                    config.remove();
                }
                store.remove(pid);
            }, this);
            this._updateGrid();
        }, this);
    },

    _onEditQueryTool(event) {
        const store = this._getConfigStore();
        const config = store.get(event.id);
        const wizard = this._createWizard(config);
        this._openWizardWindow(wizard, true);
    },

    _onCopyQueryTool(event) {
        const ids = event.ids || [];
        d_array.forEach(ids, (pid) => {
            const store = this._getConfigStore();
            const config = store.get(pid);
            if (config) {
                const date = new Date();
                config.id = "querybuilder_" + date.getTime();
                this._applyConfig(config);
            }
        }, this);
        this._updateGrid();
    },

    _updateGrid() {
        this._initConfigStore();
        const widget = this._widget;
        widget.updateGrid();
    }
});
