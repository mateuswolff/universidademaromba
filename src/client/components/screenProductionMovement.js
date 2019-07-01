import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixDatatable, WebixBuildReponsiveTopMenu, WebixInputText, WebixInputSelect } from "../lib/WebixWrapper.js";
import * as util from "../../lib/Util.js";

import * as modalMovementDeposit from '../extra/_modalMovementDeposit.js';
import * as modalReadQR from '../extra/_modalReadQR.js';
import * as permission from '../control/permission.js';

export async function showScreen(event) {

    let dtForEquipments = new WebixDatatable("dtForEquipments");
    let dtRawMaterialLots = new WebixDatatable("dtRawMaterialLots");
    let dtForDeposit = new WebixDatatable("dtForDeposit");

    // Verifico se o Usuário tem Permissão para Movimentar
    let button = await permission.checkObjectPermission('production.movement.btnMovement');

    /* Resource Transport */
    let allResourceTypes = await App.api.ormDbFind('transportresource', { status: true });
    allResourceTypes.data.sort(function (a, b) {
        if (a.description < b.description) return -1;
        if (a.description > b.description) return 1;
        return 0;
    });
    allResourceTypes.data.unshift({ id: "all", description: i18n('All') });

    let resourcetype = new WebixInputSelect('ResourceType', i18n('Transport Resource'), allResourceTypes.data, {
        template: function (obj) {
            return obj.description;
        }
    });

    /* Equipment */
    let allEquipment = await App.api.ormDbFind('equipment', { status: true });
    allEquipment.data.sort(function (a, b) {
        if (a.description < b.description) return -1;
        if (a.description > b.description) return 1;
        return 0;
    });
    allEquipment.data.unshift({ id: "all", description: i18n('All') });

    let equipment = new WebixInputSelect('Equipment', i18n('Equipment'), allEquipment.data, {
        template: function (obj) {
            return obj.description;
        }
    });

    let fieldLotChange = async (value) => {

        let allLotChange = await App.api.ormDbLotChange(value);

        $$('dtRawMaterialLots').clearAll(value);

        if (allLotChange.data.length > 0) {
            $$('dtRawMaterialLots').parse(allLotChange.data, "json");
        }

    }

    let idOp = new WebixInputText("idOp", i18n("OP"));

    /* For equipment */
    let titleForEquipment = ({
        view: "label",
        label: i18n("For Equipment"),
        inputWidth: 100,
        align: "left"
    });

    dtForEquipments.columns = [
        {
            id: "place",
            header: [i18n("Place"), { content: "textFilter" }], sort: "string",
            width: 90
        },
        {
            id: "placeto",
            header: [i18n("Place To"), { content: "textFilter" }], sort: "string",
            width: 90
        },
        {
            id: "idmaterial",
            header: [i18n("ID Material"), { content: "textFilter" }],
            sort: "string",
            format: webix.Number.numToStr({
                groupDelimiter: ".",
                groupSize: 3,
                decimalDelimiter: "3",
                decimalSize: 0
            }),
            width: 80
        },
        {
            id: "descriptionmaterial",
            header: [i18n("Material"), { content: "textFilter" }], sort: "string",
            width: 220
        },
        {
            id: "idlot",
            header: [i18n("Lot"), { content: "textFilter" }], sort: "string",
            width: 80
        },
        {
            id: "numberparts",
            header: [i18n("Num Part"), { content: "textFilter" }], sort: "string",
            width: 80
        },
        {
            id: "weight",
            header: [i18n("Weight"), { content: "textFilter" }], sort: "string",
            width: 80
        },
        {
            id: "idorder",
            header: [i18n("OP"), { content: "textFilter" }], sort: "string",
            width: 80
        },
        {
            id: "momentdate",
            header: i18n("Date"),
            format: (value) => { return moment(value).format("DD/MM/YYYY HH:mm:ss") },
            width: 80
        },
        {
            id: "iduser",
            header: [i18n("User"), { content: "textFilter" }], sort: "string",
            width: 80
        },
        {
            id: "movement",
            header: [i18n("Movement"), { content: "textFilter" }], sort: "string",
            width: 100,
            template: () => {
                if (button === true)
                    return "<div class='webix_el_button'><button class='webixtype_movement'>" + i18n('Movement') + "</button></div>"
                else
                    return "-"
            }
        },
    ];

    dtForEquipments.onClick = {
        webixtype_movement: function (ev, id) {

            let item = this.getItem(id, dtForEquipments);

            webix.confirm({
                title: i18n("Do you really want to make the move of the selected lot?"),
                ok: i18n("Yes! Confirm"),
                cancel: i18n("No! Cancel"),
                text: `<strong> ${i18n("Lot")} nº </strong> ${item.idlot}`,
                width: 300,
                callback: async function (result) {
                    if (result) {

                        let idResourceType = $$('cmbResourceType').getValue();

                        let moverequest = { "situationmovement": 'E', "idtransportresource": idResourceType, "idmovimentuser": localStorage.getItem('login') };
                        await App.api.ormDbUpdate({ "id": item.id }, 'moverequest', moverequest);

                        let lotcharacteristic = { "textvalue": item.idlocal };
                        await App.api.ormDbUpdate({ "idmaterial": item.idmaterial, "idlot": item.idlot, "name": 'CG_LOCALIZACAO' }, 'lotcharacteristic', lotcharacteristic);

                        let lothistory = { "lot": item.idlot, "field": 'CG_LOCALIZACAO', "valuebefore": item.place, "valueafter": item.idlocal };
                        await App.api.ormDbCreate('lothistory', lothistory);

                        fieldForEquipment();

                        $$('dtRawMaterialLots').clearAll();

                        webix.message(i18n('Successful move'));
                    }
                }
            });
            return;
        },
    };

    dtForEquipments.on = {
        "onItemClick": async function () {
            let grid = $$('dtForEquipments');
            let item = grid.getSelectedItem();
            fieldLotChange(item);
        },
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtForEquipments", event);
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
            id: "description",
            header: [i18n("Place"), { content: "textFilter" }], sort: "string",
            width: 150
        },
        {
            id: "idmaterial",
            header: [i18n("ID Material"), { content: "textFilter" }],
            sort: "string",
            format: webix.Number.numToStr({
                groupDelimiter: ".",
                groupSize: 3,
                decimalDelimiter: "3",
                decimalSize: 0
            }),
            width: 80
        },
        {
            id: "descriptionmaterial",
            header: [i18n("Material"), { content: "textFilter" }], sort: "string",
            width: 220
        },
        {
            id: "id",
            header: [i18n("Lot"), { content: "textFilter" }], sort: "string",
            width: 80
        },
        {
            id: "idorder",
            header: [i18n("OP"), { content: "textFilter" }], sort: "string",
            width: 80
        },
        {
            id: "expectedquantity",
            header: [i18n("Number of Parts"), { content: "textFilter" }], sort: "string",
            fillspace: true
        },
        {
            id: "plannedorderquantity",
            header: [i18n("Weight"), { content: "textFilter" }], sort: "string",
            fillspace: true
        }
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
            id: "idequipment",
            header: [i18n("Place"), { content: "textFilter" }], sort: "string",
            width: 90,
        },
        {
            id: "idmaterial",
            header: [i18n("ID Material"), { content: "textFilter" }],
            sort: "string",
            format: webix.Number.numToStr({
                groupDelimiter: ".",
                groupSize: 3,
                decimalDelimiter: "3",
                decimalSize: 0
            }),
            width: 80
        },
        {
            id: "descriptionmaterial",
            header: [i18n("Material"), { content: "textFilter" }], sort: "string",
            width: 220
        },
        {
            id: "idlot",
            header: [i18n("Lot"), { content: "textFilter" }], sort: "string",
            fillspace: true
        },
        {
            id: "numberparts",
            header: [i18n("Num Part"), { content: "textFilter" }], sort: "string",
            fillspace: true
        },
        {
            id: "weight",
            header: [i18n("Weight"), { content: "textFilter" }], sort: "string",
            fillspace: true
        },
        {
            id: "idorder",
            header: [i18n("OP"), { content: "textFilter" }], sort: "string",
            fillspace: true
        },
        {
            id: "momentdate",
            header: i18n("Date"),
            format: (value) => { return value ? moment(value).format("DD/MM/YYYY") : '-' },
            fillspace: true
        },
        {
            id: "iduser",
            header: [i18n("User"), { content: "textFilter" }], sort: "string",
            fillspace: true
        },
        {
            id: "movement",
            header: [i18n("Movement"), { content: "textFilter" }], sort: "string",
            fillspace: true,
            template: () => {
                if (button === true)
                    return "<div class='webix_el_button'><button class='webixtype_movement'>" + i18n('Movement') + "</button></div>"
                else
                    return "-"
            }
        }
    ];

    dtForDeposit.onClick = {
        webixtype_movement: async function (ev, id) {

            let readQR = await modalReadQR.showModal(this.getItem(id, dtForEquipments));

            let item = this.getItem(id, dtForDeposit)
            if (item && item.idlot || item.idlot == readQR) {
                modalMovementDeposit.showModal(item, dtForDeposit);
            } else {
                webix.message(i18n('Lot Selected Invalid'));
            }

        }
    };

    dtForDeposit.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtForDeposit", event);
        }
    };

    let allForDeposit = await App.api.ormDbMovementDeposit({});

    dtForDeposit.data = allForDeposit.data;

    let buttonAlloc = {
        view: "button",
        id: "btnRequestRM",
        width: 100,
        click: async () => {

            let grid = $$('dtForEquipments');
            let item = grid.getSelectedItem();

            let gridLot = $$('dtRawMaterialLots');
            let itemLot = gridLot.getSelectedItem();

            let getMoveRequest = await App.api.ormDbFind('moverequest', { "id": item.id });
            let moverequest = getMoveRequest.data[0];

            if (item.idlot) { /* Verifico se lote para troca foi selecionado */

                if (item.idorder != null) { /* Verifico se o Movimento possuir uma ordem */

                    let getAllocation = await App.api.ormDbLotChangeLot({
                        allocation: item,
                        lot: itemLot,
                        moverequest: moverequest,
                        iduser: localStorage.getItem('login')
                    });

                    if (getAllocation.success) {

                        let allOrdersAllocated = await App.api.ormDbGetAllocation({ idorder: item.idorder });
                        allOrdersAllocated = allOrdersAllocated.data

                        let order = await App.api.ormDbFind('order', { idordermes: item.idorder })
                        order = order.data[0];

                        allOrdersAllocated = allOrdersAllocated.map((obj) => {
                            return {
                                IDRAWMATERIAL: obj.idmaterial,
                                IDLOT: obj.idlot ? ("0000000000" + obj.idlot).slice(-10) : null,
                                LOTWEIGHT: parseFloat(obj.weight).toFixed(3)
                            }
                        });

                        let statusinterface = await App.api.ormDbFind('interface', {
                            idordermes: order.idordermes,
                            idstatus: {
                                $notIn: ['OK', 'RSD']
                            }
                        });
                        statusinterface = statusinterface.data;
    
                        let idstatus = statusinterface.length > 0 ? 'BLK' : 'NEW'

                        let interfaceSave = await App.createInterfaceMs01(order, {
                            idinterface: 'MS01',
                            operation: 'A',
                            idstatus: idstatus,
                            lot: allOrdersAllocated
                        });

                        interfaceSave.idordermes = order.idordermes;
                        interfaceSave.idordersap = order.idordersap ? order.idordersap : null
                        
                        let int = await App.api.ormDbCreate('interface', interfaceSave);

                        webix.message(i18n(getAllocation.message));

                    } else {
                        webix.alert(i18n(getAllocation.message));
                    }

                    fieldForEquipment();

                    let allForDeposit = await App.api.ormDbMovementEquipment({});
                    $$('dtForDeposit').clearAll();

                    if (allForDeposit.data.length > 0) {
                        $$('dtForDeposit').parse(allForDeposit.data, "json");
                    } else {
                        webix.message(i18n('No results were found for this search.'));
                    }

                } else {

                    webix.message(i18n('Movement Request without order'));

                }

            } else {

                webix.message(i18n('Lot origin not allocated'));

            }

        },
        value: i18n('Alloc'),
    }

    const grids = {
        view: 'form',
        id: "grids",
        minWidth: 800,
        rows: [{
            cols: [
                resourcetype,
                equipment,
                idOp
            ]
        },
            titleForEquipment,
        {
            cols: [
                dtForEquipments
            ],
        },
            titleMaterialLots,
        {
            cols: [
                dtRawMaterialLots
            ]
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

    await util.datatableColumsGet('dtForEquipments', event);
    await util.datatableColumsGet('dtRawMaterialLots', event);
    await util.datatableColumsGet('dtForDeposit', event);
}

function createSimpleCrudMenu(title, dtDetailLots) {

    let menu = WebixBuildReponsiveTopMenu(title, [{
        id: "search",
        label: "Search",
        icon: "fas fa-search",
        click: async () => {
            fieldForEquipment();
        }
    }]);

    return menu;
}

async function fieldForEquipment() {

    let idtransportresource = $$('cmbResourceType').getValue();
    let idequipment = $$('cmbEquipment').getValue();
    let idop = $$('grids').elements.idOp.getValue();

    $$('dtForEquipments').clearAll();
    $$('dtRawMaterialLots').clearAll();

    let allForEquipment = await App.api.ormDbMovementEquipment(
        {
            "idtransportresource": idtransportresource != "all" && idtransportresource != "" ? idtransportresource : null,
            "idequipment": idequipment != "all" && idequipment != "" ? idequipment : null,
            "idop": idop != "" ? idop : null,
        }
    );

    if (allForEquipment.data.length > 0) {
        $$('dtForEquipments').parse(allForEquipment.data, "json");
    } else {
        webix.message(i18n('No results were found for this search.'));
    }

}