import { i18n } from "../../lib/I18n.js";
import { App } from "../../lib/App.js";
import * as util from "../../lib/Util.js";

import * as  _modalRegisterRNC from "../../extra/_modalRegisterRNC.js";
import * as _modalDefectRegistry from "../../extra/_modalDefectRegistry.js";
import * as  screenProductionProgram from "../screenProductionProgramStart.js";

export async function create(order, secOrder) {
    if (secOrder.success) {
        secOrder = secOrder.data;
    } else {
        secOrder = null;
    }
    return secOrder ? {
        view: "form",
        scroll: false,
        elementsConfig: { margin: 10 },
        elements: [
            {
                view: "fieldset",
                label: i18n("Secondary Package"),
                borderless: true,
                body: {
                    rows: [

                        {
                            height: 45,
                            cols: [
                                await btnClosePackage(order, secOrder)
                            ]
                        },
                        {
                            cols: [
                                {
                                    view: 'text', label: `${i18n('Quantity of tubes')}`, labelPosition: 'top', id: 'txSecQuantityOfTubes', value: '', on: {
                                        onChange: async (item) => {
                                            let weightCalculate = await util.calcWeightParts(secOrder.idmaterial, 'weight', item);
                                            $$('txSecWeightOfTubes').setValue(weightCalculate);
                                        }
                                    }
                                },
                                {
                                    view: 'text', label: `${i18n('Tube weight')}`, labelPosition: 'top', id: 'txSecWeightOfTubes', value: 0, on: {
                                        onChange: async (item) => {
                                            let partsCalculate = await util.calcWeightParts(secOrder.idmaterial, 'parts', item);
                                            $$('txSecQuantityOfTubes').setValue(partsCalculate);
                                        }
                                    }
                                }
                            ]
                        }
                    ],
                }
            }
        ]
    } : { hidden: true };
}

