/*
 * Copyright (C) 2025 con terra GmbH (info@conterra.de)
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

import _Connect from "ct/_Connect";
import DataViewModel from "dataview/DataViewModel";
import DataView from "dataview/DataView";

import _BuilderWidget from "wizard/_BuilderWidget";

import _TemplatedMixin from "dijit/_TemplatedMixin";
import _WidgetsInTemplateMixin from "dijit/_WidgetsInTemplateMixin";
import _CssStateMixin from "dijit/_CssStateMixin";
import templateStringContent from "dojo/text!./templates/QueryToolsBuilderWidget.html";
import "dijit/layout/ContentPane";
import "dijit/layout/BorderContainer";

export default declare([_BuilderWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin], {

    baseClass: "ctToolsBuilderWidget",
    templateString: templateStringContent,
    constructor() {
        this._listeners = new _Connect();
    },
    postCreate() {
        this.inherited(arguments);
        const model = this._viewModel = new DataViewModel({
            store: this.configStore
        });
        const dataView = this._dataView = this._createDataView();
        this._gridNode.set("content", dataView);
        dataView.startup();
        dataView.set("model", model);
        this._listeners.connect(dataView, "onItemClicked", this, (evt) => {
            this.editQueryTool(evt.itemId);
        });
    },
    resize(dim) {
        if (dim && dim.h > 0) {
            this._containerNode.resize({
                w: dim.w,
                h: dim.h - this.getHeadingHeight()
            });
        }
    },
    _createDataView() {
        const i18n = this.i18n.dataView;
        const dataView = this._dataView = new DataView({
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
                                $eq: "storeId"
                            }
                        }
                    },
                    {
                        matches: {
                            name: {
                                $eq: "complexQuery"
                            }
                        }
                    }
                ]
            }
        });
        dataView.setToolbar(this.toolbar);
        return dataView;
    },
    isValid(config) {
        return !!config;
    },
    uninitialize() {
        this._listeners.disconnect();
        this._dataView.destroyRecursive();
        this._dataView = null;
        this._dataModel = null;
        this.inherited(arguments);
    },
    removeQueryTool() {
        const selectedIds = this._viewModel.get("selectedIds");
        if (selectedIds.length === 0) {
            return;
        }
        this.onRemoveQueryTool({
            src: this,
            ids: selectedIds
        });
    },
    createQueryTool() {
        this.onCreateQueryTool({
            src: this
        });
    },
    editQueryTool(itemId) {
        this.onEditQueryTool({
            src: this,
            id: itemId
        });
    },
    copyQueryTool() {
        const selectedIds = this._viewModel.get("selectedIds");
        if (selectedIds.length === 0) {
            return;
        }
        this.onCopyQueryTool({
            src: this,
            ids: selectedIds
        });
    },
    updateGrid() {
        this._dataView.storeContentChanged();
        this._viewModel.fireDataChanged();
    },
    onRemoveQueryTool() {
    },
    onCreateQueryTool() {
    },
    onEditQueryTool() {
    },
    onCopyQueryTool() {
    }
});
