import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputSelect } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen() {

    let dtSteelSimilarity = new WebixCrudDatatable("dtSteelSimilarity");

    let steels = await App.api.ormDbGetAllTypesOfSteels();
    steels = steels.data.map(item => { return { id: item.id, value: item.id } });

    dtSteelSimilarity.columns = [
        { id: "steelfrom", header: [i18n("Steel from"), { content: "textFilter" }], width: 200, sort: "string", fillspace: true },
        { id: "steelto", header: [i18n("Steel to"), { content: "textFilter" }], width: 200, sort: "string", fillspace: true }
    ]

    dtSteelSimilarity.createStatusColumn();
    dtSteelSimilarity.changeFilterOptions();

    let itens = [
        {
            cols: [
                new WebixInputSelect("steelfrom", i18n("Steel from"), steels),
                new WebixInputSelect("steelto", i18n("Steel to"), steels),
                new WebixInputSelect("steelto", i18n("Steel to"), steels),
            ]
        }
    ]

    let rules = {
        "steelfrom": webix.rules.isNotEmpty,
        "steelto": webix.rules.isNotEmpty
    }

    App.createDefaultFormCrud('Steel Similarity', dtSteelSimilarity, itens, rules, 'steelsimilarity');

    App.replaceMainContent(dtSteelSimilarity, async () => App.loadAllCrudData('steelsimilarity', dtSteelSimilarity));
}