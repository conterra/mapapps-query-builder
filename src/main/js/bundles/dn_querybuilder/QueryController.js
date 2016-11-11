/*
 * Copyright (C) 2015 con terra GmbH (info@conterra.de)
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
define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "ct/_when",
    "ct/store/Filter",
    "./MemorySelectionStore"
], function (declare,
             d_array,
             d_lang,
             ct_when,
             Filter,
             MemorySelectionStore) {
    return declare([], {
        activate: function () {
            this.inherited(arguments);
            this.i18n = this._i18n.get().wizard;
        },
        query: function (store, customQuery, options, tool) {
            options.fields = {geometry: 1};
            ct_when(store.query(customQuery, options), function (result) {
                if (result.total > 0) {
                    var wkid = this._mapState.getSpatialReference().wkid;
                    var geometries = d_array.map(result, function (item) {
                        return item.geometry;
                    });
                    ct_when(this._coordinateTransformer.transform(geometries, wkid), function (transformedGeometries) {
                        d_array.forEach(transformedGeometries, function (tg, index) {
                            result[index].geometry = tg;
                        });
                        var memorySelectionStore = new MemorySelectionStore({
                            masterStore: store,
                            data: result,
                            idProperty: store.idProperty
                        });
                        this._dataModel.setDatasource(memorySelectionStore);
                        this._setProcessing(tool, false);
                    }, this);
                } else {
                    this._logService.warn({
                        id: 0,
                        message: this.i18n.no_results_error
                    });
                    this._setProcessing(tool, false);
                }
            }, function (e) {
                this._logService.error({
                    id: e.code,
                    message: e
                });
                this._setProcessing(tool, false);
            }, this);
        },
        defaultQuery: function (store, customQuery, options, tool) {
            var filter = new Filter(store, customQuery, options);
            ct_when(filter.query({}, {count: 0}).total, function (total) {
                if (total) {
                    this._dataModel.setDatasource(filter);
                    this._setProcessing(tool, false);
                } else {
                    this._logService.warn({
                        id: 0,
                        message: this.i18n.no_results_error
                    });
                    this._setProcessing(tool, false);
                }
            }, function (e) {
                this._setProcessing(tool, false);
                this._logService.error({
                    id: e.code,
                    message: e
                });
            }, this);
        },
        _setProcessing: function (tool, processing) {
            if (tool) {
                tool.set("processing", processing);
            }
        }
    });
});