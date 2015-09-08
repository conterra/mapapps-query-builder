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
    "ct/store/Filter"
], function(declare, Filter) {
    return declare([], {
        // Surrounds a store with a Filter and fires a selection end event
        // If the result center is part of the app the store would be shown there
        // TODO: better integrate the filter code inside the SearchStoreTool of the result center?
        onFilterStoreClicked: function(event) {
            var store = event.store;
            if (!store) {
                // ignore
                return;
            }
            var customquery = event.customquery;
            var topic = "ct/selection/SELECTION_END";
            this._eventService.postEvent(topic, {
                source: this,
                store: customquery ? Filter(store, customquery) : store
            });
        }
    });
});
