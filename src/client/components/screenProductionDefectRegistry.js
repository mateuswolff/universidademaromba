import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixBuildReponsiveTopMenu } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

import * as modalDefectRegister from '../extra/_modalDefectRegistry.js';

export async function showScreen(event) {

    let dtDefectRegistry = new WebixCrudDatatable("dtDefectRegistry");

    let allDefectRegistry = await App.api.ormDbFind('defect');
    let allTypeDefect = await App.api.ormDbFind('defecttype');

    dtDefectRegistry.data = allDefectRegistry.data;

    /* Stops */
    dtDefectRegistry.columns = [
        {
            id: "iddefecttype",
            header: [i18n("Defect"), { content: "textFilter" }],
            fillspace: true,
            template: (obj) => {
                let result = allTypeDefect.data.find(item => item.id === obj.iddefecttype);
                if (result) {
                    return result.description;
                } else {
                    return '-'
                }
            },
            sort: "int"
        },
        {
            id: "idlot",
            header: [i18n("Lot"), { content: "textFilter" }],
            fillspace: true,
            sort: "string"
        },
        {
            id: "idorder",
            header: [i18n("OP"), { content: "textFilter" }],
            fillspace: true,
            sort: "int"
        },
        {
            id: "dtcreated",
            header: [i18n("Date"), { content: "textFilter" }],
            format: (value) => { return moment(value).format("DD/MM/YYYY HH:mm:ss") },
            fillspace: true,
            sort: "string"
        },
        {
            id: "idoperation",
            header: [i18n("Operation"), { content: "textFilter" }],
            fillspace: true,
            sort: "int"
        },
        {
            id: "weight",
            header: [i18n("Weight"), { content: "textFilter" }],
            fillspace: true,
            sort: "int"
        },

        {
            id: "quantity",
            header: [i18n("Pieces"), { content: "textFilter" }],
            fillspace: true,
            sort: "int"
        },
        {
            id: "iduser",
            header: [i18n("Responsible"), { content: "textFilter" }],
            fillspace: true,
            sort: "int"
        }
    ];
    dtDefectRegistry.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtDefectRegistry", event);
        }
    };

    const grids = {
        view: 'form',
        minWidth: 800,
        id: "form",
        rows: [{
            cols: [
                dtDefectRegistry,
            ]
        }
        ]
    }

    let menu = createSimpleCrudMenu(i18n('Defect'), dtDefectRegistry);
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);

    await util.datatableColumsGet('dtDefectRegistry', event);    
}

function createSimpleCrudMenu(title, dtDefectRegistry) {

    let menu = WebixBuildReponsiveTopMenu(title, [{
        id: "remove",
        icon: "fas fa-trash-alt",
        label: "Remove",
        click: async () => {

            let grid = $$('dtDefectRegistry');
            let item = grid.getSelectedItem();

            if (item == null) {

                webix.message(i18n('An item must be selected'));
                return;

            } else {

                webix.confirm({
                    title: i18n("Do you want to delete this record?"),
                    ok: i18n("Yes! Remove"),
                    cancel: i18n("No! Cancel"),
                    text: `<strong> ${i18n("Defect")} nº </strong> ${item.id}`,
                    callback: async function (result) {
                        if (result) {
                            await App.api.ormDbUpdate({ "id": item.id }, 'defect', { status: false });
                            $$('dtDefectRegistry').clearAll();
                            let allDefectRegistry = await App.api.ormDbFind('defect', { status: true });
                            $$('dtDefectRegistry').parse(allDefectRegistry.data, "json");
                            webix.message(i18n('Item removed successfully'));
                        }
                    }
                });
                return;

            }

        }
    },
    {
        id: "edit",
        icon: "fas fa-edit",
        label: "Edit",
        click: async () => {

            let grid = $$('dtDefectRegistry');
            let item = grid.getSelectedItem();

            if (item == null) {
                webix.message(i18n('An item must be selected'));
                return;
            } else {
                modalDefectRegister.showModal("dtDefectRegistry", item.id, item.idlot, null);
                return;
            }

        }
    }]);

    return menu;
}