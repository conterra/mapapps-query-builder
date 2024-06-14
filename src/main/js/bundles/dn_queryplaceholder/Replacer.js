/*
 * Copyright (C) 2023 con terra GmbH (info@conterra.de)
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
import d_lang from "dojo/_base/lang";
import ct_lang from "ct/_lang";
import apprt_when from "apprt-core/when";

export default class Replacer {

    activate() {
        this.placeholder = this.placeholder || {};
        this.placeholderProvider = this.placeholderProvider || [];
    }

    deactivate() {
        this.placeholder = {};
        this.placeholderProvider = [];
    }

    replace(string) {
        this.refresh();
        const s = string.substring(2, string.length - 1);
        let result = string;
        ct_lang.forEachOwnProp(this.placeholder, function (value, name) {
            if (name === s) {
                result = value;
            }
        });
        return result;
    }

    _getPlaceholder() {
        this.refresh();
        return this.placeholder;
    }

    async addPlaceholderProvider(placeholderProvider) {
        this.placeholderProvider = this.placeholderProvider || [];
        this.placeholderProvider.push(placeholderProvider);
        const globalPlaceholder = this.placeholder || {};
        if (placeholderProvider.on) {
            this._handlePlaceholderProviderEvent(placeholderProvider);
        }
        const placeholder = await placeholderProvider.getPlaceholder();
        d_lang.mixin(globalPlaceholder, placeholder);
        this.placeholder = globalPlaceholder;
    }

    refresh() {
        this.placeholderProvider.forEach((provider) => {
            if (provider.reEvaluate) {
                apprt_when(provider.reEvaluate(), (placeholder) => {
                    d_lang.mixin(this.placeholder, placeholder);
                });
            }
        });
    }

    _handlePlaceholderProviderEvent(placeholderProvider) {
        placeholderProvider.on('trigger-placeholder-refresh', () => {
            this.refresh();
        });
    }

}
