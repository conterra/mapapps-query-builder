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
import apprt_when from "apprt-core/when";
import ServiceResolver from "apprt/ServiceResolver";
import Promise from "apprt-core/Promise";
import QueryTask from "esri/tasks/QueryTask";
import Query from "esri/tasks/support/Query";

export default class MetadataAnalyzer {
    activate(componentContext) {
        const serviceResolver = this.serviceResolver = new ServiceResolver();
        const bundleCtx = componentContext.getBundleContext();
        serviceResolver.setBundleCtx(bundleCtx);
    }

    deactivate() {
        this.serviceResolver = null;
    }

    getFields(store) {
        return new Promise((resolve) => {
            try {
                const properties = this._queryBuilderProperties;
                const metadata = store.getMetadata();
                apprt_when(metadata, (metadata) => {
                    const fields = metadata.fields;
                    const storeData = [];
                    const hidedFields = properties.hidedFields;
                    fields.forEach((field) => {
                        let codedValues = [];
                        let codedValueString = "";
                        if (field.domain && field.domain.codedValues) {
                            codedValues = field.domain.codedValues;
                            codedValueString = "[CV]";
                        }
                        if (!hidedFields.includes(field.name) && field.type !== "geometry") {
                            let title = field.title;
                            if (!title || title === "") {
                                title = field.name;
                            }
                            let text = title;
                            if (properties.showFieldType) {
                                text = title + " (" + field.type + ") " + codedValueString;
                            }
                            storeData.push({
                                id: field.name,
                                text: text,
                                type: field.type,
                                codedValues: codedValues,
                                distinctValues: []
                            });
                        }
                    });
                    if (properties.enableDistinctValues) {
                        this.getDistinctValues(store, storeData);
                    }
                    resolve(storeData);
                }, this);
            } catch (e) {
                this._logService.error({
                    id: 0,
                    message: e
                });
            }
        });
    }

    getDistinctValues(store, storeData) {
        const metadata = store.getMetadata();
        return apprt_when(metadata, (metadata) => {
            const supportsDistincts = metadata.advancedQueryCapabilities
                && metadata.advancedQueryCapabilities.supportsDistinct;
            if (supportsDistincts) {
                storeData.forEach((data) => {
                    data.loading = true;
                    const queryTask = new QueryTask({
                        url: store.target
                    });
                    const query = new Query();
                    query.where = "1=1";
                    query.outFields = [data.id];
                    query.orderByFields = [data.id];
                    query.returnGeometry = false;
                    query.returnDistinctValues = true;
                    queryTask.execute(query).then((result) => {
                        const distinctValues = [];
                        result.features.forEach((feature) => {
                            const value = feature.attributes[data.id];
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
        const storeIds = [];
        stores.forEach((store) => {
            storeIds.push(store.id);
        });
        return this.getStoreDataByIds(storeIds);
    }

    getStoreDataByIds(storeIds) {
        const storeData = [];
        storeIds.forEach((storeId) => {
            const storeProperties = this.getStoreProperties(storeId);
            if (storeProperties) {
                storeData.push(
                    {
                        text: storeProperties.title || storeProperties.id,
                        id: storeId
                    }
                );
            }
        }, this);
        storeData.sort((a, b) => a.text.localeCompare(b.text));
        return storeData;
    }

    getStoreProperties(idOrStore) {
        const resolver = this.serviceResolver;
        if (typeof (idOrStore) === "string") {
            return resolver.getServiceProperties("ct.api.Store", "(id=" + idOrStore + ")");
        }
        return resolver.getServiceProperties(idOrStore);
    }
}
