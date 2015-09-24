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
define({
    root:
            {
                bundleName: "Query Builder Config",
                bundleDescription: "Configuration bundle for FilterQuery",
                windowTitle: "Query Builder Config",
                description: "Settings for the Query Builder bundle",
                widget: {
                    window: {
                        title: "Name",
                        removeTool: "Remove custom query tool",
                        addTool: "Add new custom query tool",
                        copyTool: "Copy custom query tool"
                    },
                    wizard: {
                        windowtitle: "Custom Query Tool",
                        windowtitleAdd: "Add Custom Query Tool",
                        windowtitleEdit: "Edit Custom Query Tool",
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
                        customQuery: "Custom Query",
                        queryDefinition: "Query definiton",
                        useExtent: "Use Current extent",
                        count: "Result Count",
                        ignoreCase: "Case Sensitive",
                        locale: "Language",
                        editable: "Editable",
                        addField: "Add Field",
                        store: "Store",
                        cancel: "Cancel",
                        done: "Done",
                        typeInTitle: "type in title",
                        match: "Combine fields with",
                        changeToManual: "Are you sure? The query edit-mode will be switched to manual!",
                        and: "and",
                        or: "or",
                        yes: "yes",
                        no: "no",
                        fields: {
                            typeInValue: "type in value",
                            is: "is",
                            eqw: "is (wildcard)",
                            suggest: "suggest",
                            is_not: "is not",
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
                        removeTool: "Remove custom query tool",
                        addTool: "Add new custom query tool",
                        title: "Title",
                        dataView: {
                            DGRID: {
                                noDataMessage: "No custom query tool(s) found..."
                            },
                            pager: {
                                pageSizeLabelText: "Custom query tools ${pageStartItemNumber}-${pageEndItemNumber} of ${itemCount}"
                            }
                        }
                    }
                }
            },
    de: true
});
