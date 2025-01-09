/*
 * Copyright (C) 2025 con terra GmbH (info@conterra.de)
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
import { assert } from "chai";
import module from "module";
import QueryController from "../QueryController";
import Replacer from "dn_queryplaceholder/Replacer";

describe(module.id, function(){
    it("SearchReplacer", function () {
        const object = {"$or": [{"aeroway": {"$eq": "${current_app_name}"}}]};
        const queryController = new QueryController();
        const replacer = new Replacer();
        const namePlaceholderProcvider = {
            getPlaceholder() {
                const placeholder = {};
                const appName = "Peter";
                const appTitle = "Peters App";
                placeholder["current_app_name"] = appName;
                placeholder["current_app_title"] = appTitle;
                return placeholder;
            }
        };
        replacer.addPlaceholderProvider(namePlaceholderProcvider).then(() => {
            queryController._replacer = replacer;
            queryController.searchReplacer(object);
            assert.equal(object["$or"][0].aeroway["$eq"], "Peter", 'the replacement failed.');
        });
    });
});
