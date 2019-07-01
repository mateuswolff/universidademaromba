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
let orderPRODUCTION = [];
let haveNewProgram = false;

export async function showScreen(event) {

    let dtSequencing = new WebixDatatable("dtSequencing");
    dtSequencing.drag = true;
    dtSequencing.rowHeight = 60;


    let allEquipment = await App.api.ormDbFind('equipment', { status: 'true' });
    allEquipment.data.sort(function (a, b) {
        if (a.description < b.description) return -1;
        if (a.description > b.description) return 1;
        return 0;
    });

    // Verifico se o Usuário tem Permissão para Sequenciar
    let button = await permission.checkObjectPermission('pcp.schedulling.btnAdd');

    dtSequencing.columns = [
        { id: "status", header: "", width: 35, css: "center", template: "{common.checkbox()}" },
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
        // {
        //     id: "statusmovement",
        //     header: [i18n("Movement"),
        //     { content: "textFilter" }],
        //     sort: "string",
        //     width: 55,
        //     template: (item) => {

        //     }
        // },
        {
            id: "urgency",
            width: 80,
            header: [i18n("Urgency"),
            { content: "textFilter" }],
            sort: "string"
        },
        {
            id: "idordersap",
            width: 90,
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
            width: 180,
            header: [i18n("Material to Produce"),
            { content: "textFilter" }],
            sort: "string",
        },
        {
            id: "rawmaterial",
            width: 180,
            header: [i18n("Raw Material"),
            { content: "textFilter" }],
            sort: "string",
        },
        {
            id: "setup",
            width: 80,
            header: [i18n("Setup Time"),
            { content: "textFilter" }],
            sort: "string",
            //format: (value) => { return value ? moment(value).format("HHH/MM") : '' },
        },
        {
            id: "scheduledtime",
            width: 80,
            header: [i18n("Time"),
            { content: "textFilter" }],
            sort: "string",
            //format: (value) => { return value ? moment(value).format("HHH/MM") : '' },
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
                if (button === true)
                    return "<div class='webix_el_button'><button class='webixtype_base'>" + i18n('Add instruction') + "</button></div>"
                else
                    return "-"
            }
        }
    ];
    dtSequencing.data = [];
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

    let modal = new WebixWindow();
    modal.body = {
        view: "form",
        id: "frmCrud",
        elements: [
            new WebixInputText("material", i18n("Material")),
            new WebixInputText("description", i18n("Description"))
        ],
        rules: {
            "material": webix.rules.isNotEmpty,
            "description": webix.rules.isNotEmpty,
        }
    };
    modal.modal = true;

    const sort = {
        view: "button",
        id: "btnSort",
        value: i18n('Save sort order'),
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
            requestMovement($$('dtSequencing').serialize());
        },
        value: i18n('Request RM'),
    }

    let changePriority = {
        view: "button",
        id: "changePriority",
        width: 130,
        click: async () => {
            if (!$$('dtSequencing').getSelectedItem())
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
        rows: [
            {
                cols: [
                    new WebixInputSelect('equipaments', i18n('Equipment'), allEquipment.data, {
                        template: function (obj) {
                            return obj.description;
                        }
                    }),
                    {},
                    {
                        view: "radio",
                        id: "rdSituation",
                        label: i18n('Situation'),
                        labelPosition: "top",
                        value: 'C',
                        options: [
                            { "id": 'C', "value": i18n('Current') }, // the initially selected item
                            { "id": 'N', "value": i18n('New') }
                        ]
                    }
                ]
            },
            {
                height: 20,
                cols: [
                    {},
                    {},
                    {
                        id: 'haveProgram',
                        template: `Existe um novo programa que precisa ser publicado`,
                        hidden: !haveNewProgram
                    }
                ]
            },
            {
                cols: [
                    sort,
                    {},
                    // generateOP,
                    changePriority,
                    requestRM,
                    // changeEquipSequence,
                    removeOrderButton,
                ],
            },
            {
                rows: [
                    dtSequencing
                ]
            }
        ]
    }

    let menu = createSimpleCrudMenu(i18n('Sequencing'));
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);

    await util.datatableColumsGet('dtSequencing', event);
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

                        let result = await App.api.deleteMoveRequest(item);
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
    let menu = WebixBuildReponsiveTopMenu(title, [
        {
            id: "btnRefresh",
            icon: "fas fa-search",
            label: ` ` + i18n("Search"),
            click: async () => {
                searchOrdersByFilter();
            }
        },
        {
            id: "btnPublish",
            icon: "fas fa-bolt",
            label: ` ` + i18n("Publish"),
            click: async () => {
                publish();
            }
        }
    ]);
    return menu;
}

/**
 * Função responsavel por pesquisar ordens pelo filtro
 */
