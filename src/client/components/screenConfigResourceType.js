import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputText, WebixInputNumber, WebixInputMultiText } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen() {

    let dtResourceType = new WebixCrudDatatable("dtResourceType");

    dtResourceType.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 100, sort: "string" },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "validity", header: [i18n("Validity"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "responsible", header: [i18n("Responsible"), { content: "textFilter" }], sort: "string", fillspace: true }
    ]

    dtResourceType.createStatusColumn();
    dtResourceType.changeFilterOptions();

    let itens = [
        new WebixInputText("id", i18n("Id")),
        new WebixInputText("description", i18n("Description")),
        new WebixInputNumber("validity", i18n("Validity (Months)")),
        {
            rows: [
                new WebixInputMultiText("responsible", i18n("Responsible"))
            ]
        }
    ]

    let rules = {
        "id": webix.rules.isNotEmpty,
        "description": webix.rules.isNotEmpty,
        "validity": webix.rules.isNotEmpty,
    }

    App.createDefaultFormCrud('Resource Type', dtResourceType, itens, rules, 'resourcetype', {});

    App.replaceMainContent(dtResourceType, async () => App.loadAllCrudData('resourcetype', dtResourceType));
}