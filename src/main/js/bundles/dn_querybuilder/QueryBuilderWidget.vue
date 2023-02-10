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
    <v-form class="ct-flex-container ct-flex-container--column fullHeight">
        <div
            v-if="!processing"
            class="header ct-flex-item ct-flex-item--no-grow ct-flex-item--no-shrink"
        >
            <v-container
                grid-list-md
                class="pa-0"
            >
                <v-layout
                    v-if="!filter && !editable"
                    row
                    wrap
                >
                    <v-flex xs3>
                        <v-subheader>{{ i18n.selectStore }}</v-subheader>
                    </v-flex>
                    <v-flex xs9>
                        <v-select
                            v-if="storeData.length > 1"
                            ref="selectedStoreIdSelect"
                            v-model="selectedStoreId"
                            :items="storeData"
                            :loading="loading"
                            :aria-label="i18n.aria.selectLayer"
                            label="i18n.selectStore"
                            item-value="id"
                            class="pa-0"
                            single-line
                            hide-details
                            @change="$emit('store-changed', $event)"
                        />
                        <v-subheader
                            v-else-if="storeData[0]"
                            class="pa-0"
                        >
                            {{ storeData[0].text }}
                        </v-subheader>
                    </v-flex>
                </v-layout>
                <v-layout
                    v-if="visibleElements.spatialRelation && !filter"
                    :aria-label="i18n.spatialRelation"
                    role="group"
                    row
                    wrap
                >
                    <v-flex xs3>
                        <v-subheader>{{ i18n.spatialRelation }}</v-subheader>
                    </v-flex>
                    <v-flex xs9>
                        <div
                            v-if="visibleElements.spatialInputActions"
                            class="mt-1"
                        >
                            <v-checkbox
                                v-model="negateSpatialInput"
                                class="pa-0 my-2"
                                hide-details
                                color="primary"
                                :label="i18n.negateSpatialInput"
                            />
                            <v-btn-toggle v-model="activeSpatialInputAction">
                                <v-btn
                                    v-for="spatialInputAction in spatialInputActions"
                                    :key="spatialInputAction.id"
                                    :value="spatialInputAction.id"
                                    class="mt-1"
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
                            <v-btn
                                small
                                block
                                @click="$emit('reset-spatial-input')"
                            >
                                <v-icon left>
                                    delete
                                </v-icon>
                                {{ i18n.resetSpatialInput }}
                            </v-btn>
                        </div>
                        <div v-else>
                            <v-radio-group
                                v-model="spatialRelation"
                                class="mt-2"
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
                </v-layout>
                <v-layout
                    v-if="fieldQueriesLength > 1"
                    :aria-label="i18n.linkOperator"
                    role="group"
                    row
                    wrap
                >
                    <v-flex xs3>
                        <v-subheader>{{ i18n.linkOperator }}</v-subheader>
                    </v-flex>
                    <v-flex xs9>
                        <v-radio-group
                            v-model="linkOperator"
                            class="mt-2"
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
            </v-container>
            <div
                v-if="visibleElements.sortSelect && !filter"
                class="pa-1"
            >
                <div class="caption">
                    {{ i18n.sortOptions }}
                </div>
                <div class="ct-flex-container">
                    <div class="ct-flex-item ct-flex-item--no-shrink">
                        <v-select
                            ref="selectedSortFieldNameSelect"
                            v-model="selectedSortFieldName"
                            :items="sortFieldData"
                            :disabled="editable"
                            :aria-label="i18n.aria.sortingField"
                            item-value="id"
                            class="pa-0"
                            single-line
                            hide-details
                        />
                    </div>
                    <div class="ct-flex-item ct-flex-item--no-grow">
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
                    </div>
                </div>
            </div>
        </div>
        <div class="center ct-flex-item overflow--auto">
            <v-container
                ref="searchBtn"
                align-center
                justify-center
                :fill-height="processing"
                fluid
                class="pa-1"
            >
                <v-progress-circular
                    v-if="processing"
                    :size="100"
                    color="primary"
                    indeterminate
                />
                <field-widget
                    v-for="(fieldQuery, index) in fieldQueries"
                    v-else
                    :ref="'fieldWidget_' + index"
                    :key="index"
                    :locale="locale"
                    :field-query="fieldQuery"
                    :index="index"
                    :active-tool="activeTool"
                    :enable-distinct-values="enableDistinctValues"
                    :show-field-infos="visibleElements.fieldInfos"
                    :i18n="i18n"
                    @remove="removeField"
                    @add="addField"
                />
                <v-btn
                    v-if="!editable && !processing"
                    :aria-label="i18n.aria.add"
                    flat
                    @click="$emit('add')"
                >
                    <v-icon>add</v-icon>
                    {{ i18n.aria.add }}
                </v-btn>
            </v-container>
        </div>
        <div class="footer ct-flex-item ct-flex-item--no-grow ct-flex-item--no-shrink">
            <div v-if="enableReplaceOpenedTablesControl">
                <v-checkbox
                    v-model="replaceOpenedTables"
                    :label="i18n.replaceOpenedTables"
                    color="primary"
                    @change="$emit('replaceOpenedTables', replaceOpenedTables)"
                />
            </div>
            <div v-if="!filter">
                <v-btn
                    v-if="!processing"
                    block
                    ripple
                    color="primary"
                    class="mb-0"
                    @click="emitSearch"
                >
                    <v-icon left>
                        search
                    </v-icon>
                    {{ i18n.search }}
                </v-btn>
                <v-btn
                    v-else
                    block
                    ripple
                    color="primary"
                    class="mb-0"
                    @click="$emit('cancel-search', {})"
                >
                    <v-icon left>
                        cancel
                    </v-icon>
                    {{ i18n.cancelSearch }}
                </v-btn>
            </div>
            <div v-else>
                <v-btn
                    v-if="!processing"
                    block
                    ripple
                    color="primary"
                    class="mb-0"
                    @click="emitSearch"
                >
                    <v-icon left>
                        filter_alt
                    </v-icon>
                    {{ i18n.setLayerDefinition }}
                </v-btn>
                <v-btn
                    v-else
                    block
                    ripple
                    color="primary"
                    class="mb-0"
                    @click="$emit('cancel-search', {})"
                >
                    <v-icon left>
                        cancel
                    </v-icon>
                    {{ i18n.cancelSearch }}
                </v-btn>
            </div>
        </div>
        <div
            aria-live="assertive"
            aria-relevant="additions"
            :aria-label="textToRead"
        />
    </v-form>
