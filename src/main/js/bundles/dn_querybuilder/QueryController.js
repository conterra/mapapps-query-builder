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
import ct_when from "ct/_when";
import Filter from "ct/store/Filter";
import MemorySelectionStore from "./MemorySelectionStore";

class QueryController {
    activate(componentContext) {
        this.i18n = this._i18n.get().ui;
    }

    query(store, complexQuery, options, tool, queryBuilderWidgetModel) {
        this.searchReplacer(complexQuery);
        let queryBuilderProperties = this._queryBuilderProperties;
        if (queryBuilderProperties.useMemorySelectionStore) {
            this.memorySelectionQuery(store, complexQuery, options, tool, queryBuilderWidgetModel);
        } else {
            this.defaultQuery(store, complexQuery, options, tool, queryBuilderWidgetModel);
        }
    }

    memorySelectionQuery(store, complexQuery, options, tool, queryBuilderWidgetModel) {
        this._setProcessing(tool, true, queryBuilderWidgetModel);
        options.fields = {geometry: 1};
        ct_when(store.query(complexQuery, options), (result) => {
            if (result.total > 0) {
                let mapWidgetModel = this._mapWidgetModel;
                let spatialReference = mapWidgetModel.get("spatialReference");
                let wkid = spatialReference.latestWkid || wkid;
                let geometries = result.map((item) => {
                    return item.geometry;
                });

                if (geometries[0]) {
                    ct_when(this._coordinateTransformer.transform(geometries, wkid), (transformedGeometries) => {
                        transformedGeometries.forEach((tg, index) => {
                            result[index].geometry = tg;
                        });
                    }, this);
                }

                let memorySelectionStore = new MemorySelectionStore({
                    id: "querybuilder_" + store.id,
                    masterStore: store,
                    metadata: store.getMetadata,
                    data: result,
                    idProperty: store.idProperty
                });

                this._dataModel.setDatasource(memorySelectionStore);
                this._setProcessing(tool, false, queryBuilderWidgetModel);

            } else {
                this._logService.warn({
                    id: 0,
                    message: this.i18n.errors.noResultsError
                });
                this._setProcessing(tool, false, queryBuilderWidgetModel);
            }
        }, (e) => {
            this._logService.error({
                id: e.code,
                message: e
            });
            this._setProcessing(tool, false, queryBuilderWidgetModel);
        });
    }

    defaultQuery(store, complexQuery, options, tool, queryBuilderWidgetModel) {
        this._setProcessing(tool, true, queryBuilderWidgetModel);
        let filter = new Filter(store, complexQuery, options);
        ct_when(filter.query({}, {count: 0}).total, (total) => {
            if (total) {
                this._dataModel.setDatasource(filter);
                this._setProcessing(tool, false, queryBuilderWidgetModel);
            } else {
                this._logService.warn({
                    id: 0,
                    message: this.i18n.errors.noResultsError
                });
                this._setProcessing(tool, false, queryBuilderWidgetModel);
            }
        }, (e) => {
            this._setProcessing(tool, false, queryBuilderWidgetModel);
            this._logService.error({
                id: e.code,
                message: e
            });
        });
    }

    searchReplacer(o) {
        for (let i in o) {
            let value = o[i];
            if (typeof(value) === "string") {
                o[i] = this._replacer.replace(value);
            }
            if (value !== null && typeof(value) === "object" && !value.extent) {
                this.searchReplacer(value);
            }
        }
    }

    _setProcessing(tool, processing, queryBuilderWidgetModel) {
        if(queryBuilderWidgetModel) {
            queryBuilderWidgetModel.processing = processing;
        }
        if (tool) {
            tool.set("processing", processing);
        }
    }
}

module.exports = QueryController;