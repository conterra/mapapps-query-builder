/*
 * Copyright (C) 2019 con terra GmbH (info@conterra.de)
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
    bundleName: "QueryBuilder",
    bundleDescription: "Das Bundle erm\u00f6glicht es benutzerdefinierte Queries zu erstellen",
    windowTitle: "QueryBuilder",
    editableWindowTitle: "Editierbare Query",
    tool: {
        title: "Eigene Query erstellen",
        tooltip: "Bauen Sie Ihre eigene Query",
    },
    ui: {
        selectStore: "Was suchen?",
        spatialRelation: "Wo suchen?",
        linkOperator: "Wie verknüpfen?",
        sorting: "Sortierung",
        sortOptions: "Wie sortieren?",
        everywhere: "\u00fcberall",
        currentExtent: "Aktueller Kartenausschnitt",
        delete: "Löschen",
        search: "Suche starten",
        searchParameter: "Suchparameter",
        negated: "negiert",
        typeInValue: "Wert eingeben",
        yes: "ja",
        no: "nein",
        and: "und",
        or: "oder",
        enterValue: "Wert eingeben",
        relationalOperators: {
            is: "ist gleich",
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
            after: "nach"
        },
        rules: {
            required: "Wert wird ben\u00f6tigt",
            number: "Wert muss vom Typ number sein",
            string: "Wert muss vom Typ string sein"
        },
        errors: {
            noResultsError: "Keine Ergebnisse f\u00fcr Ihre Abfrage gefunden!"
        }
    }
};