</template>
<script>
    import Bindable from "apprt-vue/mixins/Bindable";

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
                        };
                    }
                },
                locale: "en",
                storeData: [],
                sortFieldData: [],
                editable: false,
                filter: false,
                selectedStoreId: "",
                selectedSortFieldName: "",
                sortDescending: false,
                linkOperator: "$and",
                disableLinkOperatorRadio: false,
                spatialRelation: "everywhere",
                visibleElements: {
                    spatialRelation: true,
                    spatialInputActions: false,
                    sortSelect: false,
                    fieldInfos: false
                },
                disableSpatialRelationRadio: false,
                fieldQueries: [],
                loading: false,
                processing: false,
                activeTool: false,
                spatialInputActions: [],
                activeSpatialInputAction: null,
                activeSpatialInputActionDescription: null,
                allowMultipleSpatialInputs: true,
                negateSpatialInput: false,
                enableDistinctValues: true,
                linkOperatorsEnabled: false,
                linkOperatorsDisabled: true,
                ariaLabelAdded: false,
                textToRead: "",
                enableReplaceOpenedTablesControl: false,
                replaceOpenedTables: false
            };
        },
        computed: {
            fieldQueriesLength() {
                return this.fieldQueries.length;
            }
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
            },
            fieldQueriesLength: function (length) {
                if (length > 1) {
                    this.say(this.i18n.aria.linkOperatorsEnabled);
                } else {
                    this.say(this.i18n.aria.linkOperatorsDisabled);
                }
            }
        },
        mounted: function () {
            this.$emit('startup');
        },
        methods: {
            emitSearch: function () {
                this.$nextTick(() => {
                    // use setTimeout to be sure that combobox value is set before search gets started
                    // https://github.com/vuetifyjs/vuetify/issues/4679
                    setTimeout(() => {
                        this.$emit('search');
                    });
                });
            },
            say(text) {
                this.textToRead = text;
            },
            setFocusToLastFieldWidget() {
                const id = "fieldWidget_" + (this.fieldQueries.length - 1);
                const lastFieldWidget = this.$refs[id];
                lastFieldWidget[0].focus();
            },
            addField: function () {
                this.$emit("add");
            },
            removeField: function (fieldQuery) {
                this.$emit("remove", fieldQuery);
                this.setFocusToLastFieldWidget();
            }
        }
    };
</script>
