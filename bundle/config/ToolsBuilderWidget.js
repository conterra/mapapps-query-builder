define(["dojo/_base/declare",
    "ct/_Connect",
    "wizard/_BuilderWidget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/_CssStateMixin",
    "dojo/text!./templates/ToolsBuilderWidget.html",
    "ct/ui/controls/dataview/DataViewModel",
    "ct/ui/controls/dataview/DataView",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer"
], function (declare, _Connect, _BuilderWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, template, DataViewModel, DataView) {

    return declare([_BuilderWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin], {
        baseClass: "ctToolsBuilderWidget",
        templateString: template,
        constructor: function (opts) {
            this.toolbar = opts.toolbar;
            this._listeners = new _Connect();
            this._i18n = opts.i18n;
        },
        postCreate: function () {
            this.inherited(arguments);
            var model = this._viewModel = new DataViewModel({
                store: this.configStore
            });
            var dataView = this._dataView = this._createDataView();
            this._gridNode.set("content", dataView);
            dataView.startup();
            dataView.set("model", model);
            this._listeners.connect(dataView, "onItemClicked", this, function (evt) {
                this.editQueryTool(evt.itemId);
            });
        },
        resize: function (dim) {
            //Beim Klick auf "ToolsBuilderWidget" in der Live- Konfiguration
            if (dim && dim.h > 0) {
                this._containerNode.resize({
                    w: dim.w,
                    h: dim.h - this.getHeadingHeight()
                });
            }
        },
        _createDataView: function () {
            var i18n = this._i18n.dataView;
            var dataView = this._dataView = new DataView({
                i18n: i18n,
                showFilter: true,
                filterDuringKeyUp: true,
                showPager: true,
                showViewButtons: false,
                itemsPerPage: 10,
                DGRID: {
                    checkboxSelection: true,
                    columns: [
                        {
                            matches: {
                                name: {
                                    $eq: "id"
                                }
                            }
                        },
                        {
                            matches: {
                                name: {
                                    $eq: "title"
                                }
                            }
                        },
                        {
                            matches: {
                                name: {
                                    $eq: "iconClass"
                                }
                            }
                        },
                        {
                            matches: {
                                name: {
                                    $eq: "storeIdForCustomQuery"
                                }
                            }
                        },
                        {
                            matches: {
                                name: {
                                    $eq: "customquery"
                                }
                            }
                        }
                    ]
                }
            });
            dataView.setToolbar(this.toolbar);
            return dataView;
        },
        isValid: function (config) {
            return !!config;
        },
        uninitialize: function () {
            this._listeners.disconnect();
            this._dataView.destroyRecursive();
            this._dataView = null;
            this._dataModel = null;
            this.inherited(arguments);
        },
        removeQueryTool: function () {
            var selectedIds = this._viewModel.get("selectedIds");
            if (selectedIds.length === 0) {
                return;
            }
            this.onRemoveQueryTool({
                src: this,
                ids: selectedIds
            });
        },
        createQueryTool: function () {
            this.onCreateQueryTool({
                src: this
            });
        },
        editQueryTool: function (itemId) {
            this.onEditQueryTool({
                src: this,
                id: itemId
            });
        },
        updateGrid: function () {
            this._dataView.storeContentChanged();
        },
        onRemoveQueryTool: function () {
        },
        onCreateQueryTool: function () {
        },
        onEditQueryTool: function () {
        }
    });
});