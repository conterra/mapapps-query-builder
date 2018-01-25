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
define({
    root: {
        bundleName: "Query Builder",
        bundleDescription: "Bundle to build custom query tools",
        wizard: {
            title: "Title",
            userToolTitle: "Build Query",
            userToolToolTip: "Build your own Query",
            userStore: "What do you want to search?",
            userUseGeometry: "Where do you want to search?",
            userDone: "Go",
            userMatch: "Combine fields with...",
            userGeometryEverywhere: "everywhere",
            userGeometryEnhanced: "geometry",
            userGeometryExtent: "current extent",
            userUseOnlyGeometry: "Purely geometrical query",
            userChooseGeometry: "Choose geometry",
            userWindowTitle: "Build your own Query",
            userSpatialRelation: "Spatial Relation",
            userSelectedFeatures: "Selected Features",
            customToolTitle: "CustomQueryTool",
            customToolToolTip: "CustomQueryTool",
            customWindowTitle: "Create Query",
            editWindowTitle: "Editable Query",
            defineQuery: "Define query:",
            builder: "Builder",
            options: "Options",
            manual: "Manual",
            iconClass: "Icon Class",
            iconClassHelp: "Icon Class Help",
            complexQueryHelp: "Complex Query Help",
            customQuery: "Custom Query",
            queryDefinition: "Query definiton",
            useExtent: "Use current extent",
            count: "Result Count",
            ignoreCase: "Case Sensitive",
            locale: "Language",
            addField: "Add Field",
            store: "Store",
            cancel: "Cancel",
            done: "Search",
            typeInTitle: "type in title",
            match: "Combine fields with",
            changeToManual: "Are you sure? The query edit-mode will be switched to manual!",
            and: "and",
            or: "or",
            yes: "yes",
            no: "no",
            no_results_error: "No results found for your query!",
            serviceUnavailable: "Service unavailable!",
            spatialRelations: {
                intersects: "intersects",
                contains: "contains",
                crosses: "crosses",
                within: "within"
            },
            fields: {
                typeInValue: "type in value",
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
                yes: "yes",
                no: "no",
                shouldBeTrue: "Should be true",
                shouldBeFalse: "Should be false"
            }
        }
    },
    de: true
});
