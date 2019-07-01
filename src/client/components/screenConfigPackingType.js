import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { optionsStatus } from "../components/optionsScreens.js"
import { WebixCrudDatatable, WebixInputText, WebixInputDate } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen() {

    let dtPackingType = new WebixCrudDatatable("dtPackingType");

    dtPackingType.columns = [
        { id: "id", header: ["Id", { content: "textFilter" }], sort: "string", width: 100 },
        { id: "description", header: ["Description", { content: "textFilter" }], sort: "string", fillspace: true },
        {
            id: "date",
            format: (value) => { return moment(value).format("DD/MM/YYYY") },
            header: [i18n("Date"), {content: "dateFilter"}], sort: "date", width: 150, fillspace: true
        },
    
    ]

    dtPackingType.createStatusColumn();
    dtPackingType.changeFilterOptions();

    let itens = [
        new WebixInputText("id", i18n("Id")),
        new WebixInputText("description", i18n("Description")),
        new WebixInputDate('date', i18n('Date')),

    ]

    let rules = {
        "id": webix.rules.isNotEmpty,
        "description": webix.rules.isNotEmpty,
        "date": webix.rules.isNotEmpty,
    }

    async function reloadData(){
        let data = await App.api.ormDbFind('packingtype');
        let temp = [];
        
        for(let item of data.data){
            item.date = new Date(item.date);
            temp.push (item);
        }

        $$('dtPackingType').clearAll();
        $$('dtPackingType').parse(temp, "json");
    }

    App.createDefaultFormCrud('Packing Type', dtPackingType, itens, rules, 'packingtype', {});
    
    App.replaceMainContent(dtPackingType, reloadData);
}