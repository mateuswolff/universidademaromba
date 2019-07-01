import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { optionsStatus, associationFields } from "../components/optionsScreens.js"
import { WebixCrudDatatable, WebixInputText, WebixInputCombo, WebixInputSelect } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen() {
 
    let dtPrint = new WebixCrudDatatable("dtPrint");
    
    let layouts = await App.api.ormDbFind('layout', {status: true});

    dtPrint.columns = [
        { id: "name", header: [i18n("Name"), { content: "textFilter" }], width: 200, sort: "string", fillspace: true },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], width: 200, sort: "string", fillspace: true },
        { id: "ip", header: [i18n("IP"), { content: "textFilter" }], width: 200, sort: "string", fillspace: true },
        {
            id: "idlayout",
            template: (obj) => {
                let option = (layouts.data.find(x => x.id == obj.idlayout));
                if(layouts.data.length && option){
                    return option.name;
                }else{
                    return '-'
                }
            },
            header: [i18n("Layout"), { content: "selectFilter" }], sort: "string", width: 200, fillspace: true
        },
    ]

    dtPrint.createStatusColumn();
    dtPrint.changeFilterOptions();

    let itens = [
        new WebixInputText("id", i18n("Id"), { disabled: true }),
        {
            cols: [
                new WebixInputText("name", i18n("Name")),
                new WebixInputText("description", i18n("Description")),
            ]
        },
        {
            cols: [
                new WebixInputText("ip", i18n("IP")),
                new WebixInputSelect('idlayout', i18n('Layout'), layouts.data, {
                    template: (item) => {
                        return item.name;
                    }
                })
            ]
        }
    ]

    let rules = {
        "name": webix.rules.isNotEmpty,
        "description": webix.rules.isNotEmpty,
        "ip": webix.rules.isNotEmpty,
        "idlayout": webix.rules.isNotEmpty,
    }

    App.createDefaultFormCrud('Printers', dtPrint, itens, rules, 'print', {
        items: [
            {
                id: "btnTest",
                icon: "fas fa-print",
                label: "Test printer",
                click: async () => {
                    let grid = $$(dtPrint.id);
                    let item = grid.getSelectedItem();

                    item.iduser = localStorage.getItem('login');

                    if (item == null) {
                        webix.message(i18n('An item must be selected'));
                        return;
                    } else {
                        item.test = true;
                        let result = await App.api.ormDbPrint(item);
                        if (result.success) {
                            webix.message(i18n('Sent'));
                        }
                    }
                }
            }
        ]
    });

    App.replaceMainContent(dtPrint, async () => App.loadAllCrudData('print', dtPrint));
}