define({
    root:
            {
                bundleName: "Query Builder Config",
                bundleDescription: "Configuration bundle for FilterQuery",
                windowTitle: "Query Builder Config",
                description: "Settings for the Query Builder bundle",
                widget: {
                    window: {
                        title: "Name",
                        removeTool: "Remove custom query tool",
                        addTool: "Add new custom query tool"
                    },
                    wizard: {
                        windowtitle: "Custom Query Tool",
                        windowtitleAdd: "Add Custom Query Tool",
                        windowtitleEdit: "Edit Custom Query Tool",
                        title: "Title",
                        builder: "Builder",
                        manual: "Manual",
                        iconClass: "Icon Class",
                        iconClassHelp: "Icon Class Help",
                        complexQueryHelp: "Complex Query Help",
                        customQuery: "Custom Query:",
                        queryDefinition: "Query definiton:",
                        useExtent: "Limited to current extent:",
                        addField: "Add Field",
                        storeId: "Store",
                        cancel: "Cancel",
                        done: "Done",
                        typeInTitle: "type in title",
                        match1: "Get features that match ",
                        match2: " of the following expressions",
                        all: "all",
                        any: "any",
                        yes: "yes",
                        no: "no",
                        fields: {
                            typeInValue: "type in value",
                            is: "is",
                            is_not: "is not",
                            contains: "contains",
                            contains_not: "does not contain",
                            starts_with: "starts with",
                            ends_with: "ends with",
                            is_greater_than: "is greater than",
                            is_greater_or_equal: "is greater or equal",
                            is_less_than: "is less than",
                            is_less_or_equal: "is less or equal",
                            before: "before",
                            after: "after"
                        }
                    },
                    grid: {
                        removeTool: "Remove custom query tool",
                        addTool: "Add new custom query tool",
                        title: "Title",
                        dataView: {
                            DGRID: {
                                noDataMessage: "No custom query tool(s) found..."
                            },
                            pager: {
                                pageSizeLabelText: "Custom query tools ${pageStartItemNumber}-${pageEndItemNumber} of ${itemCount}"
                            }
                        }
                    }
                }
            },
    de: true
});