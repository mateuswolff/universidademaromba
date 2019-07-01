import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { optionsStatus, associationFields } from "../components/optionsScreens.js"
import { WebixCrudDatatable, WebixInputText, WebixInputCombo} from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen() {

    let dtReleaseTeam = new WebixCrudDatatable("dtReleaseTeam");

    let allUsers = await App.api.ormDbFind('user');

    dtReleaseTeam.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 100, sort: "string" },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "teamtype", header: [i18n("Team Type"), { content: "textFilter" }], width: 80, sort: "string" }
    ]
   
    dtReleaseTeam.createStatusColumn();
    dtReleaseTeam.changeFilterOptions();

    allUsers = await allUsers.data.map(
        (item) => {
            return {
                id: item.idEmployee,
                value: item.name
            }
        }
    )

    let itens = [
        new WebixInputText("id", i18n("Id")),
        new WebixInputText("description", i18n("Description")),
        new WebixInputCombo("teamtype", i18n("Team Type"), [{id: 'P', value: 'P'},{id: 'Q', value: 'Q'}])
        
    ]

    let rules = {
        "id": webix.rules.isNotEmpty,
        "description": webix.rules.isNotEmpty,
    }

    App.createDefaultFormCrud('Release Team', dtReleaseTeam, itens, rules, 'releaseteam', {});
    
    App.replaceMainContent(dtReleaseTeam, async () => App.loadAllCrudData('releaseteam', dtReleaseTeam));
}