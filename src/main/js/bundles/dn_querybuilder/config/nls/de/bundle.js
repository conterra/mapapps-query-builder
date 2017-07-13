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
    bundleDescription: "Konfigurations-Bundle f\u00fcr den Query Builder",
    title: "Query Builder Konfiguration",
    description: "Einstellungen f\u00fcr das Query Builder Bundle",
    propertiesWidget: {
        propertiesWidgetTitle: "Grundeinstellungen",
        propertiesWidgetDescription: "Grundeinstellungen f\u00FCr das Query Builder Bundle",
        enableDistinctValues: "Distinct Values vorschlagen",
        defaultRelationalOperator: "Standard-Vergleichsoperator",
        searchEverywhereAsDefault: "Als Standardeinstellung \u00FCberall suchen"
    },
    userQueryBuilderWidgetStoreSelection: {
        menuTitle: "UserQueryBuilderWidget",
        description: "UserQueryBuilderWidget konfigurieren",
        grid: {
            "title": "Titel",
            "description": "Beschreibung"
        },
        hint: "Bitte w\u00E4hlen Sie die Stores aus, die im UserQueryBuilderWidget zur Verf\u00FCgung stehen sollen"
    },
    toolsBuilder: {
        toolsBuilderTitle: "Query Tools",
        toolsBuilderDescription: "Erstellen Sie hier Ihre eigenen Query Tools"
    },
    widget: {
        window: {
            title: "Name",
            removeTool: "Custom Query Tool entfernen",
            removeToolMessage: "Custom Query Tool entfernen?",
            addTool: "Custom Query Tool hinzuf\u00fcgen",
            copyTool: "Custom Query Tool kopieren"
        },
        wizard: {
            windowtitle: "Custom Query Tool",
            windowtitleAdd: "Custom Query Tool hinzuf\u00fcgen",
            windowtitleEdit: "Custom Query Tool editieren",
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
            customQuery: "Custom Query",
            queryDefinition: "Query Definiton",
            useGeometry: "Suchgeometrie verwenden",
            useExtent: "Nur aktueller Kartenausschnitt",
            chooseGeometry: "Geometrie festlegen",
            count: "Anzahl der Ergebnisse",
            ignoreCase: "Groß-/Kleinschreibung unterscheiden",
            locale: "Sprache",
            spatialRelation: "R\u00e4umliche Relation",
            editable: "Editierbar",
            addField: "Feld hinzuf\u00fcgen",
            store: "Datenquelle",
            cancel: "Abbrechen",
            done: "Fertig",
            typeInTitle: "Titel eingeben",
            match: "Felder verkn\u00fcpfen mit",
            changeToManual: "Sind Sie sicher? Die Query wird nur noch manuell zu \u00e4ndern sein!",
            and: "und",
            or: "oder",
            yes: "ja",
            no: "nein",
            spatialRelations: {
                intersects: "ber\u00fchrt",
                contains: "enthalten in",
                crosses: "schneidet",
                within: "enth\u00e4lt"
            },
            fields: {
                typeInValue: "Wert eingeben",
                is: "ist gleich",
                eqw: "ist gleich (wildcard)",
                suggest: "\u00e4hnelt",
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
                after: "nach",
                yes: "ja",
                no: "nein",
                shouldBeTrue: "Soll zutreffen",
                shouldBeFalse: "Soll nicht zutreffen"
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
