/*
 * Copyright (C) 2015 con terra GmbH (info@conterra.de)
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
define([
    "dojo/when",
    "dojo/_base/declare",
    "ct/store/Filter",
    "dojo/_base/array",
    "ct/_Connect",
    "dojo/Deferred",
    "ct/_lang",
    "dojo/_base/lang",
    "ct/mapping/geometry",
    "ct/_when",
    "esri/geometry/Extent"
], function (dojo,
        declare,
        Filter,
        d_array,
        _Connect,
        Deferred,
        ct_lang,
        d_lang,
        geometry,
        ct_when,
        Extent) {

    return declare([_Connect, Deferred], {
        constructor: function (opts) {
            this.properties = opts;
        },
        activate: function () {
            //this.connect(this._mapState, "onClick", this._featureClick);
        },
        activateAction: function (event) {
            var tool = this.tool = event.tool;
            // start
            this._setProcessing(true);
            var topic = "ct/selection/SELECTION_START";
            this._eventService.postEvent(topic);

            var stores_array = this._stores;
            var stores_array_info = this._stores_info;
            var selected_storeid = event.storeIdForCustomQuery;
            var selected_store;

            d_array.some(stores_array, function (store,index) {
                var id = stores_array_info[index].id || store.id;
                if (id === selected_storeid) {
                    selected_store = store;
                }
                return !!selected_store;
            });

            var resultCenterDataModel = this._resultCenterDataModel;
            var filter = Filter(selected_store, event.customquery);
            var deferred = filter.query({}, {
                fields: {
                    geometry: 1
                }
            });
            var data = [];
            ct_when(deferred, function (feautures) {
                d_array.forEach(feautures, function (feature) {
                    data.push(feature);
                });
                this._setExtent(data);

                //end
                this._setProcessing(false);
                var topic = "ct/selection/SELECTION_END";
                this._eventService.postEvent(topic);

                resultCenterDataModel.setDatasource(filter);
            }, function () {
                this._setProcessing(false);
                var topic = "ct/selection/SELECTION_END";
                this._eventService.postEvent(topic);
            }, this);
            tool.set("active", false);
        },
        deactivateAction: function () {
            var resultCenterDataModel = this._resultCenterDataModel;
            //     resultCenterDataModel.setDatasource(null);
        },
        _setExtent: function (data) {
            var featuresExtent = this._getFeaturesExtent(data);

            var mapState = this._mapState;
            mapState.setExtent(featuresExtent);
        },
        _getFeaturesExtent: function (data) {
            var fullExtent = null;
            d_array.forEach(data, function (feature) {
                ct_when(this._coordinateTransformer.transform(feature.geometry, this._mapState.getSpatialReference().wkid),
                        function (transformedGeometry) {
                            var graphicExtent = this._getExtentOfGeometry(transformedGeometry);
                            if (!fullExtent) {
                                fullExtent = graphicExtent;
                            } else {
                                fullExtent = fullExtent.union(graphicExtent);
                            }
                        }
                , this);
            }, this);
            return fullExtent;
        },
        _getExtentOfGeometry: function (geometry, pointExtentSize) {
            var geomExtent;
            if (geometry.type === "point") {
                geomExtent = new Extent({
                    xmin: geometry.x,
                    xmax: geometry.x,
                    ymin: geometry.y,
                    ymax: geometry.y,
                    spatialReference: {
                        wkid: geometry.spatialReference.wkid
                    }
                });
            } else if (geometry.type === "extent") {
                geomExtent = geometry;
            } else {
                geomExtent = geometry.getExtent();
            }
            return geomExtent;
        },
        _setProcessing: function (processing) {
            var tool = this.tool;
            if (tool) {
                tool.set("processing", processing);
            }
        }
    });
});
