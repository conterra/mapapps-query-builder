///
/// Copyright (C) 2021 con terra GmbH (info@conterra.de)
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///         http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import type {InjectedReference} from "apprt-core/InjectedReference";

const ID = "querybuilder-filter";

export default class FilterActionDefinitionFactory {

    private _i18n!: InjectedReference<any>;
    private _properties!: InjectedReference<any>;
    private _filterQueryBuilderWidgetFactory!: InjectedReference<any>;
    private supportedIds!: InjectedReference<any>;

    constructor() {
        this.supportedIds = [ID];
    }

    createDefinitionById(id) {
        if (ID !== id) {
            return;
        }
        const i18n = this._i18n.get().ui;
        const filterQueryBuilderWidgetFactory = this._filterQueryBuilderWidgetFactory;
        return {
            id: ID,
            type: "button",
            label: i18n.setFilterActionLabel,
            icon: "icon-filter",
            isVisibleForItem(tocItem) {
                const ref = tocItem.ref;
                const parent = ref && ref.parent;
                const capabilities = parent && parent.capabilities;
                if (ref && ref.type !== "group") {
                    if (ref.type === "feature") {
                        return true;
                    } else if (capabilities?.operations?.supportsQuery) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            },
            isDisabledForItem(tocItem) {
                // use this method to change the action title since  isVisibleForItem is only called once
                const ref = tocItem.ref;
                if (ref._initialDefinitionExpression && ref._initialDefinitionExpression !== ref.definitionExpression
                    && ref.definitionExpression !== "1=1") {
                    this.label = i18n.resetFilterActionLabel;
                } else {
                    this.label = i18n.setFilterActionLabel;
                }
                return false;
            },
            trigger(tocItem) {
                const ref = tocItem.ref;
                if (ref._initialDefinitionExpression && ref._initialDefinitionExpression !== ref.definitionExpression) {
                    if (ref._initialDefinitionExpression) {
                        ref.definitionExpression = ref._initialDefinitionExpression;
                    }
                } else {
                    let id = ref.id;
                    if (ref?.parent?.type === "map-image") {
                        id = ref.parent.id + "/" + ref.id;
                    }
                    const title = ref.title;
                    filterQueryBuilderWidgetFactory.showFilter(id, title);
                }
            }
        };
    }

}