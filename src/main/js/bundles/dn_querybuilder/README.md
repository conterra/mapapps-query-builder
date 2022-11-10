# dn_querybuilder

The Query Builder Bundle allows you to create your own Query Tools that perform custom complex queries on a store. For example, choosing all cities with more than 1 million inhabitants. The results of your queries are either shown in the resultcenter or result-ui, depending on which bundle is referenced from the app configuration.

As an admin, it is possible to create complex queries using an interactive graphical user interface, or manually in a text format. If you enable the editing of a tool, the users will be able to change selected parts of the query. They can create their own queries if you add a special tool to your app.

**Requirement: map.apps 4.13.0**

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

### TOC filter action

The query builder includes a TOC action that allows to filter layers.
To make it available you need to add the action with the ID _querybuilder-filter_ to the toc actions.
The filter function supports FeatureLayer and MapImageLayer, which are queryable.

```json
"toc": {
    "Config": {
        "actions": [
            "show-description",
            "zoom-to-extent",
            "activate-children",
            "deactivate-children",
            "change-opacity",
            "show-copyright",
            "querybuilder-filter"
        ]
    }
}
```

## Configuration Reference

To use a store with the Query Builder bundle, add the value _querybuilder_ to the useIn property.

### Manual store

```json
{
    "id": "countries",
    "title": "Countries",
    "description": "Countries of the world",
    "url": "https://services.conterra.de/arcgis/rest/services/common/grenzen/MapServer/3",
    "popupEnabled": true,
    "useIn": [
        "querybuilder"
    ]
}
```

### AutoStoreRegistration

```json
"AutoStoreRegistration": {
    "componentEnabled": true,
    "useIn": [
        "querybuilder"
    ]
}
```

### Config:
```json
"Config": {
    "enableDistinctValues": true,
    "enableInitialDistinctValues": true,
    "defaultLinkOperator": "$or",
    "defaultSpatialRelation": "everywhere",
    "useUserExtent": false,
    "availableSpatialInputActions": [
        "*"
    ],
    "allowMultipleSpatialInputs": true,
    "visibleElements": {
        "defaultMode": {
            "spatialRelation": true,
            "spatialInputActions": false,
            "sortSelect": false,
            "fieldInfos": false
        },
        "predefinedMode": {
            "spatialRelation": true,
            "sortSelect": false,
            "fieldInfos": false
        },
        "filterMode": {
            "spatialRelation": true,
            "fieldInfos": false
        }
    },
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

| Property                     | Type    | Possible Values                                         | Default          | Description                                                                                                                                             |
|------------------------------|---------|---------------------------------------------------------|------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| enableDistinctValues         | Boolean | ```true``` &#124; ```false```                           | ```true```       | Distinct values are queried by the service.                                                                                                             |
| enableInitialDistinctValues  | Boolean | ```true``` &#124; ```false```                           | ```true```       | Distinct values are queried after a new field was selected.                                                                                             |
| defaultLinkOperator          | String  | ```or``` &#124; ```and```                               | ```or```         | Defines the default link operator.                                                                                                                      |
| defaultSpatialRelation       | String  | ```everywhere``` &#124; ```current_extent```            | ```everywhere``` | Defines the default spatial relation.                                                                                                                   |
| useUserExtent                | Boolean | ```true``` &#124; ```false```                           | ```false```      | Use the current user extent to filter predefined queries.                                                                                               |
| availableSpatialInputActions | Array   | ```point``` &#124; ```rectangle``` &#124; ```polygon``` | ```["*"]```      | IDs of allowed spatial input actions. More actions are available in the selection-actions bundle: https://github.com/conterra/mapapps-selection-actions |
| allowMultipleSpatialInputs   | Boolean | ```true``` &#124; ```false```                           | ```true```       | Allow multiple selection of geometries via the selection actions.                                                                                       |
| visibleElements              | Object  |                                                         |                  | Select visible elements in default mode, predefined mode and filter mode.                                                                               |
| hiddenFields                 | Array   |                                                         | ```[]```         | Names of fields that should be hidden in the field select                                                                                               |
| hiddenSortFields             | Array   |                                                         | ```[]```         | Names of fields that should be hidden in the sort field select                                                                                          |
| symbols                      | Object  |                                                         |                  | Symbols that will be used for the presentation of geometries that are selected via the spatial input actions.                                           |



### QueryTools:
```
"QueryTools": [
    // list of query tools
]
```
