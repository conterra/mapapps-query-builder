/*
 * Copyright (C) 2021 con terra GmbH (info@conterra.de)
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
    root: {
        apptitle: "Query Builder 4 Sample",
        map: {
            esrisites: {
                title: "Esri Germany Group Sites",
                popup: {
                    address: "Address",
                    contact: "Contact",
                    tel: "Telephone:",
                    mail: "Email:",
                    link: "Internet:"
                }
            }
        },
        queries: {
            "q_street_damage": "Show reported street damages that are not yet fixed in Münster",
            "q_constituency_density_1000": "Constituencies with population densities exceeding 1000 inhabitants/km²",
            "q_constituency_income_20000": "Constituencies with mean available disposable income of more than 20000€",
            "q_constituency_inhabitants_increasing": "Constituencies with increasing population",
            "q_find_tree_species": "Search tree species",
            "q_find_disturbances": "Search disturbances"
        },
        toolset: {
            "toolset_title": "Questions and Answers",
            "toolset_hover": "List of predefined questions, click to see the answer"
        }
    },
    "de": true
};
