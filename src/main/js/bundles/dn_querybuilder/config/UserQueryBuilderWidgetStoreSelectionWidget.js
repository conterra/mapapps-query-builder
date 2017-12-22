/*
 * Copyright (C) 2017 con terra GmbH (info@conterra.de)
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
define(["dojo/_base/declare",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/_CssStateMixin",
    "dojo/text!./templates/UserQueryBuilderWidgetStoreSelectionWidget.html",
    "ct/ui/controls/dataview/DataViewModel",
    "ct/ui/controls/dataview/DataView",
    "ct/Exception",
    "ct/_Connect",
    "wizard/_BuilderWidget",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer"
], function (declare, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, template, DataViewModel, DataView, Exception, _Connect, BuilderWidget) {
    return declare([BuilderWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, _Connect], {
        templateString: template,
        data: null,
        i18n: {
            enable: "Enable component",
            grid: {
                title: "Title",
                dataView: {
                    noDataFound: "No content definition found...",
                    pager: {
                        pageSizeLabelText: "Content definition ${pageStartItemNumber}-${pageEndItemNumber} of ${itemCount}"
                    }
                }
            },
            hint: {
                message: "Select stores that should be available for selection"
            }
        },
        postCreate: function (opts) {
            this.inherited(arguments);
            var model = this._viewModel = new DataViewModel({
                store: this.configStore
            });
            var dataView = this._dataView = this._createDataView();
            dataView.startup();
            dataView.set("model", model);
            model.set("selectedIds", this.config.properties && this.config.properties.storeIds ? this.config.properties.storeIds : []);
            this.storeSelection.set("content", dataView);
            this.connect(this.enableState, "onChange", function (value) {
                this.fireConfigChangeEvent({
                    widgetEnabled: value
                });
            });
        },
        resize: function (dim) {
            if (dim && dim.h > 0) {
                this.rootContainer.resize({
                    w: dim.w,
                    h: dim.h
                });
            }
        },
        _createDataView: function () {
            var i18n = {};
            var dataView = this._dataView = new DataView({
                showFilter: true,
                filterDuringKeyUp: true,
                showPager: true,
                showViewButtons: false,
                itemsPerPage: 10,
                DGRID: {
                    noDataMessage: i18n.noDataFound,
                    checkboxSelection: true,
                    columns: [
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
                                    $eq: "description"
                                }
                            }
                        }
                    ]
                }
            });
            return dataView;
        },
        /*
         * Checks if config is valid
         * @overrides
         */
        isValid: function (config) {
            return !!config;
        },
        uninitialize: function () {
            this.disconnect();
            this._dataView.destroyRecursive();
            this._dataView = null;
            this._dataModel = null;
            this.inherited(arguments);
        },
        updateGrid: function () {
            this._dataView.storeContentChanged();
        }
    });
});