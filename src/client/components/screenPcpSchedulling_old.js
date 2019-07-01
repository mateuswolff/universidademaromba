import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixDatatable, WebixInputText, WebixInputDate, WebixWindow, WebixInputSelect, WebixBuildReponsiveTopMenu } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

import * as modalSpecialInstruction from '../extra/_modalSpecialInstruction.js';
import * as modalChangeEquipment from '../extra/_modalChangeEquipment.js';
import * as modalProductionOrderCreate from '../extra/_modalProductionOrderCreate.js';
import * as modalChangePriority from '../extra/_modalChangePriority.js';

import * as permission from '../control/permission.js';

// Variavel global para definir todas ordens
let orders = [];
let orderPRODUCTION = [];
let orderPLANNED = [];

export async function showScreen(event) {

    let dtSequencing = new WebixDatatable("dtSequencing");

    let dtNotSequencing = new WebixDatatable("dtNotSequencing");
 
    let allEquipment = await App.api.ormDbFind('equipment', { status: 'true' });
    allEquipment.data.sort(function (a, b) {
        if (a.description < b.description) return -1;
        if (a.description > b.description) return 1;
        return 0;
    });

    let dateFilter = new WebixInputDate(
        'period',
        i18n('Period'),
        {
            view: 'daterangepicker',
            id: 'idDateFilter',
            onChange: searchOrdersByFilter
        },
        {
            start: moment().subtract(30, 'd').format("YYYY/MM/DD"),
            end: moment().format("YYYY/MM/DD"),
        }
    );

    let equip = new WebixInputSelect('equipaments', i18n('Equipment'), allEquipment.data, {
        template: function (obj) {
            return obj.description;
        },
        "onChange": searchOrdersByFilter
    });

    // Verifico se o Usuário tem Permissão para Sequenciar
    let button = await permission.checkObjectPermission('pcp.schedulling.btnAdd');
    
    dtSequencing.columns = [
        {
            id: "sequence",
            width: 40,
            header: [i18n("Seq"),
            { content: "textFilter" }],
            sort: "int",
        },
        {
            id: "statusallocation",
            header: [i18n("Status"),
            { content: "textFilter" }],
            sort: "string",
            width: 55,
            template: (item) => `<div class='${item.statusallocation}'></div>`
        },
        {
            id: "urgency",
            width: 80,
            header: [i18n("Urgency"),
            { content: "textFilter" }],
            sort: "string"
        },
        {
            id: "idordersap",
            width: 80,
            header: [i18n("Order SAP"),
            { content: "textFilter" }],
            sort: "int",
        },
        {
            id: "idordermes",
            width: 80,
            header: [i18n("Order MES"),
            { content: "textFilter" }],
            sort: "int",
        },
        {
            id: "material",
            width: 220,
            header: [i18n("Material to Produce"),
            { content: "textFilter" }],
            sort: "string",
        },
        {
            id: "rawmaterial",
            width: 220,
            header: [i18n("Raw Material"),
            { content: "textFilter" }],
            sort: "string",
        },
        {
            id: "requestdate",
            width: 100,
            header: [i18n("Date"),
            { content: "textFilter" }],
            sort: "int",
            format: (value) => { return value ? moment(value).format("DD/MM/YYYY") : '' },
        },
        {
            id: "widthm",
            width: 80,
            header: [i18n("Width"),
            { content: "textFilter" }],
            sort: "int",
        },
        {
            id: "lengthm",
            width: 80,
            header: [i18n("Length"),
            { content: "textFilter" }],
            sort: "int",
        },
        {
            id: "thicknessm",
            width: 80,
            header: [i18n("Thickness"),
            { content: "textFilter" }],
            sort: "int",
        },
        {
            id: "diameterm",
            width: 80,
            header: [i18n("Diameter"),
            { content: "textFilter" }],
            sort: "int",
        },
        {
            id: "weight",
            width: 80,
            header: [i18n("Weight"),
            { content: "textFilter" }],
            sort: "int",
        },
        {
            id: "expectedquantity",
            width: 80,
            header: [i18n("Pieces"),
            { content: "textFilter" }],
            sort: "int",
        },
        {
            id: "instruction",
            header: [i18n("Instruction"),
            { content: "textFilter" }],
            sort: "string",
            height: 60,
            template: () => {
                if(button === true)
                    return "<div class='webix_el_button'><button class='webixtype_base'>" + i18n('Add instruction') + "</button></div>"
                else
                    return "-" 
            }
        }
    ];
    dtSequencing.data = {};
    dtSequencing.onClick = {
        webixtype_base: function (ev, id) {
            modalSpecialInstruction.showModal(this.getItem(id));
        }
    };
    dtSequencing.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtSequencing", event);
        }
    };

    dtNotSequencing.columns = [
        {
            id: "idordersap",
            header: [i18n("Order SAP"),
            { content: "textFilter" }],
            sort: "int",
            fillspace: true
        },
        {
            id: "material",
            header: [i18n("Material"),
            { content: "textFilter" }],
            sort: "string",
            width: 220
        },
        {
            id: "rawmaterial",
            header: [i18n("Raw Material"),
            { content: "textFilter" }],
            sort: "string",
            width: 220
        },
        {
            id: "requestdate",
            header: [i18n("Date"),
            { content: "textFilter" }],
            sort: "int",
            format: (value) => { return value ? moment(value).format("DD/MM/YYYY") : '' },
            fillspace: true
        },
        {
            id: "widthm",
            header: [i18n("Width"),
            { content: "textFilter" }],
            sort: "int",
            fillspace: true
        },
        {
            id: "lengthm",
            header: [i18n("Length"),
            { content: "textFilter" }],
            sort: "int",
            fillspace: true
        },
        {
            id: "thicknessm",
            header: [i18n("Thickness"),
            { content: "textFilter" }],
            sort: "int",
            fillspace: true
        },
        {
            id: "diameterm",
            header: [i18n("Diameter"),
            { content: "textFilter" }],
            sort: "int",
            fillspace: true
        },
        {
            id: "weight",
            header: [i18n("Weight"),
            { content: "textFilter" }],
            sort: "int",
            fillspace: true
        },
        {
            id: "expectedquantity",
            header: [i18n("Number of Parts"),
            { content: "textFilter" }],
            sort: "int",
            fillspace: true
        }
    ];
    dtNotSequencing.data = {};
    dtNotSequencing.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtNotSequencing", event);
        }
    };

    let titlescheduled = ({
        view: "label",
        label: i18n("scheduled Orders"),
        inputWidth: 100,
        align: "left"
    });
 
    let titleNotscheduled = ({
        view: "label",
        label: i18n("Planned Orders Not scheduled"),
        inputWidth: 100,
        align: "left"
    });

    let buttonPO = [
        new WebixInputText("material", i18n("Material")),
        new WebixInputText("description", i18n("Description"))
    ]

    let rules = {
        "material": webix.rules.isNotEmpty,
        "description": webix.rules.isNotEmpty,
    }

    const frmCrud = {
        view: "form",
        id: "frmCrud",
        elements: buttonPO,
        rules: rules
    }

    let modal = new WebixWindow();
    modal.body = frmCrud;
    modal.modal = true;

    const secUp = {
        view: "button",
        id: "btnOrderSECUP",
        click: async () => {
            let grid = $$('dtSequencing');
            let item = grid.getSelectedItem();
            if (item == null) {
                webix.message(i18n('An item must be selected'));
                return;
            } else {
                changeSequenceOrderUp(item);
            }
        },
        css: "toolbarMiddler",
        width: 40,
        type: "icon",
        inputWidth: 150,
        icon: "fas fa-angle-up"
    }

    const secDown = {
        view: "button",
        id: "btnOrderSECDOWN",
        click: async () => {
            let grid = $$('dtSequencing');
            let item = grid.getSelectedItem();
            if (item == null) {
                webix.message(i18n('An item must be selected'));
                return;
            } else {
                changeSequenceOrderDown(item);
            }
        },
        css: "toolbarMiddler",
        width: 40,
        type: "icon",
        inputWidth: 150,
        icon: "fas fa-angle-down",
    }

    const orderSec = {
        view: "button",
        id: "btnOrderSEC",
        width: 40,
        click: async () => {
            let grid = $$('dtNotSequencing');
            let item = grid.getSelectedItem();
            if (item == null) {
                webix.message(i18n('An item must be selected'));
                return;
            } else {
                if (item.rawmaterial) {
                    change(item);
                } else {
                    webix.message(i18n('There is no raw material for this order. Please contact your superior.'));
                }
            }
        },
        type: "icon",
        inputWidth: 150,
        icon: "fas fa-angle-up"
    }

    const notSecOrder = {
        view: "button",
        id: "btnOrderDESEC",
        width: 40,
        click: async () => {
            let grid = $$('dtSequencing');
            let item = grid.getSelectedItem();
            if (item == null) {
                webix.message(i18n('An item must be selected'));
                return;
            } else {
                change(item);
            }
        },
        type: "icon",
        inputWidth: 150,
        icon: "fas fa-angle-down",
    }

    const generateOP = {
        view: "button",
        id: "btnGenerateOP",
        width: 100,
        click: () => {

            let grid = $$('dtNotSequencing');
            let item = grid.getSelectedItem();

            if (item == null) {

                webix.message(i18n('An item must be selected'));
                return;

            } else {

                modalProductionOrderCreate.showModal($$('dtNotSequencing').getSelectedItem(), 'schedulling').then((response) => {
                    searchOrdersByFilter();
                });
            }

        },
        value: i18n('Generate OP'),
        align: "right",
    }

    const sort = {
        view: "button",
        id: "btnSort",
        value: i18n('Sort'),
        // align: "left",
        width: 130,
        click: () => {
            sortOrders();
        }
    }

    let requestRM = {
        view: "button",
        id: "btnRequestRM",
        width: 130,
        click: () => {
            requestMovement($$('dtSequencing').getSelectedItem());
        },
        value: i18n('Request RM'),
    }

    let changePriority = {
        view: "button",
        id: "changePriority",
        width: 130,
        click: async () => {
            if(!$$('dtSequencing').getSelectedItem())
                webix.message(i18n("Please, select a order!"))
            else {
                let res = await modalChangePriority.showModal($$('dtSequencing').getSelectedItem());
                searchOrdersByFilter();
            }
        },
        value: i18n('Change Priority'),
    }

    const removeOrderButton = {
        view: "button",
        id: "btnRemoveOrder",
        value: i18n('Remove Order'),
        align: "right",
        width: 130,
        click: () => {
            removeOrder($$('dtSequencing').getSelectedItem());
        }
    }

    const grids = {
        view: 'form',
        responsive: true,
        id: "sequence",
        rows: [{
            cols: [
                equip,
                dateFilter,
            ]
        },
            titlescheduled,
        {
            cols: [
                sort,
                {},
                changePriority,
                requestRM,
                changeEquipSequence,
                removeOrderButton,
            ],
        },
        {
            height: 200,
            cols: [{
                view: "toolbar",
                cols: [{
                    rows: [
                        secUp,
                        secDown
                    ],
                },],
            },
                dtSequencing
            ]
        },
        {
            view: "toolbar",
            css: "toolbarCentering",
            cols: [
                orderSec,
                notSecOrder,
            ],
        },
            titleNotscheduled,
        {
            cols: [
                {},
                {},
                generateOP,
            ],
        },
            dtNotSequencing
        ]
    }

    let menu = createSimpleCrudMenu(i18n('Sequencing'));
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);

    await util.datatableColumsGet('dtSequencing', event);
    await util.datatableColumsGet('dtNotSequencing', event);
}