async function btnClosePackage(order, secOrder) {

    return {
        view: "button",
        label: i18n('Close package'),
        click: async () => {
            let txSecQuantityOfTubes = Number($$('txSecQuantityOfTubes').getValue());
            let txSecWeightOfTubes = Number($$('txSecWeightOfTubes').getValue());
            let idrmlot = localStorage.getItem('oldLotReader' + order.idordermes);

            if (txSecQuantityOfTubes <= 0 && txSecWeightOfTubes <= 0) {
                webix.message(i18n('Number of tubes and weight can not be 0'));
            } else {
                secOrder.weightlot = txSecWeightOfTubes;
                secOrder.valuelot = txSecQuantityOfTubes;

                let valueRemoveTwoLotConsumed = null;

                let istherelotconsumed = await App.api.ormDbFind('lotconsumed', { idorder: secOrder.idordermes, idlot: idrmlot });

                if (istherelotconsumed.data.length == 0) {

                    let sumalsec = await App.api.ormDbSum('allocation', 'weight', { idorder: secOrder.idordermes, idlot: idrmlot });
                    sumalsec = sumalsec.data

                    await App.api.ormDbCreate('lotconsumed', {
                        idequipment: order.idequipmentscheduled,
                        idorder: secOrder.idordermes,
                        idorderentry: 1,
                        idlot: idrmlot,
                        weight: sumalsec ? sumalsec : 0,
                        originalweight: sumalsec ? sumalsec : 0
                    })
                }

                // Verifica se tem algum lote registrado na tabela de lot gerado para aquela ordem secundária
                let lotConsumeds = await App.api.ormDbLotConsumedPerLotGenerate({ idorder: secOrder.idordermes });

                // Se não tem ele avisa que o lote foi totalmente consumido se sim ele percorre
                if (lotConsumeds.data.length) {
                    lotConsumeds = lotConsumeds.data;

                    let run = await App.api.ormDbFindOne('lotcharacteristic', { idlot: Number(lotConsumeds[0].idlot), name: "CG_CODIGO_ORIGEM" });
                    secOrder.idrun = run.success ? run.data.textvalue : '';

                    // Pega o peso total do lote registrado na caracteristica do lote
                    let remainingWeight = lotConsumeds[0].weight;

                    // Calcula o total de peso restante para aquele lote em consideração ao peso do lote gerado
                    let totalWeightLessLot = remainingWeight - secOrder.weightlot;

                    // Se este peso for maior que 0 significa que ainda a peso restante. Se não ele ira calcular o que foi usado no lote dois
                    if (totalWeightLessLot >= 0) {
                        secOrder.lotconsumed1 = Number(lotConsumeds[0].idlot);
                        secOrder.lotweight1 = secOrder.weightlot;
                        secOrder.lotconsumed2 = null;
                        secOrder.lotweight2 = null;
                    } else {
                        // Verifica se existe um segundo lote de raw material lido referente a ordem, se não ele informa que a quantidade
                        // de raw material é insuficiente para produzir aquela quantidade de lote
                        if (lotConsumeds[1]) {
                            secOrder.lotconsumed1 = Number(lotConsumeds[0].idlot);
                            secOrder.lotweight1 = remainingWeight;

                            valueRemoveTwoLotConsumed = secOrder.weightlot - remainingWeight;

                            secOrder.lotconsumed2 = Number(lotConsumeds[1].idlot);
                            secOrder.lotweight2 = valueRemoveTwoLotConsumed;
                        } else {
                            webix.message(i18n('Insufficient raw material lot weight'));
                            return;
                        }
                    }

                    let findlot = await App.api.ormDbFind('lot', { id: secOrder.lotconsumed1 });
                    secOrder.idlotsap = findlot.data[0].idlotsap;

                    if (secOrder.lotconsumed2) {
                        let findlot2 = await App.api.ormDbFind('lot', { id: secOrder.lotconsumed2 });
                        secOrder.idlotsap2 = findlot2.data[0].idlotsap;
                    }

                    secOrder.secPackage = { quantityOfTubes: txSecQuantityOfTubes, weight: txSecWeightOfTubes };
                    secOrder.usercreatelot = localStorage.getItem('login');

                    //secOrder.idrun = '123123'; //mesma que a primeira

                    secOrder.new = false;
                    secOrder.idshift = await util.findMyShift();

                    let res = await App.api.ormDbCreateScondaryLot(secOrder);

                    if (res.success) {
                        secOrder.idlot = res.data.id;

                        if (totalWeightLessLot >= 0) {

                            await App.api.ormDbUpdate({ idorder: secOrder.idordermes, idlot: Number(lotConsumeds[0].idlot) }, 'lotconsumed', { weight: totalWeightLessLot });

                            // Caso o peso do lote consumido chegar a 0 ele salva como ACABADO - D
                            if (totalWeightLessLot === 0) {
                                await App.api.ormDbUpdate({ id: Number(lotConsumeds[0].idlot) }, 'lot', { situation: 'D' });
                            }
                        } else {
                            if (lotConsumeds[1]) {
                                let totalWeightLessLot2 = Number(lotConsumeds[1].weight) - Number(secOrder.lotweight2);
                                // Faz a atualização das caracteristicas do lote na tabela de lote caracteristica e lot consumido
                                await App.api.ormDbUpdate({ idorder: secOrder.idordermes, idlot: Number(lotConsumeds[0].idlot) }, 'lotconsumed', { weight: 0 });
                                await App.api.ormDbUpdate({ id: Number(lotConsumeds[0].idlot) }, 'lot', { situation: 'D' });
                                await App.api.ormDbUpdate({ idorder: secOrder.idordermes, idlot: Number(lotConsumeds[1].idlot) }, 'lotconsumed', { weight: totalWeightLessLot2 });
                            }
                        }

                        await newInterface(secOrder);

                        await printLabel(secOrder)

                        await _modalRegisterRNC.showModal(null, 0, secOrder, 'production');

                        webix.message(i18n('Secondary batch successfully created.'));

                        $$('txSecQuantityOfTubes').setValue("");
                        $$('txSecWeightOfTubes').setValue("");

                        screenProductionProgram.showScreen(order.equipmentscheduledtype, order)
                    } else {
                        webix.alert(i18n('Error saving secondary batch.'));
                    };
                } else {
                    webix.alert({ title: i18n('All lot material has been consumed'), text: i18n('Please read another lot to continue'), type: ' alert-warning' });
                }
            }
        }
    }

}

