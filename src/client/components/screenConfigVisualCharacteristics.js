import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { optionsStatus } from "../components/optionsScreens.js"
import { WebixCrudDatatable, WebixInputText, WebixInputDate } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen() {

    let dtVisualCharacteristics = new WebixCrudDatatable("dtVisualCharacteristics");

    dtVisualCharacteristics.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], sort: "string", width: 100},
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], sort: "string", fillspace: true }
    ]

    dtVisualCharacteristics.createStatusColumn();
    dtVisualCharacteristics.changeFilterOptions();

    let itens = [
        new WebixInputText("id", i18n("Id")),
        new WebixInputText("description", i18n("Description"))
    ]

    let rules = {
        "id": webix.rules.isNotEmpty,
        "description": webix.rules.isNotEmpty
    }

    async function reloadData(){
        let data = await App.api.ormDbFind('visualcharacteristics');
        let temp = [];
        
        for(let item of data.data){
            item.date = new Date(item.date);
            temp.push (item);
        }

        $$('dtVisualCharacteristics').clearAll();
        $$('dtVisualCharacteristics').parse(temp, "json");
    }

    App.createDefaultFormCrud('Visual Characteristics', dtVisualCharacteristics, itens, rules, 'visualcharacteristics', {});

    App.replaceMainContent(dtVisualCharacteristics, reloadData);
}