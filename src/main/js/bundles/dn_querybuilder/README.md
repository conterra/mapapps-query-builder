# dn_querybuilder

The Query Builder Bundle allows you to create your own Query Tools that perform custom complex queries on a store. For example, choosing all cities with more than 1 million inhabitants. The results of your queries are shown in the resultcenter. As an admin, it is possible to create complex queries using an interactive graphical user interface, or manually in a text format. If you enable the editing of a tool, the users will be able to change selected parts of the query. They can create their own queries if you add a special tool to your app.

**Requirement: map.apps 4.12.0**

## Usage

1. First, you need to add the bundles "agssearch" and "dn_querybuilder" to your app.
2. After that, add some stores to your app.
3. Finally you can create a new Query Tool. (Tools -> Query Builder Config)

The Query Builder uses the Complex Query Language: https://docs.conterra.de/en/mapapps/latest/developersguide/concepts/complex-query.html#_complex_query_language

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
                    "rel_t": 100
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
                     "rel_t": 100
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

No further configuration required, default values will be used.

## Configuration Reference

### QueryBuilderProperties:
```json
"QueryBuilderProperties": {
    "enableDistinctValues": true,
    "enableInitialDistinctValues": true,
    "defaultLinkOperator": "$or",
    "defaultSpatialRelation": "everywhere",
    "useUserExtent": false,
    "allowNegation": true,
    "showQuerySettingsInEditableMode": true,
    "showSortSelectInUserMode": false,
    "showFieldType": true,
    "showSpatialInputActions": false,
    "spatialInputActions": [
        "*"
    ],
    "allowMultipleSpatialInputs": true,
    "hiddenFields": [
        "objectid",
        "OBJECTID",
        "shape"
    ],
    "hiddenSortFields": [
        "objectid",
        "OBJECTID",
        "shape"
    ],
    "symbols": {
        "point": {
            "type": "simple-marker",
            "color": [
                255,
                0,
                0,
                0.25
            ],
            "style": "circle",
            "outline": {
                "color": [
                    255,
                    0,
                    0,
                    1
                ],
                "width": 2
            },
            "size": 10
        },
        "polygon": {
            "type": "simple-fill",
            "color": [
                255,
                0,
                0,
                0.25
            ],
            "style": "solid",
            "outline": {
                "color": [
                    255,
                    0,
                    0,
                    1
                ],
                "width": "2px"
            }
        }
    }
}
```

| Property                        | Type    | Possible Values                                                       | Default                     | Description                                                                                                                                             |
|---------------------------------|---------|-----------------------------------------------------------------------|-----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| enableDistinctValues            | Boolean | ```true``` &#124; ```false```                                         | ```true```                  | Distinct values are queried by the service.                                                                                                             |
| enableInitialDistinctValues     | Boolean | ```true``` &#124; ```false```                                         | ```true```                  | Distinct values are queried after a new field was selected.                                                                                                             |
| defaultLinkOperator             | String  | ```or``` &#124; ```and```                                             | ```or```                    | Defines the default link operator.                                                                                                                      |
| defaultSpatialRelation          | String  | ```everywhere``` &#124; ```current_extent```                          | ```everywhere```            | Defines the default spatial relation.                                                                                                                   |
| useUserExtent                   | Boolean | ```true``` &#124; ```false```                                         | ```false```                 | Use the current user extent to filter predefined queries.                                                                                               |
| allowNegation                   | Boolean | ```true``` &#124; ```false```                                         | ```true```                  | Allows the user to negate the different parts of the queries.                                                                                           |
| showQuerySettingsInEditableMode | Boolean | ```true``` &#124; ```false```                                         | ```true```                  | Show or hide the query settings for editable queries.                                                                                                   |
| showSortSelectInUserMode        | Boolean | ```true``` &#124; ```false```                                         | ```false```                 | Show or hide the sort field select in user mode.                                                                                                        |
| showFieldType                   | Boolean | ```true``` &#124; ```false```                                         | ```true```                  | Show or hide the field type after the field name                                                                                                        |
| showSpatialInputActions         | Boolean | ```true``` &#124; ```false```                                         | ```true```                  | Show spatial input actions of the selection-ui bundle.                                                                                                  |
| spatialInputActions             | Array   | ```point``` &#124; ```rectangle``` &#124; ```polygon```               | ```["*"]```                 | IDs of allowed spatial input actions. More actions are available in the selection-actions bundle: https://github.com/conterra/mapapps-selection-actions |
| allowMultipleSpatialInputs      | Boolean | ```true``` &#124; ```false```                                         | ```true```                  | Allow multiple selection of geometries via the selection actions.                                                                                       |
| hiddenFields                    | Array   |                                                                       | ```[]```                    | Names of fields that should be hidden in the field select                                                                                                |
| hiddenSortFields                | Array   |                                                                       | ```[]```                    | Names of fields that should be hidden in the sort field select                                                                                           |
| symbols                         | Object  |                                                                       |                             | Symbols that will be used for the presentation of geometries that are selected via the spatial input actions.                                           |

### QueryBuilderWidgetModel:
List of store IDs that should be available in the QueryBuilderWidget
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
```
"QueryTools": [
    // list of query tools
]
```
