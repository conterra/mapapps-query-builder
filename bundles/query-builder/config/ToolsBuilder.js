define([
    "dojo/_base/lang",
    "dojo/_base/declare",
    "dojo/_base/array",
    "ct/_lang",
    "ct/_Connect",
    "ct/array",
    "ct/Exception",
    "ct/_string",
    "./ToolsBuilderWidget",
    "./ToolsBuilderWizard",
    "ct/store/ComplexMemory",
    "ct/_when",
    "ct/Hash",
    "./ToolsBuilderWizardDefinition"
], function (d_lang, declare, d_array, ct_lang, _Connect, ct_array, Exception, ct_string, ToolsBuilderWidget, ToolsBuilderWizard, ComplexMemoryStore, ct_when, Hash, ToolsBuilderWizardDefinition) {
    /*
     * COPYRIGHT 2012 con terra GmbH Germany
     */
    return declare([_Connect],
            /**
             * @lends custominfo.config.CustomInfoBuilder.prototype
             */
                    {
                        createInstance: function () {
                            var configStore = this._getConfigStore();
                            var properties = this._properties || {};
                            var i18nGRID = this._i18n.get().widget.grid;
                            var opts = d_lang.mixin({
                                //configAdminService: this._configAdminService,
                                configStore: configStore,
                                toolbar: this._toolbar,
                                i18n: i18nGRID
                            }, properties.widgetProperties);
                            var widget = this._widget = new ToolsBuilderWidget(opts);
                            this.connect(widget, "onRemoveQueryTool", "_onRemoveQueryTool");
                            this.connect(widget, "onCreateQueryTool", "_onCreateQueryTool");
                            this.connect(widget, "onEditQueryTool", "_onEditQueryTool");
                            return widget;
                        },
                        destroyInstance: function (instance) {
                            this.disconnect();
                            this._configStore = null;
                            var window = this._window;
                            if (window) {
                                window.close();
                                this._window = null;
                            }
                            this._widget = null;
                            instance.destroyRecursive();
                        },
                        _getConfigStore: function () {
                            if (!this._configStore) {
                                var store = this._configStore = new ComplexMemoryStore({
                                    data: [],
                                    idProperty: "pid",
                                    metadata: {
                                        //Attribute der Tabellen im ToolsBuilderWidget
                                        displayField: "name",
                                        fields: [
                                            {
                                                "title": "ID",
                                                "name": "id",
                                                "type": "string",
                                                "identifier": true
                                            },
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
                                                "name": "storeIdForCustomQuery",
                                                "type": "string"
                                            }/*,
                                             {
                                             "title": "Custom Query",
                                             "name": "customquery",
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
                        _initConfigStore: function () {
                            var configStore = this._configStore;
                            var configAdminService = this._configAdminService;
                            var properties = this._properties.widgetProperties;
                            var data = configAdminService.getFactoryConfigurations(properties.pid, properties.bid);
                            data = d_array.map(data, function (config) {
                                var props = config.get("properties");
                                props.pid = config.get("pid");
                                props.type = props.type || "CUSTOM";
                                return props;
                            }, this);
                            configStore.setData(data);
                        },
                        _applyConfig: function (properties) {
                            properties = d_lang.clone(properties);
                            var props = this._properties.widgetProperties;
                            var config = this._configAdminService.createFactoryConfiguration(props.pid, props.bid);

                            config.update(properties);
                            //this._updateGrid();
                        },
                        _updateConfig: function (properties) {
                            properties = d_lang.clone(properties);
                            var config = this._getConfiguration(properties.pid);
                            config.update(properties);
                        },
                        _createWizard2: function (config) {
                            var properties = this._properties || {};
                            // time & default icon
                            var date = new Date();
                            if (config.id === undefined) {
                                properties.id = "fc_" + date.getTime();
                                properties.title = "";
                                properties.iconClass = "icon-custom-info";
                                properties.customquery = {};
                                properties._wizardGUI = {
                                    mode: "new"
                                };
                            } else {
                                properties.id = config.id;
                                properties.title = config.title;
                                properties.iconClass = config.iconClass;
                                properties.pid = config.pid;
                                properties.storeIdForCustomQuery = config.storeIdForCustomQuery;
                                properties.customquery = config.customquery;
                                properties._wizardGUI = config._wizardGUI;
                            }
                            // search stores
                            var stores = this._agsstores;
                            var storeData = this._getStoreData(stores);

                            // i18n
                            var wizardI18n = this._i18n.get().widget.wizard;

                            var wizard = new ToolsBuilderWizard({storeData: storeData, properties: properties, i18n: wizardI18n, windowManager: this._windowManager, appCtx: this._appCtx, agsstores: this._agsstores, mapState: this._mapState});

                            return wizard;
                        },
                        _createWizard: function (config) {
                            var properties = this._properties || {};
                            // time & default icon
                            var date = new Date();
                            if (config.id === undefined) {
                                properties.id = "fc_" + date.getTime();
                                properties.title = "";
                                properties.iconClass = "icon-custom-info";
                                properties.customquery = {};
                            } else {
                                properties.id = config.id;
                                properties.title = config.title;
                                properties.iconClass = config.iconClass;
                                properties.pid = config.pid;
                                properties.storeIdForCustomQuery = config.storeIdForCustomQuery;
                                properties.customquery = config.customquery;
                                properties._wizardGUI = config._wizardGUI;
                            }
                            // search stores
                            var stores = this._agsstores;
                            var ids = this._getStoreIds(stores);

                            // i18n
                            var wizardI18n = this._i18n.get().widget.wizard;

                            // create dataform
                            var dfService = this._dataformService;
                            var dataformDefinition = new ToolsBuilderWizardDefinition({ids: ids, i18n: wizardI18n});
                            dataformDefinition = dataformDefinition.createDataformJson();
                            dataformDefinition = this._substituteDefintion(dataformDefinition, wizardI18n);
                            var dataform = dfService.createDataForm(dataformDefinition);

                            dataform.connect(dataform, "onControlEvent", function (evt) {
                                switch (evt.topic) {
                                    case "button_iconclass" :
                                        var winURL = 'http://www.mapapps.de/mapapps/resources/jsregistry/root/themes/3.2.1/themes/webFontsGallery.html';
                                        var winName = 'win1';
                                        var winSize = 'width=800,height=600,scrollbars=yes';
                                        var ref = window.open(winURL, winName, winSize);
                                        break;
                                    case "button_query" :
                                        var winURL = 'http://developernetwork.conterra.de/de/documentation/mapapps/32/developers-documentation/complex-query-dojostore';
                                        var winName = 'win2';
                                        var winSize = 'width=800,height=600,scrollbars=yes';
                                        var ref = window.open(winURL, winName, winSize);
                                        break;
                                }
                            });

                            var binding = dfService.createBinding("object", {
                                data: properties
                            });
                            dataform.set("dataBinding", binding);
                            return dataform;
                        },
                        _openWizardWindow2: function (wizard, edit) {
                            var properties = this._properties || {};
                            var windowManager = this._windowManager;
                            var i18n = this._i18n.get().widget.wizard;
                            var title;
                            if (edit === true) {
                                title = i18n.windowtitleEdit;
                            } else {
                                title = i18n.windowtitleAdd;
                            }
                            var window = windowManager.createModalWindow({
                                title: title,
                                marginBox: {
                                    w: 600,
                                    h: 500
                                },
                                content: wizard,
                                closable: true,
                                attachToDom: this._appCtx.builderWindowRoot
                            });
                            window.show();

                            this.connect(wizard, "_onReady", function () {
                                if (edit) {
                                    this._updateConfig(properties);
                                } else {
                                    this._applyConfig(properties);
                                }
                                this._updateGrid();
                                wizard.disconnect();
                                window.close();
                            });
                            this.connect(wizard, "_onCancel", function () {
                                wizard.disconnect();
                                window.close();
                            });
                        },
                        _openWizardWindow: function (wizard, edit) {
                            var properties = this._properties || {};
                            var windowManager = this._windowManager;
                            var i18n = this._i18n.get().widget.wizard;
                            var title;
                            if (edit === true) {
                                title = i18n.windowtitleEdit;
                            } else {
                                title = i18n.windowtitleAdd;
                            }
                            var window = windowManager.createModalWindow({
                                title: title,
                                marginBox: {
                                    w: 450,
                                    h: 450
                                },
                                content: wizard,
                                closable: true,
                                attachToDom: this._appCtx.builderWindowRoot
                            });
                            window.show();

                            var save = d_lang.hitch(this, function (event) {
                                if (edit) {
                                    this._updateConfig(properties);
                                } else {
                                    this._applyConfig(properties);
                                }
                                this._updateGrid();
                            });
                            wizard.connect(wizard, "onControlEvent", function (evt) {
                                switch (evt.topic) {
                                    case "wizardpanel/CANCEL" :
                                        window.close();
                                        break;
                                    case "wizardpanel/DONE" :
                                        save(wizard, window);
                                        window.close();
                                        break;
                                }
                            });
                        },
                        _getConfiguration: function (pid) {
                            var properties = this._properties.widgetProperties;
                            var data = this._configAdminService.getFactoryConfigurations(properties.pid, properties.bid);
                            return ct_array.arraySearchFirst(data, {
                                pid: pid
                            });
                        },
                        _onCreateQueryTool: function (event) {
                            var wizard = this._createWizard2({});
                            this._openWizardWindow2(wizard, false);
                        },
                        _onRemoveQueryTool: function (event) {
                            var ids = event.ids || [];
                            ct_when(this._windowManager.createInfoDialogWindow({
                                message: "DeleteQueryTool",
                                attachToDom: this._appCtx.builderWindowRoot
                            }), function () {
                                var store = this._getConfigStore();
                                d_array.forEach(
                                        ids,
                                        function (pid) {
                                            var config = this._getConfiguration(pid);
                                            // debugger
                                            if (config) {
                                                config.remove();
                                            }
                                            store.remove(pid);
                                        }, this);
                                this._updateGrid();
                            }, this);
                        },
                        _onEditQueryTool: function (event) {
                            var store = this._getConfigStore();
                            var config = store.get(event.id);
                            var wizard = this._createWizard2(config);
                            this._openWizardWindow2(wizard, true);
                        },
                        _substituteDefintion: function (templateWidetDefinition, params) {
                            return new Hash(templateWidetDefinition).substitute(params, true).asMap();
                        },
                        _updateGrid: function () {
                            this._initConfigStore();
                            var widget = this._widget;
                            widget.updateGrid();
                        },
                        _getStoreIds: function (stores) {
                            var idArray = [];
                            d_array.forEach(stores, function (store) {
                                var customid = store.id;
                                idArray.push(customid);
                            }, this);
                            return idArray;
                        },
                        _getStoreData: function (stores) {
                            var data = [];
                            d_array.forEach(stores, function (store) {
                                var id = store.id;
                                ct_when(store.getMetadata(), function (metadata) {
                                    var title = metadata.title || store.id;
                                    data.push({name: title, id: id});
                                }, this);
                            }, this);
                            return data;
                        }
                    });
        });