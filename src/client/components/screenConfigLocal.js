import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputText, WebixInputSelect } from "../lib/WebixWrapper.js";
import { optionsStatus } from "../components/optionsScreens.js"
import * as util from "../lib/Util.js";

export async function showScreen() {
    
    let dtLocal = new WebixCrudDatatable("dtLocal");

    let allEquipment = await App.api.ormDbFind('equipment');
    let allHangar = await App.api.ormDbFind('hangar');
    let allArea = await App.api.ormDbFind('area');

    dtLocal.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 100, sort: "string" },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], fillspace: true, sort: "string" },
        { 
            id: "idequipment", 
            template: (obj) => {
                if(allEquipment.data.find(x => x.id == obj.idequipment))
                    return (allEquipment.data.find(x => x.id == obj.idequipment)).description;
                else    
                    return "";
            }, 
            header: [i18n("Equipment"), { content: "selectFilter" }], fillspace: true, sort: "string" 
        },
        { 
            id: "idhangar", template: (obj) => {
                return (allHangar.data.find(x => x.id == obj.idhangar)).description;
            }, 
            header: [i18n("Hangar"), { content: "selectFilter" }], fillspace: true, sort: "string" 
        },
        { 
            id: "idarea", template: (obj) => {
                return (allArea.data.find(x => x.id == obj.idarea)).description;
            }, 
            header: [i18n("Area"), { content: "selectFilter" }], fillspace: true, sort: "string" 
        },
        { id: "posx", header: [i18n("Pos X"), { content: "textFilter" }], width: 80, sort: "string" },
        { id: "posy", header: [i18n("Pos Y"), { content: "textFilter" }], width: 80, sort: "string" },
        { id: "posz", header: [i18n("Pos Z"), { content: "textFilter" }], width: 80, sort: "string" }
    ];

    dtLocal.createStatusColumn();
    
    let validate = (id, req) =>{
        
        if (id == 'idequipment') {
            for (var i = 0; i < req.values.length; i++) {
                let option = (allEquipment.data.find((x) => x.id == req.values[i].value));
                if (option) {
                    req.values[i].value = option.description;
                }
            }
        }

        if (id == 'idhangar') {
            for (var i = 0; i < req.values.length; i++) {
                let option = (allHangar.data.find((x) => x.id == req.values[i].value));
                if (option) {
                    req.values[i].value = option.description;
                }
            }
        }

        if (id == 'idarea') {
            for (var i = 0; i < req.values.length; i++) {
                let option = (allArea.data.find((x) => x.id == req.values[i].value));
                if (option) {
                    req.values[i].value = option.description;
                }
            }
        }
    }

    dtLocal.changeFilterOptions(validate);

    let itens = [
        new WebixInputText("id", i18n("Id")),
        new WebixInputText("description", i18n("Description")),
        new WebixInputSelect("idequipment", i18n("Equipment"), allEquipment.data, {
            template: function (obj) {
                return obj.description;
            }
        }),
        new WebixInputSelect("idhangar", i18n("Hangar"), allHangar.data, {
            template: function (obj) {
                return obj.description;
            }
        }),
        new WebixInputSelect("idarea", i18n("Area"), allArea.data, {
            template: function (obj) {
                return obj.description;
            }
        }),
        {
            cols: [
                new WebixInputText("posx", i18n("PosX")),
                new WebixInputText("posy", i18n("PosY")),
                new WebixInputText("posz", i18n("PosZ"))
            ]
        }
    ]

    let rules = {
        "id": webix.rules.isNotEmpty,
        "description": webix.rules.isNotEmpty,
        "idhangar": webix.rules.isNotEmpty,
        "idarea": webix.rules.isNotEmpty,
        //"capacity": webix.rules.isNumber,
        "posx": webix.rules.isNotEmpty,
        "posy": webix.rules.isNotEmpty,
        "posz": webix.rules.isNotEmpty
    }

    App.createDefaultFormCrud('Local', dtLocal, itens, rules, 'local', {
        beforeCreate: async (ev, id) => {
            let form = $$('frmCrud').getValues();
            let result = await App.api.ormDbFind('local', {
                idhangar: form.idhangar, 
                idarea: form.idarea, 
                posx: form.posx, 
                posy: form.posy, 
                posz: form.posz
            });

            let res = result.data.length == 0 ? true : false;
            return res;

        },
        beforeEdit: async (ev, id) => {

            let form = $$('frmCrud').getValues();
            let grid = $$('dtLocal').getSelectedItem();

            let res = false;

            if (form.idhangar == grid.idhangar && form.idarea == grid.idarea && form.posx == grid.posx && form.posy == grid.posy && form.posz == grid.posz) {

                res = true;

            } else {
            
                let result = await App.api.ormDbFind('local', {
                    idhangar: form.idhangar, 
                    idarea: form.idarea, 
                    posx: form.posx, 
                    posy: form.posy, 
                    posz: form.posz
                });
                res = result.data.length == 0 ? true : false;

            }
            return res;

        }
    });
    
    App.replaceMainContent(dtLocal, async () => App.loadAllCrudData('local', dtLocal));
}