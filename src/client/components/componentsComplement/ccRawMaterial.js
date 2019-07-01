import { i18n } from "../../lib/I18n.js";
import { App } from "../../lib/App.js";
import * as util from "../../lib/Util.js";

import * as  _modalReadQR from "../../extra/_modalReadQR.js";
import * as  screenProductionProgram from "../screenProductionProgramStart.js";

export async function create(order) {
    return {
        view: "form",
        scroll: false,
        id: "frmRawMaterial",
        elementsConfig: { margin: 5 },
        elements: [
            {
                view: "fieldset",
                label: i18n("Material/Lot") + ': ',
                id: "fieldset-rawmaterial",
                borderless: true,
                height: 110,
                body: {
                    rows: [
                        {
                            height: 30,
                            cols: [
                                {
                                    view: 'text', width: 100, id: "txtReadRawMaterial"
                                },
                                {
                                    view: "button", width: 80, label: i18n("Read"), with: 30,
                                    click: async () => {
                                        let digitReadRawMateroal = $$('txtReadRawMaterial').getValue();
                                        if (digitReadRawMateroal) {
                                            searchInformation(digitReadRawMateroal, order);
                                        } else {
                                            let idlot = await _modalReadQR.showModal();
                                            searchInformation(idlot, order);
                                        };
                                    }
                                },
                                // {
                                //     view: "template", width: 30, template: `<strong>${i18n("Lot")}</strong>:`
                                // },
                                // {
                                //     view: "template", width: 60, id: "elementIdLot", data: '-', template: function (obj) {
                                //         return typeof obj != 'object' ? obj : '-';
                                //     }
                                // },
                                // {
                                //     view: "template", width: 80, template: `<strong>${i18n("Raw Material")}</strong>:`
                                // },
                                // {
                                //     view: "template", id: "elementRawMaterial", data: '-', template: function (obj) {
                                //         return typeof obj != 'object' ? obj : '-';
                                //     }
                                // },
                                {
                                    view: "template", width: 120, template: `<strong>${i18n("Next Lot")}</strong>:`
                                },
                                {
                                    view: "template", id: "elementNextLot", data: '-', template: function (obj) {
                                        return typeof obj != 'object' ? obj : '-';
                                    }
                                },
                                {
                                    view: "template", width: 120, template: `<strong>${i18n("Remaining Weight")}</strong>:`
                                    //view: "template", template: `<strong>${i18n("Remaining Weight")}</strong>:`
                                },
                                {
                                    view: "template", id: "elementWeightItem", data: '-', template: function (obj) {
                                        return typeof obj != 'object' ? obj : '-';
                                    }
                                },

                            ]
                        },
                        {
                            cols: [
                                
                                {
                                    view: "template", width: 160, template: `<strong>${i18n("Number of remaining parts expected")}</strong>:`
                                    //view: "template", template: `<strong>${i18n("Number of remaining parts expected")}</strong>:`
                                },
                                {
                                    view: "template", id: "elementNbPartsExpected", data: '-', template: function (obj) {
                                    //view: "template", id: "elementNbPartsExpected", data: '-', template: function (obj) {
                                        return typeof obj != 'object' ? obj : '-';
                                    }
                                },
                                {
                                    view: "template", width: 100, template: `<strong>${i18n("Quality")}</strong>:`
                                    //view: "template", template: `<strong>${i18n("Quality")}</strong>:`
                                },
                                {
                                    view: "template",  id: "elementQuality", data: '-', template: function (obj) {
                                    //view: "template", id: "elementQuality", data: '-', template: function (obj) {
                                        return typeof obj != 'object' ? obj : '-';
                                    }
                                },
                                // {
                                //     view: "template", width: 160, template: `<strong>${i18n("Heat Number")}</strong>:`
                                // },
                                // {
                                //     view: "template", id: "elementHeatNumber", data: '-', template: function (obj) {
                                //         return typeof obj != 'object' ? obj : '-';
                                //     }
                                // },
                                // {
                                //     view: "template", width: 160, template: `<strong>${i18n("Tubes collected")}</strong>:`
                                // },
                                // {
                                //     view: "template", id: "elementTubesCollected", data: '-', template: function (obj) {
                                //         return typeof obj != 'object' ? obj : '0';
                                //     }
                                // },
                                // {
                                //     view: "template", width: 180, template: `<strong>${i18n("Tubes packed")}</strong>:`
                                // },
                                // {
                                //     view: "template", id: "elementTubesPacked", data: '-', template: function (obj) {
                                //         return typeof obj != 'object' ? obj : '0';
                                //     }
                                // },
                            ]
                        },
                        {
                            cols: [
                                {
                                    view: "template", width: 160, template: `<strong>${i18n("Heat Number")}</strong>:`
                                },
                                {
                                    view: "template", id: "elementHeatNumber", data: '-', template: function (obj) {
                                        return typeof obj != 'object' ? obj : '-';
                                    }
                                },
                                {
                                    view: "template", width: 160, template: `<strong>${i18n("Tubes collected")}</strong>:`
                                },
                                {
                                    view: "template", id: "elementTubesCollected", data: '-', template: function (obj) {
                                        return typeof obj != 'object' ? obj : '0';
                                    }
                                },
                                {
                                    view: "template", width: 180, template: `<strong>${i18n("Tubes packed")}</strong>:`
                                },
                                {
                                    view: "template", id: "elementTubesPacked", data: '-', template: function (obj) {
                                        return typeof obj != 'object' ? obj : '0';
                                    }
                                }
                            ]
                        }
                    ]
                }
            }]
    }
}

