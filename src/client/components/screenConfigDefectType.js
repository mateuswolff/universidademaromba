import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputText } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen() {

    let dtDefectType = new WebixCrudDatatable("dtDefectType");

    dtDefectType.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 100, sort: "string" },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], fillspace: true, sort: "string" }
    ];

    dtDefectType.createStatusColumn();
    dtDefectType.changeFilterOptions();

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

    App.createDefaultFormCrud('Defect Type', dtDefectType, itens, rules, 'defecttype',{});
    App.replaceMainContent(dtDefectType, async () => App.loadAllCrudData('defecttype', dtDefectType, ORDER));
}