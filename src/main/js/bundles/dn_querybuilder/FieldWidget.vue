<template>
    <v-slide-y-transition>
        <v-card raised class="mb-2">
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
                        <v-select v-bind:items="fieldQuery.fields"
                                  v-model="fieldQuery.selectedFieldId"
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
                                v-bind:items="$root.getRelationalOperators($root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId))"
                                v-bind:disabled="fieldQuery.disableRelationalOperator"
                                v-model="fieldQuery.relationalOperator"
                                class="pa-0"
                                single-line
                                hide-details
                        ></v-select>
                    </v-flex>
                    <v-flex xs8 md3 v-bind:class="{ xs12: $root.editable, md5: $root.editable }">
                        <v-menu
                                v-if="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId) && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).type === 'date'"
                                v-bind:close-on-content-click="false"
                                transition="scale-transition"
                                offset-y
                                full-width
                                max-width="290px"
                                min-width="290px">
                            <v-text-field
                                    slot="activator"
                                    v-bind:disabled="fieldQuery.disableValue"
                                    v-model="fieldQuery.value"
                                    required
                                    class="pa-0"
                                    hide-details
                                    readonly
                                    v-bind:placeholder="i18n.enterValue"
                            ></v-text-field>
                            <v-date-picker v-model="fieldQuery.value" no-title scrollable>
                                <v-spacer></v-spacer>
                                <v-btn flat color="primary" @click="menu = false">Cancel</v-btn>
                                <v-btn flat color="primary" @click="$refs.menu.save(date)">OK</v-btn>
                            </v-date-picker>
                        </v-menu>
                        <v-select
                                v-else-if="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId) && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).type === 'boolean'"
                                v-bind:items="$root.getBooleanItems"
                                v-bind:disabled="fieldQuery.disableValue"
                                v-model="fieldQuery.value"
                                class="pa-0"
                                single-line
                                hide-details
                        ></v-select>
                        <v-select
                                v-else-if="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId) && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).codedValues.length > 0"
                                v-bind:items="$root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId) && $root.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId).codedValues"
                                v-bind:disabled="fieldQuery.disableValue"
                                v-model="fieldQuery.value"
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
                                required
                                class="pa-0"
                                hide-details
                                clearable
                                v-bind:placeholder="i18n.enterValue"
                        ></v-text-field>
                        <v-text-field v-else
                                      v-model="fieldQuery.value"
                                      v-bind:disabled="fieldQuery.disableValue"
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