testConfig({
    jsregistry: [{
            //root: "url to registry..",
            packages: [
                // register all self hosted packages
                "*"
            ]
        },
        {
            root: "@@mapapps.remote.base@@/resources/jsregistry/root",
            packages: [
                "apprt@3.x"
            ]
        }
    ]
});