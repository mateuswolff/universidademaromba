import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { optionsStatus } from "../components/optionsScreens.js"
import { WebixCrudDatatable, WebixInputText, WebixInputDate } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen() {
 
    let dtOrderGroup = new WebixCrudDatatable("dtOrderGroup");

    dtOrderGroup.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 100, sort: "string" },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], sort: "string", fillspace: true },
        {
            id: "date",
            format: (value) => { return moment(value).format("DD/MM/YYYY") },
            header: [i18n("Date"), {content: "dateFilter"}], sort: "date", width: 100,
        },

        { id: "situation", header: [i18n("Situation"), { content: "textFilter" }], width: 80, sort: "string" }
    ]

    dtOrderGroup.createStatusColumn();
    dtOrderGroup.changeFilterOptions();

    let itens = [
        new WebixInputText("id", i18n("Id")),
        new WebixInputText("description", i18n("Description")),
        new WebixInputDate("date", i18n("Date")),
        new WebixInputText("situation", i18n("Situation")),
    ]

    let rules = {
        "id": webix.rules.isNotEmpty,
        "description": webix.rules.isNotEmpty,
        "date": webix.rules.isNotEmpty,
        "situation": webix.rules.isNotEmpty,
    }

    async function reloadData(){
        let data = await App.api.ormDbFind('ordergroup');
        let temp = [];
        
        for(let item of data.data){
            item.date = new Date(item.date);
            temp.push (item);
        }

        $$('dtOrderGroup').clearAll();
        $$('dtOrderGroup').parse(temp, "json");
    }

    App.createDefaultFormCrud('Order Group', dtOrderGroup, itens, rules, 'ordergroup', {});

    App.replaceMainContent(dtOrderGroup, reloadData);
}