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
    "dojo/_base/declare",
    "dojo/_base/array",

    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/registry",

    "ct/_Connect"
], function (declare, d_array,
             _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, d_registry,
             _Connect) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Connect], {
        postCreate: function () {
            this.inherited(arguments);
        },
        resize: function (dim) {
            if (dim && dim.h > 0) {
                this._containerNode.resize({
                    w: dim.w,
                    h: dim.h
                });
            }
        },
        getComplexQuery: function () {
            var match = this._matchRadioButtonAnd.checked ? "$and" : "$or";
            var customQuery = {};
            if (this._geometryRadioButton1.checked === false) {
                var properties = this.properties;
                if (properties.customquery && properties.customquery.geometry) {
                    customQuery.geometry = properties.customquery.geometry;
                } else {
                    if (this.querygeometryTool) {
                        var geometry = this._geometry;
                        if (geometry) {
                            var spatialRelation = this._spatialRelationSelect.value;
                            var operator = "$" + spatialRelation;
                            customQuery.geometry = {};
                            customQuery.geometry[operator] = geometry;
                        }
                    } else {
                        var extent = this.mapState.getExtent();
                        customQuery.geometry = {
                            $contains: extent
                        };
                    }
                }
            }
            var children = this._queryNode.children;
            if (children.length > 0) {
                customQuery[match] = [];
            }
            d_array.forEach(children, function (child) {
                var widget = d_registry.getEnclosingWidget(child);
                var fieldId = widget.getSelectedField();
                var relationalOperatorId = widget.getSelectedRelationalOperator();
                var not = widget.getSelectedNot();
                var value = widget.getValue();
                var obj1 = {};
                obj1[relationalOperatorId] = value;
                var obj2 = {};
                obj2[fieldId] = obj1;
                if (not) {
                    var object = {$not: obj2};
                    customQuery[match].push(object);
                } else {
                    customQuery[match].push(obj2);
                }
            }, this);
            return customQuery;
        }
    });
})
;