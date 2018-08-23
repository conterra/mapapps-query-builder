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
import ServiceResolver from "apprt/ServiceResolver";
import Promise from "apprt-core/Promise";
import QueryTask from "esri/tasks/QueryTask";
import Query from "esri/tasks/support/Query";

export default class MetadataAnalyzer {
    activate(componentContext) {
        let serviceResolver = this.serviceResolver = new ServiceResolver();
        let bundleCtx = componentContext.getBundleContext();
        serviceResolver.setBundleCtx(bundleCtx);
    }

    getFields(store) {
        return new Promise((resolve) => {
            try {
                let metadata = store.getMetadata();
                ct_when(metadata, (metadata) => {
                    let fields = metadata.fields;
                    let storeData = [];
                    fields.forEach((field) => {
                        let codedValues = [];
                        let codedValueString = "";
                        if (field.domain && field.domain.codedValues) {
                            codedValues = field.domain.codedValues;
                            codedValueString = "[CV]";
                        }
                        if (field.type !== "geometry") {
                            storeData.push({
                                id: field.name,
                                text: field.title + " (" + field.type + ") " + codedValueString,
                                type: field.type,
                                codedValues: codedValues,
                                distinctValues: []
                            });
                        }
                    });
                    if (this._queryBuilderProperties.enableDistinctValues) {
                        this.getDistinctValues(store, storeData);
                    }
                    resolve(storeData);
                }, this);
            }
            catch (e) {
                this._logService.error({
                    id: 0,
                    message: e
                });
            }
        });
    }

    getDistinctValues(store, storeData) {
        let metadata = store.getMetadata();
        return ct_when(metadata, (metadata) => {
            let supportsDistincts = metadata.advancedQueryCapabilities && metadata.advancedQueryCapabilities.supportsDistinct;
            if (supportsDistincts) {
                storeData.forEach((data) => {
                    data.loading = true;
                    let queryTask = new QueryTask({
                        url: store.target
                    });
                    let query = new Query();
                    query.where = "1=1";
                    query.outFields = [data.id];
                    query.orderByFields = [data.id];
                    query.returnGeometry = false;
                    query.returnDistinctValues = true;
                    queryTask.execute(query).then((result) => {
                        let distinctValues = [];
                        result.features.forEach((feature) => {
                            let value = feature.attributes[data.id];
                            if (value !== null && value !== "") {
                                distinctValues.push(value);
                            }
                        });
                        data.distinctValues = distinctValues;
                        data.loading = false;
                    }, (error) => {
                        data.distinctValues = [];
                        data.loading = false;
                    });
                });
            }
        });
    }

    getStoreData(stores) {
        let storeIds = [];
        stores.forEach((store) => {
            storeIds.push(store.id);
        });
        return this.getStoreDataByIds(storeIds);
    }

    getStoreDataByIds(storeIds) {
        let storeData = [];
        storeIds.forEach((storeId) => {
            let storeProperties = this.getStoreProperties(storeId);
            if (storeProperties) {
                storeData.push(
                    {
                        text: storeProperties.title || storeProperties.id,
                        id: storeId
                    }
                );
            }
        }, this);
        storeData.sort((a, b) => {
            return a.text.localeCompare(b.text);
        });
        return storeData;
    }

    getStoreProperties(idOrStore) {
        let resolver = this.serviceResolver;
        if (typeof (idOrStore) === "string") {
            return resolver.getServiceProperties("ct.api.Store", "(id=" + idOrStore + ")");
        }
        return resolver.getServiceProperties(idOrStore);
    }
}
