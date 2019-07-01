import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { optionsStatus } from "../components/optionsScreens.js"
import { WebixCrudDatatable, WebixInputText, WebixInputSelect, WebixInputNumber } from "../lib/WebixWrapper.js";
import { optionsOEECategory, optionsTUC } from "../components/optionsScreens.js"
import * as util from "../lib/Util.js";

export async function showScreen() {
    
    let dtSetupParameter = new WebixCrudDatatable("dtSetupParameter");
    let allEquipment = await App.api.ormDbFind('equipment');

    dtSetupParameter.columns = [
        { 
            id: "idequipment", 
            template: (obj) => {
                if(allEquipment.data.find(x => x.id == obj.idequipment))
                    return (allEquipment.data.find(x => x.id == obj.idequipment)).description;
                else    
                    return "";
            }, 
            header: [i18n("Equipment"), { content: "selectFilter" }], width: 70, sort: "string" 
        },       
        { id:"targett1",	header:[i18n("T1"),  {content:"textFilter"}] , sort:"string", width: 50},
        { id:"targett2",	header:[i18n("T2"),  {content:"textFilter"}] , sort:"string", width: 50},
        { id:"targett3",	header:[i18n("T3"),  {content:"textFilter"}] , sort:"string", width: 50},
        { id:"targetoee",	header:[i18n("OEE"),  {content:"textFilter"}] , sort:"string", width: 50},
        { id:"cgdiameter",	header:[i18n("Diameter"),  {content:"textFilter"}] , sort:"string", fillspace: true},
        { id:"cgnorm",	header:[i18n("Norm"),  {content:"textFilter"}] , sort:"string", fillspace: true},
        { id:"cgthickness",	header:[i18n("Thickness"),  {content:"textFilter"}] , sort:"string", fillspace: true},
        { id:"cglength",	header:[i18n("Length"),  {content:"textFilter"}] , sort:"string", fillspace: true},
        { id:"cgsteel",	header:[i18n("Steel"),  {content:"textFilter"}] , sort:"string", fillspace: true},
        { id:"cggrana",	header:[i18n("Granularity"),  {content:"textFilter"}] , sort:"string", fillspace: true},
    ]

    dtSetupParameter.createStatusColumn();
    
    
    let validate = (id, req) => {
        
        if (id == 'idequipment') {
            for (var i = 0; i < req.values.length; i++) {
                let option = allEquipment.data.find((x) => {
                    return x.id.toString() == req.values[i].idequipment.toString();
                });
                if (option) {
                    req.values[i].value = option.description;
                }
            }
        }
    }
    
    dtSetupParameter.changeFilterOptions(validate);

    dtSetupParameter.on = {
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
        new WebixInputNumber("id", i18n("ID"),{disabled: true}),        
        new WebixInputSelect("idequipment", i18n("Change Equipment"), allEquipment.data, {
            template: function (obj) {
                return obj.description;
            }
        }),
        new WebixInputNumber("targett1", i18n("T1")),        
        new WebixInputNumber("targett2", i18n("T2")),        
        new WebixInputNumber("targett3", i18n("T3")),        
        new WebixInputNumber("cgdiameter", i18n("Change Diameter")),  
        new WebixInputNumber("cgnorm", i18n("Change Norm")),  
        new WebixInputNumber("cgthickness", i18n("Change Thickness")),  
        new WebixInputNumber("cglength", i18n("Change Length")),  
        new WebixInputNumber("cgsteel", i18n("Change Steel")),
        new WebixInputNumber("cggrana", i18n("Change Granularity")),

              
    ];

    let rules = {
        "idequipment":webix.rules.isNotEmpty,        
        "cgdiameter":webix.rules.isNotEmpty,
        "cgnorm":webix.rules.isNotEmpty,
        "cgthickness":webix.rules.isNotEmpty,
        "cglength":webix.rules.isNotEmpty,
        "cgsteel":webix.rules.isNotEmpty,
    }

    App.createDefaultFormCrud('Setup Parameter', dtSetupParameter, itens, rules, "setupparameter", {});
    
    App.replaceMainContent(dtSetupParameter, async () => App.loadAllCrudData('setupparameter', dtSetupParameter));
}