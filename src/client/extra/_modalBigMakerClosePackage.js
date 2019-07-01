import { WebixWindow, WebixCrudAddButton } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";

import * as util from "../lib/Util.js";
import * as _modalRegisterRNC from './_modalRegisterRNC.js';
import * as _modalBigMakerCollectData from './_modalBigMakerCollectData.js';
import * as _modalScrapsRecord from './_modalScrapsRecord.js';
import * as _modalChoosePrinter from "./_modalChoosePrinter.js";
import * as  screenProductionProgram from "./../components/screenProductionProgram.js";
import * as screenProductionProgramBigMakerStart from "/../components/screenProductionProgramBigMakerStart.js";

let modal = null;

export async function showModal(obj) {

    return new Promise(async function (resolve, reject) {

        let stepPieces = await App.api.ormDbFindStepPieces({ idordermes: obj.idordermes, idstep: obj.idstep, sequence: obj.sequence });
        stepPieces = stepPieces.data;

        let order = await App.api.ormDbFind('order', { idordermes: obj.idordermes });
        order = order.data[0];

        if (stepPieces.length == 0) {
            webix.message(i18n('There is no available piece to process!'))
        }
        else {
            modal = new WebixWindow({
                width: 600,
                height: 400
            });
            stepPieces = await reorganizeArray(stepPieces);

            stepPieces = stepPieces.filter(elem => elem.idstatus != "s" && elem.idstatus != 'w')

            let contP = 0;
            let contW = 0;
            let contS = 0;

            stepPieces.forEach(element => {
                if (element.idstatus == 'w' || element.idstatus == 'p') {
                    contP++;
                }
                else if (element.idstatus == 's')
                    contS++;
                else
                    contW++;
            });

            modal.body = {
                view: "form",
                id: "formStepPieces",
                rows: [
                    {
                        view: "datatable",
                        id: 'dtStepPieces',
                        css: "datatable-style-cell",
                        borderless: false,
                        columns: [
                            { id: "statusrow", header: "", width: 35, css: "center", template: "{common.checkbox()}", cssFormat: statusrow },
                            { id: "piece", header: i18n('Piece Number'), fillspace: true, css: "center-text", cssFormat: statusrow },
                            { id: "lot", header: i18n('Lot'), fillspace: true, css: "center-text", cssFormat: statusrow },
                            {
                                id: "idstatus",
                                header: i18n('Status'),
                                fillspace: true,
                                css: "center-text",
                                cssFormat: bgColor,
                                template: (obj) => {
                                    switch (obj.idstatus) {
                                        case 's':
                                            return i18n('Scrapped');
                                        case 'd':
                                            return i18n('Done');
                                        case 'w':
                                            return i18n('Waiting');
                                        case 'p':
                                            return i18n('Producing');
                                    }
                                }
                            }
                        ],
                        //autoheight: true,
                        checkboxRefresh: true,
                        maxHeight: 400,
                        rowHeight: 60,
                        data: stepPieces,
                        scroll: true
                    },
                    {
                        cols: [
                            {},
                            new WebixCrudAddButton('', i18n('Close'), async () => {

                                let pieces = $$('dtStepPieces').serialize();
                                pieces = pieces.filter(elem => elem.statusrow == 1);

                                await hasDefect(order, pieces)
                            }, {
                                    height: 80,
                                }),

                            {}
                        ]
                    }]
            };

            modal.modal = true;
            modal.show();
            modal.setTitle(i18n('Close Package'));
        }
    });

}

function bgColor(value, config) {
    switch (config.idstatus) {
        case 'd':
            return { "background": "#CCFFCC" };
    }
}

async function reorganizeArray(arr) {

    arr = arr.map(elem => {

        if (elem.chkscrap) {
            elem.status = i18n('Scrapped')
            elem.idstatus = 's'
        }
        else if (!elem.dtinitial && !elem.dtend) {
            elem.status = i18n('Waiting')
            elem.idstatus = 'w'
        }
        else if (elem.dtinitial && !elem.dtend) {
            elem.status = i18n('Producing')
            elem.idstatus = 'p'
        }
        else {
            elem.status = i18n('Done')
            elem.idstatus = 'd'
        }
        return elem

    })

    return arr

}

async function hasDefect(order, pieces) {
    webix.confirm({
        title: i18n("Are you want to create RNC?"),
        ok: i18n("Yes! Create"),
        cancel: i18n("No! Thank you"),
        text: '',
        callback: async function (result) {
            await createPackage(order, pieces, result)

        }
    });
}


