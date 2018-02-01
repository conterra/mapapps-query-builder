<template>
    <div class="querybuilder">
        <div class="top">
            <v-container grid-list-md fluid>
                <v-layout row wrap justify-space-between>
                    <v-flex md4>
                        <div>
                            <div>{{i18n.selectStore}}</div>
                            <v-select
                                    v-bind:items="storeData"
                                    v-bind:disabled="editable"
                                    v-bind:loading="loading"
                                    v-model="selectedStoreId"
                                    item-value="id"
                                    @change="$emit('storeChanged', $event)"
                            ></v-select>
                        </div>
                    </v-flex>
                    <v-flex md4>
                        <div>
                            <div>{{i18n.spatialRelation}}</div>
                            <v-radio-group
                                    class="pt-0" v-model="spatialRelation">
                                <v-radio hide-details v-bind:label="i18n.everywhere"
                                         v-bind:disabled="disableSpatialRelationRadio"
                                         value="everywhere"></v-radio>
                                <v-radio hide-details v-bind:label="i18n.currentExtent"
                                         v-bind:disabled="disableSpatialRelationRadio"
                                         value="current_extent"></v-radio>
                            </v-radio-group>
                        </div>
                    </v-flex>
                    <v-flex md4>
                        <v-slide-x-transition>
                            <div v-if="fieldQueries.length > 1">
                                <div>{{i18n.linkOperator}}</div>
                                <v-radio-group class="pt-0" v-model="linkOperator">
                                    <v-radio hide-details v-bind:label="i18n.and"
                                             v-bind:disabled="disableLinkOperatorRadio"
                                             value="$and"></v-radio>
                                    <v-radio hide-details v-bind:label="i18n.or"
                                             v-bind:disabled="disableLinkOperatorRadio"
                                             value="$or"></v-radio>
                                </v-radio-group>
                            </div>
                        </v-slide-x-transition>
                    </v-flex>
                    <v-flex md12>
                        <div>{{i18n.searchParameter}}</div>
                    </v-flex>
                </v-layout>
            </v-container>
        </div>
        <div class="center">
            <v-container grid-list-md fluid class="pt-0">
                <field-widget v-for="(fieldQuery, index) in fieldQueries"
                              v-bind:key="index" v-bind:fieldQuery="fieldQuery" v-bind:index="index"
                              v-bind:allowNegation="enableNegation"
                              v-bind:i18n="i18n"/>
            </v-container>
        </div>
        <div class="bottom">
            <v-container grid-list-md fluid>
                <v-layout row wrap justify-center>
                    <v-flex md12>
                        <v-card class="elevation-6">
                            <v-tooltip top>
                                <v-btn block ripple color="primary" slot="activator" @click="$emit('search', {})">
                                    <v-icon left>search</v-icon>
                                    {{i18n.search}}
                                </v-btn>
                                <span>{{i18n.search}}</span>
                            </v-tooltip>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>
        </div>
    </div>
</template>
<script>
    import Bindable from "apprt-vue/mixins/Bindable";
    import ct_array from "ct/array";

    import FieldWidget from "./FieldWidget.vue";

    export default {
        mixins: [Bindable],
        data: function () {
            return {
                i18n: {
                    type: Object,
                    default: function () {
                        return {
                            selectStore: "What do you want to search?",
                            spatialRelation: "Where do you want to search?",
                            linkOperator: "How to link?",
                            everywhere: "everywhere",
                            currentExtent: "current extent",
                            delete: "Delete",
                            search: "Search",
                            searchParameter: "Search parameter",
                            negated: "negated",
                            typeInValue: "type in value",
                            yes: "yes",
                            no: "no",
                            and: "and",
                            or: "or",
                            relationalOperators: {
                                is: "is",
                                eqw: "is (wildcard)",
                                suggest: "suggest",
                                contains: "contains",
                                contains_not: "does not contain",
                                starts_with: "starts with",
                                ends_with: "ends with",
                                is_greater_than: "is greater than",
                                is_greater_or_equal: "is greater or equal",
                                is_less_than: "is less than",
                                is_less_or_equal: "is less or equal",
                                before: "before",
                                after: "after",
                            },
                            rules: {
                                required: "required",
                                number: "value must be type of number",
                                string: "value must be type of string"
                            },
                            errors: {
                                noResultsError: "No results found for your query!"
                            }
                        }
                    }
                },
                storeData: [],
                editable: false,
                selectedStoreId: "",
                linkOperator: "$and",
                disableLinkOperatorRadio: false,
                spatialRelation: "everywhere",
                disableSpatialRelationRadio: false,
                fieldQueries: [],
                allowNegation: false,
                loading: false
            };
        },
        components: {
            "field-widget": FieldWidget
        },
        watch: {},
        methods: {
            fieldChanged: function (selectedFieldId, fieldQuery) {
                let selectedField = this.getSelectedField(fieldQuery.fields, selectedFieldId);
                fieldQuery.value = (selectedField.codedValues[0] && selectedField.codedValues[0].code) || selectedField.distinctValues[0] || "";
                fieldQuery.relationalOperator = "$eq";
            },
            getSelectedField: function (fields, selectedFieldId) {
                return ct_array.arraySearchFirst(fields, {id: selectedFieldId});
            },
            getBooleanItems: function () {
                return [
                    {value: false, text: "false"},
                    {value: true, text: "true"}
                ]
            },
            getRelationalOperators: function (field) {
                if (!field) {
                    return [];
                }
                let type = field.type;
                switch (type) {
                    case "codedvalue":
                        return [
                            {value: "$eq", text: this.$data.i18n.relationalOperators.is},
                            {value: "$gt", text: this.$data.i18n.relationalOperators.is_greater_than},
                            {value: "$gte", text: this.$data.i18n.relationalOperators.is_greater_or_equal},
                            {value: "$lt", text: this.$data.i18n.relationalOperators.is_less_than},
                            {value: "$lte", text: this.$data.i18n.relationalOperators.is_less_or_equal}
                        ];
                    case "boolean":
                        return [
                            {value: "$eq", text: this.$data.i18n.relationalOperators.is}
                        ];
                    case "string":
                        return [
                            {value: "$eq", text: this.$data.i18n.relationalOperators.is},
                            {value: "$eqw", text: this.$data.i18n.relationalOperators.eqw},
                            {value: "$suggest", text: this.$data.i18n.relationalOperators.suggest}
                        ];
                    case "number":
                        return [
                            {value: "$eq", text: this.$data.i18n.relationalOperators.is},
                            {value: "$gt", text: this.$data.i18n.relationalOperators.is_greater_than},
                            {value: "$gte", text: this.$data.i18n.relationalOperators.is_greater_or_equal},
                            {value: "$lt", text: this.$data.i18n.relationalOperators.is_less_than},
                            {value: "$lte", text: this.$data.i18n.relationalOperators.is_less_or_equal}
                        ];
                    case "date":
                        return [
                            {value: "$lte", text: this.$data.i18n.relationalOperators.before},
                            {value: "$gte", text: this.$data.i18n.relationalOperators.after}
                        ];
                }
            }
        }
    };
</script>