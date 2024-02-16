/*
 * Copyright (C) 2024 con terra GmbH (info@conterra.de)
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
import { Evented } from "apprt-core/Events";

class AuthenticationPlaceholderProvider extends Evented {

    getPlaceholder() {
        const placeholder = {};
        const userAdminService = this._userAdminService;
        const authentication = userAdminService.getAuthentication();
        if (authentication.getUser()) {
            placeholder["current_user_name"] = authentication.getUser().name;
        }
        return placeholder;
    }

    reEvaluate() {
        return this.getPlaceholder();
    }

    _onLoginTriggered() {
        this.emit('trigger-placeholder-refresh');
    }

}
export default AuthenticationPlaceholderProvider;
