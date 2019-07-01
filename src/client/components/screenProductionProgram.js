import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixBuildReponsiveTopMenu } from "../lib/WebixWrapper.js";
import * as util from "../../lib/Util.js";

import * as screenProductionProgramStart from "./screenProductionProgramStart.js";
import * as screenProductionProgramBigMakerStart from "./screenProductionProgramBigMakerStart.js";
import * as screenDashboardList from "./screenDashboardList.js";
import * as modalDetailOP from '../extra/_modalDetailOP.js';

let allAllocatedRawMaterialLots = [];
let allProductionProgram = [];

export async function showScreen(event) {

    let equipment = localStorage.getItem("selectedEquipment");

    if (!equipment) {
        screenDashboardList.showScreen();
    } else {
        // allProductionProgram = await App.api.ormDbTubesProductionSystem({ idequipment: equipment });
        allProductionProgram = await App.api.ormDbProgramOrderByEquipmentAndSituation({
            equipment: equipment,
            situation: 'C'
        });
    }

    let dtProductionProgram = new WebixCrudDatatable("dtProductionProgram");

    let dtRawMaterialLots = new WebixCrudDatatable("dtRawMaterialLots");

    dtProductionProgram.columns = [
        {
            id: "sequence",
            header: i18n("Sequence"),
            width: 70
        },
        {
            id: "material",
            header: i18n("Material"),
            width: 280
        },
        {
            id: "statusallocation",
            header: i18n("Status"),
            width: 50,
            template: (item) => `<div class='${item.statusallocation}'></div>`
        },
        {
            id: "steelm",
            header: i18n("Aço"),
            width: 50
        },
        {
            id: "idordermes",
            header: i18n("OP"),
            width: 100
        },
        {
            id: "idordersap",
            header: i18n("OP SAP"),
            width: 100
        },
        {
            id: "thicknessm",
            header: i18n("Thickness"),
            width: 70
        },
        {
            id: "diameterm",
            header: i18n("Diameter"),
            width: 70
        },
        {
            id: "weight",
            header: i18n("Weight Production"),
            width: 90
        },
        //        {
        //            id: "expectedquantity",
        //            header: i18n("Number of Parts Programmed"),
        //            width: 100
        //        },
        {
            id: "requestdate",
            header: i18n("Date"),
            format: (value) => { return value ? moment(value).format("DD/MM/YYYY") : '-' },
            width: 80
        },
        {
            id: "orderstatus",
            header: i18n("Situation"),
            cssFormat: CellbackCollor,
            format: (value) => { return (value == 'FINISHED') ? i18n("FINISHED") : (value == 'PRODUCTION') ? i18n("WAITING") : (value == 'IN_PROCESS') ? i18n("IN PROCESS") : (value == 'PAUSED') ? i18n("PAUSED") : "" },
            //cssFormat: (value) => { return (value == 'IN_PROCESS') ? "highlight_InProcess" : (value == 'PAUSED') ? "highlight_Paused" : "" },
            width: 180
        },
    ];

    dtProductionProgram.on = {
        "onItemClick": async function () {

            let data = $$('dtProductionProgram').getSelectedItem();
            $$('dtRawMaterialLots').clearAll();

            if (data.orderstatus == "FINISHED") {

                $$("btnStartProduction").define("label", i18n("Start Production"));
                $$("btnStartProduction").refresh();

                $$("btnStartProduction").disable();
                $$("btnPausedOP").disable();
                $$("btnRequestRM").disable();
                $$("btnCancelRM").disable();
                $$("btnDetailOP").enable();
                $$("btnSkipOP").disable();

            } else if (data.orderstatus == "PAUSED") {

                $$("btnStartProduction").define("label", i18n("Continue Production"));
                $$("btnStartProduction").refresh();

                $$("btnStartProduction").enable();
                $$("btnPausedOP").disable();
                $$("btnRequestRM").disable();
                $$("btnCancelRM").disable();
                $$("btnDetailOP").enable();
                $$("btnSkipOP").disable();

            } else if (data.orderstatus == "IN_PROCESS") {

                $$("btnStartProduction").define("label", i18n("Continue Production"));
                $$("btnStartProduction").refresh();

                $$("btnStartProduction").enable();
                $$("btnPausedOP").enable();
                $$("btnRequestRM").disable();
                $$("btnCancelRM").disable();
                $$("btnDetailOP").enable();
                $$("btnSkipOP").disable();

            } else {

                $$("btnStartProduction").define("label", i18n("Start Production"));
                $$("btnStartProduction").refresh();

                $$("btnStartProduction").enable();
                $$("btnPausedOP").disable();
                $$("btnRequestRM").enable();
                $$("btnCancelRM").enable();
                $$("btnSkipOP").enable();

            }

            allAllocatedRawMaterialLots = await App.api.ormDbTubesLotSystem({ idordermes: data.idordermes });

            if (allAllocatedRawMaterialLots.data.length > 0) {
                $$('dtRawMaterialLots').parse(allAllocatedRawMaterialLots.data, "json");
            } else {
                webix.message({ text: i18n('No results were found for this search.') });
                $$("btnStartProduction").disable();
            }

        },
        "onAfterColumnDrop": async function () {
            util.datatableColumsSave("dtProductionProgram", event);
        }
    };

    dtRawMaterialLots.columns = [
        {
            id: "descriptionmaterial",
            header: i18n("Material"),
            sort: "string",
            width: 220
        },
        {
            id: "idlot",
            header: i18n("Lot"),
            width: 80
        },
        {
            id: "steel",
            header: i18n("Aço"),
            width: 50
        },
        {
            id: "idorder",
            header: i18n("OP"),
            width: 100
        },
        {
            id: "thickness",
            header: i18n("Thickness"),
            width: 90
        },
        {
            id: "diameter",
            header: i18n("Diameter"),
            width: 90
        },
        {
            id: "plannedorderquantity",
            header: i18n("Weight Production"),
            width: 100
        },
        {
            id: "expectedquantity",
            header: i18n("Number of Parts Programmed"),
            width: 80
        },
        {
            id: "requestdate",
            header: i18n("Date"),
            format: (value) => { return value ? moment(value).format("DD/MM/YYYY") : '-' },
            width: 100
        },
        {
            id: "situationmovement",
            header: i18n("Situation"),
            format: (value) => {
                return (value == 'P') ? i18n('Moving Pendant') : (value == 'E') ? i18n('In Front Of') : (value == 'C') ? i18n('Canceled') : (value == 'R') ? i18n('Finished') : (value == 'T') ? i18n('Processing') : i18n('In Stock')
            },
            fillspace: true
        },
    ]

    dtRawMaterialLots.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtRawMaterialLots", event);
        }
    };

    let startProduction = {
        view: "button",
        id: "btnStartProduction",
        height: 80,
        click: async () => {

            let grid = $$('dtProductionProgram');
            let item = grid.getSelectedItem();


            if (item == null) {

                webix.message(i18n('An Order must be selected'));
                return;

            }
            else if (!item.idordersap) {
                webix.message(i18n('You cannot produce an Order without a SAP Order ID!'));
                return;
            }
            else {

                let findstop = await App.api.ormDbFind('stop', {
                    idequipment: item.idequipmentscheduled,
                    idorder: {
                        $ne: item.idordermes
                    },
                    enddate: null
                })

                if (findstop.data.length) {
                    webix.message(i18n('This equipment was stopped by the Order') + ' ' + findstop.data.idorder + ', ' + i18n('please close the stop to produce!'));
                    return;
                }

                let data = allAllocatedRawMaterialLots.data;
                let count = data ? data.findIndex(x => x.situationmovement == "E") : -1;
                if (count == -1) {
                    let data1 = allAllocatedRawMaterialLots.data;
                    let count1 = data1 ? data1.findIndex(x1 => x1.situationmovement == "T") : -1;
                    count = count1;
                }

                let sequence = item.sequence;
                let idequipment = localStorage.getItem('selectedEquipment');

                let indexOrderSelected = allProductionProgram.data.findIndex(x => x.sequence == sequence);

                let getInProcess = allProductionProgram.data.findIndex(x => x.orderstatus == "IN_PROCESS");
                let getProduction = allProductionProgram.data.findIndex(x => x.orderstatus == "PRODUCTION");

                /* Verifico se a ordem está em Processo */
                if (item.orderstatus == "IN_PROCESS") {

                    /* Se tiver EM PROCESSO abro a tela de PRODUÇÃO */
                    let order = await App.api.ormDbGetOrder({ idordermes: item.idordermes });
                    let result = await validateStandardPackage(order.data[0]);

                    /* Verifico se existe pacotes padrão cadastrado */
                    if (result.success) {

                        /* Se a ordem for para a Big Maker, redirecionar para o equipamento correto */
                        if (order.data[0].equipmentscheduledtype == 'BMKT') {
                            order.data[0].lots = allAllocatedRawMaterialLots.data;
                            screenProductionProgramBigMakerStart.showScreen(order.data);
                        }
                        else {
                            screenProductionProgramStart.showScreen(order.data[0].equipmentscheduledtype, order.data[0]);
                        }

                    }
                    return;

                } else {

                    /* Verifico a sequência da OP escolhida */
                    if (sequence == 1) {

                        /* Verifico se existe alguma ordem em Processo */
                        if (getInProcess != -1) {

                            webix.message(i18n('Error, Exist orders in process'));
                            return;

                        } else {

                            /* Verifico se existe pelo menos um Lote encostado */
                            if (count != -1) {

                                /* Abro a tela de PRODUÇÃO */
                                let order = await App.api.ormDbGetOrder({ idordermes: item.idordermes });
                                let result = await validateStandardPackage(order.data[0]);

                                /* Verifico se existe pacotes padrão cadastrado */
                                if (result.success) {
                                    await App.api.ormDbUpdate({ idordermes: item.idordermes }, 'order', {
                                        orderstatus: "IN_PROCESS",
                                    });

                                    /* Salvo o Collects */
                                    saveCollects();

                                    /* Abro a tela de PRODUÇÃO */
                                    // let order = await App.api.ormDbGetOrder({ idordermes: item.idordermes });
                                    screenProductionProgramStart.showScreen(order.data[0].equipmentscheduledtype, order.data[0]);
                                    return;
                                }

                            } else {

                                webix.message(i18n('Error, there is no lot facing this order'));
                                return;

                            }

                        }

                    } else {

                        /* Busco dados da Ordem com sequência anterior */
                        let lastSequence = sequence <= 1 ? 1 : sequence - 1;
                        let orderBefore = await App.api.ormDbGetOrderScheduled({ idequipment, lastSequence });

                        if (orderBefore.data.length == 0) {

                            //webix.message(i18n('Error, there is no scheduled batch previous'));
                            //return;
                            await App.api.ormDbUpdate({ idordermes: item.idordermes }, 'order', {
                                orderstatus: "IN_PROCESS",
                            });

                            /* Salvo o Collects */
                            saveCollects();

                            /* Abro a tela de PRODUÇÃO */
                            let order = await App.api.ormDbGetOrder({ idordermes: item.idordermes });
                            screenProductionProgramStart.showScreen(order.data[0].equipmentscheduledtype, order.data[0]);
                            return;

                        } else {

                            /* Verifico se existe alguma ordem em Processo */
                            if (getInProcess != -1) {

                                webix.message(i18n('Error, Exist orders in process'));
                                return;

                            } else {

                                /* Verifico se tem alguma Ordem em Produção anterior a escolhida */
                                if (getProduction < indexOrderSelected && getProduction === indexOrderSelected) {

                                    webix.message(i18n('Error, Previous orders pending'));
                                    return;

                                } else {
                                    if (orderBefore.data.length) {
                                        if ((orderBefore.data[0].orderstatus === "FINISHED") || (orderBefore.data[0].orderstatus === "PAUSED")) {

                                            await App.api.ormDbUpdate({ idordermes: item.idordermes }, 'order', {
                                                orderstatus: "IN_PROCESS",
                                            });

                                            /* Salvo o Collects */
                                            saveCollects();

                                            /* Abro a tela de PRODUÇÃO */
                                            let order = await App.api.ormDbGetOrder({ idordermes: item.idordermes });
                                            screenProductionProgramStart.showScreen(order.data[0].equipmentscheduledtype, order.data[0]);
                                            return;

                                        } else {

                                            webix.message(i18n('Error, Previous orders pending'));
                                            return;

                                        }
                                    }
                                    else {
                                        await App.api.ormDbUpdate({ idordermes: item.idordermes }, 'order', {
                                            orderstatus: "IN_PROCESS",
                                        });

                                        /* Salvo o Collects */
                                        saveCollects();

                                        /* Abro a tela de PRODUÇÃO */
                                        let order = await App.api.ormDbGetOrder({ idordermes: item.idordermes });
                                        screenProductionProgramStart.showScreen(order.data[0].equipmentscheduledtype, order.data[0]);
                                        return;
                                    }

                                }

                            }

                        }

                    }

                }

            }

        },
        value: i18n('Start Production'),
    }

    let requestRM = {
        view: "button",
        id: "btnRequestRM",
        height: 80,
        click: () => {

            let grid = $$('dtProductionProgram');
            let item = grid.getSelectedItem();

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

                                let idequipment = localStorage.getItem('selectedEquipment');

                                let local = await App.api.ormDbFind('local', { idequipment: idequipment });
                                if (local.data.length > 0) {

                                    let idLocal = local.data[0].id;
                                    let count = 0;

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

                                        $$('dtRawMaterialLots').clearAll();

                                        let data = $$('dtProductionProgram').getSelectedItem();
                                        allAllocatedRawMaterialLots = await App.api.ormDbTubesLotSystem({ idordermes: data.idordermes });

                                        if (allAllocatedRawMaterialLots.data.length > 0) {
                                            $$('dtRawMaterialLots').parse(allAllocatedRawMaterialLots.data, "json");
                                        } else {
                                            webix.message({ text: i18n('No results were found for this search.') });
                                        }

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

        },
        value: i18n('Request RM'),
    }

    let cancelRM = {
        view: "button",
        id: "btnCancelRM",
        height: 80,
        click: () => {

            let grid = $$('dtProductionProgram');
            let item = grid.getSelectedItem();

            if (item == null) {

                webix.message(i18n('An Order must be selected'));
                return;

            } else {

                if (item.orderstatus == "PRODUCTION") {

                    webix.confirm({
                        title: i18n("Confirm the cancel move request for these batches?"),
                        ok: i18n("Yes! Confirm"),
                        cancel: i18n("No! Cancel"),
                        text: `<strong> ${i18n("OP")} nº </strong> ${item.idordermes}`,
                        callback: async function (result) {

                            if (result) {

                                let idequipment = localStorage.getItem('selectedEquipment');

                                for (let i = 0; i < allAllocatedRawMaterialLots.data.length; i++) {

                                    let data = allAllocatedRawMaterialLots.data[i];

                                    let filter = {
                                        idequipment: idequipment,
                                        idlot: data.idlot
                                    };

                                    let moverequest = {
                                        situationmovement: 'C',
                                        status: false,
                                    };

                                    await App.api.ormDbUpdate(filter, 'moverequest', moverequest);

                                }

                                $$('dtRawMaterialLots').clearAll();

                                let data = $$('dtProductionProgram').getSelectedItem();
                                allAllocatedRawMaterialLots = await App.api.ormDbTubesLotSystem({ idordermes: data.idordermes });

                                if (allAllocatedRawMaterialLots.data.length > 0) {
                                    $$('dtRawMaterialLots').parse(allAllocatedRawMaterialLots.data, "json");
                                } else {
                                    webix.message({ text: i18n('No results were found for this search.') });
                                }

                                webix.message(i18n('Successfully cancel requested movement'));
                            }

                        }

                    });
                    return;

                } else {

                    webix.message(i18n('Order already started or finished'));
                    return;

                }

            }

        },
        value: i18n('Cancel RM'),
    }

    let detailOP = {
        view: "button",
        id: "btnDetailOP",
        height: 80,
        click: () => {

            let grid = $$('dtProductionProgram');
            let item = grid.getSelectedItem();

            if (item == null) {

                webix.message(i18n('An Order must be selected'));
                return;

            } else {

                modalDetailOP.showModal(item);
                return;

            }
        },
        value: i18n('Detail OP'),
    }

    let skipOP = {
        view: "button",
        id: "btnSkipOP",
        height: 80,
        click: async () => {

            let grid = $$('dtProductionProgram');
            let item = grid.getSelectedItem();

            if (item == null) {

                webix.message(i18n('An Order must be selected'));
                return;

            } else {

                let getInProcess = allProductionProgram.data.findIndex(x => x.orderstatus == "IN_PROCESS");

                /* Verifico se existe alguma ordem em Progresso */
                if (getInProcess != -1) {

                    /* Verifico se a ordem está em Progresso */
                    if (item.orderstatus == "IN_PROCESS") {

                        /* Se tiver EM PROCESSO abro a tela de PRODUÇÃO */
                        let order = await App.api.ormDbGetOrder({ idordermes: item.idordermes });
                        screenProductionProgramStart.showScreen(order.data[0].equipmentscheduledtype, order.data[0]);
                        return;

                    } else {

                        webix.message(i18n('Error, Exist orders in process'));
                        return;

                    }

                } else {

                    if (item.orderstatus == "PRODUCTION") {

                        let data = allAllocatedRawMaterialLots.data;
                        let count = data.findIndex(x => x.situationmovement == "E");

                        if (count != -1) {

                            let orders = {
                                "orderstatus": "IN_PROCESS",
                            };
                            await App.api.ormDbUpdate({ idordermes: item.idordermes }, 'order', orders);

                            /* Salvo o Collects */
                            saveCollects();

                            /* Abro a Produção */
                            let order = await App.api.ormDbGetOrder({ idordermes: item.idordermes });
                            screenProductionProgramStart.showScreen(order.data[0].equipmentscheduledtype, order.data[0]);
                            return;

                        } else {

                            webix.message(i18n('Error, there is no lot in front of this equipement'));
                            return;

                        }

                    } else {

                        webix.message(i18n('order is not under production'));
                        return;

                    }
                }
            }
        },
        value: i18n('Skip OP'),
    }

    let pausedOP = {
        view: "button",
        id: "btnPausedOP",
        height: 80,
        click: async () => {

            let grid = $$('dtProductionProgram');
            let item = grid.getSelectedItem();

            if (item == null) {
                webix.message(i18n('An Order must be selected'));
                return;
            } else {

                /* Verifico se a ordem está em Produção */
                if (item.orderstatus != "PAUSED") {

                    if (item.orderstatus == "IN_PROCESS") {

                        //let getInPaused = allProductionProgram.data.findIndex(x => x.orderstatus == "PAUSED");
                        let getInPaused = allProductionProgram.data.filter(x => x.orderstatus == "PAUSED");

                        /* Verifico se tem uma ordem pausada */
                        if (getInPaused.length >= 2) {

                            webix.message(i18n('There are two paused orders!'));

                        } else {


                            let update = await App.api.ormDbUpdate({ idordermes: item.idordermes }, 'order', {
                                orderstatus: "PAUSED",
                            });

                            await pauseCollects();

                            webix.message(i18n('Order paused successfully'));
                            fieldProductionProgram(equipment);

                            // $$('dtRawMaterialLots').clearAll();

                            // //let data = $$('dtProductionProgram').getSelectedItem();
                            // allAllocatedRawMaterialLots = await App.api.ormDbTubesLotSystem({ idordermes: item.idordermes });

                            // if (allAllocatedRawMaterialLots.data.length > 0) {
                            //     $$('dtRawMaterialLots').parse(allAllocatedRawMaterialLots.data, "json");
                            // } else {
                            //     webix.message({ text: i18n('No results were found for this search.') });
                            // }

                        }

                    } else {
                        webix.message(i18n('Error, order is not in process'));
                        return;
                    }

                } else {
                    webix.message(i18n('Order Paused'));
                    return;
                }

            }

        },
        value: i18n('Pause Production'),
    }

    let titleProductionProgram = ({
        view: "label",
        label: i18n("Production Program"),
        inputWidth: 100,
        align: "left"
    })

    let titleRawMaterialLots = ({
        view: "label",
        label: i18n("Raw Material Lots"),
        inputWidth: 100,
        align: "left"
    })

    const grids = {
        view: 'form',
        id: "frmProductionProgram",
        minWidth: 800,
        rows: [
            titleProductionProgram,
            {
                cols: [
                    dtProductionProgram
                ]
            },
            titleRawMaterialLots,
            {
                cols: [
                    dtRawMaterialLots
                ]
            },
            {
                cols: [
                    startProduction,
                    pausedOP,
                    requestRM,
                    cancelRM,
                    detailOP,
                    skipOP
                ]
            }
        ]
    }

    let menu = createSimpleCrudMenu(`${i18n('Production Program')} - ${i18n('equipment')} ${equipment} ${i18n('selected')}`);
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);
    fieldProductionProgram(equipment);

    await util.datatableColumsGet('dtProductionProgram', event);
    await util.datatableColumsGet('dtRawMaterialLots', event);
}