export async function searchInformation(idlot, order) {

    let characteristics = await App.api.getCharacteriscsByLot(idlot);
    characteristics = characteristics.data[0];
    
    if (characteristics) {
        order.lengthrm = characteristics.length;
        order.rawmaterial = characteristics.description;
        order.weight = characteristics.weight;
        order.idrawmaterial = characteristics.materialid;
    }
    
    //let consumed = await App.api.ormDbFind('lotconsumed', { status: true, idlot: idlot, idorder: order.idordermes });
    
    let lotconsumedCharcateristic = await App.api.ormDbFind('lotcharacteristic', { status: true, idlot: idlot, name: 'CG_QUANTIDADE' });
    lotconsumedCharcateristic = lotconsumedCharcateristic.data[0];

    let lotconsumedQuality = await App.api.ormDbFind('lotcharacteristic', { status: true, idlot: idlot, name: 'CG_DEPOSITO_DESTINO' });
    if (lotconsumedQuality)
        lotconsumedQuality = lotconsumedQuality.data[0];
    
    let allocation = await App.api.ormDbFindOne('allocation', { idlot: idlot, idorder: order.idordermes });
    let lot = await App.api.ormDbFindOne('lot', { id: idlot });

    if (allocation.success) {
        if (allocation.data.idorder) {
            await App.api.ormDbUpdate({ idlot: idlot, status: true }, 'moverequest', { situationmovement: 'T' });
            
            let checkLotConsumed = await App.api.ormDbFindOne('lotconsumed', { idlot: idlot, idorder: order.idordermes });
            if(checkLotConsumed.success){
                if(checkLotConsumed.data.weight)
                    order.weight = checkLotConsumed.data.weight;
            }
            else
                await createLotConsumed(idlot, order, allocation.data.weight);

            let consumed = await App.api.ormDbSum('lotconsumed', 'weight', { status: true, idorder: order.idordermes });
            if(consumed.success){
                if(consumed.data)
                    order.weight = consumed.data;
            }
            
            $$('fieldset-rawmaterial').define("label", i18n("Material/Lot") + ": " + order.rawmaterial + ' / ' + idlot) ;

            // $$('elementIdLot').setHTML(idlot);
            // $$('elementRawMaterial').setHTML(order.rawmaterial);
            $$('elementHeatNumber').setHTML(lot.data.idrun);
            if (lotconsumedQuality)
                $$('elementQuality').setHTML(lotconsumedQuality.textvalue);
            //else
            //    $$('elementQuality').setHTML('-');

            let lotConsumeds = await App.api.ormDbLotConsumedPerLotGenerate({ idorder: order.idordermes });
            let nextLot = ' - '
            if (lotConsumeds.data.length > 1) {
                nextLot = lotConsumeds.data[1].idlot;
            }
            
            $$('elementNextLot').setHTML(nextLot);

            localStorage.setItem('oldLotReader' + order.idordermes, idlot);
            
            if (order.equipmentscheduledtype == 'CUT') {
                let sumWeightScrap = await App.api.ormDbSum('scrap', 'weight', { idorder: order.idordermes, idequipment: order.idequipmentscheduled });
                //let remainingWeight = consumed.data ? consumed.data : allocation.data.weight;
                //Só pode pegar o peso que já foi lido, nunca da alocação.
                let remainingWeight = consumed.data ? consumed.data : 0;
                remainingWeight = remainingWeight - (sumWeightScrap.data ? sumWeightScrap.data : 0);
                let sumCollectedTubes = await App.api.ormDbSum('stop', 'quantityofparts', { idequipment: order.idequipmentscheduled, idorder: order.idordermes, stoptype: "PERFORMED" })
                let sumScrap = await App.api.ormDbSum('scrap', 'quantity', { idorder: order.idordermes, idequipment: order.idequipmentscheduled });
                let sumPiciesLotGenereted = await App.api.ormDbSumPiciesLotGenereted({ idorder: order.idordermes });

                let so = parseFloat(order.lengthm) + 3;       // Material Length
                let rm = order.lengthrm;                      // Raw Material Length
                let ct = parseInt(rm / so);                   // Number of cuts
                let leftOver = rm - (so * ct);                // LeftOver
                
                let nExpected = 0;
                if (lotconsumedCharcateristic)
                    nExpected = lotconsumedCharcateristic.numbervalue * ct
                else {
                    let piecesExpected = await util.calcWeightParts(order.idmaterial, 'piecies', remainingWeight);
                    //nExpected = piecesExpected * ct
                    nExpected = piecesExpected
                }
                let tubesCollected = (sumCollectedTubes.data && sumScrap.data ? (sumCollectedTubes.data + sumScrap.data) : (sumScrap.data ? sumScrap.data : (sumCollectedTubes.data ? sumCollectedTubes.data : 0)))

                //$$('elementNbPartsExpected').setHTML(nExpected - tubesCollected);
                $$('elementNbPartsExpected').setHTML(nExpected);
                $$('elementWeightItem').setHTML(remainingWeight.toFixed(3));
                $$('elementTubesCollected').setHTML(tubesCollected);
                $$('elementTubesPacked').setHTML(sumPiciesLotGenereted.data.length ? sumPiciesLotGenereted.data[0].pieces : 0);
            }
            else if (order.equipmentscheduledtype = 'MKT') {
                
                    let sumWeightScrap = await App.api.ormDbSum('scrap', 'weight', { idorder: order.idordermes, idequipment: order.idequipmentscheduled });
                    let remainingWeight = consumed.data ? consumed.data : allocation.data.weight;
                    remainingWeight = parseFloat(parseFloat(remainingWeight).toFixed(3)) - parseFloat(parseFloat(sumWeightScrap.data ? sumWeightScrap.data : 0).toFixed(3));
                    let piecesExpected = await util.calcWeightParts(idlot, 'piecies', remainingWeight);
                    piecesExpected = ((parseFloat(piecesExpected)*1000)/parseFloat(order.lengthm)).toFixed(0);
                    let sumCollectedTubes = await App.api.ormDbSum('stop', 'quantityofparts', { idequipment: order.idequipmentscheduled, idorder: order.idordermes, stoptype: "PERFORMED" })
                    let sumScrap = await App.api.ormDbSum('scrap', 'quantity', { idorder: order.idordermes, idequipment: order.idequipmentscheduled });
                    let sumPiciesLotGenereted = await App.api.ormDbSumPiciesLotGenereted({ idorder: order.idordermes });
                    let elementTubesCollected = (sumCollectedTubes.data && sumScrap.data) ? (sumCollectedTubes.data + sumScrap.data) : (sumScrap.data ? sumScrap.data : sumCollectedTubes.data)
                    
                    $$('elementNbPartsExpected').setHTML(piecesExpected);
                    $$('elementWeightItem').setHTML(remainingWeight.toFixed(3));
                    $$('elementTubesCollected').setHTML(elementTubesCollected ? elementTubesCollected : 0);
                    $$('elementTubesPacked').setHTML(sumPiciesLotGenereted.data.length ? sumPiciesLotGenereted.data[0].pieces : 0);
            }
            else {
                let sumWeightScrap = await App.api.ormDbSum('scrap', 'weight', { idorder: order.idordermes, idequipment: order.idequipmentscheduled });
                let remainingWeight = consumed.data ? consumed.data : allocation.data.weight;
                remainingWeight = parseFloat(parseFloat(remainingWeight).toFixed(3)) - parseFloat(parseFloat(sumWeightScrap.data ? sumWeightScrap.data : 0).toFixed(3));
                let piecesExpected = await util.calcWeightParts(idlot, 'piecies', remainingWeight);
                let sumCollectedTubes = await App.api.ormDbSum('stop', 'quantityofparts', { idequipment: order.idequipmentscheduled, idorder: order.idordermes, stoptype: "PERFORMED" })
                let sumScrap = await App.api.ormDbSum('scrap', 'quantity', { idorder: order.idordermes, idequipment: order.idequipmentscheduled });
                let sumPiciesLotGenereted = await App.api.ormDbSumPiciesLotGenereted({ idorder: order.idordermes });
                let elementTubesCollected = (sumCollectedTubes.data && sumScrap.data) ? (sumCollectedTubes.data + sumScrap.data) : (sumScrap.data ? sumScrap.data : sumCollectedTubes.data)
                
                $$('elementNbPartsExpected').setHTML(piecesExpected);
                $$('elementWeightItem').setHTML(remainingWeight.toFixed(3));
                $$('elementTubesCollected').setHTML(elementTubesCollected ? elementTubesCollected : 0);
                $$('elementTubesPacked').setHTML(sumPiciesLotGenereted.data.length ? sumPiciesLotGenereted.data[0].pieces : 0);

            }

        } else {
            webix.message(i18n('Unallocated batch for this order.'));
        }
    } else {
        let message = allocation.message ? allocation.message : 'Unallocated lot for this order.';
        webix.alert(i18n(message));
    }
}

