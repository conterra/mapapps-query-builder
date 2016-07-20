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
    bundleName: "Query Builder",
    bundleDescription: "Das Bundle erm\u00f6glicht es benutzerdefinierte QueryTools zu erstellen",
    wizard: {
        title: "Title",
        toolTitle: "Eigene Query erstellen",
        toolToolTip: "Bauen Sie Ihre eigene Query",
        windowTitle: "Custom Query Tool",
        editWindowTitle: "Edit Query Tool",
        builder: "Bauen",
        options: "Optionen",
        manual: "Manuell",
        iconClass: "Icon Klasse",
        iconClassHelp: "Hilfe zur Icon Class",
        complexQueryHelp: "Hilfe zur Complex Query",
        customQuery: "Custom Query",
        queryDefinition: "Query Definiton",
        useExtent: "Auswahl auf aktuellen\nKartenausschnitt begrenzen",
        count: "Anzahl der Ergebnisse",
        ignoreCase: "Groß-/Kleinschreibung unterscheiden",
        locale: "Sprache",
        addField: "Feld hinzuf\u00fcgen",
        store: "Datenquelle",
        cancel: "Abbrechen",
        done: "Suchen",
        typeInTitle: "Titel eingeben",
        match: "Felder verkn\u00fcpfen mit",
        changeToManual: "Sind Sie sicher? Die Query wird nur noch manuell zu \u00e4ndern sein!",
        and: "und",
        or: "oder",
        yes: "ja",
        no: "nein",
        userStore: "Was suchen?",
        userUseGeometry: "Wo suchen?",
        userDone: "Los gehts",
        userMatch: "Suche verkn\u00fcpfen mit...",
        userGeometryEverywhere: "\u00fcberall",
        userGeometryEnhanced: "Geometrie",
        userGeometryExtent: "Aktueller Kartenausschnitt",
        userChooseGeometry: "Geometrie festlegen",
        userWindowTitle: "Eigene Abfrage erstellen",
        userSpatialRelation: "R\u00e4umliche Verkn\u00fcpfung",
        userSelectedFeatures: "Selektierte Objekte",
        no_results_error: "Keine Ergebnisse f\u00fcr Ihre Abfrage gefunden!",
        serviceUnavailable: "Service nicht erreichbar!",
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
    }
});
