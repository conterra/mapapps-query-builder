<template>
    <div class="ct-flex-container ct-flex-container--column fullHeight">
        <div class="header ct-flex-item ct-flex-item--no-grow ct-flex-item--no-shrink">
            <v-container
                grid-list-md
                fluid
                class="pa-1">
                <v-layout
                    row
                    wrap
                    justify-space-between>
                    <v-flex
                        v-if="editable && title"
                        xs12
                        md12>
                        <div>{{ title }}</div>
                    </v-flex>
                    <v-flex
                        v-if="showQuerySettings"
                        :class="{ xs4: !showSortSelectInUserMode, md4: !showSortSelectInUserMode }"
                        xs3
                        md3>
                        <div>
                            <div>{{ i18n.selectStore }}</div>
                            <v-select
                                :items="storeData"
                                :disabled="editable"
                                :loading="loading"
                                v-model="selectedStoreId"
                                item-value="id"
                                single-line
                                hide-details
                                @change="$emit('storeChanged', $event)"
                            />
                        </div>
                    </v-flex>
                    <v-flex
                        v-if="showQuerySettings"
                        :class="{ xs4: !showSortSelectInUserMode, md4: !showSortSelectInUserMode }"
                        xs3
                        md3>
                        <div>
                            <div>{{ i18n.spatialRelation }}</div>
                            <v-radio-group
                                v-model="spatialRelation"
                                class="pt-0">
                                <v-radio
                                    :label="i18n.everywhere"
                                    :disabled="disableSpatialRelationRadio"
                                    hide-details
                                    value="everywhere"
                                    color="success"/>
                                <v-radio
                                    :label="i18n.currentExtent"
                                    :disabled="disableSpatialRelationRadio"
                                    hide-details
                                    value="current_extent"
                                    color="success"/>
                            </v-radio-group>
                        </div>
                    </v-flex>
                    <v-flex
                        v-if="showQuerySettings && showSortSelectInUserMode"
                        :class="{ xs4: !showSortSelectInUserMode, md4: !showSortSelectInUserMode }"
                        xs3
                        md3>
                        <div>
                            <div>{{ i18n.sortOptions }}</div>
                            <v-select
                                v-model="selectedSortFieldName"
                                :items="fieldData"
                                :disabled="editable"
                                item-value="id"
                                single-line
                                hide-details
                            />
                        </div>
                    </v-flex>
                    <v-flex
                        v-if="showQuerySettings"
                        :class="{ xs4: !showSortSelectInUserMode, md4: !showSortSelectInUserMode }"
                        xs3
                        md3>
                        <v-slide-x-transition>
                            <div
                                v-if="fieldQueries.length > 1">
                                <div>{{ i18n.linkOperator }}</div>
                                <v-radio-group
                                    v-model="linkOperator"
                                    class="pt-0">
                                    <v-radio
                                        :label="i18n.and"
                                        :disabled="disableLinkOperatorRadio"
                                        hide-details
                                        value="$and"
                                        color="success"/>
                                    <v-radio
                                        :label="i18n.or"
                                        :disabled="disableLinkOperatorRadio"
                                        hide-details
                                        value="$or"
                                        color="success"/>
                                </v-radio-group>
                            </div>
                        </v-slide-x-transition>
                    </v-flex>
                    <v-flex
                        xs12
                        md12>
                        <div>{{ i18n.searchParameter }}</div>
                    </v-flex>
                </v-layout>
            </v-container>
        </div>
        <div class="center ct-flex-item overflowAuto">
            <v-container
                grid-list-md
                fluid
                class="pa-1">
                <field-widget
                    v-for="(fieldQuery, index) in fieldQueries"
                    :key="index"
                    :fieldQuery="fieldQuery"
                    :index="index"
                    :allowNegation="enableNegation"
                    :i18n="i18n"/>
            </v-container>
        </div>
        <div class="ct-flex-item ct-flex-item--no-grow ct-flex-item--no-shrink">
            <v-container
                grid-list-md
                fluid
                class="pa-1">
                <v-layout
                    row
                    wrap
                    justify-center>
                    <v-flex md12>
                        <v-card
                            class="elevation-6">
                            <v-btn
                                :loading="processing"
                                block
                                ripple
                                color="primary"
                                @click="$emit('search', {})">
                                <v-icon left>search</v-icon>
                                {{ i18n.search }}
                            </v-btn>
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
        components: {
            "field-widget": FieldWidget
        },
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
                            enterValue: "enter value",
                            relationalOperators: {
                                is: "is",
                                exists: "exists",
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
                                after: "after"
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
                fieldData: [],
                editable: false,
                selectedStoreId: "",
                selectedSortFieldName: "",
                title: null,
                showQuerySettings: true,
                linkOperator: "$and",
                disableLinkOperatorRadio: false,
                spatialRelation: "everywhere",
                disableSpatialRelationRadio: false,
                fieldQueries: [],
                allowNegation: false,
                loading: false,
                processing: false,
                showSortSelectInUserMode: false
            };
        },
        mounted: function () {
            this.$emit('startup');
        },
        methods: {
            fieldChanged: function (selectedFieldId, fieldQuery) {
                let selectedField = this.getSelectedField(fieldQuery.fields, selectedFieldId);
                if (selectedField.type === "date") {
                    fieldQuery.value = null;
                    fieldQuery.relationalOperator = "$lte";
                } else {
                    fieldQuery.value = (selectedField.codedValues[0] && selectedField.codedValues[0].code) || selectedField.distinctValues[0] || "";
                    fieldQuery.relationalOperator = "$eq";
                }
                if (fieldQuery.relationalOperator === "$exists") {
                    fieldQuery.value = true;
                }
            },
            relationalOperatorChanged: function (relationalOperator, fieldQuery) {
                let selectedField = this.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId);
                if (relationalOperator === "$exists") {
                    fieldQuery.value = true;
                } else {
                    if (selectedField.type === "date") {
                        fieldQuery.value = "";
                    } else {
                        fieldQuery.value = (selectedField.codedValues[0] && selectedField.codedValues[0].code) || selectedField.distinctValues[0] || "";
                    }
                }
            },
            getSelectedField: function (fields, selectedFieldId) {
                return ct_array.arraySearchFirst(fields, {id: selectedFieldId});
            },
            getBooleanItems: function () {
                return [
                    {value: true, text: this.$data.i18n.yes},
                    {value: false, text: this.$data.i18n.no}
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
                            {value: "$lte", text: this.$data.i18n.relationalOperators.is_less_or_equal},
                            {value: "$exists", text: this.$data.i18n.relationalOperators.exists}
                        ];
                    case "boolean":
                        return [
                            {value: "$eq", text: this.$data.i18n.relationalOperators.is},
                            {value: "$exists", text: this.$data.i18n.relationalOperators.exists}
                        ];
                    case "string":
                        return [
                            {value: "$eq", text: this.$data.i18n.relationalOperators.is},
                            {value: "$eqw", text: this.$data.i18n.relationalOperators.eqw},
                            {value: "$suggest", text: this.$data.i18n.relationalOperators.suggest},
                            {value: "$exists", text: this.$data.i18n.relationalOperators.exists}
                        ];
                    case "number":
                        return [
                            {value: "$eq", text: this.$data.i18n.relationalOperators.is},
                            {value: "$gt", text: this.$data.i18n.relationalOperators.is_greater_than},
                            {value: "$gte", text: this.$data.i18n.relationalOperators.is_greater_or_equal},
                            {value: "$lt", text: this.$data.i18n.relationalOperators.is_less_than},
                            {value: "$lte", text: this.$data.i18n.relationalOperators.is_less_or_equal},
                            {value: "$exists", text: this.$data.i18n.relationalOperators.exists}
                        ];
                    case "date":
                        return [
                            {value: "$lte", text: this.$data.i18n.relationalOperators.before},
                            {value: "$gte", text: this.$data.i18n.relationalOperators.after},
                            {value: "$exists", text: this.$data.i18n.relationalOperators.exists}
                        ];
                }
            }
        }
    };
</script>
