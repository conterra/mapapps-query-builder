[![devnet-bundle-snapshot](https://github.com/conterra/mapapps-query-builder/actions/workflows/devnet-bundle-snapshot.yml/badge.svg)](https://github.com/conterra/mapapps-query-builder/actions/workflows/devnet-bundle-snapshot.yml)
![Static Badge](https://img.shields.io/badge/requires_map.apps-4.20.0-e5e5e5?labelColor=%233E464F&logoColor=%23e5e5e5)
![Static Badge](https://img.shields.io/badge/tested_for_map.apps-4.20.0-%20?labelColor=%233E464F&color=%232FC050)
# Query Builder
The Query Builder Bundle allows you to create your own Query Tools that perform custom complex queries on a store. For example, choosing all cities with more than 1 million inhabitants. The results of your queries are shown in the resultcenter. As an admin, it is possible to create complex queries using an interactive graphical user interface, or manually in a text format. If you enable the editing of a tool, the users will be able to change selected parts of the query. They can create their own queries if you add a special tool to your app.

![Screenshot App](https://github.com/conterra/mapapps-query-builder/blob/main/screenshot.JPG)

The Query Builder 3 for Linie 3 can be found in the 3.x branch:
https://github.com/conterra/mapapps-query-builder/tree/3.x

## Build Status
[![devnet-bundle-snapshot](https://github.com/conterra/mapapps-query-builder/actions/workflows/devnet-bundle-snapshot.yml/badge.svg)](https://github.com/conterra/mapapps-query-builder/actions/workflows/devnet-bundle-snapshot.yml)

## Sample App
https://demos.conterra.de/mapapps/resources/apps/public_demo_querybuilder/index.html

## Installation Guide

⚠️**Attention the new Query Builder version 5 has a different configuration than the previous version 4**

[dn_querybuilder Documentation](https://github.com/conterra/mapapps-query-builder/tree/master/src/main/js/bundles/dn_querybuilder)

[dn_queryplaceholder Documentation](https://github.com/conterra/mapapps-query-builder/tree/master/src/main/js/bundles/dn_queryplaceholder)

## Quick start

Clone this project and ensure that you have all required dependencies installed correctly (see [Documentation](https://docs.conterra.de/en/mapapps/latest/developersguide/getting-started/set-up-development-environment.html)).

Then run the following commands from the project root directory to start a local development server:

```bash
# install all required node modules
$ mvn initialize

# start dev server
$ mvn compile -Denv=dev -Pinclude-mapapps-deps

# run unit tests
$ mvn test -P run-js-tests,include-mapapps-deps
```
