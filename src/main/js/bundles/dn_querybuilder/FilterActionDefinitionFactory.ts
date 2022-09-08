import type {InjectedReference} from "apprt-core/InjectedReference";

const ID = "querybuilder-filter";

export default class FilterActionDefinitionFactory {

    private _i18n!: InjectedReference<any>;
    private _properties!: InjectedReference<any>;
    private _filterQueryBuilderWidgetFactory!: InjectedReference<any>;
    private supportedIds!: InjectedReference<any>;

    constructor() {
        this.supportedIds = [ID];
    }

    createDefinitionById(id) {
        if (ID !== id) {
            return;
        }
        const i18n = this._i18n.get().ui;
        const filterQueryBuilderWidgetFactory = this._filterQueryBuilderWidgetFactory;
        return {
            id: ID,
            type: "button",
            label: i18n.filterActionLabel,
            icon: "icon-filter",
            isVisibleForItem(tocItem) {
                const ref = tocItem.ref;
                const parent = ref && ref.parent;
                const capabilities = parent && parent.capabilities;
                if (ref && ref.type !== "group") {
                    if (ref.type === "feature") {
                        return true;
                    } else if (capabilities?.operations?.supportsQuery) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            },
            trigger(tocItem) {
                const ref = tocItem.ref;
                let id = ref.id;
                if (ref?.parent?.type === "map-image") {
                    id = ref.parent.id + "/" + ref.id;
                }
                const title = ref.title;
                filterQueryBuilderWidgetFactory.showFilter(id, title);
            }
        };
    }

}
