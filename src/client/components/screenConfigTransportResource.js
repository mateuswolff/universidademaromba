import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { optionsStatus } from "../components/optionsScreens.js"
import { WebixCrudDatatable, WebixInputText } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen() {
    
    let dtTransportResource = new WebixCrudDatatable("dtTransportResource");

    dtTransportResource.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], sort: "string", width: 100 },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "maxload", header: [i18n("Maximun Load")+" (KG)", { content: "textFilter" }], sort: "string", width: 120 }
    ]

    dtTransportResource.createStatusColumn();
    dtTransportResource.changeFilterOptions();

    let itens = [
        new WebixInputText("id", i18n("Id")),
        new WebixInputText("description", i18n("Description")),
        new WebixInputText("maxload", i18n("Maximun Load")+" (KG)"),
    ]

    let rules = {
        "id": webix.rules.isNotEmpty,
        "description": webix.rules.isNotEmpty,
        "maxload": webix.rules.isNumber
    }

    App.createDefaultFormCrud('Transport Resource', dtTransportResource, itens, rules, 'transportresource', {});

    App.replaceMainContent(dtTransportResource, async () => App.loadAllCrudData('transportresource', dtTransportResource));
}