/**
 * Remove um ordem.
 * @param {Order} item 
 */
function removeOrder(item) {

    if (item) {
        if (item.orderstatus == 'IN_PROCESS' || item.orderstatus == 'PAUSED') {
            webix.message(i18n('You can not remove order in production or paused.'));
        } else {
            webix.confirm({
                title: i18n("Are you sure you want to delete this order?"),
                ok: i18n("Yes! Remove"),
                cancel: i18n("No! Cancel"),
                text: `<strong>order MES nº </strong> ${item.idordermes} \n<strong>order SAP nº </strong> ${item.idordersap}`,
                callback: async function (result) {
                    if (result) {
                        let result = await App.api.ormDbDelete({ idprogram: item.idproductionprogram, idorder: item.idordermes }, 'productionprogramitem');
                        let index = orderPRODUCTION.indexOf(item);
                        updateSequence(index);
                        if (!result.success) {
                            webix.alert(i18n('Error deleting a planned order.'))
                        }
                    }
                }
            });
        }
    } else {
        webix.message("Please select some item");
    }
}

/**
 * Cria menu com titulo
 * @param {string} title 
 */
function createSimpleCrudMenu(title) {
    let menu = WebixBuildReponsiveTopMenu(title, [{
        id: "btnRefresh",
        icon: "fas fa-redo",
        label: "Refresh",
        click: async () => {
            searchOrdersByFilter();
        }
    }]);
    return menu;
}

