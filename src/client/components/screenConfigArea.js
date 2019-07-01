import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputText } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen() {

    let dtArea = new WebixCrudDatatable("dtArea");

    function sortByParam(a, b) {
        a = parseFloat(a.id);
        b = parseFloat(b.id);
        return a > b ? 1 : (a < b ? -1 : 0);
    }

    dtArea.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 100, sort: "string" },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], sort: "string", fillspace: true}
    ];

    dtArea.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtArea");
        }
    };

    dtArea.createStatusColumn();
    dtArea.changeFilterOptions();

    let itens = [
        new WebixInputText("id", i18n("Id")),
        new WebixInputText("description", i18n("Description"))
    ];

    let rules = {
        "id": webix.rules.isNotEmpty,
        "description": webix.rules.isNotEmpty,
    };

    App.createDefaultFormCrud('Area', dtArea, itens, rules, 'area', {});
    App.replaceMainContent(dtArea, async () => App.loadAllCrudData('area', dtArea));
}