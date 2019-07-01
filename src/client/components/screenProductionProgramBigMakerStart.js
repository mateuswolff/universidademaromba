import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixBuildReponsiveTopMenu } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

import * as  _modalReadQR from "../extra/_modalReadQR.js";
import * as  _modalBigMakerCollect from "../extra/_modalBigMakerCollect.js";
import * as  _modalBigMakerClosePackage from "../extra/_modalBigMakerClosePackage.js";
import * as  _modalBigMakerCloseOp from "../extra/_modalBigMakerCloseOp.js";
import * as  productionProgram from "../components/screenProductionProgram.js";
import * as  productionProgramBigMakerStart from "../components/screenProductionProgramBigMakerStart.js";

let hasStepPieces = "";


export async function showScreen(order, event) {


    if (order.length)
        order = order[0];

    let allocatedLots = order.lots;

    let sumPieces = 0;
    let sumWeight = 0;
    allocatedLots.forEach((elem) => {
        sumPieces += elem.expectedquantity;
        sumWeight =+ elem.plannedorderquantity;
    })

    let piecesCalculate = await util.calcWeightPartsBigTub(order.idmaterial, 'pieces', sumWeight, order.lots[0].idlot);
    
    order.standardPackage = localStorage.getItem('standardPackage')

    let linked = await App.api.ormDbLinkedStepByOrder({ idequipment: order.idequipmentscheduled, idordermes: order.idordermes });
    linked = linked.data

    let contW = linked[linked.length - 1]
    contW.idordermes = order.idordermes;

    let contPacked = linked[0].packed

    order.steps = linked

    hasStepPieces = await App.api.ormDbFind('steppieces', { idequipment: order.idequipmentscheduled, idordermes: order.idordermes });
    hasStepPieces = hasStepPieces.data;

    if (hasStepPieces.length > 0) {
        hasStepPieces = true;
    }
    else {
        hasStepPieces = false;
    }

    order.hasStepPieces = hasStepPieces;

    let readQR = [
        {
            view: "text",
            label: i18n("Lot"),
            name: "txtreadlot",
            css: "large_text",
            id: "txtreadlot",
            labelPosition: "left",
            on: {
                onBlur: async () => {
                    if ($$('txtreadlot').getValue() == "") {
                        webix.message(i18n('Please, choose a lot to produce!'))
                    }
                    else {
                        let index = order.lots.findIndex(x => x.idlot == $$('txtreadlot').getValue())

                        if (index == -1) {
                            webix.message(i18n('The selected lot is not allocated to this order!'))
                        }
                        else {
                            order.lotSelected = order.lots[index];
                            order.iduser = localStorage.getItem('login')

                            let sequenceConsumed = await App.api.ormDbFind('lotconsumed', { idequipment: order.idequipmentscheduled, idorder: order.idordermes });
                            sequenceConsumed = sequenceConsumed.data;

                            if (sequenceConsumed.length == 0) {
                                let sequence = 1;

                                let lotweight = await App.api.ormDbFind('lotcharacteristic', { idlot: order.lotSelected.idlot, name: 'CG_PESO_LIQUIDO' })
                                lotweight = lotweight.data[0].numbervalue

                                let lotConsumed = await App.api.ormDbCreate('lotconsumed', {
                                    idequipment: order.idequipmentscheduled,
                                    idorder: order.idordermes,
                                    idorderentry: sequence,
                                    idlot: order.lotSelected.idlot,
                                    iduser: order.iduser,
                                    weight: lotweight ? lotweight : 0,
                                    originalweight: lotweight ? lotweight : 0

                                });
                            }
                            else if (sequenceConsumed.findIndex(elem => elem.idlot == order.lotSelected.idlot) == -1) {
                                let sequence = sequenceConsumed.length;

                                let lotweight = await App.api.ormDbFind('lotcharacteristic', { idlot: order.lotSelected.idlot, name: 'CG_PESO_LIQUIDO' });
                                lotweight = lotweight.data[0].numbervalue;

                                let lotConsumed = await App.api.ormDbCreate('lotconsumed', {
                                    idequipment: order.idequipmentscheduled,
                                    idorder: order.idordermes,
                                    idorderentry: sequence,
                                    idlot: order.lotSelected.idlot,
                                    iduser: order.iduser,
                                    weight: lotweight ? lotweight : 0,
                                    originalweight: lotweight ? lotweight : 0

                                });
                            }


                            let createSteps = await App.api.ormDbCreateStepPieces(order);

                            if (createSteps.success) {
                                hasStepPieces = true;
                            }
                        }
                    }

                }
            },
            format: "111"
        },
        {
            view: "button", label: i18n("Read"), click: async () => {
                let digitReadRawMaterial = $$('txtreadlot').getValue();
                if (digitReadRawMaterial) {
                } else {
                    let idlot = await _modalReadQR.showModal();
                    $$('txtreadlot').setValue(idlot);

                    let index = order.lots.findIndex(x => x.idlot == idlot)

                    if (index == -1) {
                        webix.message(i18n('The selected lot is not allocated to this order!'))
                    }
                    else {

                        order.lotSelected = order.lots[index];
                        order.iduser = localStorage.getItem('login')

                        let createSteps = await App.api.ormDbCreateStepPieces(order);
                        if (createSteps.success) {
                            hasStepPieces = true
                        }

                    }

                };
            }
        }]

    const padding = ({
        view: "label",
        label: i18n(""),
    });

    let columns = [];

    columns.push({
        id: "step", header: '',
        width: 250,
        disabled: true,
        template: function (obj) {
            return `<div class='webix_el_button btn_click_table'><button class='webixtype_base large_text'> ${obj.step} </button></div>`;
        }
    });

    columns.push({
        id: "worked",
        header: { text: i18n("Worked and Unpacked Pieces"), css: { "text-align": "center" } },
        fillspace: true
    })

    columns.push({
        id: "pendent",
        header: { text: i18n("Pendent Pieces"), css: { "text-align": "center" } },
        fillspace: true
    })

    columns.push({
        id: "producing",
        header: { text: i18n("Producing Pieces"), css: { "text-align": "center" } },
        fillspace: true
    })

    columns.push({
        id: "scrapped",
        header: { text: i18n("Scrapped Pieces"), css: { "text-align": "center" } },
        fillspace: true
    })

    // new WebixCrudAddButton('rnc', i18n('RNC'), async () => {
    //     await _modalRegisterRNC.showModal(null, null, null, 'search');
    // }, {
    //         width: 100,
    //         height: 80,
    //     })

    let expectedquantity = order.expectedquantity ? order.expectedquantity : i18n('Uninformed');

    const grids = {
        view: 'form',
        id: "form",
        autoheight: false,
        rows: [
            {
                view: "fieldset",
                label: i18n("Production Summary"),
                borderless: true,
                height: 70,
                body: {
                    rows: [
                        {
                            cols: [
                                {
                                    rows: readQR,
                                },
                                {
                                    view: "template",
                                    template: `<div class='header_align'><span class='header_size'><strong>${i18n('Order MES')}</strong></span><br /><span class='subheader_size'>` + order.idordermes + `</span></div>`
                                },
                                {
                                    view: "template",
                                    template: `<div class='header_align'><span class='header_size'><strong>${i18n('Order SAP')}</strong></span><br /><span class='subheader_size'>` + order.idordersap + `</span></div>`
                                },
                                {
                                    view: "template",
                                    template: `<div class='header_align'><span class='header_size'><strong>${i18n('Lot Pieces')}</strong></span><br /><span class='subheader_size'>` + sumPieces + `</span></div>`
                                },
                                {
                                    view: "template",
                                    template: `<div class='header_align'><span class='header_size'><strong>${i18n('Lot Weight')}</strong></span><br /><span class='subheader_size'>` + sumWeight + `</span></div>`
                                },
                                {
                                    view: "template",
                                    template: `<div class='header_align'><span class='header_size'><strong>${i18n('Expected Pieces')}</strong></span><br /><span class='subheader_size'>` + piecesCalculate + `</span></div>`
                                },
                                {
                                    view: "template",
                                    template: `<div class='header_align'><span class='header_size'><strong>${i18n('Raw Material')}</strong></span><br /><span class='subheader_size'>` + order.rawmaterial + `</span></div>`
                                },
                                {
                                    view: "template",
                                    template: `<div class='header_align'><span class='header_size'><strong>${i18n('Output Material')}</strong></span><br /><span class='subheader_size'>` + order.material + `</span></div>`
                                },
                                {
                                    view: "template",
                                    template: `<div class='header_align'><span class='header_size'><strong>${i18n('Standard Package')}</strong></span><br /><span class='subheader_size'>` + order.standardPackage + `</span></div>`
                                },

                            ]
                        },
                    ]
                }
            },
            padding,
            {
                view: "datatable",
                css: "datatable-style-cell",
                id: "dtStepEquipment",
                columns: columns,
                dragColumn: true,
                leftSplit: 1,
                borderless: false,
                on: {
                    "onAfterColumnDrop": function () {
                        util.datatableColumsSave("dtStepEquipment", event);
                    }
                },
                onClick: {
                    webixtype_base: stepcollect
                },
                spans: true,
                rowHeight: 90,
                data: {
                    data: [],
                },
            },
            { height: 30 },
            {
                cols: [{
                    rows: [{
                        cols: [
                            {
                                view: 'button',
                                label: '« ' + i18n('Back'),
                                height: 80,
                                id: "btnBack",
                                click: () => {
                                    productionProgram.showScreen();
                                }
                            },
                            {
                                view: 'button',
                                label: i18n('Close Package'),
                                height: 80,
                                badge: contW.worked,
                                css: "test-badge",
                                id: "btnClosePackage",
                                click: async () => {
                                    if (contW.worked == 0) {
                                        webix.message(i18n('There is no finished piece to close the Packge!'))
                                    }
                                    else {
                                        await _modalBigMakerClosePackage.showModal(contW);
                                    }
                                }
                            },
                            {
                                view: 'button',
                                label: i18n('Close OP'),
                                height: 80,
                                css: "test-badge",
                                id: "btnCloseOp",
                                click: async () => {
                                    await _modalBigMakerCloseOp.showModal(contW);
                                }
                            }
                        ]
                    }
                    ]
                },
                {},
                {
                    view: "fieldset",
                    label: i18n("Production Summary"),
                    //height: 80,
                    body: {
                        rows: [
                            {
                                view: "template",
                                id: "templatePacked",
                                template: `<div class='header_align'><strong><span class='header_size header_color_green_big'>${i18n('PACKED PIECES: ')}</span><span class='subheader_size_big'>` + contPacked + `</span></strong></div>`
                            }
                        ]
                    }
                }]
            },
        ]
    }


    App.toggleSidebar();
    App.replaceMainContent(grids, () => { loadTableStepEquipment(linked, order) });
    App.replaceMainMenu(WebixBuildReponsiveTopMenu(`${i18n('Production of Big Maker')} ${order.idequipmentscheduled}`, []));

}


async function loadTableStepEquipment(item, order) {
    $$('dtStepEquipment').clearAll();

    let stepEquipment = [];
    item.forEach(element => {
        stepEquipment.push(
            {
                idstep: element.idstep,
                step: element.step,
                idequipment: element.idequipment,
                sequence: element.sequence,
                idordermes: order.idordermes,
                idlot: "",
                worked: element.worked,
                pendent: element.pendent,
                producing: element.producing,
                scrapped: element.scrapped,
                order: order
            }
        )
    });

    $$('dtStepEquipment').parse(stepEquipment)

}

async function stepcollect(ev, obj, html) {

    let order = $$('dtStepEquipment').serialize()
    order = order[0].order

    let step = this.getItem(obj)
    step.idlot = $$('txtreadlot').getValue();

    if (!hasStepPieces) {
        webix.message(i18n('Please, choose a lot to produce!'))
    }
    else {
        let resultModal = await _modalBigMakerCollect.showModal(step);

        if (resultModal)
            productionProgramBigMakerStart.showScreen(order)
    }
}
