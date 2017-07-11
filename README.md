# Query Builder Bundle
The Query Builder Bundle allows you to create your own Query Tools that perform custom complex queries on a store. For example, choosing all cities with more than 1 million inhabitants. The results of your queries are shown in the resultcenter. As an admin, it is possible to create complex queries using an interactive graphical user interface, or manually in a text format. If you enable the editing of a tool, the users will be able to change selected parts of the query. They can create their own queries if you add a special tool to your app.

Sample App
------------------
http://www.mapapps.de/mapapps/resources/apps/downloads_query_builder/index.html

Video Tutorial
------------------
https://youtu.be/yP2quHAXXPI

Installation Guide
------------------
**Requirement: map.apps 3.2.1**

1. First, you need to add the bundles "agssearch", "resultcenter" and "dn_querybuilder" to your app.
2. After that, add a service to your app (Content -> Services Management).
3. Now you can add the new service to the Search&Selection bundle. Don't forget to enable the selection checkbox. (Search&Selection -> ArcGIS for Server Search&Selection)
4. Finally you can create a new Query Tool. (Tools -> Query Builder Config)

Use a toolset:
To add a toolset to your app that contains the Query Tools, copy the following code to your app.json:
```
"toolset": {
  "ToolsetManager": {
    "toolsets": [{
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
      "tools": ["fc_*"]
    }]
  },
  "enabled": true
}
```

Enable user querybuilder tool:

To enable user query tools in your app, add the "userQueryBuilderTool" to your toolset:
```
"toolset": {
  "ToolsetManager": {
    "toolsets": [{
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
      "tools": ["fc_*", "userQueryBuilderTool"]
    }]
  },
  "enabled": true
}
```

#### Configurable Components of dn_querybuilder:

##### QueryBuilderProperties:
```
"QueryBuilderProperties": {
  "enableDistinctValues": true,
  "defaultRelationalOperator": "$and"
}
```

##### UserQueryBuilderWidgetFactory:
```
"UserQueryBuilderWidgetFactory": {
  "storeIds": [
    "stoerungen",
    "_AGS_STORE_1469615663725",
    "_AGS_STORE_1441195340629",
    "_AGS_STORE_1441195356941",
    "_AGS_STORE_1441195705828",
    "_AGS_STORE_1442226070628",
    "_AGS_STORE_1442227045951",
    "_AGS_STORE_1442227058500",
    "_AGS_STORE_1442299569090",
    "_AGS_STORE_1443534824350"
  ]
}
```

##### QueryTools:
```
"QueryTools": [
  // list of query tools
]
```

#### Configurable Components of dn_queryplaceholder:

##### Replacer:
```
"Replacer": {
  "placeholder": {
    "user": "Müller"
  }
}
```

More information about how to place a widget:
https://developernetwork.conterra.de/de/documentation/mapapps/developers-documentation/templates

Development Guide
------------------
### Define the mapapps remote base
Before you can run the project you have to define the mapapps.remote.base property in the pom.xml-file:
`<mapapps.remote.base>http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%</mapapps.remote.base>`

##### Other methods to to define the mapapps.remote.base property.
1. Goal parameters
`mvn install -Dmapapps.remote.base=http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%`

2. Build properties
Change the mapapps.remote.base in the build.properties file and run:
`mvn install -Denv=dev -Dlocal.configfile=%ABSOLUTEPATHTOPROJECTROOT%/build.properties`