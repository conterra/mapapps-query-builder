# Query Builder Bundle
The Query Builder Bundle allows you to create your own Query Tools, that perform custom complex queries to a store. For example, you can choose all cities with more than 1 million inhabitants. The results of your queries are shown in the resultcenter. As an admin it is possible to create complex queries by an interactive graphical user interface or manual in a text format. If you enable the editing of a tool the users will be able to change selected parts of the query. They can create their own queries if you add a special tool to your app.

### Sample App ###
http://www.mapapps.de/mapapps/resources/apps/downloads_query_builder/index.html

Installation Guide
------------------
**Requirement: map.apps 3.2.2**

1. At first, you need to add the bundles "agssearch", "resultcenter" and "dn_query_builder" to your app.
2. After that add a service to your app (Content -> Services Management). Example
3. Now you can add the new service to the Search&Selection bundle. Don't forget to enable the selection checkbox. (Search&Selection -> ArcGIS for Server Search&Selection)
4. Finally you can create a new Query Tool. (Tools -> Query Builder Config)

Use a toolset:
To add a toolset to your app, that contains the Query Tools, copy the following code to your app.json:
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
