<template>
    <v-slide-y-transition>
        <v-card raised class="mb-2" v-if="!fieldQuery.disableNot || !fieldQuery.disableField || !fieldQuery.disableRelationalOperator || !fieldQuery.disableValue">
            <v-container fluid grid-list-md v-if="fieldQuery.not">
                <v-chip label color="red">
                    <v-icon left>warning</v-icon>
                    {{i18n.negated}}
                </v-chip>
            </v-container>
            <v-container fluid grid-list-md>
                <v-layout row wrap align-center>
                    <v-flex xs2 md1 v-if="allowNegation">
                        <v-switch
                            v-model="fieldQuery.not"
                            v-bind:value="fieldQuery.not"
                            v-bind:disabled="fieldQuery.disableNot"
                            color="red"
                            hide-details
                        ></v-switch>
                    </v-flex>
                    <v-flex xs5 md3 v-bind:class="{ xs7: !allowNegation, md4: !allowNegation }">
                        <v-select
                            v-model="fieldQuery.selectedFieldId"
                            v-bind:items="fieldQuery.fields"
                            v-bind:disabled="fieldQuery.disableField"
                            @change="$root.fieldChanged($event, fieldQuery)"
                            item-value="id"
                            class="pa-0"
                            single-line
                            hide-details
                        ></v-select>
                    </v-flex>
                    <v-flex xs5 md3>
                        <v-select
                            v-model="fieldQuery.relationalOperator"
                            v-bind:items="$root.getRelationalOperators($root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId))"
                            v-bind:disabled="fieldQuery.disableRelationalOperator"
                            @change="$root.relationalOperatorChanged($event, fieldQuery)"
                            class="pa-0"
                            single-line
                            hide-details
                        ></v-select>
                    </v-flex>
                    <v-flex xs8 md3 v-bind:class="{ xs12: $root.editable, md5: $root.editable }">
                        <v-menu
                            v-if="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId) && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).type === 'date' && fieldQuery.relationalOperator !== '$exists'"
                            v-bind:close-on-content-click="false"
                            transition="scale-transition"
                            lazy
                            offset-y
                            full-width
                            max-width="300px"
                            min-width="300px">
                            <v-text-field
                                slot="activator"
                                v-model="fieldQuery.value"
                                v-bind:disabled="fieldQuery.disableValue"
                                required
                                class="pa-0"
                                hide-details
                                readonly
                                v-bind:placeholder="i18n.enterValue"
                            ></v-text-field>
                            <v-date-picker v-model="fieldQuery.value" no-title scrollable></v-date-picker>
                        </v-menu>
                        <v-select
                            v-else-if="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId) && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).type === 'boolean' || fieldQuery.relationalOperator === '$exists'"
                            v-model="fieldQuery.value"
                            v-bind:items="$root.getBooleanItems()"
                            v-bind:disabled="fieldQuery.disableValue"
                            class="pa-0"
                            single-line
                            hide-details
                        ></v-select>
                        <v-select
                            v-else-if="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId) && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).codedValues.length > 0"
                            v-model="fieldQuery.value"
                            v-bind:items="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId) && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).codedValues"
                            v-bind:disabled="fieldQuery.disableValue"
                            key="select"
                            item-value="code"
                            item-text="name"
                            class="pa-0"
                            single-line
                            hide-details
                        ></v-select>
                        <v-select
                            v-else-if="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId) && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).distinctValues.length > 0 && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).type === 'number'"
                            v-bind:items="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId) && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).distinctValues"
                            v-bind:disabled="fieldQuery.disableValue"
                            v-model="fieldQuery.value"
                            v-bind:rules="[rules.required, rules.number]"
                            v-bind:loading="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).loading"
                            required
                            key="combobox"
                            class="pa-0"
                            combobox
                            single-line
                            hide-details
                            clearable
                            v-bind:placeholder="i18n.enterValue"
                        ></v-select>
                        <v-select
                            v-else-if="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId) && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).distinctValues.length > 0 && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).type === 'string'"
                            v-bind:items="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId) && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).distinctValues"
                            v-bind:disabled="fieldQuery.disableValue"
                            v-model="fieldQuery.value"
                            v-bind:rules="[rules.required]"
                            v-bind:loading="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).loading"
                            required
                            key="combobox"
                            class="pa-0"
                            combobox
                            single-line
                            hide-details
                            clearable
                            v-bind:placeholder="i18n.enterValue"
                        ></v-select>
                        <v-text-field
                            v-else-if="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).type === 'number'"
                            v-model="fieldQuery.value"
                            v-bind:disabled="fieldQuery.disableValue"
                            v-bind:rules="[rules.required, rules.number]"
                            v-bind:loading="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).loading"
                            required
                            class="pa-0"
                            hide-details
                            clearable
                            v-bind:placeholder="i18n.enterValue"
                        ></v-text-field>
                        <v-text-field
                            v-else
                            v-model="fieldQuery.value"
                            v-bind:disabled="fieldQuery.disableValue"
                            v-bind:loading="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).loading"
                            required
                            v-bind:rules="[rules.required]"
                            class="pa-0"
                            hide-details
                            clearable
                            v-bind:placeholder="i18n.enterValue"
                        ></v-text-field>
                    </v-flex>
                    <v-flex xs2 md1 v-if="!$root.editable">
                        <v-fab-transition>
                            <v-btn v-if="$root.fieldQueries.length > 1" icon
                                   v-bind:disabled="$root.editable"
                                   @click="$root.$emit('remove', fieldQuery)">
                                <v-icon>delete</v-icon>
                            </v-btn>
                        </v-fab-transition>
                    </v-flex>
                    <v-flex xs2 md1 v-if="!$root.editable">
                        <v-fab-transition>
                            <v-btn v-if="$root.fieldQueries.length === index + 1" icon
                                   v-bind:disabled="$root.editable"
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
        props: [
            "i18n",
            "fieldQuery",
            "index",
            "allowNegation"
        ],
        data() {
            return {
                rules: {
                    required: (value) => !!value || this.i18n.rules.required,
                    number: (value) => {
                        return (typeof Number.parseFloat(value) === "number" && !isNaN(Number.parseFloat(value))) || this.i18n.rules.number;
                    },
                    string: (value) => {
                        return typeof value === "string" || this.i18n.rules.string;
                    }
                }
            }
        }
    }
</script>
