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
import d_lang from "dojo/_base/lang";
import declare from "dojo/_base/declare";

import _Connect from "ct/_Connect";
import Exception from "ct/Exception";
import ComplexMemoryStore from "ct/store/ComplexMemory";

import QueryBuilderWidgetStoreSelectionWidget from "./QueryBuilderWidgetStoreSelectionWidget";

export default declare([_Connect], {

    createInstance() {
        const configStore = this._getConfigStore();
        const i18n = this._i18n.get().queryBuilderWidgetStoreSelection;
        const properties = this._properties || {};
        const opts = d_lang.mixin({
            i18n: i18n,
            configAdminService: this._configAdminService,
            configStore: configStore,
            config: this._getComponentConfig()
        }, properties.widgetProperties);
        const widget = this._widget = new QueryBuilderWidgetStoreSelectionWidget(opts);
        this.connectP("model", widget._viewModel, "selectedIds", (type, oldVal, newVal) => {
            widget.fireConfigChangeEvent({
                storeIds: newVal
            });
        });
        return widget;
    },

    _getComponentConfig() {
        const properties = this._properties.widgetProperties;
        return this._configAdminService.getConfiguration(properties.pid, properties.bid);
    },

    _updateConfig(config) {
        try {
            this._getComponentConfig().update(config);
        } catch (e) {
            const error = Exception.wrap(e);
            const msg = "_Configurable: Can't apply changed configuration! Error:" + e;
            console.error(msg, error);
            throw e;
        }
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
        const i18n = this._i18n.get().queryBuilderWidgetStoreSelection;
        if (!this._configStore) {
            const store = this._configStore = new ComplexMemoryStore({
                data: [],
                idProperty: "id"
            });
            store.getMetadata = () => {
                return {
                    fields: [{
                        "title": "id",
                        "name": "id",
                        "type": "string",
                        "identifier": true
                    }, {
                        "title": i18n.grid.title,
                        "name": "title",
                        "type": "string"
                    }, {
                        "title": i18n.grid.description,
                        "name": "description",
                        "type": "string"
                    }]
                };
            };
        }
        return this._configStore;
    },

    addStore(service, properties) {
        const configStore = this._getConfigStore();
        if (!configStore.get(properties.id)) {
            configStore.add({
                "id": properties.id,
                "title": properties.title,
                "description": properties.description
            });
        }
    }
});
