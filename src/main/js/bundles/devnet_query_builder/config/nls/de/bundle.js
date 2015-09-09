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
    bundleName: "Query Builder Konfiguration",
    bundleDescription: "Konfigurations-Bundle fuer das FilterQuery-Tool",
    windowTitle: "Query Builder Konfiguration",
    description: "Einstellungen f\u00fcr das Query Builder Bundle",
    widget: {
        window: {
            title: "Name",
            removeTool: "Custom Query Tool entfernen",
            addTool: "Custom Query Tool hinzuf\u00fcgen"
        },
        wizard: {
            windowtitle: "Custom Query Tool",
            windowtitleAdd: "Custom Query Tool hinzuf\u00fcgen",
            windowtitleEdit: "Custom Query Tool editieren",
            title: "Titel",
            builder: "Bauen",
            manual: "Manuell",
            iconClass: "Icon Klasse",
            iconClassHelp: "Hilfe zur Icon Class",
            complexQueryHelp: "Hilfe zur Complex Query",
            customQuery: "Custom Query",
            queryDefinition: "Query Definiton:",
            useExtent: "Aktueller Kartenausschnitt",
            addField: "Feld hinzuf\u00fcgen",
            storeId: "Store",
            cancel: "Abbrechen",
            done: "Fertig",
            typeInTitle: "Titel eingeben",
            match: "Felder verknüpfen",
            match1: "Features abfragen, die ",
            match2: " der folgenden Ausr\u00fccke erf\u00fcllen",
            changeToManual: "Sind Sie sicher? Die Query wird nur noch manuell zu \u00e4ndern sein!",
            all: "alle",
            any: "einige",
            yes: "ja",
            no: "nein",
            fields: {
                typeInValue: "Wert eingeben",
                is: "ist gleich",
                is_not: "ist nicht gleich",
                contains: "enth\u00e4lt",
                contains_not: "enth\u00e4lt nicht",
                starts_with: "beginnt mit",
                ends_with: "endet mit",
                is_greater_than: "ist gr\u00f6\u00dfer",
                is_greater_or_equal: "ist gr\u00f6\u00dfer / gleich",
                is_less_than: "ist kleiner",
                is_less_or_equal: "ist kleiner / gleich",
                before: "vor",
                after: "nach"
            }
        },
        grid: {
            removeTool: "Custom Query Tool entfernen",
            addTool: "Custom Query Tool hinzuf\u00fcgen",
            title: "Titel",
            dataView: {
                DGRID: {
                    noDataMessage: "Kein(e) Custom Query Tool(s) vorhanden..."
                },
                pager: {
                    pageSizeLabelText: "Custom Query Tools ${pageStartItemNumber}-${pageEndItemNumber} of ${itemCount}"
                }
            }
        }
    }
});
