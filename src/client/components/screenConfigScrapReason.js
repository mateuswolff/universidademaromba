import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { optionsStatus } from "../components/optionsScreens.js"
import { WebixCrudDatatable, WebixInputText} from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen() {

    let dtScrapReason = new WebixCrudDatatable("dtScrapReason");
        
    dtScrapReason.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 100, sort: "string" },        
        { id:"description",	header:[i18n("Description"),  {content:"textFilter"}] , sort:"string", fillspace: true }
    ]

    dtScrapReason.createStatusColumn();
    dtScrapReason.changeFilterOptions();

    let itens = [
        new WebixInputText("id", i18n("Id")),        
        new WebixInputText("description", i18n("Description"))
    ]

    let rules = {
        "id":webix.rules.isNotEmpty,        
        "description":webix.rules.isNotEmpty,
    }

    App.createDefaultFormCrud('Scrap Reason', dtScrapReason, itens, rules, "scrapreason", {});
    
    App.replaceMainContent(dtScrapReason, async () => App.loadAllCrudData('scrapreason', dtScrapReason));
}