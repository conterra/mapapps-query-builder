/*
 * Copyright (C) 2019 con terra GmbH (info@conterra.de)
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
export default class AuthenticationPlaceholderProvider {

    getPlaceholder() {
        let placeholder = {};
        let userAdminService = this._userAdminService;
        let authentication = userAdminService.getAuthentication();
        if (authentication.getUser()) {
            placeholder["current_user_name"] = authentication.getUser().name;
        }
        return placeholder;
    }
}