function createSimpleCrudMenu(title) {
    let menu = WebixBuildReponsiveTopMenu(title, []);
    return menu;
}

async function saveCollects() {

    let grid = $$('dtProductionProgram');
    let item = grid.getSelectedItem();

    let idequipment = localStorage.getItem('selectedEquipment');

    let registerCollects = {
        "idequipment": idequipment,
        "idordermes": item.idordermes,
        "startdate": new Date(),
    };

    await App.api.ormDbCreate('orderprodhistory', registerCollects);

}

async function pauseCollects() {

    let grid = $$('dtProductionProgram');
    let item = grid.getSelectedItem();

    let idequipment = localStorage.getItem('selectedEquipment');

    let orderprodhistory = await App.api.ormDbFind('orderprodhistory', {
        idequipment: idequipment,
        idordermes: item.idordermes,
        stopdate: null
    })

    let id = null

    if (orderprodhistory.data.length)
        id = orderprodhistory.data[0].id;

    if (id)
        await App.api.ormDbUpdate({ "id": id }, 'orderprodhistory', { "stopdate": new Date() })


}

async function fieldProductionProgram(idequipment) {

    $$('dtProductionProgram').clearAll();

    allProductionProgram = await App.api.ormDbProgramOrderByEquipmentAndSituation({
        equipment: idequipment,
        situation: 'C'
    });

    // await App.api.ormDbTubesProductionSystem({ idequipment: idequipment });

    if (allProductionProgram.data.length > 0) {
        $$('dtProductionProgram').parse(allProductionProgram.data, "json");
    } else {
        webix.message(i18n('No results were found for this search.'));
    }

}

async function validateStandardPackage(order) {

    if (order.thicknessm && order.thicknessm < 0 || order.diametem && order.diametem < 0) {
        webix.message(i18n('There is no thickness or diameter for this material of the order.'))
        return { success: false };
    } else {
        let stdpackage = await App.api.ormDbGetStandardPackage({ thickness: order.thicknessm, diameter: order.diameterm, length: order.lengthm });

        if (stdpackage.data.length) {
            localStorage.removeItem('standardPackage')
            localStorage.setItem('standardPackage', stdpackage.data[0].packagequantity)
            localStorage.removeItem('standardPackageName')
            localStorage.setItem('standardPackageName', stdpackage.data[0].description)

            return { success: true };
        } else {
            webix.message(i18n('You must create the default quantity for the material in this order.'))
            return { success: false };
        }
    }
}

function CellbackCollor(value) {
    if (value == i18n("IN PROCESS")) {
        return "highlight_InProcess";
    }
    else if (value == i18n("PAUSED")) {
        return "highlight_Paused";
    }

}