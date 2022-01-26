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
    apptitle: "Query Builder 4 Sample",
    map: {
        esrisites: {
            title: "Standorte der Esri Deutschland Gruppe",
            popup: {
                address: "Adresse",
                contact: "Kontakt",
                tel: "Telefon:",
                mail: "Email:",
                link: "Internet:"
            }
        }
    },
    queries: {
        "q_street_damage": "Bisher nicht reparierte Straßenschäden in Münster suchen",
        "q_constituency_density_1000": "Wahlkreise deren Bevökerungsdichte größer ist als 1000 Einwohner/km²",
        "q_constituency_income_20000": "Wahlkreise in denen das verfügbare Einkommen je Einwohner größer ist als 20000€",
        "q_constituency_inhabitants_increasing": "Wahlkreise deren Bevölkerung zunimmt",
        "q_find_tree_species": "Baumart suchen",
        "q_find_disturbances": "Störungen suchen"
    },
    toolset: {
        "toolset_title": "Fragen und Antworten",
        "toolset_hover": "Liste vordefinierter Fragen, klicken um Antworten zu sehen"
    }
};
