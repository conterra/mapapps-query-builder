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
    "./OWMInfoWidget"
], function (
        declare,
        OWMInfoWidget
        ) {
    return declare([], {
        createWidget: function (args) {
            var content = args.content;
            var context = args.context;
            var rule = args.rule;
            var i18n = this._i18n.get();
            var widget = new OWMInfoWidget({
                i18n: i18n,
                content: content,
                context: context
            });
            return widget;
        }
    });
});