define([
    "dojo/_base/declare",
    "./OWMInfoWidget"
], function (
        declare,
        OWMInfoWidget
        ) {
    return declare([], {
        createWidget: function (args) {
            var content = args.content;
            var context = args.context;
            var rule = args.rule;
            var i18n = this._i18n.get();
            var widget = new OWMInfoWidget({
                i18n: i18n,
                content: content,
                context: context
            });
            return widget;
        }
    });
});