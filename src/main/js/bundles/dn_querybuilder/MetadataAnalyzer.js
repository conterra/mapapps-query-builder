/*
 * Copyright (C) 2021 con terra GmbH (info@conterra.de)
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
import Promise from "apprt-core/Promise";
import ServiceResolver from "apprt/ServiceResolver";
import apprt_request from "apprt-request";

export default class MetadataAnalyzer {

    #serviceResolver = undefined;
    #distinctValueQuery = undefined;

    activate(componentContext) {
        const serviceResolver = this.#serviceResolver = new ServiceResolver();
        const bundleCtx = componentContext.getBundleContext();
        serviceResolver.setBundleCtx(bundleCtx);
    }

    deactivate() {
        this.#serviceResolver = undefined;
    }

    getFields(store) {
        return new Promise((resolve) => {
            try {
                const queryBuilderProperties = this._queryBuilderProperties;
                const metadata = store.getMetadata();
                apprt_when(metadata, (metadata) => {
                    const types = metadata.types;
                    const domainsFromTypes = {};
                    types && types.forEach(type => {
                        if (type.domains) {
                            for (const [key, value] of Object.entries(type.domains)) {
                                if (domainsFromTypes[key]) {
                                    domainsFromTypes[key].concat(value.codedValues);
                                } else {
                                    domainsFromTypes[key] = value.codedValues;
                                }
                            }
                        }
                    })

                    const fields = metadata.fields;
                    const storeData = [];
                    fields.forEach((field) => {
                        const codedValues = (field.domain && field.domain.codedValues)
                            || domainsFromTypes[field.name] || [];
                        const codedValueString = codedValues.length > 0 ? "[CV]" : "";
                        if (field.type !== "geometry") {
                            let title = field.title;
                            if (!title || title === "") {
                                title = field.name;
                            }
                            let text = title;
                            if (queryBuilderProperties.showFieldType) {
                                text = title + " (" + field.type + ") " + codedValueString;
                            }
                            storeData.push({
                                id: field.name,
                                text: text,
                                type: field.type,
                                codedValues: codedValues,
                                distinctValues: [],
                                loading: false
                            });
                        }
                    });
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

    getDistinctValues(value, fieldData, store) {
        if (this.#distinctValueQuery) {
            this.#distinctValueQuery.cancel && this.#distinctValueQuery.cancel();
            this.#distinctValueQuery = null;
        }
        const queryBuilderProperties = this._queryBuilderProperties;
        return new Promise((resolve) => {
            if ((!value && !queryBuilderProperties.enableInitialDistinctValues)
                || !queryBuilderProperties.enableDistinctValues) {
                resolve();
                return;
            }
            if (fieldData.type === "number" && fieldData.distinctValues.length) {
                resolve();
                return;
            }
            const metadata = store.getMetadata();
            return apprt_when(metadata, (metadata) => {
                const metadataSupportsDistinct = metadata.advancedQueryCapabilities?.supportsDistinct;
                const layerSupportsDistinct = store.layer?.capabilities?.query?.supportsDistinct;
                const supportsDistinct = metadataSupportsDistinct || layerSupportsDistinct;
                if (supportsDistinct) {
                    fieldData.loading = true;
                    const query = {
                        outFields: fieldData.id,
                        orderByFields: fieldData.id,
                        returnDistinctValues: true,
                        returnGeometry: false,
                        f: 'json'
                    };
                    if (!value) {
                        query.where = "1=1";
                    } else if (fieldData.type === "string") {
                        value = value.toLowerCase();
                        query.where = "LOWER(" + [fieldData.id] + ") LIKE '%" + value + "%'";
                    } else if (fieldData.type === "number") {
                        query.where = "1=1";
                    }
                    this.#distinctValueQuery = apprt_request(store.target + "/query", {
                        query: query,
                        handleAs: 'json'
                    }).then((result) => {
                        const distinctValues = [];
                        result.features?.forEach((feature) => {
                            const value = feature.attributes[fieldData.id];
                            if (value !== null && value !== "") {
                                distinctValues.push(value);
                            }
                        });
                        fieldData.distinctValues = distinctValues;
                        fieldData.loading = false;
                        this.#distinctValueQuery = null;
                        resolve();
                    }, (error) => {
                        fieldData.distinctValues = [];
                        fieldData.loading = false;
                        this.#distinctValueQuery = null;
                        resolve();
                    });
                }
            });
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
        const resolver = this.#serviceResolver;
        if (typeof (idOrStore) === "string") {
            return resolver.getServiceProperties("ct.api.Store", "(id=" + idOrStore + ")");
        }
        return resolver.getServiceProperties(idOrStore);
    }
}
