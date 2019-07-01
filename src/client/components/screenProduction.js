import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixBuildReponsiveTopMenu, WebixInputText, WebixInputSelect } from "../lib/WebixWrapper.js";

import * as util from "../lib/Util.js";

import * as modalMovement from '../extra/_modalMovement.js';

export async function showScreen(event) {

    let dtForEquipament = new WebixCrudDatatable("dtForEquipament");

    let dtRawMaterialLots = new WebixCrudDatatable("dtRawMaterialLots");
    
    let dtForDeposit = new WebixCrudDatatable("dtForDeposit");
    
    let allForEquipment = "";
    let fieldForEquipment = async () => {

        let idequipment = $$('cmbEquipment').getValue();

        allForEquipment = await App.api.ormDbMovement({"idequipment": idequipment});

        $$('dtForEquipament').clearAll();

        if(allForEquipment.data.length > 0 ) {
            $$('dtForEquipament').parse(allForEquipment.data, "json");
        } else {
            webix.message({ text: i18n('No results were found for this search.') });
        }     

    }

    /* Equipments */
    let allEquipment = await App.api.ormDbFind('equipment');

    let equipments = new WebixInputSelect('equipment', i18n('Equipments'), allEquipment.data, {
        template: function (obj) {
            return obj.description;
        },
        "onChange": fieldForEquipment
    });

    /* For equipment */
    let titleForEquipment = ({
        view: "label",
        label: i18n("For Equipment"),
        inputWidth: 100,
        align: "left"
    });

    dtForEquipament.columns = [
        {
            id: "description",
            header: i18n("Place"),
            width: 150
        },
        {
            id: "idequipment",
            header: i18n("Deposit"),
            width: 80
        },
        {
            id: "idmaterial",
            header: i18n("Material"),
            width: 150
        },
        {
            id: "idlot",
            header: i18n("Lot"),
            width: 80
        },
        {
            id: "numberparts",
            header: i18n("Number of Parts"),
            width: 120
        },
        {
            id: "weight",
            header: i18n("Weight"),
            width: 80
        },
        {
            id: "idorder",
            header: i18n("OP"),
            width: 80
        },
        {
            id: "momentdate",
            header: i18n("Date"),
            format: (value) => { return moment(value).format("DD/MM/YYYY HH:mm:ss"); },
            width: 100
        },
        {
            id: "iduser",
            header: i18n("User"),
            width: 80
        },
        {
            id: "movement",
            header: i18n("Movement"),
            width: 100,
            template: "<div class='webix_el_button'><button class='webixtype_movement'>"+i18n('Movement')+"</button></div>"
        },
        {
            id: "changeLot",
            header: i18n("Change Lot"),
            width: 100,
            template: "<div class='webix_el_button'><button class='webixtype_change'>"+i18n('Change')+"</button></div>"
        }
    ];
    dtForEquipament.onClick = {
        webixtype_movement: function (ev, id) {
           modalMovement.showModal(this.getItem(id));
        },
        webixtype_change: function (ev, id) {
            modalMovement.showModal(this.getItem(id));
        }
    };
    dtForEquipament.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtForEquipament", event);
        }
    };

    /* Lot for exchange */
    let titleMaterialLots = ({
        view: "label",
        label: i18n("Select lot to exchange"),
        inputWidth: 100,
        align: "left"
    });

    dtRawMaterialLots.columns = [
        {
            id: "place",
            header: i18n("Place"),
            width: 70
        },
        {
            id: "material",
            header: i18n("Material"),
            width: 80
        },
        {
            id: "lot",
            header: i18n("Lot"),
            width: 80
        },
        {
            id: "expectedquantity",
            header: i18n("Number of Parts"),
            width: 120
        },
        {
            id: "weight",
            header: i18n("Weight"),
            width: 80
        },
    ]
    dtRawMaterialLots.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtRawMaterialLots", event);
        }
    };

    let titleProductionForDeposit = ({
        view: "label",
        label: i18n("For Deposit"),
        inputWidth: 100,
        align: "left"
    })

    dtForDeposit.columns = [
        {
            id: "placeOf",
            header: i18n("Place of"),
            width: 70
        },
        {
            id: "placeTo",
            header: i18n("Place To"),
            width: 80
        },
        {
            id: "material",
            header: i18n("Material"),
            width: 80
        },
        {
            id: "lot",
            header: i18n("Lot"),
            width: 80
        },
        {
            id: "expectedquantity",
            header: i18n("Number of Parts"),
            width: 120
        },
        {
            id: "weight",
            header: i18n("Weight"),
            width: 80
        },
        {
            id: "requestdate",
            header: i18n("Date"),
            // format: (item) => {
            //     return moment(item).format('DD/MM/YYYY');
            // },
            width: 100
        },
        {
            id: "user",
            header: i18n("User"),
            width: 80
        },
        {
            id: "movement",
            header: i18n("Movement"),
            width: 80,
            template: "<div class='webix_el_button'><button class='webixtype_base'> Click me uhuuu</button></div>"
        },
        {
            id: "changeLot",
            header: i18n("Change Lot"),
            width: 80,
            template: "<div class='webix_el_button'><button class='webixtype_base'> Click me uhuuu</button></div>"
        }
    ]
    dtForDeposit.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtForDeposit", event);
        }
    };

    let buttonAlloc = {
        view: "button",
        id: "buttonRequestRM",
        width: 100,
        click: () => {

        },
        value: i18n('Alloc'),
    }
    
    const grids = {
        view: 'form',
        id: "grids",
        minWidth: 800,
        rows: [
            equipments,
            titleForEquipment,
            {
                cols: [
                    dtForEquipament
                ],
            },
            titleMaterialLots,
            {
                cols: [
                    dtRawMaterialLots
                ],
            },
            {
                cols: [
                    {},
                    buttonAlloc,
                    {},
                ],
            },
            titleProductionForDeposit,
            {
                cols: [
                    dtForDeposit
                ]
            }
        ]   
    };

    let menu = createSimpleCrudMenu(i18n('Movement'));
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);

    await util.datatableColumsGet('dtForEquipament', event);
    await util.datatableColumsGet('dtRawMaterialLots', event);
    await util.datatableColumsGet('dtForDeposit', event);
}

function createSimpleCrudMenu(title) {
    
    let menu = WebixBuildReponsiveTopMenu(title, [{
        id: "save",
        icon: "fas fa-save",
        label: i18n('Save'),
        click: async () => {

            if (localStorage.getItem('save') === null) {
                webix.message(i18n('No Item Salve'));
            } else {
                localStorage.removeItem('save');
                let item = $$("dtForEquipament").serialize()[0];
                item.idorderplanned = $$("dtForEquipament").serialize()[0].idorderplanned;
                await this.api.ormDbUpdate({"idordermes": item.idordermes}, 'order', item);
                webix.message(i18n('Salve successfully'));
            }
        }

    }, {
        id: "remove",
        icon: "fas fa-trash-alt",
        label: "Remove",
        click: async () => {

            let grid = $$('dtForEquipaments');
            let item = grid.getSelectedItem();

            if (item == null) {
                webix.message(i18n('An item must be selected'));
                return;
            } else {
                item.idorderplanned = null;
                await this.api.ormDbUpdate({"idordermes": item.idordermes}, 'order', item);
                $$('dtForEquipament').clearAll();
                webix.message(i18n('Item removed successfully'));
                return;
            }
        }
    
    }]);

    return menu;
}