async function newInterface(order) {

    let RNC = 'X'

    let lotLocal = await App.api.ormDbFind('local', { idequipment: order.idequipmentscheduled });
    if (lotLocal.data.length) {
        lotLocal = lotLocal.data[0].id;
    } else {
        webix.message(i18n('There is no local registered to this equipment!'))
        lotLocal = "1A1";
    }

    order.valuelot = Math.round(parseFloat(order.valuelot));

    let lengthLotSecondary = await App.api.ormDbFindOne('lotcharacteristic', { idmaterial: order.idrawmaterial, name: "CG_COMPRIMENTO" });
    order.lengthm = lengthLotSecondary.success ? lengthLotSecondary.data.numbervalue : 0

    if (order.lengthm) {
        if (typeof order.lengthm === 'string')
            order.lengthm = order.lengthm.replace(".", ",")
        else
            order.lengthm = order.lengthm.toString().replace(".", ",")
    }

    let produced = [
        {
            MATERIAL: order.idmaterial,
            LOTGENERATED: ("00000000000000" + order.idlot).slice(-10),
            PIECES: order.valuelot,
            WEIGHT: (parseFloat(order.weightlot).toFixed(3) - 0.0005).toFixed(3),
            RNC: RNC,
            RETURN: "",
            LOTCHARACTERISTICS: [
                {
                    CHARACTERISTICCODE: "CG_QUANTIDADE",
                    NOMINALVALUE: order.valuelot,
                    UNIT: ""
                },
                {
                    CHARACTERISTICCODE: "CG_PESO_LIQUIDO",
                    NOMINALVALUE: Math.round(parseFloat(order.weightlot)),
                    UNIT: "kg"
                },
                {
                    CHARACTERISTICCODE: "CG_PESO_BRUTO",
                    NOMINALVALUE: Math.round(parseFloat(order.weightlot)),
                    UNIT: "kg"
                },
                {
                    CHARACTERISTICCODE: "CG_COMPRIMENTO",
                    NOMINALVALUE: order.lengthm,
                    UNIT: "mm"
                },
                {
                    CHARACTERISTICCODE: "CG_LOCALIZACAO",
                    NOMINALVALUE: lotLocal,
                    UNIT: ""
                },
                {
                    CHARACTERISTICCODE: "CG_ORDEM",
                    NOMINALVALUE: order.idordersap,
                    UNIT: ""
                },
            ],
            LOTCONSUMED: [
                {
                    MATERIALCONSUMED: order.idrawmaterial,
                    LOTCONSUMED: order.idlotsap ? ("0000000000" + order.idlotsap).slice(-10) : ("0000000000" + order.lotconsumed1).slice(-10),
                    WEIGHTCONSUMED: (parseFloat(order.lotweight1).toFixed(3) - 0.0005).toFixed(3),
                    ORDERPRODUCTION: ("000000000000" + order.idordersap).slice(-12),
                },
                order.lotconsumed2 ? {
                    MATERIALCONSUMED: order.idrawmaterial,
                    LOTCONSUMED: order.idlotsap2 ? ("0000000000" + order.idlotsap2).slice(-10) : ("0000000000" + order.lotconsumed2).slice(-10),
                    WEIGHTCONSUMED: (parseFloat(order.lotweight2).toFixed(3) - 0.0005).toFixed(3),
                    ORDERPRODUCTION: ("000000000000" + order.idordersap).slice(-12),
                } : null
            ]
        }
    ];

    let hardness = await App.api.ormDbHardness({ idlot: order.idlot, description: i18n('Dureza') });

    if (hardness.data > 0) {
        produced[0].LOTCHARACTERISTICS.push({
            CHARACTERISTICCODE: "CG_INS_DUREZA",
            NOMINALVALUE: hardness,
            UNIT: "Mohs"
        });
    }

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
        produced: produced,
    });

    interfaceSave.idlot = order.idlot;
    interfaceSave.idordermes = order.idordermes;
    interfaceSave.idordersap = order.idordersap ? order.idordersap : null

    let inte = await App.api.ormDbCreate('interface', interfaceSave);
}

