# dn_querybuilder

The Query Builder Bundle allows you to create your own Query Tools that perform custom complex queries on a store. For example, choosing all cities with more than 1 million inhabitants. The results of your queries are shown in the resultcenter. As an admin, it is possible to create complex queries using an interactive graphical user interface, or manually in a text format. If you enable the editing of a tool, the users will be able to change selected parts of the query. They can create their own queries if you add a special tool to your app.

## Usage

1. First, you need to add the bundles "agssearch" and "dn_querybuilder" to your app.
2. After that, add a service to your app (Content -> Services Management).
3. Now you can add the new service to the Search&Selection bundle. Don't forget to enable the selection checkbox. (Search&Selection -> ArcGIS for Server Search&Selection)
4. Finally you can create a new Query Tool. (Tools -> Query Builder Config)

To make the functions of this bundle available to the user, the following tool can be added to a toolset:

| Tool ID                | Component              | Description              |
| ---------------------- | ---------------------- | ------------------------ |
| queryBuilderToggleTool | QueryBuilderToggleTool | Show or hide the widget. |

Use a toolset:
To add a toolset to your app that contains the Query Tools, copy the following code to your app.json:
```json
"toolset": {
    "ToolsetManager": {
        "toolsets": [
            {
                "id": "query_builder_toolset",
                "title": "yourTitle",
                "container": "map",
                "window": {
                    "closable": true
                },
                "tooltip": "yourTooltip",
                "cssClass": "ctWDYWBtn ctPrimaryInput",
                "max_horizontal": 1,
                "windowType": "dropdown",
                "position": {
                    "rel_l": 20,
                    "rel_t": 20
                },
                "tools": [
                    "querybuilder_*"
                ]
            }
        ]
    }
}
```

Enable user querybuilder tool:

To enable user query tools in your app, add the "queryBuilderToggleTool" to your toolset:
```json
"toolset": {
    "ToolsetManager": {
        "toolsets": [
            {
                "id": "query_builder_toolset",
                "title": "yourTitle",
                "container": "map",
                "window": {
                    "closable": true
                },
                "tooltip": "yourTooltip",
                 "cssClass": "ctWDYWBtn ctPrimaryInput",
                "max_horizontal": 1,
                "windowType": "dropdown",
                "position": {
                     "rel_l": 20,
                     "rel_t": 20
                },
                "tools": [
                    "querybuilder_*",
                    "queryBuilderToggleTool"
                ]
            }
        ]
    }
}
```

No further configuration is required, default values will be used.

## Configuration Reference

### QueryBuilderProperties:
```json
"QueryBuilderProperties": {
    "enableDistinctValues": true,
    "defaultLinkOperator": "$or",
    "defaultSpatialRelation": "everywhere",
    "useMemorySelectionStore": false,
    "useUserExtent": false,
    "allowNegation": true,
    "showQuerySettingsInEditableMode": true,
    "showSortSelectInUserMode": false,
    "showFieldType": true,
    "hidedFields": [
        "objectid",
        "OBJECTID",
        "shape"
    ]
}
```

| Property                        | Type    | Possible Values                                                       | Default                     | Description                                                                                                                            |
|---------------------------------|---------|-----------------------------------------------------------------------|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| enableDistinctValues            | Boolean | ```true``` &#124; ```false```                                         | ```true```                  | Distinct values are queried by the service.                                                                                            |
| defaultLinkOperator             | String  | ```or``` &#124; ```and```                                             | ```or```                    | Defines the default link operator.                                                                                                     |
| defaultSpatialRelation          | String  | ```everywhere``` &#124; ```current_extent```                          | ```everywhere```            | Defines the default spatial relation.                                                                                                  |
| useMemorySelectionStore         | Boolean | ```true``` &#124; ```false```                                         | ```false```                 | Use MemorySelectionStore to save the results.                                                                                          |
| useUserExtent                   | Boolean | ```true``` &#124; ```false```                                         | ```false```                 | Use the current user extent to filter predefined queries.                                                                              |
| allowNegation                   | Boolean | ```true``` &#124; ```false```                                         | ```true```                  | Allows the user to negate the different parts of the queries.                                                                          |
| showQuerySettingsInEditableMode | Boolean | ```true``` &#124; ```false```                                         | ```true```                  | Show or hide the query settings for editable queries.                                                                                  |
| showSortSelectInUserMode        | Boolean | ```true``` &#124; ```false```                                         | ```false```                 | Show or hide the sort field select in user mode.                                                                                       |
| showFieldType                   | Boolean | ```true``` &#124; ```false```                                         | ```true```                  | Show or hide the field type after the field name                                                                                       |
| hidedFields                     | Array   |                                                                       | ```true```                  | Names of fields that should be hided in the field select                                                                               |

### QueryBuilderWidgetModel:
List of store ids that should be available in the QueryBuilderWidget
```json
"QueryBuilderWidgetModel": {
    "storeIds": [
        "airtraffic",
        "countries",
        "baumkataster",
        "stoerungen",
        "wahlkreise_strukturdaten"
    ]
}
```

### QueryTools:
```json
"QueryTools": [
    // list of query tools
]
```
