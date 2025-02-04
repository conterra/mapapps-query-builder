<!--

    Copyright (C) 2025 con terra GmbH (info@conterra.de)

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
        <div
            v-if="!fieldQuery.disableField || !fieldQuery.disableRelationalOperator || !fieldQuery.disableValue"
            class="mb-2"
        >
            <fieldset>
                <legend class="visually-hidden">
                    {{ i18n.conditionFieldsetLegend }}
                </legend>
                <v-container
                    fluid
                    grid-list-md
                    class="pa-1"
                >
                    <v-layout
                        row
                        wrap
                        pt-3
                        align-start
                    >
                        <v-flex
                            xs7
                            md4
                        >
                            <!-- This label is correctly defined but the rule triggers a false positive -->
                            <!--eslint-disable-next-line vuejs-accessibility/label-has-for -->
                            <label
                                v-if="fieldQuery.label"
                                :for="'fieldQueryLabel' + index"
                                class="visually-hidden"
                            >{{ i18n.conditionFieldNameLabel }}</label>
                            <v-text-field
                                v-if="fieldQuery.label"
                                :id="'fieldQueryLabel' + index"
                                :value="fieldQuery.label"
                                class="pa-0 ma-0"
                                disabled
                                single-line
                                hide-details
                            />
                            <label
                                v-if="!fieldQuery.label"
                                :for="'selectedFieldId' + index"
                                class="visually-hidden"
                            >{{ i18n.conditionFieldNameLabel }}</label>
                            <v-select
                                v-if="!fieldQuery.label"
                                :id="'selectedFieldId' + index"
                                ref="selectedFieldIdSelect"
                                v-model="fieldQuery.selectedFieldId"
                                :items="fieldQuery.fields"
                                :disabled="fieldQuery.disableField"
                                class="pa-0 ma-0"
                                item-value="id"
                                item-text="title"
                                single-line
                                hide-details
                                @change="fieldChanged($event, fieldQuery)"
                            >
                                <template
                                    slot="selection"
                                    slot-scope="data"
                                >
                                    <div v-if="showFieldInfos">
                                        {{ data.item.title }} {{ data.item.infos }}
                                    </div>
                                    <div v-else>
                                        {{ data.item.title }}
                                    </div>
                                </template>
                                <template
                                    slot="item"
                                    slot-scope="data"
                                >
                                    <div v-if="showFieldInfos">
                                        {{ data.item.title }} {{ data.item.infos }}
                                    </div>
                                    <div v-else>
                                        {{ data.item.title }}
                                    </div>
                                </template>
                            </v-select>
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
                                :aria-label="relationalOperatorAriaLabel"
                                @change="relationalOperatorChanged($event, fieldQuery)"
                            />
                        </v-flex>
                        <v-flex
                            :class="{ xs12: $root.editable || $root.fieldQueries.length < 2, md5: $root.editable
                                || $root.fieldQueries.length < 2}"
                            xs10
                            md4
                        >
                            <v-menu
                                v-if="selectedField && selectedField.type === 'date'
                                    && fieldQuery.relationalOperator !== '$exists'"
                                ref="dateMenu"
                                :close-on-content-click="false"
                                transition="scale-transition"
                                lazy
                                offset-y
                                full-width
                                max-width="290px"
                                min-width="290px"
                            >
                                <template #activator="{ on }">
                                    <v-text-field
                                        v-model="dateString"
                                        :disabled="fieldQuery.disableValue"
                                        :placeholder="i18n.enterValue"
                                        class="pa-0 ma-0"
                                        required
                                        hide-details
                                        :aria-label="i18n.enterValue"
                                        readonly
                                        v-on="on"
                                    />
                                </template>
                                <v-date-picker
                                    v-model="dateString"
                                    color="primary"
                                    :locale="locale"
                                    full-width
                                    scrollable
                                />
                            </v-menu>
                            <v-select
                                v-else-if="selectedField && selectedField.type === 'boolean'
                                    || fieldQuery.relationalOperator === '$exists'"
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
                                :multiple="fieldQuery.relationalOperator==='$in'"
                            />
                            <v-combobox
                                v-else-if="selectedField && enableDistinctValues && selectedField.type === 'number'"
                                ref="valueNumberDistinctValuesCombobox"
                                v-model="fieldQuery.value"
                                :items="selectedField.distinctValues"
                                :disabled="fieldQuery.disableValue"
                                :rules="[rules.required, rules.number]"
                                :loading="selectedField.loading"
                                :placeholder="i18n.enterValue"
                                class="pa-0 ma-0"
                                required
                                single-line
                                hide-no-data
                                clearable
                                :search-input.sync="search"
                                :multiple="fieldQuery.relationalOperator==='$in'"
                            />
                            <v-combobox
                                v-else-if="selectedField && enableDistinctValues && (selectedField.type === 'string'
                                    || selectedField.type === 'guid' || selectedField.type === 'global-id')"
                                ref="valueStringDistinctValuesCombobox"
                                v-model="fieldQuery.value"
                                :items="selectedField.distinctValues"
                                :disabled="fieldQuery.disableValue"
                                :rules="[rules.required]"
                                :loading="selectedField.loading"
                                :placeholder="i18n.enterValue"
                                class="pa-0 ma-0"
                                required
                                single-line
                                hide-no-data
                                clearable
                                :search-input.sync="search"
                                :multiple="fieldQuery.relationalOperator==='$in'"
                            />
                            <v-text-field
                                v-else-if="selectedField && selectedField.type === 'number'"
                                v-model="fieldQuery.value"
                                :disabled="fieldQuery.disableValue"
                                :rules="[rules.required]"
                                :loading="selectedField.loading"
                                :placeholder="i18n.enterValue"
                                :aria-label="i18n.enterValue"
                                type="number"
                                class="pa-0 ma-0"
                                required
                                clearable
                            />
                            <v-text-field
                                v-else
                                v-model="fieldQuery.value"
                                :disabled="fieldQuery.disableValue"
                                :loading="selectedField.loading"
                                :placeholder="i18n.enterValue"
                                :aria-label="i18n.enterValue"
                                :rules="[rules.required]"
                                class="pa-0 ma-0"
                                required
                                clearable
                            />
                        </v-flex>
                        <v-flex
                            v-if="!$root.editable"
                            xs2
                            md1
                        >
                            <v-fab-transition>
                                <v-tooltip
                                    right
                                    bottom
                                >
                                    <template #activator="{ on }">
                                        <v-btn
                                            v-if="$root.fieldQueries.length > 1"
                                            :disabled="$root.editable"
                                            :aria-label="i18n.aria.remove"
                                            class="ma-0"
                                            icon
                                            small
                                            v-on="on"
                                            @click="$emit('remove', fieldQuery)"
                                        >
                                            <v-icon>delete</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>{{ i18n.removeQuery }}</span>
                                </v-tooltip>
                            </v-fab-transition>
                        </v-flex>
                    </v-layout>
                </v-container>
            </fieldset>
        </div>
    </v-scroll-y-transition>
