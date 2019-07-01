import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { optionsStatus } from "../components/optionsScreens.js"
import { WebixCrudDatatable, WebixInputText, WebixInputSelect } from "../lib/WebixWrapper.js";
import { optionsOEECategory, optionsTUC } from "../components/optionsScreens.js"
import * as util from "../lib/Util.js";

export async function showScreen() {
    
    let dtStopReason = new WebixCrudDatatable("dtStopReason");

    dtStopReason.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 100, sort: "string"},        
        { id:"description",	header:[i18n("Description"),  {content:"textFilter"}] , sort:"string", fillspace: true},
        { id:"oeecategory",	header:[i18n("OEE Category"),  {content:"textFilter"}] , sort:"string", fillspace: true},
        { id:"tuc",	header:[i18n("TUC"),  {content:"textFilter"}] , sort:"string", fillspace: true}
    ]

    dtStopReason.createStatusColumn();
    dtStopReason.changeFilterOptions();

    dtStopReason.on = {
        'onItemClick': function (id, e, trg) {
            let element = this.getItem(id.row)
            if (element.iduser == 'OEE') {
                $$('btnRemove').disable();
                $$('btnEnable').disable();
                $$('btnDisable').disable();
                $$('btnEdit').disable();
            }else{
                $$('btnRemove').enable();
                $$('btnEnable').enable();
                $$('btnDisable').enable();
                $$('btnEdit').enable();
            }
        }
    }

    let itens = [
        new WebixInputText("id", i18n("Id")),        
        new WebixInputText("description", i18n("Description")),
        new WebixInputSelect("oeecategory", i18n("OEE Category"), optionsOEECategory, {
            template: function (obj) {
                return obj.value;
            }
        }),      
        new WebixInputSelect("tuc", i18n("TUC"), optionsTUC, {
            template: function (obj) {
                return obj.value;
            }
        }),      
    ];

    let rules = {
        "id":webix.rules.isNotEmpty,        
        "description":webix.rules.isNotEmpty,
        "oeecategory":webix.rules.isNotEmpty,
        "tuc":webix.rules.isNotEmpty,
    }

    App.createDefaultFormCrud('Stop Reason', dtStopReason, itens, rules, "stopreason", {});
    
    App.replaceMainContent(dtStopReason, async () => App.loadAllCrudData('stopreason', dtStopReason));
}