/**
 * Função responsavel por pesquisar ordens pelo filtro
 */
async function searchOrdersByFilter() {

    let idequipment = $$('cmbEquipaments').getValue();
    let date = $$('idDateFilter').getValue();
    let startdate = moment(date.start).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(date.start).format('YYYY-MM-DD');
    let enddate = moment(date.end).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(date.end).format('YYYY-MM-DD');
    orderPLANNED = [];
    orderPRODUCTION = [];

    if (idequipment && enddate && startdate) {

        // Pesquisando no banco mediante os filtros.
        let scheduled = await App.api.ormDbAllOrderScheduled({
            idequipment: idequipment,
            startdate: startdate,
            enddate: enddate
        });

        let provided = await App.api.ormDbAllOrderExpected({
            idequipment: idequipment,
            startdate: startdate,
            enddate: enddate
        });

        if (provided.data.length) {
            orderPLANNED = provided.data;
        }

        if (scheduled.data.length) {
            orderPRODUCTION = scheduled.data;
        }

        // Fazendo logica para separar ordens
        reloadTable();

        if (!provided.data.length && !scheduled.data.length) {
            webix.message(i18n("No data for this filter"));
            orderPLANNED = [];
            orderPRODUCTION = [];
            // Atualizando a tabela com os valores.
            reloadTable();
        }
    }
}

