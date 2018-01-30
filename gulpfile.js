/*
 * Copyright (C) 2018 con terra GmbH (info@conterra.de)
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
const gulp = require("gulp");
const run_sequence = require('run-sequence');
const mapapps = require('ct-mapapps-gulp-js');

mapapps.registerTasks({
    themes: [/*sample_theme*/],
    hasVuetify: true,
    hasBaseThemes: true,
    forceTranspile: true/*,
    themeChangeTargets:{
        "vuetify":[
            "sample_theme"
        ]
    }*/
});

gulp.task("default", function(callback) {
    run_sequence(
            "copy-resources",
            "themes-copy",
            ["js-transpile", "themes-compile"],
            callback);
});