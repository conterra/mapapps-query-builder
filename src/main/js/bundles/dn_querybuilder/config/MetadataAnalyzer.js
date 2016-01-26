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
    "ct/_when"
], function (d_lang, declare, Deferred, d_array, ct_async, ct_array, ct_when) {

    return declare([], {
        constructor: function () {
        },
        getFields: function (store) {
            var def = new Deferred();
            var metadata = store.getMetadata();
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
        getStoreData: function (stores, storesInfo) {
            return ct_async.join(d_array.map(stores, function (s) {
                return s.getMetadata();
            })).then(function (metadata) {
                var result = [];
                d_array.forEach(metadata, function (m, index) {
                    if (m.fields && m.fields.length > 0) {
                        var id = stores[index].id;
                        var title;
                        if (storesInfo) {
                            var storeInfoTitle = ct_array.arraySearchFirst(storesInfo, {id: id}).title;
                            title = storeInfoTitle || id;
                        } else {
                            title = m.title || id;
                        }
                        result.push({name: title, id: id});
                    }
                });
                return result;
            });
        },
        _getStoreInfoData: function (id) {
            return ct_array.arraySearchFirst(this.storesInfo, {id: id});
        }
    });
});
