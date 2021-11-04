# Query Builder
The Query Builder Bundle allows you to create your own Query Tools that perform custom complex queries on a store. For example, choosing all cities with more than 1 million inhabitants. The results of your queries are shown in the resultcenter. As an admin, it is possible to create complex queries using an interactive graphical user interface, or manually in a text format. If you enable the editing of a tool, the users will be able to change selected parts of the query. They can create their own queries if you add a special tool to your app.

![Screenshot App](https://github.com/conterra/mapapps-query-builder/blob/master/screenshot.JPG)

The Query Builder 3 for Linie 3 can be found in the 3.x branch:
https://github.com/conterra/mapapps-query-builder/tree/3.x

## Build Status
[![devnet-bundle-snapshot](https://github.com/conterra/mapapps-query-builder/actions/workflows/devnet-bundle-snapshot.yml/badge.svg)](https://github.com/conterra/mapapps-query-builder/actions/workflows/devnet-bundle-snapshot.yml)

## Sample App
https://demos.conterra.de/mapapps/resources/apps/downloads_query_builder4/index.html

## Installation Guide
**Requirement: map.apps 4.12.0**

[dn_querybuilder Documentation](https://github.com/conterra/mapapps-query-builder/tree/master/src/main/js/bundles/dn_querybuilder)

[dn_queryplaceholder Documentation](https://github.com/conterra/mapapps-query-builder/tree/master/src/main/js/bundles/dn_queryplaceholder)

## Development Guide
### Define the mapapps remote base
Before you can run the project you have to define the mapapps.remote.base property in the pom.xml-file:
`<mapapps.remote.base>http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%</mapapps.remote.base>`

### Other methods to to define the mapapps.remote.base property.
1. Goal parameters
`mvn install -Dmapapps.remote.base=http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%`

2. Build properties
Change the mapapps.remote.base in the build.properties file and run:
`mvn install -Denv=dev -Dlocal.configfile=%ABSOLUTEPATHTOPROJECTROOT%/build.properties`
