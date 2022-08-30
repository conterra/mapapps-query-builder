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
                        xs12
                        md12
                    >
                        <div class="caption">{{ i18n.selectStore }}</div>
                        <v-select
                            v-if="showQuerySettings && storeData.length > 1"
                            ref="selectedStoreIdSelect"
                            v-model="selectedStoreId"
                            :items="storeData"
                            :disabled="editable"
                            :loading="loading"
                            :aria-label="i18n.aria.selectLayer"
                            item-value="id"
                            class="pa-0"
                            single-line
                            hide-details
                            @change="$emit('storeChanged', $event)"
                        >
                        </v-select>
                        <div
                            v-else-if="storeData[0]"
                            class="single-store">
                            {{ storeData[0].text }}
                        </div>
                    </v-flex>
                    <v-flex
                        v-if="showQuerySettings"
                        xs12
                        md12
                    >
                        <div
                            :aria-label="i18n.spatialRelation"
                            role="group"
                        >
                            <div class="caption">
                                {{ i18n.spatialRelation }}
                            </div>
                            <template v-if="showSpatialInputActions">
                                <v-container class="pa-0 mt-1">
                                    <v-checkbox
                                        v-model="negateSpatialInput"
                                        class="pa-0 mt-2 mb-2"
                                        hide-details
                                        color="primary"
                                        :label="i18n.negateSpatialInput"
                                    ></v-checkbox>
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
                            </template>
                            <template v-else>
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
                            </template>
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
                                    :aria-label="i18n.aria.sortingField"
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
                        >
                            <div
                                :aria-label="i18n.linkOperator"
                                role="group"
                            >
                                <v-flex
                                    class="pr-5 subheading"
                                    shrink
                                >
                                    {{ i18n.searchParameter }}
                                </v-flex>
                                <v-flex
                                    v-if="showQuerySettings"
                                    class="flex caption shrink pt-2"
                                >
                                    {{ i18n.linkOperator }}
                                </v-flex>
                                <v-flex
                                    v-if="showQuerySettings"
                                    shrink
                                >
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
                            </div>
                        </v-layout>
                        <v-divider class="mt-1"></v-divider>
                    </v-flex>
                </v-layout>
            </v-container>
        </div>
        <div class="center ct-flex-item overflow--auto">
            <v-container
                align-center
                justify-center
                :fill-height="processing"
                grid-list-md
                fluid
                class="pa-1"
            >
                <v-progress-circular
                    v-if="processing"
                    :size="100"
                    color="primary"
                    indeterminate
                ></v-progress-circular>
                <field-widget
                    v-for="(fieldQuery, index) in fieldQueries"
                    v-else
                    :key="index"
                    :locale="locale"
                    :field-query="fieldQuery"
                    :index="index"
                    :allow-negation="allowNegation"
                    :active-tool="activeTool"
                    :enable-distinct-values="enableDistinctValues"
                    :i18n="i18n"
                    @add-event="handleLinkOperatorsAriaLabel"
                    @remove-event="handleLinkOperatorsAriaLabel"
                />
            </v-container>
        </div>
        <div class="ct-flex-item ct-flex-item--no-grow ct-flex-item--no-shrink" id="query-builder-search">
            <v-container
                grid-list-md
                fluid
                class="pa-1"
            >
                <v-layout
                    v-if="!showSetLayerDefinition || !layerAvailable"
                    row
                    wrap
                    justify-center
                >
                    <v-flex md12>
                        <v-btn
                            v-if="!processing"
                            block
                            ripple
                            color="primary"
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
                            @click="$emit('cancel-search', {})"
                        >
                            <v-icon left>
                                cancel
                            </v-icon>
                            {{ i18n.cancelSearch }}
                        </v-btn>
                    </v-flex>
                </v-layout>
            </v-container>
        </div>
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
                allowMultipleSpatialInputs: true,
                negateSpatialInput: false,
                enableDistinctValues: true,
                linkOperatorsEnabled: false,
                linkOperatorsDisabled: true,
                ariaLabelAdded: false
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
            },
            fieldQueries: {
                deep: true,
                handler(){
                    this.addAlertMessageHolderElement();
                    const element = document.getElementById("qbAlertMessageHolder");
                    if (this.linkOperatorsEnabled && this.fieldQueries.length === 2 && !this.ariaLabelAdded){
                        this.addAriaLabel(element, this.i18n.aria.linkOperatorsEnabled);
                        this.ariaLabelAdded = true;
                    }
                    if (!this.linkOperatorsDisabled && this.fieldQueries.length < 2){
                        this.ariaLabelAdded && this.removeAriaLabel(element);
                        this.addAriaLabel(element, this.i18n.aria.linkOperatorsDisabled);
                        this.linkOperatorsEnabled = false;
                    }
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
                        this.$emit('search', {});
                    })
                });
            },
            handleLinkOperatorsAriaLabel() {
                /*Here, the expected behaviour is that the event emitted from the child component is triggered before the fieldQueries array is updated*/
                if (this.fieldQueries.length < 2) {
                    this.linkOperatorsEnabled = true;
                    this.linkOperatorsDisabled = false;
                }
                if (this.linkOperatorsDisabled && this.fieldQueries.length === 2) {
                    this.linkOperatorsDisabled = false;
                }
            },
            addAriaLabel(element, message) {
                element.setAttribute("role", "alert");
                element.setAttribute("aria-label", message);
            },
            removeAriaLabel(element) {
                element.removeAttribute("role");
                element.removeAttribute("aria-label");
                this.ariaLabelAdded = false;
            },
            addAlertMessageHolderElement(){
                const element = document.getElementById("qbAlertMessageHolder");
                const containerDiv = document.getElementById("query-builder-search");
                if (!element && containerDiv){
                    const div = document.createElement("div");
                    const span = document.createElement("span");
                    span.setAttribute("id", "qbAlertMessageHolder");
                    div.appendChild(span);
                    containerDiv.appendChild(div);
                }
            }

        }
    };
</script>
