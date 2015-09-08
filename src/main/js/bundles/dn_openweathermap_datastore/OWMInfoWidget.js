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
    "dojo/_base/Deferred",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/OWMInfoWidget.html",
    "dojo/_base/lang",
    "dojo/dom-attr",
    "contentviewer/GridContent",
    "ct/_when",
    "ct/request",
    "dojox/charting/Chart",
    "dojox/charting/themes/MiamiNice",
    "dojox/charting/plot2d/StackedAreas"
], function (
        declare,
        Deferred,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        templateStringContent,
        d_lang,
        domAttr,
        GridContent,
        ct_when,
        ct_request,
        Chart,
        theme,
        StackedAreas
        ) {
    return declare([_WidgetBase, _TemplatedMixin,
        _WidgetsInTemplateMixin], {
        templateString: templateStringContent,
        constructor: function (args) {
            this.inherited(arguments);
            var i18n = this._i18n = args.i18n;
            var content = this._content = args.content;
            this._context = args.context;
            this.set("title", i18n.widget.conditions + content.name);
        },
        postCreate: function () {
            this.inherited(arguments);
            var content = this._content;
            var icon = content.icon;
            var url = "http://openweathermap.org/img/w/" + icon + ".png";
            domAttr.set(this._icon, "src", url);

            var grid = new GridContent({
                content: this.content,
                context: this.context
            });

            /*append the new grid to the div*/
            this._grid.set("content", grid);
            ct_when(this._getFiveDayForecast(), function (data) {
                //this._renderChart(data, this._chartNode1);
            }, this);
        },
        _renderChart: function (data, domNode) {
            var chart = this._chart = new Chart(domNode);
            //domNode.removePlot("default");
            //var chart = this._chart;
            chart.setTheme(theme);
            chart.addAxis("x", {fixLower: "major", fixUpper: "major"});
            chart.addAxis("y", {
                min: 0,
                vertical: true,
                fixLower: "major",
                fixUpper: "major",
                majorTickStep: 1,
                minorTicks: false
            });
            for (var i = 0; i < data.length; i++) {
                var s = data[i].name;
                var tooltip = data[i].name + " [" + data[i].count + "]";
                var d1 = [{x: 0, y: data[i].count, tooltip: tooltip}];
                chart.addSeries(s, d1);
            }
            chart.addPlot("default", {type: StackedAreas, lines: true, areas: true, markers: false});
            new Tooltip(chart, "default");
            //new Highlight(chart, "default");
            chart.render();

            if (this.legend === undefined) {
                this.legend = new Legend({chart: chart}, this.legendNode);
            } else {
                this.legend.set("chart", chart);
                this.legend.refresh();
            }

            /*this.connect(this._chartContainer1, "resize", function (dims) {
             var width = dims.w;
             var height = dims.h;
             this._chart.resize(width, height);
             });*/
        },
        _getFiveDayForecast: function () {
            var id = this.content.id;
            var url = "http://api.openweathermap.org/data/2.5/forecast?id=" + id;
            var list;
            return ct_when(ct_request({
                url: url,
                timeout: 10000
            }), function (response) {
                debugger
                list = response.list;
                return list;
            }, this);
        },
        resize: function (dim) {
            if (dim && dim.h > 0) {
                this._containerNode.resize({
                    w: dim.w,
                    h: dim.h// - this.getHeadingHeight()
                });
            }
        }
    });
});