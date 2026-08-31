/*
 * Copyright (C) 2025 con terra GmbH (info@conterra.de)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { assert } from "chai";
import sinon from "sinon";
import module from "module";
import QueryController from "../QueryController";
import Replacer from "dn_queryplaceholder/Replacer";

function createFakeDataTable(id, seq) {
    const table = {
        id,
        destroyed: false,
        dataset: {
            id,
            state: "not-initialized",
            initialIdsProvider: `idsProvider-${seq}`,
            replaceItemsByIdsProvider: sinon.stub().resolves(),
            watch: () => {
                return { remove: () => {} };
            }
        },
        destroy() {
            table.destroyed = true;
        }
    };
    return table;
}

function createFakeDataTableCollection(initialTables) {
    const tables = new Map((initialTables || []).map((table) => [table.id, table]));
    return {
        getById: (id) => tables.get(id),
        add(table) {
            if (tables.has(table.id)) {
                throw new Error(`Table with id ${table.id} already registered!`);
            }
            tables.set(table.id, table);
            return this;
        },
        deleteAndDestroyById(id) {
            const table = tables.get(id);
            tables.delete(id);
            table?.destroy();
            return table;
        },
        selectTables: sinon.stub(),
        clickTable: sinon.stub()
    };
}

function createQueryController() {
    const queryController = new QueryController();
    let seq = 0;
    const dataTableFactory = {
        async createDataTableFromStoreAndQuery(options) {
            return createFakeDataTable(options.dataSource.id, ++seq);
        },
        createDataTableCollection(tables) {
            return createFakeDataTableCollection(tables);
        }
    };
    const resultViewerService = {
        dataTableFactory,
        currentDataTables: undefined,
        open: sinon.stub().callsFake(function (collection) {
            resultViewerService.currentDataTables = collection;
            return { remove: () => {} };
        })
    };
    queryController._resultViewerService = resultViewerService;
    queryController._metadataAnalyzer = {
        getStoreProperties() {
            return { title: "Test Layer" };
        }
    };
    queryController._i18n = {
        get() {
            return { ui: {} };
        }
    };
    queryController.activate({
        getBundleContext() {
            return {
                getBundleBySymbolicName() {
                    return {
                        getVersion() {
                            return { compare: () => 1 };
                        }
                    };
                }
            };
        }
    });
    return { queryController, resultViewerService };
}

describe(module.id, function(){
    it("SearchReplacer", function () {
        const object = {"$or": [{"aeroway": {"$eq": "${current_app_name}"}}]};
        const queryController = new QueryController();
        const replacer = new Replacer();
        const namePlaceholderProcvider = {
            getPlaceholder() {
                const placeholder = {};
                const appName = "Peter";
                const appTitle = "Peters App";
                placeholder["current_app_name"] = appName;
                placeholder["current_app_title"] = appTitle;
                return placeholder;
            }
        };
        replacer.addPlaceholderProvider(namePlaceholderProcvider).then(() => {
            queryController._replacer = replacer;
            queryController.searchReplacer(object);
            assert.equal(object["$or"][0].aeroway["$eq"], "Peter", 'the replacement failed.');
        });
    });

    describe("_openResultUi", function () {
        const tool = { id: "queryBuilderToggleTool", set: sinon.stub() };
        const queryBuilderWidgetModel = { set: sinon.stub() };
        const store = { id: "layer-1" };

        it("updates the existing result table instead of failing when querying the same layer twice", async function () {
            const { queryController, resultViewerService } = createQueryController();

            await queryController._openResultUi(tool, store, {}, {}, queryBuilderWidgetModel);
            const collection = resultViewerService.currentDataTables;
            const firstTable = collection.getById("layer-1");
            assert.isDefined(firstTable, "table should have been added on the first query");
            assert.isTrue(resultViewerService.open.calledOnce, "open() should be used to show the first result");

            await queryController._openResultUi(tool, store, {}, {}, queryBuilderWidgetModel);

            assert.strictEqual(resultViewerService.currentDataTables, collection, "collection should not be replaced");
            assert.strictEqual(collection.getById("layer-1"), firstTable, "the original table should be reused");
            assert.isTrue(
                firstTable.dataset.replaceItemsByIdsProvider.calledOnceWith("idsProvider-2"),
                "the existing table's items should be replaced with the new query's results"
            );
            assert.isTrue(resultViewerService.open.calledOnce, "open() should not be called again for the update");
        });

        it("replaces a previously failed result table instead of updating it", async function () {
            const { queryController, resultViewerService } = createQueryController();

            await queryController._openResultUi(tool, store, {}, {}, queryBuilderWidgetModel);
            const collection = resultViewerService.currentDataTables;
            const firstTable = collection.getById("layer-1");
            firstTable.dataset.state = "init-error";

            await queryController._openResultUi(tool, store, {}, {}, queryBuilderWidgetModel);

            const currentTable = collection.getById("layer-1");
            assert.notStrictEqual(currentTable, firstTable, "the failed table should be replaced, not reused");
            assert.isTrue(firstTable.destroyed, "the failed table should be destroyed");
            assert.isFalse(
                firstTable.dataset.replaceItemsByIdsProvider.called,
                "replaceItemsByIdsProvider should not be called on a failed table"
            );
        });
    });
});
