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
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/string",
    "ct/Stateful",
    "ct/_when"
], function (declare,
             d_lang,
             d_array,
             d_string,
             Stateful,
             ct_when) {
    return declare([Stateful], {
        activate: function () {
            this.placeholder = this.placeholder || {};
            this.placeholderProvider = this.placeholderProvider || [];
        },
        deactivate: function () {
            this.placeholder = null;
            this.placeholderProvider = null;
        },
        replace: function (string) {
            this.refresh();
            var s = string.substring(2, string.length - 1);
            for (var i in this.placeholder) {
                if (i === s) {
                    return this.placeholder[i]
                }
            }
            return string;

            //return d_string.substitute(string, this.placeholder);
        },
        _getPlaceholder: function () {
            this.refresh();
            return this.placeholder;
        },
        addPlaceholderProvider: function (placeholderProvider) {
            this.placeholderProvider = this.placeholderProvider || [];
            this.placeholderProvider.push(placeholderProvider);
            var globalPlaceholder = this.placeholder || {};
            var placeholder = placeholderProvider.getPlaceholder();
            d_lang.mixin(globalPlaceholder, placeholder);
            this.placeholder = globalPlaceholder;
        },
        refresh: function () {
            d_array.forEach(this.placeholderProvider, function (provider) {
                if (provider.reEvaluate) {
                    ct_when(provider.reEvaluate(), function (result) {
                        var placeholder = result;
                        d_lang.mixin(this.placeholder, placeholder);
                    }, this);
                }
            }, this);
        }
    });
});
