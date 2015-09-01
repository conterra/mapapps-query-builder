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
            customQuery: "Custom Query:",
            queryDefinition: "Query Definiton:",
            useExtent: "Auf aktuellen Kartenausschnitt begrenzen:",
            addField: "Feld hinzuf\u00fcgen",
            storeId: "Store",
            cancel: "Abbrechen",
            done: "Fertig",
            typeInTitle: "Titel eingeben",
            match1: "Features abfragen, die ",
            match2: " der folgenden Ausr\u00fccke erf\u00fcllen",
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