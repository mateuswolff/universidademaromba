import { i18n } from "../../lib/I18n.js";
import { App } from "../../lib/App.js";
import { WebixWindow, WebixCrudAddButton } from "../../lib/WebixWrapper.js";
import * as util from "../../lib/Util.js";
// Modals
import * as  _modalTechnicalSheet from "../../extra/_modalTechnicalSheet.js";
import * as  _modalEddyCurrent from "../../extra/_modalEddyCurrent.js";
import * as  _modalDetailDimensionalControlTrainingTests from "../../extra/_modalDetailDimensionalControlTrainingTests.js";
import * as  _modalStopsPerOrder from "../../extra/_modalStopsPerOrder.js";
import * as  _modalDefectPerOrder from "../../extra/_modalDefectPerOrder.js";
import * as  _modalMetallographyPerOrder from "../../extra/_modalMetallographyPerOrder.js";
import * as  _modalScrapPerOrder from "../../extra/_modalScrapPerOrder.js";
import * as  _modalRNCPerOrder from "../../extra/_modalRNCPerOrder.js";
import * as  _modalStops from "../../extra/_modalStops.js";
import * as  _modalDefectRegistry from "../../extra/_modalDefectRegistry.js";
import * as  _modalScrapsRecord from "../../extra/_modalScrapsRecord.js";
import * as  screenProductionProgram from "../screenProductionProgramStart.js";
import * as  program from "../screenProductionProgram.js";
import * as productionProgram from "../screenProductionProgram.js";

export function create(order, hiddenQualityStandard = false, isHaveSecondaryOrder = false) {
    return [{
        view: 'button',
        label: '« ' + i18n('Back'),
        height: 70,
        id: "btnBack",
        click: () => {
            productionProgram.showScreen();
        }
    }, {
        view: 'button',
        label: i18n('Stops'),
        height: 70,
        disabled: localStorage.getItem('oldLotReader' + order.idordermes) ? false : true,
        id: "btnStop",
        click: () => {
            showModalStop(order);
        }
    },
    {
        view: 'button',
        label: i18n('Sample'),
        disabled: localStorage.getItem('oldLotReader' + order.idordermes) ? false : true,
        height: 70,
        id: "btnSample",
        click: () => {
            showModalMetallography(order);
            //generateNewSample(order);
        }
    },
    {
        view: 'button',
        label: i18n('Defect'),
        disabled: localStorage.getItem('oldLotReader' + order.idordermes) ? false : true,
        height: 70,
        id: "btnDefect",
        click: () => {
            showModalDefect(order);
        }
    },
    {
        hidden: hiddenQualityStandard,
        view: 'button',
        label: i18n('EDDY Current'),
        disabled: localStorage.getItem('oldLotReader' + order.idordermes) ? false : true,
        height: 70,
        id: "btnEddyCurrent",
        click: () => {
            _modalEddyCurrent.showModal(null, 0, order);
        }
    },
    {
        view: 'button',
        label: i18n('Scraps'),
        disabled: localStorage.getItem('oldLotReader' + order.idordermes) ? false : true,
        height: 70,
        id: "btnScraps",
        click: () => {
            showModalScrap(order);
        }
    },
    {
        view: 'button',
        label: i18n('RNC'),
        disabled: localStorage.getItem('oldLotReader' + order.idordermes) ? false : true,
        height: 70,
        id: "btnRnc",
        click: () => {
            showModalRNC(order);
        }
    },
    {
        view: 'button',
        label: i18n('Dimensional Control'),
        disabled: localStorage.getItem('oldLotReader' + order.idordermes) ? false : true,
        height: 70,
        id: "btnDimensionalControl",
        click: async () => {
            let lot = await App.api.ormDbFindOne('lot', { idorderprod: order.idordermes.toString(), new: true });
            await _modalDetailDimensionalControlTrainingTests.showModal(order, lot.data.id);
            screenProductionProgram.showScreen(order.equipmentscheduledtype, order);
        }
    },
    {
        view: 'button',
        label: i18n('Finish OP'),
        height: 70,
        disabled: localStorage.getItem('statusEquipment') == 'stop' ? true : false,
        click: async () => {
            let checklist = await App.api.ormDbFind('checklist', { status: true, idequipment: order.idequipmentscheduled });
            if (checklist.data.length) {
                let dimensinalControlResults = await App.api.ormDbFind('checklistitemresult', { status: true, idchecklist: checklist.data[0].id });
                if (!dimensinalControlResults.data.length) {
                    webix.message(i18n('This order has unfilled checklists, fill them out'));
                } else {
                    showInformationAndFinishOP(order, isHaveSecondaryOrder);
                }
            } else {
                showInformationAndFinishOP(order, isHaveSecondaryOrder);
            }
        }
    }];
}