async function printLabel(orderOrLot) {
    let printer = await App.api.ormDbEquipmentPrinter({ idequipment: orderOrLot.idequipmentscheduled });
    let idLot = orderOrLot.idlot ? orderOrLot.idlot : orderOrLot.id;

    let company = await App.api.ormDbFindOne('company');
    company = company.data;

    let lotcharacteristic = await App.api.ormDbFindOne('lotcharacteristic', { idlot: idLot, name: 'CG_CODIGO_ORIGEM' });
    lotcharacteristic = lotcharacteristic.data;

    let lotcharacteristicfinishing = await App.api.ormDbFindOne('lotcharacteristic', { idlot: idLot, name: 'CG_DEPOSITO_DESTINO' });
    lotcharacteristicfinishing = lotcharacteristicfinishing.data ? lotcharacteristicfinishing.data.textvalue : null;

    if (lotcharacteristicfinishing != 'P1' && lotcharacteristicfinishing != 'P2' && lotcharacteristicfinishing != 'P3') {
        lotcharacteristicfinishing = '';
    }

    let ov = await App.api.ormDbFindOne('lotcharacteristic', { idlot: idLot, name: 'CG_PEDIDO' });
    ov = ov.data;

    let ovitem = await App.api.ormDbFindOne('lotcharacteristic', { idlot: idLot, name: 'CG_ITEM' });
    ovitem = ovitem.data;

    let idMaterial = +orderOrLot.idmaterial;

    let cod = ("0000000000" + idLot).slice(-10) + idMaterial;

    if (printer.data.length && printer.data[0].ip) {
        let print = {
            test: false,
            ip: printer.data[0].ip,
            layout: printer.data[0].idlayout,
            company: company.center + ' - ' + company.name,
            finishing: lotcharacteristicfinishing,
            barCodeAndQRCode: cod,
            client: orderOrLot.idclient ? orderOrLot.idclient : '-',
            idmaterial: +orderOrLot.idmaterial,
            netWeight: orderOrLot.weightlot,
            grossWeight: orderOrLot.weightlot,
            un: lotcharacteristic && lotcharacteristic.textvalue ? lotcharacteristic.textvalue : '-',
            material: orderOrLot.material,
            idlot: idLot,
            idorder: orderOrLot.idordermes,
            order: orderOrLot.idordersap ? orderOrLot.idordersap : null,
            ov: ov && ov.textvalue ? ov.textvalue : '-',
            item: ovitem && ovitem.textvalue ? ovitem.textvalue : '-',
            qtdPieces: orderOrLot.valuelot,
            length: orderOrLot.lengthm ? orderOrLot.lengthm : 0,
            total: orderOrLot.lengthm ? Number(orderOrLot.valuelot) * Number(orderOrLot.lengthm) : 0,
            date: moment().format('DD/MM/YYYY HH:mm'),
            iduser: localStorage.getItem('login'),
        };
        await App.api.ormDbPrint(print);
        return true;
    } else {
        let idprinter = await _modalChoosePrinter.showModal();
        if (idprinter) {
            let print = {
                test: false,
                ip: idprinter.ip,
                layout: idprinter.idlayout,
                company: company.center + ' - ' + company.name,
                finishing: lotcharacteristicfinishing,
                barCodeAndQRCode: cod,
                client: orderOrLot.idclient ? orderOrLot.idclient : '-',
                idmaterial: +orderOrLot.idmaterial,
                netWeight: orderOrLot.weightlot,
                grossWeight: orderOrLot.weightlot,
                un: lotcharacteristic && lotcharacteristic.textvalue ? lotcharacteristic.textvalue : '-',
                material: orderOrLot.material,
                idlot: idLot,
                order: orderOrLot.idordersap ? orderOrLot.idordersap : null,
                idorder: orderOrLot.idordermes,
                ov: ov && ov.textvalue ? ov.textvalue : '-',
                item: ovitem && ovitem.textvalue ? ovitem.textvalue : '-',
                qtdPieces: orderOrLot.valuelot,
                length: orderOrLot.lengthm ? orderOrLot.lengthm : 0,
                total: orderOrLot.lengthm ? Number(orderOrLot.valuelot) * Number(orderOrLot.lengthm) : 0,
                date: moment().format('DD/MM/YYYY HH:mm'),
                iduser: localStorage.getItem('login')
            };
            await App.api.ormDbPrint(print);
            return true;
        }
    }
}