async function searchOrdersByFilter() {

    let idequipment = $$('cmbEquipaments').getValue();
    let situation = $$('rdSituation').getValue();
    orderPRODUCTION = [];

    let setupparameter = await App.api.ormDbFind('setupparameter', { idequipment: idequipment });
    setupparameter = setupparameter.data.length > 0 ? setupparameter.data[0] : null

    if (idequipment && situation) {

        let result = await App.api.ormDbProgramOrderByEquipmentAndSituation({
            equipment: idequipment,
            situation: situation
        });

        let newProgram = await App.api.ormDbProgramOrderByEquipmentAndSituation({
            equipment: idequipment,
            situation: 'N'
        });

        haveNewProgram = newProgram.success && newProgram.data.length ? true : false;

        if (haveNewProgram) {
            $$('haveProgram').show();
        } else {
            $$('haveProgram').hide();
        }

        if (result.data.length)
            orderPRODUCTION = result.data;

        for (let i = 0; i < orderPRODUCTION.length; i++) {

            orderPRODUCTION[i].setup = 0;

            if(i > 0 && setupparameter){

                if(orderPRODUCTION[i].diameterm != orderPRODUCTION[i-1].diameterm){
                    orderPRODUCTION[i].setup = setupparameter.cgdiameter ? setupparameter.cgdiameter : 0;
                }
                else if(orderPRODUCTION[i].norm != orderPRODUCTION[i-1].norm){
                    orderPRODUCTION[i].setup = setupparameter.cgnorm ? setupparameter.cgnorm : 0;
                }
                else if(orderPRODUCTION[i].thicknessm != orderPRODUCTION[i-1].thicknessm){
                    orderPRODUCTION[i].setup = setupparameter.cgthickness ? setupparameter.cgthickness : 0;
                }
                else if(orderPRODUCTION[i].lengthm != orderPRODUCTION[i-1].lengthm){
                    orderPRODUCTION[i].setup = setupparameter.cglength ? setupparameter.cglength : 0;
                }
                else if(orderPRODUCTION[i].steelm != orderPRODUCTION[i-1].steelm){
                    orderPRODUCTION[i].setup = setupparameter.cgsteel ? setupparameter.cgsteel : 0;
                }

            }

            if (orderPRODUCTION[i].equipmentscheduledtype == 'CUT') {

                // Number Cutting Calculate and LeftOver
                let so = orderPRODUCTION[i].lengthm;

                if (orderPRODUCTION[i].lengthm < orderPRODUCTION[i].lengthrm)
                    so = parseFloat(orderPRODUCTION[i].lengthm) + 3;

                //let so = parseFloat($$('dtscheduledOrder').getSelectedItem().lengthm) + 3;       // Sequence Order
                let rm = orderPRODUCTION[i].lengthrm;                                              // Raw Material
                let ct = parseInt(rm / so);                                                        // Cutting Tubes Number
                let leftOver = rm - (so * ct);                                                     // LeftOver

                if (leftOver)
                    orderPRODUCTION[i].leftover = leftOver.toFixed(2);

                let totalPieces = 0;

                if (orderPRODUCTION[i].sumpiecesallocated) {
                    totalPieces = ct * orderPRODUCTION[i].sumpiecesallocated;
                    orderPRODUCTION[i].expectedquantity = totalPieces
                }
                else if (orderPRODUCTION[i].sumallocation) {
                    let aux = await util.calcWeightParts(orderPRODUCTION[i].idrawmaterial, 'piecies', orderPRODUCTION[i].sumallocation);

                    totalPieces = ct * aux
                    orderPRODUCTION[i].expectedquantity = totalPieces
                }

            }
            
        }
        
        reloadTable();

        if (!result.data.length) {
            webix.message(i18n("No data for this filter"));
            orderPRODUCTION = [];
            // Atualizando a tabela com os valores.
            reloadTable();
        }
    }
    else {
        webix.message(i18n("Please, select an equipment"));
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
    orderPRODUCTION = $$('dtSequencing').serialize();
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
        let filteredarray = item.filter(x => x.status == 1);

        if (filteredarray.length > 0) {

            webix.confirm({
                text: i18n("Do you want to request the move of the lots of the selected orders?"),
                ok: i18n("Yes! Confirm"),
                cancel: i18n("No! Cancel"),
                callback: async function (result) {
                    if (result) {
                        let notmovemented = [];
                        let movemented = [];

                        for (let i = 0; i < filteredarray.length; i++) {

                            let idequipment = filteredarray[i].idequipmentscheduled;

                            let local = await App.api.ormDbFind('local', { idequipment: idequipment });

                            if (local.data.length > 0) {

                                let idLocal = local.data[0].id;
                                let count = 0;

                                let allAllocatedRawMaterialLots = await App.api.ormDbTubesLotSystem({ idordermes: filteredarray[i].idordermes });

                                for (let j = 0; j < allAllocatedRawMaterialLots.data.length; j++) {

                                    if (allAllocatedRawMaterialLots.data[j].idlocal == idLocal) {
                                        notmovemented.push(filteredarray[i].idordermes)
                                    }
                                    else {
                                        
                                        let data = allAllocatedRawMaterialLots.data[j];
                                        let moveCount = await App.api.ormDbFind('moverequest', {
                                            idequipment: idequipment,
                                            idlot: data.idlot,
                                            status: true
                                        });
                                        
                                        if (moveCount.data.length == 0) {
                                            movemented.push(filteredarray[i].idordermes)
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
                                        }
                                    }
                                }

                            } else {
                                webix.message(i18n('There is no local registered to this equipment!'));
                            }
                        }

                        if (movemented.length > 0) {

                            movemented = movemented.filter(function(elem, i) {
                                return movemented.indexOf(elem) === i;
                            });

                            let messsage = '';
                            movemented.forEach(e => {
                                messsage = messsage + e + ', '
                            })

                            messsage = messsage.substring(0,(messsage.length - 2));
                            messsage += '!'

                            webix.alert(i18n('You have requested to move the lots of the following orders: ') + messsage)

                            movemented = [];
                        }
                        else {
                            webix.message(i18n('All the lots of the selected orders are already in front of the equipment!'))
                            movemented = [];
                        }
                    }
                }
            });

        }
        else {
            webix.message(i18n('Please, select some order to request the Raw Material'))
        }
        return;

    }
}

async function publish() {

    let idequipment = $$('cmbEquipaments').getValue();
    let iduser = localStorage.getItem('login');

    if (idequipment) {

        let data = await App.api.ormDbPlaySchedulling({ equipment: idequipment, iduser: iduser });
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

function reloadTable() {
    $$('dtSequencing').clearAll();
    $$('dtSequencing').parse(orderPRODUCTION, "json");
}