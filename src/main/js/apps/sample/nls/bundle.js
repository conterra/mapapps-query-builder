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
    root: {
        apptitle: "Query Builder Sample",
        map: {
            cologne: "Data of the city of Cologne",
            earthquakes: "Earthquakes",
            koeln1: {
                title: "Basic Data",
                districts: {
                    title: "City Districts",
                    text: "Cologne's city district <b>{STV_NAME}</b>."
                },
                boroughs: {
                    title: "Boroughs",
                    text: "Boroughs <b>{NAME}</b> is located in Cologne's precints {STADTBEZIR}."
                },
                precints: {
                    title: "Precints",
                    text: "Cologne's precint {NAME}."
                }
            },
            koeln2: {
                title: "Education and Culture",
                description: "List of all libraries, museums and schools in Cologne.",
                libraries: {
                    title: "Libraries"
                },
                museums: {
                    title: "Museums",
                    text: "Museum <b>{NAME}</b> is located in Cologne's boroughs {STADTTEIL}."
                },
                schools: {
                    title: "Schools"
                }
            },
            koeln3: {
                title: "Recreation",
                sights: {
                    title: "Tourist Attractions",
                    titleSingle: "Tourist Attraction",
                    text: "Tourist attraction <b>{NAME}</b> is located in Cologne's borough {STADTTEIL}."
                },
                playgrounds: {
                    title: "Playgrounds- and Sports Areas",
                    text: "<b>{Spielplatzname}</b> is located in Cologne's borough {Stadtteil}.",
                    baskets: "Basketball Baskets",
                    goals: "Soccer Goals",
                    tables: "Ping-Pong Tables",
                    walls: "Goal Wall",
                    skate: "Skating",
                    misc: "Miscellaneous"
                },
                places: {
                    title: "Places of Event",
                    titleSingle: "Place of Event",
                    text: "<b>{NAME}</b> is a {expression/carrier} place of event."
                }
            },
            basemaps: {
                gray: "Street Map (gray)",
                streets: "Street Map",
                topo: "Topographical Map",
                hybrid: "Aerial (hybrid)"
            }
        },
        queries: {
            streetDamage: "Show reported street damages that are not yet fixed in Münster",
            populationDensity: "Constituencies with population densities exceeding 1000 inhabitants/km²",
            income: "Constituencies with mean available disposable income of more than 20000€",
            populationIncreasing: "Constituencies with increasing population",
            tree: "Search tree species",
            disturbances: "Search disturbances",
            earthquakes: "Search earthquakes"
        },
        toolset: {
            whatDoYouWant: "Questions and Answers",
            whatDoYouWantToolTip: "List of predefined questions, click to see the answer"
        },
        tools: {
            drawerLeft: "Tools",
            measuring: "Measuring Tools"
        },
        common: {
            number: "Number",
            area: "Area [ha]",
            totalArea: "Percentage of the total area [%]",
            name: "Name",
            provider: "Provider",
            address: "Address",
            furtherinfo: "Further Information",
            precint: "Precint",
            district: "District",
            private: "privater",
            municipal: "municipal",
            zip: "Zip code",
            type: "Type"
        }
    },
    "de": true
};