/**
 * Altera para orden sequenciada a não sequenciada
 * @param {order} item 
 */
async function change(item) {
    if (item.ordertype === 'PRODUCTION') {
        if (item.idordersap || item.orderstatus == 'IN_PROCESS' || item.orderstatus == 'PAUSED') {
            webix.message(i18n('You can not cancel the schedulling order.'));
        } else {
            item.ordertype = 'PLANNED';
            item.sequence = null;
            item.idequipmentscheduled = null;

            orderPLANNED.push(item);

            let index = orderPRODUCTION.indexOf(item);
            if (index != -1) {
                orderPRODUCTION.splice(index, 1);
                updateSequence(index);

                let up = await App.api.ormDbUpdate({ idordermes: item.idordermes }, 'order', item);
                reloadTable();
            }

        }
    } else if (item.ordertype === 'PLANNED') {
        let alterOrder = {};
        item.ordertype = 'PRODUCTION';
        alterOrder.ordertype = 'PRODUCTION';
        item.sequence = orderPRODUCTION.length + 1;
        alterOrder.sequence = orderPRODUCTION.length + 1;
        item.idequipmentscheduled = $$('cmbEquipaments').getValue();
        alterOrder.idequipmentscheduled = $$('cmbEquipaments').getValue();
        orderPRODUCTION.push(item);
        let index = orderPLANNED.indexOf(item);
        if (index != -1) {
            orderPLANNED.splice(index, 1);
        }
        orderPLANNED.sort((a, b) => {
            if (a.sequence < b.sequence)
                return -1;
            if (a.sequence > b.sequence)
                return 1;
            return 0;
        });
        let result = await App.api.ormDbUpdate({ idordermes: item.idordermes }, 'order', alterOrder);
        if (result.success) {
            reloadTable();
        } else {
            webix.message(i18n('Error while schedulling an order.'));
        };
    }
}

/**
 * Altera a sequencia da ordem para baixo
 * @param {Order} item 
 */
async function changeSequenceOrderDown(item) {
    let index = orderPRODUCTION.findIndex((data) => {
        return data.sequence == item.sequence + 1;
    });
    let aux;
    if (index != -1) {
        orderPRODUCTION[index].sequence = orderPRODUCTION[index].sequence - 1;
        await App.api.ormDbUpdate({ idordermes: orderPRODUCTION[index].idordermes }, 'order', orderPRODUCTION[index]);

        orderPRODUCTION[index - 1].sequence = orderPRODUCTION[index - 1].sequence + 1;
        await App.api.ormDbUpdate({ idordermes: orderPRODUCTION[index - 1].idordermes }, 'order', orderPRODUCTION[index - 1]);

        $$('dtSequencing').clearAll();
        let sortData = orderPRODUCTION.sort((a, b) => {
            if (a.sequence < b.sequence)
                return -1;
            if (a.sequence > b.sequence)
                return 1;
            return 0;
        });
        $$('dtSequencing').parse(sortData, "json");
    }

}

/**
 * Altera a sequencia da ordem para cima
 * @param {Order} item 
 */