async function createPackage(order, pieces, rnc = false) {

    webix.confirm({
        title: i18n("Are you sure you want to close a package?"),
        ok: i18n("Yes! Close"),
        cancel: i18n("No! Cancel"),
        text: i18n('Your package will be closed with') + ` ${pieces.length} ` + i18n('items'),
        callback: async function (result) {

            if (result) {
                let Continua = true;
                for (var i = 0; i < pieces.length; i++) {
                    if (pieces[i].status != i18n("Done")) {
                        webix.message(i18n('The selected piece need to be Collected!'))
                        Continua = false;
                    }
                }
                if (Continua) {
                    let value = pieces.length;
                    //let weightCalculate = await util.calcWeightParts(order.idmaterial, 'weight', value);
                    //Novo calculo do peso de saída, pois é utilizado materia prima com espessura diferente do material de saída.
                    let weightCalculate = await util.calcWeightPartsBigTub(order.idmaterial, 'weight', value, order.idrawmaterial);
                    if (weightCalculate) {

                        let window = webix.ui({
                            view: "window",
                            height: 400,
                            width: 380,
                            modal: true,
                            position: "center",
                            head: i18n('Please, check the weight for this package'),
                            body: {
                                view: "form",
                                elements: [
                                    { view: "text", name: "weightDigit", label: i18n('Weight'), value: weightCalculate, attributes: { type: "number" } },
                                    {
                                        view: "button", label: "Ok", click: async function () {

                                            let weightDigit = this.getFormView().elements["weightDigit"].getValue();

                                            if (weightDigit <= 0) {
                                                webix.alert(i18n("The weight must to be greater than zero!"))
                                            }
                                            else {
                                                window.close();

                                                // Verifica a resposta se deseja realmente fechar o pacote
                                                // Adiciona no objeto principal os itens referente ao pacote para ser criado no back
                                                order.valuelot = value;
                                                order.weightlot = weightDigit;
                                                order.usercreatelot = localStorage.getItem('login');
                                                order.idshift = await util.findMyShift();
                                                order.idorderprod = order.idordermes;

                                                // Verifica se tem algum lote registrado na tabela de lot gerado para aquela ordem
                                                let lotConsumeds = await App.api.ormDbLotConsumedPerLotGenerate({ idorder: order.idordermes });

                                                // Se não tem ele avisa que o lote foi totalmente consumido se sim ele percorre
                                                if (lotConsumeds.data.length) {
                                                    lotConsumeds = lotConsumeds.data;

                                                    // Pega o peso total do lote registrado na caracteristica do lote
                                                    let remainingWeight = lotConsumeds[0].weight;

                                                    // Calcula o total de peso restante para aquele lote em consideração ao peso do lote gerado
                                                    let totalWeightLessLot = remainingWeight - order.weightlot;

                                                    // Pega o peso total de sucatas e o peso total de lotes consumidos
                                                    let scraps = await App.api.ormDbSum('scrap', 'weight', { idorder: order.idordermes, idlot: order.lotconsumed1, status: true });
                                                    let allWeightLotConsumeds = await App.api.ormDbSum('lotconsumed', 'weight', { idorder: order.idordermes, status: true });

                                                    // Verifica se realmente exites lotes lidos, caso não ele informa que é necessario fazer a leitura do lote
                                                    if (allWeightLotConsumeds.success) {
                                                        // Verifica se houve sucata registrada se não ele continua o percurso normal
                                                        if (scraps.success) {
                                                            let weightScraps = scraps.data;
                                                            let weightConsumeds = allWeightLotConsumeds.data;

                                                            // Soma o peso do meu lote e o peso das sucatas
                                                            let valueScrapsPlusLotWeightDigit = Number(order.weightlot) + Number(weightScraps);
                                                            // Se o valor for menor que 0 isso identifica que nao terá peso de lote a consumir
                                                            // com tamanho suficiente para ele fechar este lote
                                                            if (weightConsumeds - valueScrapsPlusLotWeightDigit < 0) {
                                                                webix.message(i18n('You can not close this lot because you do not have enough weight to consume (total weight - scrap + batch weight)'));
                                                                return;
                                                            }
                                                        }
                                                    } else {
                                                        webix.alert({ title: i18n('All lot material has been consumed'), text: i18n('Please read another lot to continue'), type: ' alert-warning' });
                                                        return;
                                                    }

                                                    // Se este peso for maior que 0 significa que ainda a peso restante.
                                                    if (totalWeightLessLot >= 0) {
                                                        order.lotconsumed1 = Number(lotConsumeds[0].idlot);
                                                        order.lotweight1 = order.weightlot;
                                                    } else {
                                                        webix.message(i18n('Insufficient raw material lot weight'));
                                                        return;
                                                    }

                                                    order.idlotsap = order.lotconsumed1;
                                                    order.RNC = rnc;
                                                    order.pieces = pieces;

                                                    // Envia os dados para o servidor com intuito de criar o lot
                                                    let resultCreateLot = await App.api.ormDbCreateBigMakerLot(order);

                                                    //Verifica o resultado da resposta para ver se tudo correu bem ele vai consumindo o lote
                                                    if (resultCreateLot.success) {
                                                        order.idlot = resultCreateLot.data.id

                                                        if (totalWeightLessLot >= 0) {
                                                            await App.api.ormDbUpdate({ idorder: order.idordermes, idlot: lotConsumeds[0].idlot }, 'lotconsumed', { weight: totalWeightLessLot });
                                                            // Caso o peso do lote consumido chegar a 0 ele salva como ACABADO - D
                                                            if (totalWeightLessLot === 0) {
                                                                await App.api.ormDbUpdate({ id: Number(lotConsumeds[0].idlot) }, 'lot', { situation: 'D' });
                                                            }
                                                        }


                                                        if (rnc)
                                                            await _modalRegisterRNC.showModal(null, 0, order, 'production');

                                                        await newInterface(order);
                                                        webix.message(i18n('Create package success'));


                                                        let allAllocatedRawMaterialLots = await App.api.ormDbTubesLotSystem({ idordermes: order.idordermes });
                                                        order.lots = allAllocatedRawMaterialLots.data;

                                                        modal.close()

                                                        screenProductionProgramBigMakerStart.showScreen(order)

                                                        await printLabel(order)

                                                    } else {
                                                        webix.alert(i18n(result.message));
                                                    }
                                                } else {
                                                    webix.alert({ title: i18n('All lot material has been consumed'), text: i18n('Please read another lot to continue'), type: ' alert-warning' });
                                                }

                                            }
                                        }
                                    }
                                ]
                            }
                        });

                        window.show();
                    }
                    else {
                        webix.alert(i18n("There is an error, please contact the support!"))
                    }
                }

            }
        }
    });
}


