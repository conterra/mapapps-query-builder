/*
 * Copyright (C) 2025 con terra GmbH (info@conterra.de)
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
    apptitle: "Query Builder Sample",
    map: {
        cologne: "Daten der Stadt Köln",
        earthquakes: "Erdbeben",
        koeln1: {
            title: "Basisdaten",
            districts: {
                title: "Stadtviertel",
                text: "Das K\xF6lner Stadtviertel <b>{STV_NAME}</b>."
            },
            boroughs: {
                title: "Stadtteile",
                text: "Der Stadtteil <b>{NAME}</b> liegt im K\xF6lner Stadtbezirk {STADTBEZIR}."
            },
            precints: {
                title: "Stadtbezirke",
                text: "Der K\xF6lner Stadtbezirk <b>{NAME}</b>."
            }
        },
        koeln2: {
            title: "Bildung und Kultur",
            description: "Liste aller Bibliotheken, Museen und Schulen in Köln.",
            libraries: {
                title: "Bibliotheken"
            },
            museums: {
                title: "Museen",
                text: "Das Museum <b>{NAME}</b> liegt im K\xF6lner Stadtteil {STADTTEIL}."
            },
            schools: {
                title: "Schulen",
                text: ""
            }
        },
        koeln3: {
            title: "Freizeit",
            sights: {
                title: "Sehensw\xFCrdigkeiten",
                titleSingle: "Sehensw\xFCrdigkeit",
                text: "Die Sehensw\xFCrdigkeit <b>{NAME}</b> liegt im K\xF6lner Stadtteil {STADTTEIL}."
            },
            playgrounds: {
                title: "Spiel- und Sportpl\xE4tze",
                text: "<b>{Spielplatzname}</b> liegt im K\xF6lner Stadtteil {Stadtteil}.",
                baskets: "Basketballk\xF6rbe",
                goals: "Fussballtore",
                tables: "Tischtennis Tische",
                walls: "Torwand",
                skate: "Skaten",
                misc: "Sonstiges"
            },
            places: {
                title: "Veranstaltungsorte",
                titleSingle: "Veranstaltungsort",
                text: "<b>{NAME}</b> ist ein {expression/carrier} Veranstaltungsort."
            }
        },
        basemaps: {
            gray: "Stra\xDFenkarte (grau)",
            streets: "Stra\xDFenkarte",
            topo: "Topographische Karte",
            hybrid: "Luftbild (hybrid)"
        }
    },
    queries: {
        streetDamage: "Bisher nicht reparierte Straßenschäden in Münster suchen",
        populationDensity: "Wahlkreise deren Bevökerungsdichte größer ist als 1000 Einwohner/km²",
        income: "Wahlkreise in denen das verfügbare Einkommen je Einwohner größer ist als 20000€",
        populationIncreasing: "Wahlkreise deren Bevölkerung zunimmt",
        tree: "Baumart suchen",
        disturbances: "Störungen suchen",
        earthquakes: "Erdbeben suchen"
    },
    toolset: {
        whatDoYouWant: "Fragen und Antworten",
        whatDoYouWantToolTip: "Liste vordefinierter Fragen, klicken um Antworten zu sehen"
    },
    tools: {
        drawerLeft: "Werkzeuge",
        measuring: "Messwerkzeuge"
    },
    common: {
        number: "Nummer",
        area: "Fl\xE4che [ha]",
        totalArea: "Anteil an Gesamtfl\xE4che [%]",
        name: "Name",
        provider: "Tr\xE4ger",
        address: "Adresse",
        furtherinfo: "Weitere Informationen",
        precint: "Stadtbezirk",
        district: "Stadtviertel",
        private: "private",
        municipal: "st\xE4dtischer",
        zip: "PLZ",
        type: "Art"
    }
};
