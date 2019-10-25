/*
 * Copyright (C) 2019 con terra GmbH (info@conterra.de)
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
import _TemplatedMixin from "dijit/_TemplatedMixin";
import _WidgetsInTemplateMixin from "dijit/_WidgetsInTemplateMixin";
import _CssStateMixin from "dijit/_CssStateMixin";
import template from "dojo/text!./templates/QueryBuilderWidgetStoreSelectionWidget.html";

import DataViewModel from "dataview/DataViewModel";
import DataView from "dataview/DataView";
import _Connect from "ct/_Connect";

import BuilderWidget from "wizard/_BuilderWidget";

import "dijit/layout/ContentPane";
import "dijit/layout/BorderContainer"

export default declare([BuilderWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, _Connect], {

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

    postCreate(opts) {
        this.inherited(arguments);
        let model = this._viewModel = new DataViewModel({
            store: this.configStore
        });
        let dataView = this._dataView = this._createDataView();
        dataView.startup();
        dataView.set("model", model);
        model.set("selectedIds", this.config.properties && this.config.properties.storeIds ? this.config.properties.storeIds : []);
        this.storeSelection.set("content", dataView);
        this.connect(this.enableState, "onChange", (value) => {
            this.fireConfigChangeEvent({
                widgetEnabled: value
            });
        });
    },

    resize(dim) {
        if (dim && dim.h > 0) {
            this.rootContainer.resize({
                w: dim.w,
                h: dim.h
            });
        }
    },

    _createDataView() {
        let i18n = {};
        return this._dataView = new DataView({
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
    },

    isValid(config) {
        return !!config;
    },

    uninitialize() {
        this.disconnect();
        this._dataView.destroyRecursive();
        this._dataView = null;
        this._dataModel = null;
        this.inherited(arguments);
    },

    updateGrid() {
        this._dataView.storeContentChanged();
    }
});