/**
 * Gerado quando faz a leitura do lot, parte importante para definir o valor total de peso do lote
 * @param {*} idlot 
 * @param {*} order 
 * @param {*} weight 
 */
async function createLotConsumed(idlot, order, weight) {

    let lastEntries = await App.api.ormDbFind('lotconsumed', {
        idequipment: order.idequipmentscheduled,
        idorder: order.idordermes
    });

    let lotEntryNow = lastEntries.data.filter((item) => {
        if (item.idlot == idlot) {
            return true;
        } else {
            return false;
        }
    });

    let generated = lastEntries.success ? lotEntryNow.length : 0;

    if (lastEntries.success && generated == 0) {
        let weightLot = await App.api.ormDbFindOne('lotcharacteristic', { idlot: idlot, name: 'CG_PESO_LIQUIDO' });

        if (weightLot.success && weightLot.data.numbervalue) {
            lastEntries = lastEntries.success && lastEntries.data.length ? Math.max(...lastEntries.data.map((item) => { return item.idorderentry })) + 1 : 1;

            await App.api.ormDbCreate('lotconsumed', {
                idequipment: order.idequipmentscheduled,
                idorder: order.idordermes,
                idorderentry: lastEntries,
                idlot: idlot,
                weight: weight ? weight : weightLot.data.numbervalue,
                originalweight: weight ? weight : weightLot.data.numbervalue,
                iduser: localStorage.getItem('login')
            });

            let ordersec = await App.api.ormDbFind('order',{
                idorderplanned: order.idordermes
            });

            if(ordersec.data.length > 0){
                ordersec = ordersec.data[0];

                let allocation = await App.api.ormDbFind('allocation', {
                    idorder: ordersec.idordermes,
                    idlot: idlot
                });

                if(allocation.data.length > 0){
                    allocation = allocation.data[0];

                    await App.api.ormDbCreate('lotconsumed', {
                        idequipment: order.idequipmentscheduled,
                        idorder: ordersec.idordermes,
                        idorderentry: lastEntries,
                        idlot: idlot,
                        weight: allocation.weight ? allocation.weight : 0,
                        originalweight: allocation.weight ? allocation.weight : 0,
                        iduser: localStorage.getItem('login')
                    });


                }
            }

            screenProductionProgram.showScreen(order.equipmentscheduledtype, order)

        } else {
            webix.message(i18n('Lot without the characteristic weight'));
        }
    } else {
       await enableButtons();
    }
}

async function enableButtons() {
    $$('btnClosePackage').enable();
    $$('btnAddDefect').enable();
    $$('btnStop').enable();
    $$('btnSample').enable();
    //$$('btnTechinicalSheet').enable();
    $$('btnDefect').enable();
    $$('btnEddyCurrent').enable();
    $$('btnScraps').enable();
    $$('btnRnc').enable();
    $$('btnDimensionalControl').enable();
    $$('btnStatusProduction').enable();
    $$('btnScrapRegister').enable();
}