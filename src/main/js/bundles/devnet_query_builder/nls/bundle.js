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
                bundleName: "Query Builder",
                bundleDescription: "Bundle to build custom query tools",
                wizard: {
                    toolTitle: "Build Query",
                    toolToolTip: "Build your own Query",
                    windowTitle: "Custom Query Tool",
                    title: "Title",
                    builder: "Builder",
                    manual: "Manual",
                    iconClass: "Icon Class",
                    iconClassHelp: "Icon Class Help",
                    complexQueryHelp: "Complex Query Help",
                    customQuery: "Custom Query",
                    queryDefinition: "Query definiton:",
                    useExtent: "Current extent",
                    addField: "Add Field",
                    storeId: "Store",
                    cancel: "Cancel",
                    done: "Search",
                    typeInTitle: "type in title",
                    match: "Combine Fields",
                    match1: "Get features that match ",
                    match2: " of the following expressions",
                    changeToManual: "Are you sure? The query edit-mode will be switched to manual!",
                    and: "and",
                    or: "or",
                    yes: "yes",
                    no: "no",
                    fields: {
                        typeInValue: "type in value",
                        is: "is",
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
                        after: "after"
                    }
                }
            },
    de: true
});