async function newInterface(order) {

    let hasPendency = await App.api.ormDbFind('pendency', { idlot: order.idlot });
    let RNC = null

    if (hasPendency.data.length > 0)
        RNC = 'X'

    let lotLocal = await App.api.ormDbFind('local', { idequipment: order.idequipmentscheduled });

    if (lotLocal.data.length > 0) {
        lotLocal = lotLocal.data[0].id;
    } else {
        webix.message(i18n('There is no local registered to this equipment!'))
        lotLocal = "1A1";
    }

    order.valuelot = Math.round(parseFloat(order.valuelot))

    let lengthm = await App.api.ormDbFind('materialcharacteristic', { idmaterial: order.idmaterial, idcharacteristic: 'CG_COMPRIMENTO' });
    lengthm = lengthm.data[0].numbervalue

    if (lengthm) {
        if (typeof lengthm === 'string')
            lengthm = lengthm.replace(".", ",")
        else
            lengthm = lengthm.toString().replace(".", ",")
    }

    let ov = await App.api.ormDbFindOne('lotcharacteristic', { idlot: order.idlot, name: 'CG_PEDIDO' });
    ov = ov.data;

    let ovitem = await App.api.ormDbFindOne('lotcharacteristic', { idlot: order.idlot, name: 'CG_ITEM' });
    ovitem = ovitem.data;

    let codigo_origem = await App.api.ormDbFindOne('lotcharacteristic', { idlot: order.idlot, name: 'CG_CODIGO_ORIGEM' });
    codigo_origem = codigo_origem.data;

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
                    NOMINALVALUE: lengthm ? lengthm : null,
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
                {
                    CHARACTERISTICCODE: "CG_PEDIDO",
                    NOMINALVALUE: ov ? ov.textvalue : null,
                    UNIT: ""
                },
                {
                    CHARACTERISTICCODE: "CG_ITEM",
                    NOMINALVALUE: ovitem ? ovitem.textvalue : null,
                    UNIT: ""
                },
                {
                    CHARACTERISTICCODE: "CG_CODIGO_ORIGEM",
                    NOMINALVALUE: codigo_origem ? codigo_origem.textvalue : null,
                    UNIT: ""
                },
            ],
            LOTCONSUMED: [
                {
                    MATERIALCONSUMED: order.idrawmaterial,
                    LOTCONSUMED: order.idlotsap ? ("0000000000" + order.idlotsap).slice(-10) : ("0000000000" + order.lotconsumed1).slice(-10),
                    WEIGHTCONSUMED: (parseFloat(order.lotweight1).toFixed(3) - 0.0005).toFixed(3),
                    ORDERPRODUCTION: ("000000000000" + order.idordersap).slice(-12),
                }
            ]
        }
    ];

    let hardness = await App.api.ormDbHardness({ idlot: order.idlot, description: i18n('Dureza') });

    if (hardness.data > 0) {
        produced[0].LOTCHARACTERISTICS.push({
            CHARACTERISTICCODE: "CG_INS_DUREZA",
            NOMINALVALUE: hardness
            //UNIT: "Mohs"
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

async function reloadScreen(obj) {

}

function statusrow(value, obj) {
    if (obj.statusrow) return "row-marked";
    return "";
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
            order: orderOrLot.idordersap ? orderOrLot.idordersap : '-',
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
                order: orderOrLot.idordersap ? orderOrLot.idordersap : '-',
                idorder: orderOrLot.idordermes,
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
        }
    }
}