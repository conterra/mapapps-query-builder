/*
 * Copyright (C) 2023 con terra GmbH (info@conterra.de)
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
// eslint-disable-next-line no-undef
testConfig({
    jsregistry: [{
        //root: "url to registry..",
        packages: [
            // register all self hosted packages
            "*"
        ]}
        //uncomment, if project runs in remote mode
        // ,{
        //     root: "@@mapapps.remote.base@@/resources/jsregistry/root",
        //     packages: [
        //         "apprt-polyfill",
        //         "apprt@4.x",
        //         "apprt-vue@4.x",
        //         "vuetify@~0.14.7",
        //         "esri@4.x"
        //     ]
        // }
    ],
    // ensure babel polyfill is loaded during test execution
    deps: [
        "apprt-polyfill",
        // Needed for import { assert } from "chai"
        "/js/tests/init-packs.js"
    ]
});
