<!--

    Copyright (C) 2020 con terra GmbH (info@conterra.de)

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
    <div class="ct-flex-container ct-flex-container--column fullHeight">
        <div class="header ct-flex-item ct-flex-item--no-grow ct-flex-item--no-shrink">
            <v-container
                grid-list-md
                fluid
                class="pa-1"
            >
                <v-layout
                    row
                    wrap
                    justify-space-between
                >
                    <v-flex
                        v-if="editable && title"
                        xs12
                        md12
                    >
                        <div>{{ title }}</div>
                    </v-flex>
                    <v-flex
                        v-if="showQuerySettings && storeData.length > 1"
                        xs12
                        md12
                    >
                        <div class="caption">{{ i18n.selectStore }}</div>
                        <v-select
                            ref="selectedStoreIdSelect"
                            v-model="selectedStoreId"
                            :items="storeData"
                            :disabled="editable"
                            :loading="loading"
                            item-value="id"
                            class="pa-0"
                            single-line
                            hide-details
                            @change="$emit('storeChanged', $event)"
                        />
                    </v-flex>
                    <v-flex
                        v-if="showQuerySettings"
                        xs12
                        md12
                    >
                        <div class="caption">{{ i18n.spatialRelation }}</div>
                        <div v-if="showSpatialInputActions">
                            <v-container class="pa-0 mt-1">
                                <v-btn-toggle v-model="activeSpatialInputAction">
                                    <v-btn
                                        v-for="spatialInputAction in spatialInputActions"
                                        :key="spatialInputAction.id"
                                        :value="spatialInputAction.id"
                                    >
                                        <v-icon>{{ spatialInputAction.iconClass }}</v-icon>
                                        <span class="ml-2">{{ spatialInputAction.title }}</span>
                                    </v-btn>
                                </v-btn-toggle>
                                <div
                                    v-if="activeSpatialInputActionDescription"
                                    class="ct-message ct-message--info mt-2"
                                >
                                    {{ activeSpatialInputActionDescription }}
                                </div>
                            </v-container>
                        </div>
                        <div v-else>
                            <v-radio-group
                                v-model="spatialRelation"
                                class="pa-0 mt-1"
                                row
                                hide-details
                            >
                                <v-radio
                                    :label="i18n.everywhere"
                                    :disabled="disableSpatialRelationRadio"
                                    hide-details
                                    value="everywhere"
                                    color="primary"
                                />
                                <v-radio
                                    :label="i18n.currentExtent"
                                    :disabled="disableSpatialRelationRadio"
                                    hide-details
                                    value="current_extent"
                                    color="primary"
                                />
                            </v-radio-group>
                        </div>
                    </v-flex>
                    <v-flex
                        v-if="showSpatialInputActions"
                        xs12
                        md12
                    >
                        <v-btn
                            small
                            block
                            class="ma-0"
                            @click="$emit('resetSpatialInput')"
                        >
                            <v-icon left>
                                delete
                            </v-icon>
                            {{ i18n.resetSpatialInput }}
                        </v-btn>
                    </v-flex>
                    <!--<v-flex
                        v-if="showSpatialInputActions"
                        xs6
                        md6
                    >
                        <v-switch
                            v-model="allowMultipleSpatialInputs"
                            :label="i18n.multipleSpatialInputs"
                            class="ma-0"
                            color="primary"
                            hide-details>
                        </v-switch>
                    </v-flex>-->
                    <v-flex
                        v-if="showQuerySettings && showSortSelectInUserMode"
                        xs12
                        md12
                    >
                        <div class="caption">{{ i18n.sortOptions }}</div>
                        <v-layout
                            row
                            align-center>
                            <v-flex grow>
                                <v-select
                                    ref="selectedSortFieldNameSelect"
                                    v-model="selectedSortFieldName"
                                    :items="sortFieldData"
                                    :disabled="editable"
                                    item-value="id"
                                    class="pa-0"
                                    single-line
                                    hide-details
                                />
                            </v-flex>
                            <v-flex shrink>
                                <v-btn
                                    flat
                                    small
                                    class="ma-0"
                                    color="primary"
                                    @click="sortDescending=!sortDescending"
                                >
                                    <v-icon
                                        v-if="sortDescending"
                                        left
                                    >
                                        arrow_downward
                                    </v-icon>
                                    <v-icon
                                        v-else
                                        left
                                    >
                                        arrow_upward
                                    </v-icon>
                                    {{ i18n.sorting }}
                                </v-btn>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex
                        xs12
                        md12
                    >
                        <v-layout
                            row
                            align-center>
                            <v-flex
                                class="pr-5 subheading"
                                shrink>
                                {{ i18n.searchParameter }}
                            </v-flex>
                            <v-flex
                                v-if="showQuerySettings"
                                class="caption"
                                shrink>
                                {{ i18n.linkOperator }}
                            </v-flex>
                            <v-flex
                                v-if="showQuerySettings"
                                shrink>
                                <v-radio-group
                                    v-model="linkOperator"
                                    class="pa-0 ma-0"
                                    :disabled="fieldQueries.length < 2"
                                    row
                                    hide-details
                                >
                                    <v-radio
                                        :label="i18n.and"
                                        :disabled="disableLinkOperatorRadio"
                                        hide-details
                                        value="$and"
                                        color="primary"
                                    />
                                    <v-radio
                                        :label="i18n.or"
                                        :disabled="disableLinkOperatorRadio"
                                        hide-details
                                        value="$or"
                                        color="primary"
                                    />
                                </v-radio-group>
                            </v-flex>
                        </v-layout>
                        <v-divider class="mt-1"></v-divider>
                    </v-flex>
                </v-layout>
            </v-container>
        </div>
        <div class="center ct-flex-item overflowAuto">
            <v-container
                grid-list-md
                fluid
                class="pa-1"
            >
                <field-widget
                    v-for="(fieldQuery, index) in fieldQueries"
                    :key="index"
                    :locale="locale"
                    :field-query="fieldQuery"
                    :index="index"
                    :allow-negation="allowNegation"
                    :active-tool="activeTool"
                    :i18n="i18n"
                />
            </v-container>
        </div>
        <div class="ct-flex-item ct-flex-item--no-grow ct-flex-item--no-shrink">
            <v-container
                grid-list-md
                fluid
                class="pa-1"
            >
                <v-layout
                    row
                    wrap
                    justify-center
                >
                    <v-flex md12>
                        <v-card
                            class="elevation-6"
                        >
                            <v-btn
                                :loading="processing"
                                block
                                ripple
                                color="primary"
                                @click="$emit('search', {})"
                            >
                                <v-icon left>
                                    search
                                </v-icon>
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
                locale: "en",
                storeData: [],
                sortFieldData: [],
                editable: false,
                selectedStoreId: "",
                selectedSortFieldName: "",
                sortDescending: false,
                title: null,
                showQuerySettings: true,
                linkOperator: "$and",
                disableLinkOperatorRadio: false,
                spatialRelation: "everywhere",
                showSpatialInputActions: false,
                disableSpatialRelationRadio: false,
                fieldQueries: [],
                allowNegation: false,
                loading: false,
                processing: false,
                showSortSelectInUserMode: false,
                activeTool: false,
                spatialInputActions: [],
                activeSpatialInputAction: null,
                activeSpatialInputActionDescription: null,
                allowMultipleSpatialInputs: true
            };
        },
        watch: {
            activeTool: function (value) {
                if (!value) {
                    if (this.$refs.selectedStoreIdSelect) {
                        this.$refs.selectedStoreIdSelect.isMenuActive = false;
                    }
                    if (this.$refs.selectedSortFieldNameSelect) {
                        this.$refs.selectedSortFieldNameSelect.isMenuActive = false;
                    }
                }
            },
            activeSpatialInputAction: function (id) {
                this.$emit("selectSpatialInputAction", id);
            }
        },
        mounted: function () {
            this.$emit('startup');
        },
        methods: {
            fieldChanged: function (selectedFieldId, fieldQuery) {
                const selectedField = this.getSelectedField(fieldQuery.fields, selectedFieldId);
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
                const selectedField = this.getSelectedField(fieldQuery.fields, fieldQuery.selectedFieldId);
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
                const type = field.type;
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
