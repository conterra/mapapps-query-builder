<!--

    Copyright (C) 2021 con terra GmbH (info@conterra.de)

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

            http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

-->
<template>
    <v-scroll-y-transition hide-on-leave>
        <v-card
            v-if="!fieldQuery.disableNot || !fieldQuery.disableField || !fieldQuery.disableRelationalOperator || !fieldQuery.disableValue"
            raised
            class="mb-2"
        >
            <v-container
                v-if="fieldQuery.not"
                fluid
                grid-list-md
                class="pa-0 pl-2"
            >
                <v-chip
                    label
                    color="red"
                >
                    <v-icon left>
                        warning
                    </v-icon>
                    {{ i18n.negated }}
                </v-chip>
            </v-container>
            <v-container
                fluid
                grid-list-md
                class="pa-1 pl-2"
            >
                <v-layout
                    row
                    wrap
                    align-center
                >
                    <v-flex
                        v-if="allowNegation"
                        xs2
                        md1
                    >
                        <v-switch
                            v-model="fieldQuery.not"
                            :value="fieldQuery.not"
                            :disabled="fieldQuery.disableNot"
                            class="pa-0 ma-0"
                            color="red"
                            hide-details
                        />
                    </v-flex>
                    <v-flex
                        :class="{ xs7: !allowNegation, md4: !allowNegation }"
                        xs5
                        md3
                    >
                        <v-select
                            ref="selectedFieldIdSelect"
                            v-model="fieldQuery.selectedFieldId"
                            :items="fieldQuery.fields"
                            :disabled="fieldQuery.disableField"
                            class="pa-0 ma-0"
                            item-value="id"
                            single-line
                            hide-details
                            @change="fieldChanged($event, fieldQuery)"
                        />
                    </v-flex>
                    <v-flex
                        xs5
                        md3
                    >
                        <v-select
                            ref="relationalOperatorSelect"
                            v-model="fieldQuery.relationalOperator"
                            :items="getRelationalOperators(selectedField)"
                            :disabled="fieldQuery.disableRelationalOperator"
                            class="pa-0 ma-0"
                            single-line
                            hide-details
                            @change="relationalOperatorChanged($event, fieldQuery)"
                        />
                    </v-flex>
                    <v-flex
                        :class="{ xs12: $root.editable, md5: $root.editable }"
                        xs8
                        md3
                    >
                        <v-menu
                            v-if="selectedField && selectedField.type === 'date' && fieldQuery.relationalOperator !== '$exists'"
                            ref="dateMenu"
                            :close-on-content-click="false"
                            transition="scale-transition"
                            lazy
                            offset-y
                            full-width
                            max-width="290px"
                            min-width="290px"
                        >
                            <template v-slot:activator="{ on }">
                                <v-text-field
                                    v-model="dateString"
                                    :disabled="fieldQuery.disableValue"
                                    :placeholder="i18n.enterValue"
                                    class="pa-0 ma-0"
                                    required
                                    hide-details
                                    readonly
                                    v-on="on"
                                />
                            </template>
                            <v-date-picker
                                v-model="dateString"
                                :locale="locale"
                                full-width
                                scrollable
                            />
                        </v-menu>
                        <v-select
                            v-else-if="selectedField && selectedField.type === 'boolean' || fieldQuery.relationalOperator === '$exists'"
                            ref="valueBooleanSelect"
                            v-model="fieldQuery.value"
                            :items="getBooleanItems()"
                            :disabled="fieldQuery.disableValue"
                            class="pa-0 ma-0"
                            single-line
                            hide-details
                        />
                        <v-select
                            v-else-if="selectedField && selectedField.codedValues.length > 0"
                            ref="valueCodedValueSelect"
                            v-model="fieldQuery.value"
                            :items="selectedField && selectedField.codedValues"
                            :disabled="fieldQuery.disableValue"
                            class="pa-0 ma-0"
                            item-value="code"
                            item-text="name"
                            single-line
                            hide-details
                        />
                        <v-combobox
                            v-else-if="selectedField && enableDistinctValues && selectedField.type === 'number'"
                            v-model="fieldQuery.value"
                            ref="valueNumberDistinctValuesCombobox"
                            :items="selectedField.distinctValues"
                            :disabled="fieldQuery.disableValue"
                            :rules="[rules.required, rules.number]"
                            :loading="selectedField.loading"
                            :placeholder="i18n.enterValue"
                            class="pa-0 ma-0"
                            required
                            single-line
                            hide-details
                            hide-no-data
                            clearable
                            :search-input.sync="search"
                        />
                        <v-combobox
                            v-else-if="selectedField && enableDistinctValues && selectedField.type === 'string'"
                            v-model="fieldQuery.value"
                            ref="valueStringDistinctValuesCombobox"
                            :items="selectedField.distinctValues"
                            :disabled="fieldQuery.disableValue"
                            :rules="[rules.required]"
                            :loading="selectedField.loading"
                            :placeholder="i18n.enterValue"
                            class="pa-0 ma-0"
                            required
                            single-line
                            hide-details
                            hide-no-data
                            clearable
                            :search-input.sync="search"
                        />
                        <v-text-field
                            v-else-if="selectedField && selectedField.type === 'number'"
                            v-model="fieldQuery.value"
                            :disabled="fieldQuery.disableValue"
                            :rules="[rules.required]"
                            :loading="selectedField.loading"
                            :placeholder="i18n.enterValue"
                            type="number"
                            class="pa-0 ma-0"
                            required
                            hide-details
                            clearable
                        />
                        <v-text-field
                            v-else
                            v-model="fieldQuery.value"
                            :disabled="fieldQuery.disableValue"
                            :loading="selectedField.loading"
                            :placeholder="i18n.enterValue"
                            :rules="[rules.required]"
                            class="pa-0 ma-0"
                            required
                            hide-details
                            clearable
                        />
                    </v-flex>
                    <v-flex
                        v-if="!$root.editable"
                        xs2
                        md1
                    >
                        <v-fab-transition>
                            <v-btn
                                v-if="$root.fieldQueries.length > 1"
                                :disabled="$root.editable"
                                class="ma-0"
                                icon
                                small
                                @click="$root.$emit('remove', fieldQuery)"
                            >
                                <v-icon>delete</v-icon>
                            </v-btn>
                        </v-fab-transition>
                    </v-flex>
                    <v-flex
                        v-if="!$root.editable"
                        xs2
                        md1
                    >
                        <v-fab-transition>
                            <v-btn
                                v-if="$root.fieldQueries.length === index + 1"
                                :disabled="$root.editable"
                                class="ma-0"
                                icon
                                small
                                @click="$root.$emit('add', {})"
                            >
                                <v-icon>add</v-icon>
                            </v-btn>
                        </v-fab-transition>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-card>
    </v-scroll-y-transition>
