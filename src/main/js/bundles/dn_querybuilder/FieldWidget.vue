<template>
    <v-slide-y-transition>
        <v-card
            v-if="!fieldQuery.disableNot || !fieldQuery.disableField || !fieldQuery.disableRelationalOperator || !fieldQuery.disableValue"
            raised
            class="mb-2">
            <v-container
                v-if="fieldQuery.not"
                fluid
                grid-list-md
                class="pa-0 pl-2">
                <v-chip
                    label
                    color="red">
                    <v-icon left>warning</v-icon>
                    {{ i18n.negated }}
                </v-chip>
            </v-container>
            <v-container
                fluid
                grid-list-md
                class="pa-1 pl-2">
                <v-layout
                    row
                    wrap
                    align-center>
                    <v-flex
                        v-if="allowNegation"
                        xs2
                        md1>
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
                        md3>
                        <v-select
                            v-model="fieldQuery.selectedFieldId"
                            :items="fieldQuery.fields"
                            :disabled="fieldQuery.disableField"
                            class="pa-0"
                            item-value="id"
                            single-line
                            hide-details
                            @change="$root.fieldChanged($event, fieldQuery)"
                            ref="selectedFieldIdSelect"
                        />
                    </v-flex>
                    <v-flex
                        xs5
                        md3>
                        <v-select
                            v-model="fieldQuery.relationalOperator"
                            :items="$root.getRelationalOperators($root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId))"
                            :disabled="fieldQuery.disableRelationalOperator"
                            class="pa-0"
                            single-line
                            hide-details
                            @change="$root.relationalOperatorChanged($event, fieldQuery)"
                            ref="relationalOperatorSelect"
                        />
                    </v-flex>
                    <v-flex
                        :class="{ xs12: $root.editable, md5: $root.editable }"
                        xs8
                        md3>
                        <v-menu
                            ref="dateMenu"
                            v-if="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId) && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).type === 'date' && fieldQuery.relationalOperator !== '$exists'"
                            :close-on-content-click="false"
                            transition="scale-transition"
                            lazy
                            offset-y
                            full-width
                            max-width="290px"
                            min-width="290px">
                            <template v-slot:activator="{ on }">
                                <v-text-field
                                    v-model="fieldQuery.value"
                                    :disabled="fieldQuery.disableValue"
                                    :placeholder="i18n.enterValue"
                                    class="pa-0"
                                    required
                                    hide-details
                                    readonly
                                    v-on="on"
                                />
                            </template>
                            <v-date-picker
                                v-model="fieldQuery.value"
                                :locale="locale"
                                full-width
                                scrollable/>
                        </v-menu>
                        <v-select
                            v-else-if="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId) && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).type === 'boolean' || fieldQuery.relationalOperator === '$exists'"
                            v-model="fieldQuery.value"
                            :items="$root.getBooleanItems()"
                            :disabled="fieldQuery.disableValue"
                            class="pa-0"
                            single-line
                            hide-details
                            ref="valueBooleanSelect"
                        />
                        <v-select
                            v-else-if="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId) && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).codedValues.length > 0"
                            v-model="fieldQuery.value"
                            :items="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId) && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).codedValues"
                            :disabled="fieldQuery.disableValue"
                            class="pa-0"
                            item-value="code"
                            item-text="name"
                            single-line
                            hide-details
                            ref="valueCodedValueSelect"
                        />
                        <v-combobox
                            v-else-if="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId) && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).distinctValues.length > 0 && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).type === 'number'"
                            :items="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId) && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).distinctValues"
                            :disabled="fieldQuery.disableValue"
                            v-model="fieldQuery.value"
                            :rules="[rules.required, rules.number]"
                            :loading="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).loading"
                            :placeholder="i18n.enterValue"
                            @input.native="changeValue"
                            class="pa-0"
                            required
                            single-line
                            hide-details
                            clearable
                            ref="valueNumberDistinctValuesCombobox"
                        />
                        <v-combobox
                            v-else-if="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId) && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).distinctValues.length > 0 && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).type === 'string'"
                            :items="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId) && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).distinctValues"
                            :disabled="fieldQuery.disableValue"
                            v-model="fieldQuery.value"
                            :rules="[rules.required]"
                            :loading="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).loading"
                            :placeholder="i18n.enterValue"
                            @input.native="changeValue"
                            class="pa-0"
                            required
                            single-line
                            hide-details
                            clearable
                            ref="valueStringDistinctValuesCombobox"
                        />
                        <v-text-field
                            v-else-if="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).type === 'number'"
                            v-model="fieldQuery.value"
                            :disabled="fieldQuery.disableValue"
                            :rules="[rules.required, rules.number]"
                            :loading="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).loading"
                            :placeholder="i18n.enterValue"
                            class="pa-0"
                            required
                            hide-details
                            clearable
                        />
                        <v-text-field
                            v-else
                            v-model="fieldQuery.value"
                            :disabled="fieldQuery.disableValue"
                            :loading="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).loading"
                            :placeholder="i18n.enterValue"
                            :rules="[rules.required]"
                            class="pa-0"
                            required
                            hide-details
                            clearable
                        />
                    </v-flex>
                    <v-flex
                        v-if="!$root.editable"
                        xs2
                        md1>
                        <v-fab-transition>
                            <v-btn
                                v-if="$root.fieldQueries.length > 1"
                                :disabled="$root.editable"
                                icon
                                @click="$root.$emit('remove', fieldQuery)">
                                <v-icon>delete</v-icon>
                            </v-btn>
                        </v-fab-transition>
                    </v-flex>
                    <v-flex
                        v-if="!$root.editable"
                        xs2
                        md1>
                        <v-fab-transition>
                            <v-btn
                                v-if="$root.fieldQueries.length === index + 1"
                                :disabled="$root.editable"
                                icon
                                @click="$root.$emit('add', {})">
                                <v-icon>add</v-icon>
                            </v-btn>
                        </v-fab-transition>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-card>
    </v-slide-y-transition>
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
            allowNegation: {
                type: Boolean,
                default: false
            },
            activeTool: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                rules: {
                    required: (value) => !!value || this.i18n.rules.required,
                    number: (value) => (typeof Number.parseFloat(value) === "number" && !isNaN(Number.parseFloat(value))) || this.i18n.rules.number,
                    string: (value) => typeof value === "string" || this.i18n.rules.string
                }
            }
        },
        watch: {
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
            changeValue: function (event) {
                this.fieldQuery.value = event.target.value;
            }
        }
    }
</script>
