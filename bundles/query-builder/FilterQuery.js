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
            this.connect(this._mapState, "onClick", this._featureClick);
        },
        activateAction: function (event) {
            this.tool = event.tool;
            // start
            this._setProcessing(true);
            var topic = "ct/selection/SELECTION_START";
            this._eventService.postEvent(topic);

            var stores_array = this._stores;
            var selected_storeid = event.storeIdForCustomQuery;
            var selected_store;

            d_array.forEach(stores_array, function (store_positions) {
                if (store_positions.id === selected_storeid) {
                    var position_selected_store = d_array.indexOf(stores_array, store_positions);
                    selected_store = stores_array[position_selected_store];
                }
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
        },
        deactivateAction: function () {
            var resultCenterDataModel = this._resultCenterDataModel;
            resultCenterDataModel.setDatasource(null);
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