</template>
<script>
    import ct_array from "ct/array";

    export default {
        props: {
            i18n: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            locale: {
                type: String,
                default: "en"
            },
            fieldQuery: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            index: {
                type: Number,
                default: 0
            },
            allowNegation: {
                type: Boolean,
                default: false
            },
            activeTool: {
                type: Boolean,
                default: false
            },
            enableDistinctValues: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                dateString: this.getDateString(),
                rules: {
                    required: (value) => !!value || this.i18n.rules.required,
                    number: (value) => (typeof Number.parseFloat(value) === "number" && !isNaN(Number.parseFloat(value))) || this.i18n.rules.number,
                    string: (value) => typeof value === "string" || this.i18n.rules.string
                },
                search: ""
            }
        },
        computed: {
            selectedField() {
                return ct_array.arraySearchFirst(this.fieldQuery.fields, {id: this.fieldQuery.selectedFieldId});
            }
        },
        watch: {
            search: function (value) {
                const selectedField = this.selectedField;
                this.getDistinctValues(value, selectedField);
            },
            dateString: function (value) {
                this.fieldQuery.value = new Date(value);
            },
            activeTool: function (value) {
                if (!value) {
                    if (this.$refs.selectedFieldIdSelect) {
                        this.$refs.selectedFieldIdSelect.isMenuActive = false;
                    }
                    if (this.$refs.relationalOperatorSelect) {
                        this.$refs.relationalOperatorSelect.isMenuActive = false;
                    }
                    if (this.$refs.valueBooleanSelect) {
                        this.$refs.valueBooleanSelect.isMenuActive = false;
                    }
                    if (this.$refs.valueCodedValueSelect) {
                        this.$refs.valueCodedValueSelect.isMenuActive = false;
                    }
                    if (this.$refs.valueNumberDistinctValuesCombobox) {
                        this.$refs.valueNumberDistinctValuesCombobox.isMenuActive = false;
                    }
                    if (this.$refs.valueStringDistinctValuesCombobox) {
                        this.$refs.valueStringDistinctValuesCombobox.isMenuActive = false;
                    }
                }
            }
        },
        methods: {
            getDateString() {
                const dateObj = new Date(this.fieldQuery.value);
                if (!isNaN(dateObj.getTime())) {
                    const month = dateObj.getUTCMonth() + 1; //months from 1-12
                    const day = dateObj.getUTCDate();
                    const year = dateObj.getUTCFullYear();
                    return year + "-" + month + "-" + day;
                } else {
                    return null;
                }
            },
            fieldChanged: function (selectedFieldId, fieldQuery) {
                const selectedField = this.selectedField;
                if (selectedField.type === "date") {
                    fieldQuery.value = null;
                    fieldQuery.relationalOperator = "$lte";
                } else {
                    fieldQuery.value = (selectedField.codedValues[0]
                        && selectedField.codedValues[0].code) || selectedField.distinctValues[0] || "";
                    fieldQuery.relationalOperator = "$eq";
                }
                if (fieldQuery.relationalOperator === "$exists") {
                    fieldQuery.value = true;
                }
            },
            relationalOperatorChanged: function (relationalOperator, fieldQuery) {
                const selectedField = this.selectedField;
                if (relationalOperator === "$exists") {
                    fieldQuery.value = true;
                } else {
                    if (selectedField.type === "date") {
                        fieldQuery.value = "";
                    } else {
                        fieldQuery.value = (selectedField.codedValues[0]
                            && selectedField.codedValues[0].code) || selectedField.distinctValues[0] || "";
                    }
                }
            },
            getBooleanItems: function () {
                return [
                    {value: true, text: this.i18n.yes},
                    {value: false, text: this.i18n.no}
                ]
            },
            getRelationalOperators: function (field) {
                if (!field) {
                    return [];
                }
                const type = field.type;
                switch (type) {
                    case "codedvalue":
                        return [
                            {value: "$eq", text: this.i18n.relationalOperators.is},
                            {value: "$gt", text: this.i18n.relationalOperators.is_greater_than},
                            {value: "$gte", text: this.i18n.relationalOperators.is_greater_or_equal},
                            {value: "$lt", text: this.i18n.relationalOperators.is_less_than},
                            {value: "$lte", text: this.i18n.relationalOperators.is_less_or_equal},
                            {value: "$exists", text: this.i18n.relationalOperators.exists}
                        ];
                    case "boolean":
                        return [
                            {value: "$eq", text: this.i18n.relationalOperators.is},
                            {value: "$exists", text: this.i18n.relationalOperators.exists}
                        ];
                    case "string":
                        return [
                            {value: "$eq", text: this.i18n.relationalOperators.is},
                            {value: "$eqw", text: this.i18n.relationalOperators.eqw},
                            {value: "$suggest", text: this.i18n.relationalOperators.suggest},
                            {value: "$exists", text: this.i18n.relationalOperators.exists}
                        ];
                    case "number":
                        return [
                            {value: "$eq", text: this.i18n.relationalOperators.is},
                            {value: "$gt", text: this.i18n.relationalOperators.is_greater_than},
                            {value: "$gte", text: this.i18n.relationalOperators.is_greater_or_equal},
                            {value: "$lt", text: this.i18n.relationalOperators.is_less_than},
                            {value: "$lte", text: this.i18n.relationalOperators.is_less_or_equal}
                        ];
                    case "date":
                        return [
                            {value: "$lte", text: this.i18n.relationalOperators.before},
                            {value: "$gte", text: this.i18n.relationalOperators.after},
                            {value: "$exists", text: this.i18n.relationalOperators.exists}
                        ];
                }
            },
            getDistinctValues(value, fieldQuery) {
                this.$root.$emit("getDistinctValues", {value, fieldQuery});
            }
        }
    }
</script>
