import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputText } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen() {

    let dtInstrumentType = new WebixCrudDatatable("dtInstrumentType");

    dtInstrumentType.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 100, sort: "string" },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], sort: "string", fillspace: true }
    ];
    
    dtInstrumentType.createStatusColumn();
    dtInstrumentType.changeFilterOptions();
    
    let itens = [
        new WebixInputText("id", i18n("Id")),
        new WebixInputText("description", i18n("Description"))
    ];

    let rules = {
        "id": webix.rules.isNotEmpty,
        "description": webix.rules.isNotEmpty,
    };

    let ORDER = {
        "colum" : 'id',
        "sort"  : 'ASC'
    }

    App.createDefaultFormCrud('Instrument Type', dtInstrumentType, itens, rules, 'instrumenttype');
    App.replaceMainContent(dtInstrumentType, async () => App.loadAllCrudData('instrumenttype', dtInstrumentType, ORDER));
}