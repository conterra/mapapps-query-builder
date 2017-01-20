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
    "dojo/_base/lang",
    "dojo/_base/declare",
    "dojo/_base/Deferred",
    "dojo/_base/array",
    "ct/async",
    "ct/array",
    "ct/_when",
    "apprt/ServiceResolver"
], function (d_lang, declare, Deferred, d_array, ct_async, ct_array, ct_when, ServiceResolver) {

    return declare([], {
        activate: function (componentContext) {
            var serviceResolver = this.serviceResolver = new ServiceResolver();
            var bundleCtx = componentContext.getBundleContext();
            serviceResolver.setBundleCtx(bundleCtx);
        },
        constructor: function () {
        },
        getFields: function (store) {
            var def = new Deferred();
            try {
                var metadata = store.getMetadata();
            }
            catch (e) {
                this._logService.error({
                    id: 0,
                    message: e
                });
            }
            ct_when(metadata, function (metadata) {
                var fields = metadata.fields;
                var storeData = [];
                d_array.forEach(fields, function (field) {
                    var codedValues = [];
                    if (field.domain)
                        if (field.domain.codedValues)
                            codedValues = field.domain.codedValues;
                    var codedValueString = "";
                    if (codedValues.length > 0) {
                        codedValueString = "[CV]";
                    }
                    if (field.type !== "geometry") {
                        storeData.push({
                            id: field.name,
                            title: field.title + " (" + field.type + ") " + codedValueString,
                            type: field.type,
                            codedValues: codedValues
                        });
                    }
                });
                def.resolve(storeData);
            }, this);
            return def;
        },
        getStoreData: function (stores) {
            var storeIds = [];
            d_array.forEach(stores, function (store) {
                storeIds.push(store.id);
            });
            return this.getStoreDataByIds(storeIds);
        },
        getStoreDataByIds: function (storeIds) {
            var storeData = [];
            d_array.forEach(storeIds, function (storeId) {
                var storeProperties = this.getStoreProperties(storeId);
                if (storeProperties) {
                    storeData.push(
                        {
                            name: storeProperties.title || storeProperties.id,
                            id: storeId
                        }
                    );
                }
            }, this);
            storeData.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
            return storeData;
        },
        getStoreProperties: function (idOrStore) {
            var resolver = this.serviceResolver;
            if (typeof (idOrStore) === "string") {
                return resolver.getServiceProperties("ct.api.Store", "(id=" + idOrStore + ")");
            }
            return resolver.getServiceProperties(idOrStore);
        }
    });
});
