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
import d_locale from "dojo/date/locale";

export default class DatePlaceholderProvider {

    getPlaceholder() {
        const dateObj = new Date();
        const dateString = d_locale.format(dateObj, {datePattern: "yyyy-MM-dd", selector: 'date'});
        const date = new Date();
        const timeString = d_locale.format(dateObj, {datePattern: "HH:mm:ss", selector: 'date'});
        const placeholder = {};
        placeholder["current_date"] = date;
        placeholder["current_date_string"] = dateString;
        placeholder["current_time_string"] = timeString;
        return placeholder;
    }

    reEvaluate() {
        return this.getPlaceholder();
    }

}
