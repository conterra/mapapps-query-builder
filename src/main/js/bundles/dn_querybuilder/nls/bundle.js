/*
 * Copyright (C) 2017 con terra GmbH (info@conterra.de)
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
module.exports = {
    root: ({
        bundleName: "Query Builder",
        bundleDescription: "Bundle to build custom query tools",
        windowTitle: "Build your own Query",
        editableWindowTitle: "Build your own Query",
        tool: {
            title: "Build Query",
            tooltip: "Build your own Query"
        },
        ui: {
            selectStore: "What do you want to search?",
            spatialRelation: "Where do you want to search?",
            linkOperator: "How to link?",
            everywhere: "everywhere",
            currentExtent: "current extent",
            delete: "Delete",
            search: "Search",
            searchParameter: "Search parameter",
            negated: "negated",
            typeInValue: "type in value",
            yes: "yes",
            no: "no",
            and: "and",
            or: "or",
            relationalOperators: {
                is: "is",
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
            },
            errors: {
                noResultsError: "No results found for your query!"
            }
        }
    }),
    "de": true
};