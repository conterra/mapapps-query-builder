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
    bundleName: "Query Builder Konfiguration",
    bundleDescription: "Konfigurations-Bundle f\u00fcr den Query Builder",
    title: "Query Builder Konfiguration",
    description: "Einstellungen f\u00fcr das Query Builder Bundle",
    propertiesWidget: {
        propertiesWidgetTitle: "Grundeinstellungen",
        propertiesWidgetDescription: "Grundeinstellungen f\u00FCr das Query Builder Bundle",
        enableDistinctValues: "Distinct Values vorschlagen",
        defaultLinkOperator: "Standard-Vergleichsoperator",
        defaultSpatialRelation: "Standard-R\u00E4umlicher-Vergleichsoperator",
        useCurrentMapExtent: "Aktuelle Kartenausdehnung des Anwenders verwenden anstelle einer voreingestellten Ausdehnung",
        visibleElements: "Sichtbare Elemente"
    },
    toolsBuilder: {
        toolsBuilderTitle: "Query Tools",
        toolsBuilderDescription: "Erstellen Sie hier Ihre eigenen Query Tools"
    },
    widget: {
        window: {
            title: "Name",
            removeTool: "Query Tool entfernen",
            removeToolMessage: "Query Tool entfernen?",
            addTool: "Query Tool hinzuf\u00fcgen",
            copyTool: "Query Tool kopieren"
        },
        wizard: {
            windowtitle: "Query Tool",
            windowtitleAdd: "Query Tool hinzuf\u00fcgen",
            windowtitleEdit: "Query Tool editieren",
            title: "Titel",
            builder: "Bauen",
            options: "Optionen",
            manual: "Manuell",
            key: "Schl\u00fcssel",
            value: "Werte werden dynamisch gesetzt, aktueller Wert ist",
            placeholder: "Platzhalter",
            iconClass: "Icon Klasse",
            iconClassHelp: "Hilfe zur Icon Class",
            complexQueryHelp: "Hilfe zur Complex Query",
            complexQuery: "Complex Query",
            queryDefinition: "Query Definiton",
            count: "Anzahl der Ergebnisse",
            ignoreCase: "Groß-/Kleinschreibung unterscheiden",
            locale: "Sprache",
            editable: "Editierbar",
            addField: "Feld hinzuf\u00fcgen",
            store: "Datenquelle",
            cancel: "Abbrechen",
            done: "Fertig",
            typeInTitle: "Titel eingeben",
            spatialRelation: "Wo suchen?",
            match: "Wie verkn\u00fcpfen?",
            changeToManual: "Sind Sie sicher? Die Query wird nur noch manuell zu \u00e4ndern sein!",
            and: "und",
            or: "oder",
            yes: "ja",
            no: "nein",
            extent: "Aktueller Kartenausschnitt",
            everywhere: "\u00FCberall",
            fields: {
                typeInValue: "Wert eingeben",
                is: "ist gleich",
                is_not: "ist nicht gleich",
                exists: "ist vorhanden",
                eqw: "ist gleich (wildcard)",
                suggest: "\u00e4hnelt",
                contains: "enth\u00e4lt",
                contains_not: "enth\u00e4lt nicht",
                starts_with: "beginnt mit",
                ends_with: "endet mit",
                is_greater_than: "ist gr\u00f6\u00dfer",
                is_greater_or_equal: "ist gr\u00f6\u00dfer / gleich",
                is_less_than: "ist kleiner",
                is_less_or_equal: "ist kleiner / gleich",
                before: "vor",
                after: "nach",
                yes: "ja",
                no: "nein",
                shouldBeTrue: "Soll zutreffen",
                shouldBeFalse: "Soll nicht zutreffen"
            }
        },
        grid: {
            removeTool: "Query Tool entfernen",
            addTool: "Query Tool hinzuf\u00fcgen",
            title: "Titel",
            dataView: {
                DGRID: {
                    noDataMessage: "Kein(e) Query Tool(s) vorhanden..."
                },
                pager: {
                    pageSizeLabelText: "Query Tools ${pageStartItemNumber}-${pageEndItemNumber} of ${itemCount}"
                }
            }
        }
    }
};
