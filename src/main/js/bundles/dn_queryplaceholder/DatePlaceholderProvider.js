/*
 * Copyright (C) 2017 con terra GmbH (info@conterra.de)
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

import d_locale from "dojo/date/locale";

class DatePlaceholderProvider {

    getPlaceholder() {
        let dateObj = new Date();
        let dateString = d_locale.format(dateObj, {datePattern: "yyyy-MM-dd", selector: 'date'});
        let date = new Date();
        let timeString = d_locale.format(dateObj, {datePattern: "HH:mm:ss", selector: 'date'});
        let placeholder = {};
        placeholder["current_date"] = date;
        placeholder["current_date_string"] = dateString;
        placeholder["current_time_string"] = timeString;
        return placeholder;
    }

    reEvaluate() {
        return this.getPlaceholder();
    }
}

module.exports = DatePlaceholderProvider;