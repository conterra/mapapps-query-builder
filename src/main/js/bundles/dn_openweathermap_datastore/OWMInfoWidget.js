define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/OWMInfoWidget.html",
    "dojo/_base/lang",
    "dojo/dom-attr",
    "contentviewer/GridContent",
    "ct/_when",
    "ct/request"
], function (
        declare,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        templateStringContent,
        d_lang,
        domAttr,
        GridContent,
        ct_when,
        ct_request
        ) {
    return declare([_WidgetBase, _TemplatedMixin,
        _WidgetsInTemplateMixin], {
        templateString: templateStringContent,
        constructor: function (args) {
            this.inherited(arguments);
            var i18n = this._i18n = args.i18n;
            var content = this._content = args.content;
            this._context = args.context
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
            this._getFiveDayForecast();
        },
        _getFiveDayForecast: function () {
            var id = this.content.id;
            var url = "http://api.openweathermap.org/data/2.5/forecast?id=" + id;

            return ct_when(ct_request({
                url: url,
                timeout: 10000
            }), function (response) {
                var list = response.list;
                //debugger
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