async function changeSequenceOrderUp(item) {
    let index = orderPRODUCTION.findIndex((data) => {
        return data.sequence == item.sequence - 1;
    });
    let aux;
    if (index != -1) {
        orderPRODUCTION[index].sequence = orderPRODUCTION[index].sequence + 1;
        await App.api.ormDbUpdate({ idordermes: orderPRODUCTION[index].idordermes }, 'order', orderPRODUCTION[index]);

        orderPRODUCTION[index + 1].sequence = orderPRODUCTION[index + 1].sequence - 1;
        await App.api.ormDbUpdate({ idordermes: orderPRODUCTION[index + 1].idordermes }, 'order', orderPRODUCTION[index + 1]);

        $$('dtSequencing').clearAll();
        let sortData = orderPRODUCTION.sort((a, b) => {
            if (a.sequence < b.sequence)
                return -1;
            if (a.sequence > b.sequence)
                return 1;
            return 0;
        });
        $$('dtSequencing').parse(sortData, "json");
    }
}

async function updateSequence(index) {
    orderPRODUCTION.splice(index, 1);
    for (let i = index; i < orderPRODUCTION.length; i++) {
        orderPRODUCTION[i].sequence = orderPRODUCTION[i].sequence - 1;
    }

    orderPRODUCTION.sort((a, b) => {
        if (a.sequence < b.sequence)
            return -1;
        if (a.sequence > b.sequence)
            return 1;
        return 0;
    });

    $$('dtSequencing').clearAll();
    $$('dtSequencing').parse(orderPRODUCTION, "json");
    sortOrders();
}

async function sortOrders() {
    let updated = await App.api.ormDbSortOrders({ orders: orderPRODUCTION });
    if (updated.success) {
        orderPRODUCTION = updated.data;
        $$('dtSequencing').clearAll();
        $$('dtSequencing').parse(orderPRODUCTION, "json");
    } else {
        webix.message(i18n('Error sequencing order.'));
    }
}

async function requestMovement(item) {
    if (item == null) {
        webix.message(i18n('An Order must be selected'));
        return;
    } else {
        if (item.orderstatus == "PRODUCTION") {
            webix.confirm({
                title: i18n("Confirm the move request for these batches?"),
                ok: i18n("Yes! Confirm"),
                cancel: i18n("No! Cancel"),
                text: `<strong> ${i18n("OP")} nº </strong> ${item.idordermes}`,
                callback: async function (result) {
                    if (result) {
                        let idequipment = item.idequipmentscheduled;

                        let local = await App.api.ormDbFind('local', { idequipment: idequipment });
                        if (local.data.length > 0) {

                            let idLocal = local.data[0].id;
                            let count = 0;

                            let allAllocatedRawMaterialLots = await App.api.ormDbTubesLotSystem({ idordermes: item.idordermes });

                            for (let i = 0; i < allAllocatedRawMaterialLots.data.length; i++) {
                                let data = allAllocatedRawMaterialLots.data[i];
                                let moveCount = await App.api.ormDbFind('moverequest', {
                                    idequipment: idequipment,
                                    idlot: data.idlot,
                                    status: true
                                });

                                if (moveCount.data.length == 0) {
                                    let moverequest = {
                                        idequipment: idequipment,
                                        idlot: data.idlot,
                                        idlocal: idLocal,
                                        situationmovement: 'P',
                                        idtransportresource: null,
                                        momentdate: new Date(),
                                        idmovimentuser: null,
                                        idexchangelot: null,
                                        exchangedate: null,
                                        idexchangeuser: null,
                                        iduser: localStorage.getItem('login')
                                    };
                                    await App.api.ormDbCreate('moverequest', moverequest);
                                    count++;
                                }
                            }

                            if (count == 0) {
                                webix.message(i18n('Movement already requested'));
                            } else {
                                webix.message(i18n('Successfully requested movement'));
                            }

                        } else {
                            webix.message(i18n('There is no local registered to this equipment!'));
                        }
                    }
                }
            });
            return;
        } else {
            webix.message(i18n('Order already started or finished'));
            return;
        }
    }
}

async function publish() {
    
    let idequipment = $$('cmbEquipaments').getValue();
    let iduser =  localStorage.getItem('login');

    if (idequipment) {

        let data = await App.api.ormDbPlaySchedulling({equipment: idequipment, iduser: iduser});
        if (data.success) {
            webix.message(i18n("Publish Success"));
            searchOrdersByFilter();
        } else {
            webix.message(i18n("No data to publish!"));
        }
    } else {
        webix.message(i18n("Please select an equipment!"));
    }
 }

/**
 * Atualiza a tabela
 */
function reloadTable() {
    $$('dtNotSequencing').clearAll();
    $$('dtNotSequencing').parse(orderPLANNED, "json");
    $$('dtSequencing').clearAll();
    $$('dtSequencing').parse(orderPRODUCTION, "json");
}