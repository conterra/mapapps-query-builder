# Query Builder Bundle
The Query Builder Bundle allows you to create your own Query Tools, that perform custom queries to a store. For example, you can choose all cities with more than 1 million inhabitants. The results are shown in the resultcenter. In this version, you can add custom queries in a text format. In future versions we plan to enable you to create complex queries by an interactive graphical user interface.

### Sample App ###
http://www.mapapps.de/mapapps/resources/apps/downloads_query_builder/index.html

Installation Guide
------------------
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
