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
export default {
    root: {
        bundleName: "Query Builder Config",
        bundleDescription: "Configuration bundle for Query Builder",
        title: "Query Builder Config",
        description: "Settings for the Query Builder bundle",
        propertiesWidget: {
            propertiesWidgetTitle: "Base Config",
            propertiesWidgetDescription: "Basic settings for the Query Builder",
            enableDistinctValues: "Use distinct values",
            defaultLinkOperator: "Default relational operator",
            defaultSpatialRelation: "Default spatial relation",
            useCurrentMapExtent: "Use user's current map extent instead of a preset one",
            visibleElements: "Visible elements"
        },
        toolsBuilder: {
            toolsBuilderTitle: "Query Tools",
            toolsBuilderDescription: "Create your own Query Tools"
        },
        widget: {
            window: {
                title: "Name",
                removeTool: "Remove query tool",
                removeToolMessage: "Remove query tool?",
                addTool: "Add new query tool",
                copyTool: "Copy query tool"
            },
            wizard: {
                windowtitle: "Query Tool",
                windowtitleAdd: "Add Query Tool",
                windowtitleEdit: "Edit Query Tool",
                title: "Title",
                builder: "Builder",
                options: "Options",
                manual: "Manual",
                key: "Key",
                value: "Values will be dynamically set, current value is",
                placeholder: "Placeholder",
                iconClass: "Icon Class",
                iconClassHelp: "Icon Class Help",
                complexQueryHelp: "Complex Query Help",
                complexQuery: "Complex Query",
                queryDefinition: "Query definiton",
                count: "Result Count",
                ignoreCase: "Case Sensitive",
                locale: "Language",
                editable: "Editable",
                addField: "Add Field",
                store: "Store",
                cancel: "Cancel",
                done: "Done",
                typeInTitle: "type in title",
                spatialRelation: "Where do you want to search?",
                match: "Combine fields with",
                changeToManual: "Are you sure? The query edit-mode will be switched to manual!",
                and: "and",
                or: "or",
                yes: "yes",
                no: "no",
                extent: "current extent",
                everywhere: "everywhere",
                fields: {
                    typeInValue: "type in value",
                    is: "is",
                    is_not: "is not",
                    exists: "exists",
                    eqw: "is (wildcard)",
                    suggest: "suggest",
                    contains: "contains",
                    contains_not: "does not contain",
                    starts_with: "starts with",
                    ends_with: "ends with",
                    is_greater_than: "is greater than",
                    is_greater_or_equal: "is greater or equal",
                    is_less_than: "is less than",
                    is_less_or_equal: "is less or equal",
                    before: "before",
                    after: "after",
                    yes: "yes",
                    no: "no",
                    shouldBeTrue: "Should be true",
                    shouldBeFalse: "Should be false"
                }
            },
            grid: {
                removeTool: "Remove query tool",
                addTool: "Add new query tool",
                title: "Title",
                dataView: {
                    DGRID: {
                        noDataMessage: "No query tool(s) found..."
                    },
                    pager: {
                        pageSizeLabelText: "Query tools ${pageStartItemNumber}-${pageEndItemNumber} of ${itemCount}"
                    }
                }
            }
        }
    },
    de: true
};