</template>
<script>
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
            activeTool: {
                type: Boolean,
                default: false
            },
            enableDistinctValues: {
                type: Boolean,
                default: true
            },
            showFieldInfos: {
                type: Boolean,
                default: false
            },
            operators: {
                type: Object,
                default: () => {
                    return {default:{default: []}};
                }
            }
        },
        data() {
            return {
                rules: {
                    required: (value) => !!value || this.i18n.rules.required,
                    number: (value) => (typeof Number.parseFloat(value) === "number"
                        && !isNaN(Number.parseFloat(value))) || this.i18n.rules.number,
                    string: (value) => typeof value === "string" || this.i18n.rules.string
                },
                search: ""
            };
        },
        computed: {
            selectedField() {
                return this.fieldQuery.fields.find((field) => field.id === this.fieldQuery.selectedFieldId);
            },
            dateString: {
                get: function () {
                    let dateObj;
                    if (this.fieldQuery.value) {
                        dateObj = new Date(this.fieldQuery.value);
                    } else {
                        dateObj = new Date();
                    }
                    if (!isNaN(dateObj.getTime())) {
                        return dateObj.toISOString().substr(0, 10);
                    } else {
                        return null;
                    }
                },
                set: function (value) {
                    this.fieldQuery.value = new Date(value);
                }
            },
            firstSelectAriaLabel() {
                return this.fieldQuery.selectedFieldId;
            },
            relationalOperatorAriaLabel() {
                const relOperators = this.getRelationalOperators(this.selectedField);
                const relOperator = relOperators?.find(ro => ro.value === this.fieldQuery.relationalOperator);
                const relOperatorText = relOperator?.text;
                const ariaLabel = this.i18n.aria.selectRelationalOperators;
                return relOperatorText ? ariaLabel + " " + relOperatorText : ariaLabel;
            }
        },
        watch: {
            search: function (value) {
                const selectedField = this.selectedField;
                this.getDistinctValues(value, selectedField);
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
        mounted() {
            this.focus();
        },
        methods: {
            focus: function () {
                // TODO: Focus should be possible via ref
                // const focusElement = this.$refs.selectedFieldIdSelect;
                // this.$nextTick(() => {
                //     setTimeout(() => {
                //         focusElement.$el.focus();
                //     },100)
                // });

                const index = this.index;
                const focusElement = document.getElementById("selectedFieldIdSelect" + index);
                this.$nextTick(() => {
                    focusElement?.focus();
                });
            },
            fieldChanged: function (selectedFieldId, fieldQuery) {
                const value = this.search;
                const selectedField = this.selectedField;
                this.getDistinctValues(value, selectedField);
                if (selectedField.type === "date") {
                    fieldQuery.value = new Date();
                } else {
                    fieldQuery.value = (selectedField.codedValues[0]
                        && selectedField.codedValues[0].code) || selectedField.distinctValues[0] || "";
                }
                fieldQuery.relationalOperator = this.getRelationalOperators(selectedField)[0].value;
                if (fieldQuery.relationalOperator === "$exists") {
                    fieldQuery.value = true;
                }
            },
            relationalOperatorChanged: function (relationalOperator, fieldQuery) {
                const selectedField = this.selectedField;
                if (relationalOperator === "$in") {
                    fieldQuery.value = [];
                } else if (fieldQuery.value === null || fieldQuery.value === "") { /* only if no value was selected*/
                    if (relationalOperator === "$exists") {
                        fieldQuery.value = true;
                    } else {
                        if (selectedField.type === "date") {
                            fieldQuery.value = new Date();
                        } else {
                            fieldQuery.value = (selectedField.codedValues[0]
                                && selectedField.codedValues[0].code) || selectedField.distinctValues[0] || "";
                        }
                    }
                }
            },
            getBooleanItems: function () {
                return [
                    {value: true, text: this.i18n.yes},
                    {value: false, text: this.i18n.no}
                ];
            },
            getRelationalOperators: function (field) {
                if (!field) {
                    return [];
                }
                let type = field.type;
                let operators = [];
                if (type === "guid" || type === "global-id"){
                    type = "string";
                }
                if(field.operatorClass && this.operators[field.operatorClass]){
                    operators = this.operators[field.operatorClass][type];
                }
                else{
                    operators = this.operators.default[type];
                }
                if(!operators){
                    operators = this.operators.default.default;
                }
                return operators;

            },
            getDistinctValues(value, selectedField) {
                this.$root.$emit("getDistinctValues", {value, selectedField});
            }
        }
    };
</script>
