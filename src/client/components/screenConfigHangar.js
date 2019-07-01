import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputText, WebixInputCombo } from "../lib/WebixWrapper.js";
import { optionsStatus } from "./optionsScreens.js";
import * as util from "../lib/Util.js";

export async function showScreen() {

    let dtHangar = new WebixCrudDatatable("dtHangar");

    let allArea = await App.api.ormDbFind('area');

    dtHangar.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 100, sort: "string" },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], sort: "string", fillspace: true },
        { 
            id: "idarea", template: (obj) => {
                return (allArea.data.find(x => x.id == obj.idarea)).description;
            }, 
            header: [i18n("Area"), { content: "selectFilter" }], width: 200, sort: "string"   
        }
    ];

    dtHangar.createStatusColumn();
        
    let validate = (id, req) =>{
        if (id == 'idarea') {
            for (var i = 0; i < req.values.length; i++) {
                let option = (allArea.data.find((x) => x.id == req.values[i].value));
                if (option) {
                    req.values[i].value = option.description;
                }
            }
        }
    }

    dtHangar.changeFilterOptions(validate);

    let itens = [
        new WebixInputText("id", i18n("Id")),
        new WebixInputText("description", i18n("Description")),
        new WebixInputCombo("idarea", i18n("Area"), allArea.data, {
            template: function (obj) {
                return obj.id + ' - ' + obj.description;
            }
        }),
    ];

    let rules = {
        "id": webix.rules.isNotEmpty,
        "description": webix.rules.isNotEmpty,
        "idarea": webix.rules.isNotEmpty
    };

    let ORDER = {
        "colum" : 'id',
        "sort"  : 'ASC'
    }

    App.createDefaultFormCrud('Hangar', dtHangar, itens, rules, 'hangar');
    App.replaceMainContent(dtHangar, async () => App.loadAllCrudData('hangar', dtHangar,ORDER));
}