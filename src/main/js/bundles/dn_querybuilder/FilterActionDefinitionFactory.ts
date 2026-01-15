///
/// Copyright (C) 2025 con terra GmbH (info@conterra.de)
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

import type { InjectedReference } from "apprt-core/InjectedReference";
import { ActionDefinition, TocItem } from "toc/api";

const ID = "querybuilder-filter";

const ACTIONS = {
    0: {
        icon: "icon-filter",
        name: "setFilterAction"
    },
    1: {
        icon: "icon-trashcan",
        name: "resetFilterAction"
    }
};

export default class FilterActionDefinitionFactory {

    private _i18n!: InjectedReference<any>;
    private _filterQueryBuilderWidgetFactory!: InjectedReference<any>;
    private supportedIds!: Array<string>;

    constructor() {
        this.supportedIds = [ID];
    }

    createDefinitionById(id: string): ActionDefinition | undefined {
        if (ID !== id) {
            return;
        }
        const i18n = this._i18n.get().ui;
        const reorderLayerToolTips = i18n.filterAction.tooltips || {};
        const filterQueryBuilderWidgetFactory = this._filterQueryBuilderWidgetFactory;

        return {
            id: ID,
            type: "button-row",
            label: i18n.filterAction.filterActionLabel,
            icons: Object.keys(ACTIONS).map(k => ACTIONS[k].icon),
            actionLabels: Object.keys(ACTIONS).map(k => {
                const name = ACTIONS[k].name;
                return reorderLayerToolTips[name] || name;
            }),
            async isVisibleForItem(tocItem: TocItem) {
                const ref = tocItem.ref as __esri.FeatureLayer | __esri.MapImageLayer | __esri.GroupLayer;
                await ref.load();
                const parent = ref && ref.layer;
                const capabilities = parent && parent.capabilities;
                if (ref && ref.type !== "group") {
                    if (ref.type === "feature") {
                        return true;
                    } else if (capabilities?.operations?.supportsQuery && ref.fields) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            },
            isDisabledForItem(tocItem: TocItem) {
                const ref = tocItem.ref as __esri.FeatureLayer | __esri.MapImageLayer | __esri.GroupLayer;
                if (ref._initialDefinitionExpression !== undefined
                    && ref._initialDefinitionExpression !== ref.definitionExpression
                    && ref.definitionExpression !== "1=1") {
                    return [false, false];
                }
                return [false, true];
            },
            trigger(tocItem: TocItem, actionIndex: number) {
                const ref = tocItem.ref as __esri.FeatureLayer | __esri.MapImageLayer | __esri.GroupLayer;
                const title = ref.title;

                switch (ACTIONS[actionIndex].name) {
                    case "setFilterAction":
                        filterQueryBuilderWidgetFactory.showFilter(title, ref);
                        break;
                    case "resetFilterAction":
                        ref.definitionExpression = ref._initialDefinitionExpression;
                        ref._complexQuery = undefined;
                        break;
                }
            }
        };
    }

}