async function showModalStop(order) {
    _modalStopsPerOrder.showModal(order);
}

async function showModalDefect(order) {
    _modalDefectPerOrder.showModal(order);
}

async function showModalMetallography(order) {
    _modalMetallographyPerOrder.showModal(order);
}

async function showModalScrap(order) {
    _modalScrapPerOrder.showModal(order);
}

async function showModalRNC(order) {
    _modalRNCPerOrder.showModal(order);
}

async function showInformationAndFinishOP(order, isHaveSecondaryOrder) {

    let canFinish = await App.api.canFinishOrder(order.idordermes);
    canFinish = canFinish.data[0].remainingweight

    if (canFinish >= 0) {
        let stops = await App.api.ormDbFind('stop', { idorder: order.idordermes, idequipment: order.idequipmentscheduled });
        let defects = await App.api.ormDbFind('defect', { idorder: order.idordermes });
        let packages = await App.api.ormDbFind('lotgenerated', { idorder: order.idordermes, idequipment: order.idequipmentscheduled });
        let scraps = await App.api.ormDbFind('scrap', { idorder: order.idordermes, idequipment: order.idequipmentscheduled });

        //  COUTS
        let sumCollectedTubes = await App.api.ormDbSum('stop', 'quantityofparts', { idequipment: order.idequipmentscheduled, idorder: order.idordermes, stoptype: "PERFORMED" })
        sumCollectedTubes.data = sumCollectedTubes.success ? sumCollectedTubes.data : 0;
        order.sumCollectedTubes = sumCollectedTubes.data;

        let sumScraps = await App.api.ormDbSum('scrap', 'quantity', { idorder: order.idordermes, idequipment: order.idequipmentscheduled });
        sumScraps.data = sumScraps.success ? sumScraps.data : 0;
        order.sumScraps = sumScraps.data;

        let sumOfTheWeightRemainingLot = await App.api.ormDbSum('lotconsumed', 'weight', { idorder: order.idordermes, idequipment: order.idequipmentscheduled });
        sumOfTheWeightRemainingLot = sumOfTheWeightRemainingLot.data ? sumOfTheWeightRemainingLot.data - sumScraps.data : 0;
        order.sumOfTheWeightRemainingLot = sumOfTheWeightRemainingLot;
        let sumOfTheWeightRemainingLotOld = sumOfTheWeightRemainingLot;

        let sumTubesWithOrderAndEquipment = await App.api.ormDbSumTubesWithOrderAndEquipment({ idequipment: order.idequipmentscheduled, idorder: order.idordermes });
        sumTubesWithOrderAndEquipment = sumTubesWithOrderAndEquipment.data.length ? sumTubesWithOrderAndEquipment.data[0].sum : 0;
        order.sumTubesWithOrderAndEquipment = Number(sumTubesWithOrderAndEquipment);

        let message = await generateMessage(sumCollectedTubes.data, sumScraps.data, sumTubesWithOrderAndEquipment, isHaveSecondaryOrder, order.equipmentscheduledtype);

        let allScrapsReason = await App.api.ormDbFind('scrapreason');
        let scrapsReasonFilter = await App.api.ormDbScrapReasonByEquipment({ idequipment: order.idequipmentscheduled });
        let optionsScraps = [];

        if (scrapsReasonFilter.data.length) {
            optionsScraps = scrapsReasonFilter.data;
        } else {
            optionsScraps = allScrapsReason.data;
        }

        let modal = new WebixWindow({
            width: 700,
            height: 800
        });
        modal.body = {
            padding: 20,
            rows: [{
                height: 30,
                cols: [
                    { view: 'template', width: 100, template: `<strong>${i18n('N° MES')}</strong>: ${order.idordermes}` },
                    { view: 'template', template: `<strong>${i18n('N° SAP')}</strong>: ${order.idordersap ? order.idordersap : '-'}` }
                ]
            },
            {
                height: 50,
                cols: [
                    { view: 'template', template: `<strong>${i18n('Packages Identified')}</strong>: ${packages.data ? packages.data.length : '0'}` },
                    { view: 'template', template: `<strong>${i18n('Stops Identified')}</strong>: ${stops.data ? stops.data.length : '0'}` },
                    { view: 'template', template: `<strong>${i18n('Defects Identified')}</strong>: ${defects.data ? defects.data.length : '0'}` },
                    { id: 'scrapIndenfier', view: 'template', template: `<strong>${i18n('Scraps Identified')}</strong>: ${scraps.data ? order.sumScraps : '0'}` },
                    { id: 'lotRemain', view: 'template', template: `<strong>${i18n('Lot remaining weight')}</strong>: ${sumOfTheWeightRemainingLot.toFixed(3)}` },
                ]
            },
            {
                height: 100,
                hidden: message.result > 0 ? false : true,
                cols: [
                    {
                        view: 'template', template: message.result > 0 ? `<div class="alert-danger" id="message">
                    <h1 class="title">${message.title}</h1><br>
                    <span class="title">${message.message}</span>
                </div>` : ''
                    }
                ]
            },
            {
                height: 65,
                hidden: message.result != 2,
                cols: [
                    {},
                    { view: 'text', width: 100, inputHeight: 40, id: 'idSpeed', label: i18n('Speed'), labelPosition: 'top', hidden: message.result != 2, attributes: { type: "number" } },
                    { view: 'text', width: 150, inputHeight: 40, id: 'idQuantityOfTubes', label: i18n('Quantity of tubes'), labelPosition: 'top', value: message.tubes, hidden: message.result != 2, attributes: { type: "number" } },
                    {},
                ]
            },
            {
                hidden: sumOfTheWeightRemainingLot > 0 && message.result !== 1 ? false : true,
                rows: [
                    {
                        height: 65,
                        cols: [
                            {},
                            {
                                view: 'text', width: 150, inputHeight: 40, id: 'returnedBack', label: i18n('Weight Returned'), labelPosition: 'top', attributes: { type: "number" }, on: {
                                    onChange: (newv, old) => {
                                        newv = newv ? Number(newv.replace(/,/g, ".")) : 0;
                                        old = old ? Number(old.replace(/,/g, ".")) : 0;

                                        sumOfTheWeightRemainingLot = (sumOfTheWeightRemainingLot + old) - newv;

                                        $$('lotRemain').setHTML(`<strong>${i18n('Lot remaining weight')}</strong>: ${(sumOfTheWeightRemainingLot).toFixed(3)}`)
                                    }
                                }
                            },
                            {},
                            new WebixCrudAddButton("addScraps", i18n('Add Scrap'), () => {
                                let dt = $$('dtScrapCreate');
                                let all = dt.serialize();
                                all.push({});
                                dt.clearAll();
                                dt.parse(all, "json");
                            }, { width: 100, height: 40 }),
                        ]
                    },
                    {
                        height: 300,
                        hidden: sumOfTheWeightRemainingLot > 0 && message.result !== 1 ? false : true,
                        cols: [
                            {
                                view: "datatable",
                                id: "dtScrapCreate",
                                rowLineHeight: 50,
                                rowHeight: 50,
                                editable: true,
                                columns: [
                                    {
                                        id: "weight", header: i18n('Weight'), editor: "text"
                                    },
                                    { id: "scrapreason", header: i18n('Scrap Reason'), fillspace: true, editor: "richselect", options: optionsScraps.map(item => { return { id: item.id, value: item.id + ' - ' + item.description } }) },
                                    {
                                        id: "remove", header: i18n('Remove'),
                                        height: 50,
                                        template: function (obj) {
                                            return `<div class='webix_el_button'><button class='webixtype_base button_size'>${i18n('Remove')} </button></div>`;
                                        }
                                    }
                                ],
                                data: [],
                                onClick: {
                                    webixtype_base: function (ev, id, html) {
                                        let itemSelected = this.getItem(id);
                                        let dt = $$('dtScrapCreate');
                                        let all = dt.serialize();
                                        let index = all.findIndex(item => item.id === itemSelected.id);
                                        if (index != -1) {
                                            let item = all[index];
                                            let weightOld = Number(item.weight.replace(/,/g, "."));

                                            order.sumScraps = order.sumScraps - weightOld;
                                            sumOfTheWeightRemainingLot = sumOfTheWeightRemainingLot + weightOld;

                                            $$('scrapIndenfier').setHTML(`<strong>${i18n('Scraps Identified')}</strong>: ${order.sumScraps}`)
                                            $$('lotRemain').setHTML(`<strong>${i18n('Lot remaining weight')}</strong>: ${sumOfTheWeightRemainingLot}`)


                                            all.splice(index, 1);
                                            dt.clearAll();
                                            dt.parse(all, "json");
                                        }
                                    }
                                },
                                on: {
                                    onAfterEditStart: () => {
                                        $$('btbCloseOp').disable();
                                    },
                                    onAfterEditStop: (item, editor) => {
                                        if (editor.column === 'weight') {
                                            let valueDigitNow = item.value ? Number(item.value.replace(/,/g, ".")) : 0;
                                            let valueDigitOld = item.old ? Number(item.old.replace(/,/g, ".")) : 0;

                                            order.sumScraps = (order.sumScraps - valueDigitOld) + valueDigitNow;

                                            sumOfTheWeightRemainingLot = (sumOfTheWeightRemainingLot.toFixed(3) + valueDigitOld) - valueDigitNow;

                                            $$('scrapIndenfier').setHTML(`<strong>${i18n('Scraps Identified')}</strong>: ${order.sumScraps.toFixed(3)}`)
                                            $$('lotRemain').setHTML(`<strong>${i18n('Lot remaining weight')}</strong>: ${sumOfTheWeightRemainingLot.toFixed(3)}`)
                                        }
                                        $$('btbCloseOp').enable();
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
            {

                cols: [
                    {},
                    {
                        view: 'button', width: 80, height: 50, css: 'danger', label: i18n("Cancel"), click: () => {
                            modal.close();
                        }
                    },
                    { view: 'button', width: 80, id: 'btbCloseOp', height: 50, css: 'success', label: i18n("Close OP"), disabled: message.result == 1 || message.result == 3, click: () => { closeOP(order, message, modal, isHaveSecondaryOrder.data) } },
                    {}
                ]
            }]
        };
        modal.modal = true;
        modal.show();
        modal.setTitle(i18n("Finish OP"));
    }
    else {
        webix.alert(i18n("There is a negative value on remaining weight, please read the next raw material Lot!"))
    }
}

/**
 * TODO: Se os tubos de sucata forem definidos em paradas, será necessario somar sucatas + paradas então ( packages - (scraps - stops))
 * @param {*} stops 
 * @param {*} scraps 
 * @param {*} packages 
 * @param {*} orderSec 
 */
async function generateMessage(stops, scraps, packages, orderSec = false, equipmenttype = null) {
    let orderSC = null;
    if (orderSec.hasOwnProperty('success') && orderSec.success) {
        orderSC = orderSec.data.idordermes;
    }

    let packingLot = await App.api.ormDbFind('lotgenerated', { idorder: orderSC });

    if (!packingLot.success && !packingLot.data.length) {
        return { result: 3, title: i18n(`This is an order with child items`), message: i18n(`You need to close secondary batches for this order.`), idOrderSec: orderSC }
    }

    let tubes = 0;

    if (equipmenttype == 'CUT') {
        tubes = packages - (stops - scraps);
    }
    else {
        tubes = packages - stops;
    }

    if (tubes == 0) {
        return { result: 0, idOrderSec: orderSC };
    } else if (tubes < 0) {
        return { result: 1, title: i18n(`We identified @n tubes that were not packaged.`).replace('@n', tubes * -1), message: i18n(`Please close packages with @n remaining tubes`).replace('@n', tubes * -1), idOrderSec: orderSC }
    } else if (tubes > 0) {
        return { result: 2, title: i18n(`We found @n tubes that were not informed to the systems at their stops.`).replace('@n', tubes), message: i18n(`Please inform the speed and quantity of tubes on your desk`), tubes: tubes, idOrderSec: orderSC }
    }
}

async function closeOP(order, message, modal, secondary = null) {

    secondary = secondary ? secondary : null

    if (order.sumOfTheWeightRemainingLot > 0) {
        let lastLotRead = await App.api.ormDbLastLotReadInOrder({ idorder: order.idordermes });
        let lotId = null;

        if (lastLotRead.data.length) {
            lotId = Number(lastLotRead.data[0].idlot);
        }

        // Pega a instancia do grid de sucata
        let dt = $$('dtScrapCreate');
        // Pega o retorno digitado pelo usuario do valor do lot
        let returnedBack = $$('returnedBack').getValue() > 0 ? Number($$('returnedBack').getValue()) : 0;

        // Valida para ver se o objeto está totalmente preenchido, não poderá ter item vazio
        let validProcess = dt.serialize().length ? (dt.serialize().filter(item => { if (!item.scrapreason || !item.weight) return true; else false; }).length ? true : false) : false;
        if (validProcess) {
            webix.message(i18n('You need to fill in the weight and reason for the scrap.'));
            return;
        }

        // Transformar o array de objeto em um array de peso para somar
        let dataScraps = dt.serialize().map(item => {
            if (item.weight) {
                return Number(item.weight.replace(/,/g, "."));
            }
        });
        // Soma todos os valroes do array de peso da sucata
        let sumScrap = dataScraps.length ? dataScraps.reduce((accumulator, currentValue) => accumulator + currentValue) : 0;

        // Verifico se os valores digitado pelo usuario no datatable é valido
        if (isNaN(sumScrap)) {
            webix.message(i18n('Invalid values ​​for lot weight'));
            return;
        }

        // Valor referente ao calculo de soma do retorno para traz mais soma de sucata menos o valor restante do lote
        let lassLotConsumeds = parseFloat(parseFloat(order.sumOfTheWeightRemainingLot).toFixed(3)) - parseFloat(parseFloat(returnedBack + sumScrap).toFixed(3));

        if (lassLotConsumeds > 0) {
            // A soma dos pesos do lot passou do peso restante disponivel
            webix.message(i18n('You need to stop all lot read to be consumed'));
            return;
        } else if (lassLotConsumeds < 0) {
            // A soma dos pesos é menor do que o peso restante disponivel
            webix.message(i18n('Return to back and scrap greater than the remaining value of lot'));
            return;
        } else {

            // Verifica se existe valor maior que zero em retorno para traz, caso não tenha ele desabilita o lot
            if (returnedBack > 0) {
                let beforeValue = await App.api.ormDbFindOne('lotcharacteristic', { idlot: lotId, name: "CG_PESO_LIQUIDO" });
                await App.api.ormDbUpdate({ idlot: lotId, name: "CG_PESO_LIQUIDO" }, 'lotcharacteristic', { numbervalue: returnedBack });
                await App.api.ormDbUpdate({ idlot: lotId, name: "CG_PESO_BRUTO" }, 'lotcharacteristic', { numbervalue: returnedBack });
                await App.api.ormDbCreate('lothistory', { lot: lotId, field: "CG_PESO_LIQUIDO", valuebefore: beforeValue.data.numbervalue, valueafter: returnedBack })
            } else {
                await App.api.ormDbUpdate({ id: lotId }, 'lot', { situation: 'D' });
                // Atualiza para 0 todo o lote consumido naquela ordem
                await App.api.ormDbUpdate({ idlot: lotId, idorder: order.idordermes, idequipment: order.idequipmentscheduled }, 'lotconsumed', { weight: 0 });
            }
        }

        // Verifica se existe valores em sucata para salvar, se sim ele salva todo estes valores
        if (sumScrap > 0) {
            let data = dt.serialize();
            for (let i = 0; i < data.length; i++) {
                let item = data[i];
                let weight = Number(item.weight.replace(/,/g, "."));
                await App.api.ormDbCreate('scrap', {
                    idscrapreason: item.scrapreason,
                    weight: weight,
                    quantity: await util.calcWeightParts(lotId, 'parts', weight),
                    idequipment: order.idequipmentscheduled,
                    idlot: lotId,
                    idorder: order.idordermes
                });
            }
        }
    }

    if (message.result == 0) {
        let result = await App.api.ormDbUpdate({ idordermes: order.idordermes }, 'order', { orderstatus: "FINISHED" });
        if (message.idOrderSec)
            await App.api.ormDbUpdate({ idordermes: message.idOrderSec }, 'order', { orderstatus: "FINISHED" });
        if (result.success) {

            //remove lotes alocados mas não utilizados
            let result = await App.api.ormDbRemoveAllocation(order);

            webix.message(i18n('Order produced'));

            let res = await App.api.ormDbUpdate({ idorder: order.idordermes }, 'collect', { enddate: new Date() });

            if (res.success) {
                secondary = secondary ? secondary : null
                await pauseCollects(order)
                newInterface(order, secondary);
            }

            program.showScreen()
            modal.close();
        } else {
            webix.alert(i18n('Error contact your system administrator'));
        }
    } else if (message.result == 2) {
        let speed = $$('idSpeed').getValue();
        let quantityOfTubes = $$('idQuantityOfTubes').getValue();
        if (speed && quantityOfTubes) {
            let resCreateStop = await App.api.ormDbCreate('stop', {
                "idequipment": order.idequipmentscheduled,
                "idorder": order.idordermes,
                "stoptype": "PERFORMED",
                "startdate": moment().format("YYYY-MM-DD HH:mm:ss"),
                "enddate": moment().format("YYYY-MM-DD HH:mm:ss"),
                "idstopreason": "99", // PARADA DE ENCERRAMENTO DE OP
                "idstoptype": null,
                "quantityofparts": quantityOfTubes,
                "velocity": speed,
                "letter": '0'
            })
            if (resCreateStop.success) {
                await App.api.ormDbUpdate({ idordermes: order.idordermes }, 'order', { orderstatus: "FINISHED" });
                if (message.idOrderSec)
                    await App.api.ormDbUpdate({ idordermes: message.idOrderSec }, 'order', { orderstatus: "FINISHED" });

                //remove lotes alocados mas não utilizados
                let result = await App.api.ormDbRemoveAllocation(order);
                webix.alert(i18n('Order produced'));
                let res = await App.api.ormDbUpdate({ idorder: order.idordermes }, 'collect', { enddate: new Date() });

                if (res.success) {
                    secondary = secondary ? secondary : null
                    await pauseCollects(order)
                    newInterface(order, secondary);
                }

                program.showScreen()
                modal.close();
            } else {
                webix.alert(i18n('Error contact your system administrator'));
            }
        } else {
            webix.message(i18n('Please fill in the speed and quantity of tubes!'));
        }
    }
}

async function newInterface(order, secondary = null) {

    let finalWeight = parseInt((parseFloat(order.sumScraps)) * 1000) / 1000;

    let lotgeneratedweight = await App.api.getWeightConsumed(order.idordermes);

    let scraps = await App.api.getWeightConsumedLots(order);
    scraps = scraps.consumeds

    let produced = [
        {
            LOTCONSUMED: lotgeneratedweight.map(elem => {

                return {
                    WEIGHTCONSUMED: (parseFloat(elem.sum).toFixed(3) - 0.0005).toFixed(3),
                    ORDERPRODUCTION: elem.idordersap ? ("000000000000" + elem.idordersap).slice(-12) : null,
                    MATERIALCONSUMED: elem.idmaterial,
                    LOTCONSUMED: ("00000000000000" + elem.lotconsumed).slice(-10)
                }
            })
        }
    ]

    let scrapp = scraps.map(elem => {
        return {
            MATERIALCONSUMED: elem.idmaterial,
            LOTCONSUMED: ("00000000000000" + elem.idlot).slice(-10),
            WEIGHTSCRAPPED: elem.scrap ? elem.scrap : 0,
            END: "X"
        }
    })


    let statusinterface = await App.api.ormDbFind('interface', {
        idordermes: order.idordermes,
        idstatus: {
            $notIn: ['OK', 'RSD']
        }
    });
    statusinterface = statusinterface.data;

    let idstatus = statusinterface.length > 0 ? 'BLK' : 'NEW'

    let interfaceSave = await App.createInterfaceMs02(order, {
        idinterface: 'MS02',
        operation: 'A',
        idstatus: idstatus,
        scrapp: scrapp,
        produced: produced
    });

    interfaceSave.idordermes = order.idordermes;
    interfaceSave.idordersap = order.idordersap ? order.idordersap : null

    let inte = await App.api.ormDbCreate('interface', interfaceSave);

    if (secondary) {

        let lotgeneratedweight = await App.api.getWeightConsumed(secondary.idordermes);

        let scrapsSec = await App.api.getWeightConsumedLotsSec(secondary);
        scrapsSec = scrapsSec.consumeds

        let produced = [
            {
                LOTCONSUMED: lotgeneratedweight.map(elem => {

                    return {
                        WEIGHTCONSUMED: (parseFloat(elem.sum).toFixed(3) - 0.0005).toFixed(3),
                        ORDERPRODUCTION: elem.idordersap ? ("000000000000" + elem.idordersap).slice(-12) : null,
                        MATERIALCONSUMED: elem.idmaterial,
                        LOTCONSUMED: ("00000000000000" + elem.lotconsumed).slice(-10)
                    }
                })
            }
        ]

        let scrapp = scrapsSec.map(elem => {
            return {
                MATERIALCONSUMED: elem.idmaterial,
                LOTCONSUMED: ("00000000000000" + elem.idlot).slice(-10),
                WEIGHTSCRAPPED: elem.weight,
                END: "X"
            }
        })

        let statusinterface = await App.api.ormDbFind('interface', {
            idordermes: secondary.idordermes,
            idstatus: {
                $notIn: ['OK', 'RSD']
            }
        });
        statusinterface = statusinterface.data;

        let idstatus = statusinterface.length > 0 ? 'BLK' : 'NEW'

        let interfaceSave = await App.createInterfaceMs02(secondary, {
            idinterface: 'MS02',
            operation: 'A',
            idstatus: idstatus,
            scrapp: scrapp,
            produced: produced
        });

        interfaceSave.idordermes = secondary.idordermes;
        interfaceSave.idordersap = secondary.idordersap ? secondary.idordersap : null

        let inte = await App.api.ormDbCreate('interface', interfaceSave);

    }
}

async function pauseCollects(order) {

    let idequipment = order.idequipmentscheduled;
    let idordermes = order.idordermes

    let orderprodhistory = await App.api.ormDbFind('orderprodhistory', {
        idequipment: idequipment,
        idordermes: idordermes,
        stopdate: null
    })

    let id = null

    if (orderprodhistory.data.length)
        id = orderprodhistory.data[0].id;

    if (id)
        await App.api.ormDbUpdate({ "id": id }, 'orderprodhistory', { "stopdate": new Date() })

}