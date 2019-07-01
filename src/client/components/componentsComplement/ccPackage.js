import { i18n } from "../../lib/I18n.js";
import { App } from "../../lib/App.js";
import * as util from "../../lib/Util.js";
import * as  _modalRegisterRNC from "../../extra/_modalRegisterRNC.js";
import * as _modalDefectRegistry from "../../extra/_modalDefectRegistry.js";
import * as _modalChoosePrinter from "../../extra/_modalChoosePrinter.js";
import * as  screenProductionProgram from "../screenProductionProgramStart.js";

export async function create(order, hiddenQualityStandard = true) {
    let sumCollectedTubes = await App.api.ormDbSum('stop', 'quantityofparts', { idequipment: order.idequipmentscheduled, idorder: order.idordermes })
    sumCollectedTubes = sumCollectedTubes.data ? sumCollectedTubes.data : 0;

    let sumTubesWithOrderAndEquipment = await App.api.ormDbSumTubesWithOrderAndEquipment({ idequipment: order.idequipmentscheduled, idorder: order.idordermes })
    sumTubesWithOrderAndEquipment = sumTubesWithOrderAndEquipment.data.length ? sumTubesWithOrderAndEquipment.data[0].sum : 0;

    let sumScrapsCutter = null;

    if (order.equipmentscheduledtype === 'CUT') {
        sumScrapsCutter = await App.api.ormDbSum('scrap', 'quantity', { idorder: order.idordermes, idequipment: order.idequipmentscheduled });
        sumScrapsCutter = sumScrapsCutter.data ? sumScrapsCutter.data : 0
    }

    order = await createNewLotEmpty(order, null);
    return {
        view: "form",
        scroll: false,
        elementsConfig: { margin: 10 },
        elements: [
            {
                view: "fieldset",
                label: i18n("Package"),
                borderless: true,
                body: {
                    rows: [
                        {
                            height: 45,
                            cols: [
                                {
                                    view: 'template', template: `<strong>${i18n('Package default')}</strong>: ${localStorage.getItem('standardPackage')} - ${localStorage.getItem('standardPackageName')}`
                                },
                                order.equipmentscheduledtype == 'CUT' ? await btnClosePackage(order, hiddenQualityStandard, sumCollectedTubes - sumScrapsCutter - sumTubesWithOrderAndEquipment) : await btnClosePackage(order, hiddenQualityStandard, sumCollectedTubes - sumTubesWithOrderAndEquipment),
                                await btnRegisterDefect(order)
                            ]
                        },
/*                        {
                            hidden: hiddenQualityStandard,
                            cols: [
                                {
                                    view: 'template', template: `<strong>${i18n('Quality Standard')}</strong>:`
                                },
                                {
                                    view: 'select', width: 100, value: "P1", options: [{ id: "P1", value: "P1" }, { id: "P2", value: "P2" }, { id: "P3", value: "P3" }], id: 'txtQualityStandard'
                                }
                            ]
                        },
*/                        {
                            cols: [
                                {
                                    view: 'template', template: `<strong>${i18n('Quantity of tubes')}</strong>:`
                                },
                                {
                                    view: 'text', width: 80, height: 40, id: 'txtQuantityOfTubes' //, value: sumCollectedTubes - sumTubesWithOrderAndEquipment
                                },
                                {
                                    hidden: hiddenQualityStandard,
                                    cols: [
                                        {
                                            view: 'template', template: `<strong>${i18n('Quality Standard')}</strong>:`
                                        },
                                        {
                                            view: 'select', value: "P1", options: [{ id: "P1", value: "P1" }, { id: "P2", value: "P2" }, { id: "P3", value: "P3" }], id: 'txtQualityStandard'
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                }
            }
        ]
    };
}

function btnClosePackage(order, hiddenQualityStandard, badge = null) {
    return {
        view: "button",
        label: i18n('Close package'),
        disabled: localStorage.getItem('oldLotReader' + order.idordermes) ? false : true,
        id: 'btnClosePackage',
        badge: badge ? badge : null,
        css: "package-badge",
        click: async () => {

            let lot = await App.api.ormDbFind('lot', { idmaterial: order.idmaterial, new: true, idorderprod: order.idordermes.toString() });

            if (lot.data.length) {
                order.idlot = lot.data[0].id;
            } else {
                lot = await createNewLotEmpty(order, null);
                order.idlot = lot.data.id;
            }

            let dimensinalControlResults = await App.api.ormDbFind('dimensionalcontrolresult', { status: true, idlot: order.idlot });

            if (!dimensinalControlResults.data.length) {
                webix.message(i18n('This lot has no dimensional control release'));
            } else if ($$('txtQuantityOfTubes').getValue() > 0) {
                let defect = await App.api.ormDbFind('defect', { idorder: order.idordermes, idlot: order.idlot });
                let defectData = defect.data[defect.data.length - 1] ? defect.data[defect.data.length - 1] : null;
                hasDefect(order, defectData, hiddenQualityStandard);
            } else {
                webix.message(i18n('Number of pipes can not be 0'));
            }
        }
    }
}

function hasDefect(order, defectData, hiddenQualityStandard) {
    if (defectData) {
        webix.confirm({
            title: i18n("Are you want to create RNC?"),
            ok: i18n("Yes! Create"),
            cancel: i18n("No! Thank you"),
            text: '',
            callback: async function (result) {
                await createPackage(order, null, hiddenQualityStandard, result)
            }
        });
    } else {
        createPackage(order, null, hiddenQualityStandard);
    }
}

async function btnRegisterDefect(order) {
    let lot = await App.api.ormDbFind('lot', { idmaterial: order.idmaterial, new: true, idorderprod: order.idordermes.toString() });
    let qtdDefectByLot = 0;

    if (lot.data.length) {
        let defect = await App.api.ormDbFind('defect', { idorder: order.idordermes.toString(), idlot: lot.data[0].id });
        qtdDefectByLot = defect.data.length;
    }

    return {
        view: "button",
        badge: qtdDefectByLot,
        label: i18n('Add Defect'),
        id: 'btnAddDefect',
        disabled: localStorage.getItem('oldLotReader' + order.idordermes) ? false : true,
        click: async () => {
            let lot = await App.api.ormDbFind('lot', { idmaterial: order.idmaterial, new: true, idorderprod: order.idordermes.toString() });
            order.idlot = lot.data[0].id;
            await _modalDefectRegistry.showModal(null, 0, order.idlot, order);
            screenProductionProgram.showScreen(order.equipmentscheduledtype, order)

        }
    };
}

async function createPackage(order, quality, hiddenQualityStandard, rnc = false) {

    let valueDigit = Number($$('txtQuantityOfTubes').getValue());
    let valueStorage = Number(localStorage.getItem('standardPackage'));
    let value = valueDigit < valueStorage ? valueDigit : valueStorage;
    let lengthCalculate = order.lengthm / 1000;

    //let lengthDigit = Number($$('lengthDigit').getValue());

    if (order.steelm) {

        let weightCalculate = 0;
        let viewlength = false;

        if (order.lengthm > 20000 && order.equipmentscheduledtype == 'MKT') {
            viewlength = (order.lengthm > 20000) ? true : false;
            //weightCalculate = await util.calcWeightPartsBigTub(order.idmaterial, 'weight', value, order.idrawmaterial, 500000);
        }

        //let weightCalculate = await util.calcWeightParts(order.idmaterial, 'weight', value);
        //Novo calculo do peso de saída, pois é utilizado materia prima com espessura diferente do material de saída.
        weightCalculate = await util.calcWeightPartsBigTub(order.idmaterial, 'weight', value, order.idrawmaterial);


        let window = webix.ui({
            view: "window",
            width: 400,
            modal: true,
            position: "center",
            css: 'font-18',
            head: i18n('Package review'),
            body: {
                view: "form",
                id: "formPackageReview",
                elements: [
                    { view: "text", width: 400, name: "pieces", label: i18n('Pieces'), value: value, attributes: { type: "number" }, disabled: true },
                    { view: "text", width: 400, name: "weightDigit", id: "weightDigit", label: i18n('Weight'), value: weightCalculate, attributes: { type: "number" } },
                    viewlength ? {
                        view: "text", width: 400, name: "lengthDigit", id: "lengthDigit", label: i18n('Length'), value: lengthCalculate, attributes: { type: "number" }, on: {
                            onChange: async () => {
                                
                                let lengthDigit = Number($$('formPackageReview').elements.lengthDigit.getValue());
                                lengthDigit *= 1000
                                weightCalculate = await util.calcWeightPartsBigTub(order.idmaterial, 'weight', value, order.idrawmaterial, lengthDigit);
                                $$('formPackageReview').elements.weightDigit.setValue(weightCalculate);
                                webix.html.addCss( $$("weightDigit").getNode(), "custom-background");
                            }
                        }
                    } : {},
                    {
                        height: 10
                    },
                    {
                        rows: [{
                            cols: [{
                                view: "button", label: "Ok", height: 50, click: async function () {

                                    let weightDigit = this.getFormView().elements["weightDigit"].getValue();
                                    let lengthDigit = viewlength ? this.getFormView().elements["lengthDigit"].getValue() * 1000 : lengthCalculate * 1000;

                                    if (weightDigit <= 0) {
                                        webix.alert(i18n("The weight must to be greater than zero!"))
                                    }
                                    else if (lengthDigit <= 0) {
                                        webix.alert(i18n("The length must to be greater than zero!"))
                                    }
                                    else {

                                        let window2 = webix.ui({
                                            view: "window",
                                            width: 400,
                                            //height: 200,
                                            modal: true,
                                            position: "center",
                                            css: 'font-18',
                                            head: i18n("Are you sure you want to close a package?"),
                                            body: {
                                                view: "form",
                                                elements: [
                                                    {
                                                        view: "label",
                                                        css: "font-18",
                                                        template: i18n('Your package will be closed with:')
                                                    },
                                                    {
                                                        height: 10
                                                    },
                                                    {
                                                        view: "label",
                                                        css: "font-18",
                                                        template: '- ' + weightDigit + ' ' + i18n(' Kilos')
                                                    },
                                                    {
                                                        view: "label",
                                                        css: "font-18",
                                                        template: '- ' + value + ' ' + i18n(' Pieces')
                                                    },
                                                    viewlength ? {
                                                        view: "label",
                                                        css: "font-18",
                                                        template: '- ' + lengthDigit / 1000 + ' ' + i18n(' m')
                                                    } : {},
                                                    {
                                                        height: 10
                                                    },
                                                    {
                                                        rows: [
                                                            {
                                                                cols: [

                                                                    {
                                                                        view: "button", label: "Ok", height: 50, click: async function () {

                                                                            window.close();
                                                                            window2.close();

                                                                            // Verifica a resposta se deseja realmente fechar o pacote
                                                                            // Adiciona no objeto principal os itens referente ao pacote para ser criado no back
                                                                            order.valuelot = value;
                                                                            order.weightlot = weightDigit;
                                                                            order.usercreatelot = localStorage.getItem('login');
                                                                            order.quality = hiddenQualityStandard || quality ? quality : $$('txtQualityStandard').getValue()
                                                                            order.idshift = await util.findMyShift();
                                                                            order.idorderprod = order.idordermes;
                                                                            let valueRemoveTwoLotConsumed = null;

                                                                            order.lengthdigit = lengthDigit ? lengthDigit : null

                                                                            // Verifica se tem algum lote registrado na tabela de lot gerado para aquela ordem
                                                                            let lotConsumeds = await App.api.ormDbLotConsumedPerLotGenerate({ idorder: order.idordermes });

                                                                            let vlrPeso = 0;
                                                                            let idlot2 = "";

                                                                            // Se não tem ele avisa que o lote foi totalmente consumido se sim ele percorre
                                                                            if (lotConsumeds.data.length) {
                                                                                lotConsumeds = lotConsumeds.data;

                                                                                // Pega o peso total do lote registrado na caracteristica do lote
                                                                                let remainingWeight = lotConsumeds[0].weight;

                                                                                // Calcula o total de peso restante para aquele lote em consideração ao peso do lote gerado
                                                                                let totalWeightLessLot = remainingWeight - order.weightlot;

                                                                                // Pega o peso total de sucatas e o peso total de lotes consumidos
                                                                                let scraps = await App.api.ormDbSum('scrap', 'weight', { idorder: order.idordermes, idequipment: order.idequipmentscheduled, status: true });
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
                                                                                            webix.message(i18n('You can not close this lot because you do not have enough weight to consume (total weight - scrap + lot weight)'));
                                                                                            return;
                                                                                        }
                                                                                    }
                                                                                } else {
                                                                                    webix.alert({ title: i18n('All lot material has been consumed'), text: i18n('Please read another lot to continue'), type: ' alert-warning' });
                                                                                    return;
                                                                                }

                                                                                //Variável para controle dos lotes a serem consumidos na interface de coleta para o SAP 
                                                                                let lotInteface = 0;

                                                                                // Se este peso for maior que 0 significa que ainda a peso restante. Se não ele ira calcular o que foi usado no lote dois
                                                                                if (totalWeightLessLot >= 0) {
                                                                                    order.lotconsumed1 = Number(lotConsumeds[0].idlot);
                                                                                    order.lotweight1 = order.weightlot;
                                                                                    order.lotconsumed2 = null;
                                                                                    order.lotweight2 = null;
                                                                                } else {
                                                                                    // Verifica se existe um segundo lote de raw material lido referente a ordem, se não ele informa que a quantidade
                                                                                    // de raw material é insuficiente para produzir aquela quantidade de lote

                                                                                    for (let i = 1; i < lotConsumeds.length; i++) {
                                                                                        if (lotConsumeds[i]) {
                                                                                            if ((totalWeightLessLot + (vlrPeso)) < 0) {
                                                                                                vlrPeso += lotConsumeds[i].weight; //lotConsumeds.data[i];
                                                                                                idlot2 = lotConsumeds[i].idlot;
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    //Soma dos pesos dos lotes a consumir com saldo é maior que a necessidade de consumo?
                                                                                    if ((totalWeightLessLot + (vlrPeso)) < 0) {
                                                                                        webix.message(i18n('Insufficient raw material lot weight'));
                                                                                        return;
                                                                                    }
                                                                                    else {
                                                                                        order.lotconsumed1 = Number(lotConsumeds[0].idlot);
                                                                                        order.lotweight1 = remainingWeight;

                                                                                        valueRemoveTwoLotConsumed = order.weightlot - remainingWeight;

                                                                                        //order.lotconsumed2 = Number(lotConsumeds[1].idlot);
                                                                                        order.lotconsumed2 = Number(idlot2);
                                                                                        order.lotweight2 = valueRemoveTwoLotConsumed;
                                                                                    }
                                                                                }

                                                                                let findlot = await App.api.ormDbFind('lot', { id: order.lotconsumed1 });
                                                                                order.idlotsap = findlot.data[0].idlotsap;
                                                                                order.idmateriallot = findlot.data[0].idmaterial;

                                                                                if (order.lotconsumed2) {
                                                                                    let findlot2 = await App.api.ormDbFind('lot', { id: order.lotconsumed2 });
                                                                                    order.idlotsap2 = findlot2.data[0].idlotsap;
                                                                                    order.idmateriallot2 = findlot2.data[0].idmaterial;
                                                                                }


                                                                                let hasPendency = await App.api.ormDbFind('pendency', { idlot: order.idlot });

                                                                                if (hasPendency.data.lenght > 0)
                                                                                    order.RNC = true;
                                                                                else
                                                                                    order.RNC = false;

                                                                                // Envia os dados para o servidor com intuito de criar o lot
                                                                                let resultCreateLot = await App.api.ormDbCreateLot(order);

                                                                                //Verifica o resultado da resposta para ver se tudo correu bem ele vai consumindo o lote
                                                                                if (resultCreateLot.success) {
                                                                                    if (totalWeightLessLot >= 0) {
                                                                                        await App.api.ormDbUpdate({ idorder: order.idordermes, idlot: lotConsumeds[0].idlot }, 'lotconsumed', { weight: totalWeightLessLot });
                                                                                        // Caso o peso do lote consumido chegar a 0 ele salva como ACABADO - D
                                                                                        if (totalWeightLessLot === 0) {
                                                                                            await App.api.ormDbUpdate({ id: Number(lotConsumeds[0].idlot) }, 'lot', { situation: 'D' });
                                                                                        }
                                                                                    } else {
                                                                                        //Verifica qual será o segundo lote da OP.
                                                                                        if (vlrPeso < 0) {
                                                                                            for (let i = 1; i < lotConsumeds.length; i++) {
                                                                                                if (lotConsumeds[i]) {
                                                                                                    if ((totalWeightLessLot + (vlrPeso)) < 0) {
                                                                                                        vlrPeso += lotConsumeds[i].weight; //lotConsumeds.data[i];
                                                                                                        idlot2 = lotConsumeds[i].idlot;
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                        //if (lotConsumeds[1]) {
                                                                                        if (idlot2) {
                                                                                            //let totalWeightLessLot2 = Number(lotConsumeds[1].weight) - Number(order.lotweight2);
                                                                                            let totalWeightLessLot2 = Number(vlrPeso) - Number(order.lotweight2);
                                                                                            // Faz a atualização das caracteristicas do lote na tabela de lote caracteristica e lot consumido
                                                                                            await App.api.ormDbUpdate({ idorder: order.idordermes, idlot: Number(lotConsumeds[0].idlot) }, 'lotconsumed', { weight: 0 });
                                                                                            await App.api.ormDbUpdate({ id: Number(lotConsumeds[0].idlot) }, 'lot', { situation: 'D' });

                                                                                            //Variável para controle do peso dos lotes a serem consumidos por 
                                                                                            //motivo do usuário poder ler mais lotes de materia prima que o 
                                                                                            //necessário para geração do lote de saída em questão.
                                                                                            let weightCompleted = 0;

                                                                                            // Atualiza o peso dos lotes que foram consumidos entre o Lote[0] e o lote[1].
                                                                                            for (let i = 1; i < lotConsumeds.length; i++) {
                                                                                                if (lotConsumeds[i].idlot != idlot2) {
                                                                                                    if (weightCompleted == 0) {
                                                                                                        await App.api.ormDbUpdate({ idorder: order.idordermes, idlot: Number(lotConsumeds[i].idlot) }, 'lotconsumed', { weight: 0 });
                                                                                                        await App.api.ormDbUpdate({ id: Number(lotConsumeds[i].idlot) }, 'lot', { situation: 'D' });
                                                                                                        order.lotweight2 = order.lotweight2 - lotConsumeds[i].weight;
                                                                                                        lotInteface = i;
                                                                                                    }
                                                                                                }
                                                                                                else {
                                                                                                    lotConsumeds[i].weight = (parseFloat(order.lotweight2) - 0.0005).toFixed(3);
                                                                                                    //Já encontrou o ultimo lote para consumo, não precisa consumir mais nada de outros lotes lidos.
                                                                                                    weightCompleted = 1;
                                                                                                    lotInteface = i;
                                                                                                }
                                                                                            }
                                                                                            //await App.api.ormDbUpdate({ idorder: order.idordermes, idlot: Number(lotConsumeds[1].idlot) }, 'lotconsumed', { weight: totalWeightLessLot2 });
                                                                                            await App.api.ormDbUpdate({ idorder: order.idordermes, idlot: Number(idlot2) }, 'lotconsumed', { weight: totalWeightLessLot2 });
                                                                                        }
                                                                                    }


                                                                                    if (rnc)
                                                                                        await _modalRegisterRNC.showModal(null, 0, order, 'production');

                                                                                    await newInterface(order, lotConsumeds, idlot2, lotInteface, lengthDigit);
                                                                                    webix.message(i18n('Create package success'));

                                                                                    // TODO: Descomentar esta parte para imprimir
                                                                                    await printLabel(order)

                                                                                    await createNewLotEmpty(order, null);
                                                                                    screenProductionProgram.showScreen(order.equipmentscheduledtype, order)

                                                                                } else {
                                                                                    webix.alert(i18n(result.message));
                                                                                }
                                                                            } else {
                                                                                webix.alert({ title: i18n('All lot material has been consumed'), text: i18n('Please read another lot to continue'), type: ' alert-warning' });
                                                                            }

                                                                        }
                                                                    },
                                                                    {
                                                                        view: "button",
                                                                        label: "Cancel",
                                                                        height: 50,
                                                                        click: () => {
                                                                            window2.close();
                                                                        }
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    },



                                                ]
                                            }
                                        });

                                        window2.show()

                                    }
                                }
                            },
                            {
                                view: "button",
                                label: "Cancel",
                                height: 50,
                                click: () => {
                                    window.close();
                                }
                            }
                            ]
                        }
                        ]
                    },



                ]
            }
        });

        window.show();
    }
    else {
        webix.alert(i18n("There is no information about steel registered for this material. Please contact the support!"))
    }
}


async function newInterface(order, lotConsumeds, idlot2, lotInteface, lengthDigit) {

    if(typeof lengthDigit === 'string')
        lengthDigit = lengthDigit.replace(".", ",")
    else
        lengthDigit = lengthDigit.toString().replace(".", ",")
        

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

    let ov = await App.api.ormDbFindOne('lotcharacteristic', { idlot: order.idlot, name: 'CG_PEDIDO' });
    ov = ov.data;

    let ovitem = await App.api.ormDbFindOne('lotcharacteristic', { idlot: order.idlot, name: 'CG_ITEM' });
    ovitem = ovitem.data;

    let codigo_origem = await App.api.ormDbFindOne('lotcharacteristic', { idlot: order.idlot, name: 'CG_CODIGO_ORIGEM' });
    codigo_origem = codigo_origem.data;

    order.valuelot = Math.round(parseFloat(order.valuelot))

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
                    NOMINALVALUE: lengthDigit,
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
                    CHARACTERISTICCODE: "CG_DEPOSITO_DESTINO",
                    NOMINALVALUE: order.quality,
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
                    MATERIALCONSUMED: order.idmateriallot,
                    LOTCONSUMED: order.idlotsap ? ("0000000000" + order.idlotsap).slice(-10) : ("0000000000" + order.lotconsumed1).slice(-10),
                    WEIGHTCONSUMED: (parseFloat(order.lotweight1).toFixed(3) - 0.0005).toFixed(3),
                    ORDERPRODUCTION: ("000000000000" + order.idordersap).slice(-12),
                },
                lotConsumeds[1] && idlot2 && (lotInteface >= 1) ? {
                    MATERIALCONSUMED: lotConsumeds[1].idmaterial,
                    LOTCONSUMED: lotConsumeds[1].idlot ? ("0000000000" + lotConsumeds[1].idlot).slice(-10) : ("0000000000" + order.lotconsumed2).slice(-10),
                    WEIGHTCONSUMED: (parseFloat(lotConsumeds[1].weight).toFixed(3) - 0.0005).toFixed(3),
                    ORDERPRODUCTION: ("000000000000" + order.idordersap).slice(-12),
                } : null,
                lotConsumeds[2] && idlot2 && (lotInteface >= 2) ? {
                    MATERIALCONSUMED: lotConsumeds[2].idmaterial,
                    LOTCONSUMED: lotConsumeds[2].idlot ? ("0000000000" + lotConsumeds[2].idlot).slice(-10) : ("0000000000" + order.lotconsumed2).slice(-10),
                    WEIGHTCONSUMED: (parseFloat(lotConsumeds[2].weight).toFixed(3) - 0.0005).toFixed(3),
                    ORDERPRODUCTION: ("000000000000" + order.idordersap).slice(-12),
                } : null,
                lotConsumeds[3] && idlot2 && (lotInteface >= 3) ? {
                    MATERIALCONSUMED: lotConsumeds[3].idmaterial,
                    LOTCONSUMED: lotConsumeds[3].idlot ? ("0000000000" + lotConsumeds[3].idlot).slice(-10) : ("0000000000" + order.lotconsumed2).slice(-10),
                    WEIGHTCONSUMED: (parseFloat(lotConsumeds[3].weight).toFixed(3) - 0.0005).toFixed(3),
                    ORDERPRODUCTION: ("000000000000" + order.idordersap).slice(-12),
                } : null,
                lotConsumeds[4] && idlot2 && (lotInteface >= 4) ? {
                    MATERIALCONSUMED: lotConsumeds[4].idmaterial,
                    LOTCONSUMED: lotConsumeds[4].idlot ? ("0000000000" + lotConsumeds[4].idlot).slice(-10) : ("0000000000" + order.lotconsumed2).slice(-10),
                    WEIGHTCONSUMED: (parseFloat(lotConsumeds[4].weight).toFixed(3) - 0.0005).toFixed(3),
                    ORDERPRODUCTION: ("000000000000" + order.idordersap).slice(-12),
                } : null,
                lotConsumeds[5] && idlot2 && (lotInteface >= 5) ? {
                    MATERIALCONSUMED: lotConsumeds[5].idmaterial,
                    LOTCONSUMED: lotConsumeds[5].idlot ? ("0000000000" + lotConsumeds[5].idlot).slice(-10) : ("0000000000" + order.lotconsumed2).slice(-10),
                    WEIGHTCONSUMED: (parseFloat(lotConsumeds[5].weight).toFixed(3) - 0.0005).toFixed(3),
                    ORDERPRODUCTION: ("000000000000" + order.idordersap).slice(-12),
                } : null,
                lotConsumeds[6] && idlot2 && (lotInteface >= 6) ? {
                    MATERIALCONSUMED: lotConsumeds[6].idmaterial,
                    LOTCONSUMED: lotConsumeds[6].idlot ? ("0000000000" + lotConsumeds[6].idlot).slice(-10) : ("0000000000" + order.lotconsumed2).slice(-10),
                    WEIGHTCONSUMED: (parseFloat(lotConsumeds[6].weight).toFixed(3) - 0.0005).toFixed(3),
                    ORDERPRODUCTION: ("000000000000" + order.idordersap).slice(-12),
                } : null,
                lotConsumeds[7] && idlot2 && (lotInteface >= 7) ? {
                    MATERIALCONSUMED: lotConsumeds[7].idmaterial,
                    LOTCONSUMED: lotConsumeds[7].idlot ? ("0000000000" + lotConsumeds[7].idlot).slice(-10) : ("0000000000" + order.lotconsumed2).slice(-10),
                    WEIGHTCONSUMED: (parseFloat(lotConsumeds[7].weight).toFixed(3) - 0.0005).toFixed(3),
                    ORDERPRODUCTION: ("000000000000" + order.idordersap).slice(-12),
                } : null,
                lotConsumeds[8] && idlot2 && (lotInteface >= 8) ? {
                    MATERIALCONSUMED: lotConsumeds[8].idmaterial,
                    LOTCONSUMED: lotConsumeds[8].idlot ? ("0000000000" + lotConsumeds[8].idlot).slice(-10) : ("0000000000" + order.lotconsumed2).slice(-10),
                    WEIGHTCONSUMED: (parseFloat(lotConsumeds[8].weight).toFixed(3) - 0.0005).toFixed(3),
                    ORDERPRODUCTION: ("000000000000" + order.idordersap).slice(-12),
                } : null,
                lotConsumeds[9] && idlot2 && (lotInteface >= 9) ? {
                    MATERIALCONSUMED: lotConsumeds[9].idmaterial,
                    LOTCONSUMED: lotConsumeds[9].idlot ? ("0000000000" + lotConsumeds[9].idlot).slice(-10) : ("0000000000" + order.lotconsumed2).slice(-10),
                    WEIGHTCONSUMED: (parseFloat(lotConsumeds[9].weight).toFixed(3) - 0.0005).toFixed(3),
                    ORDERPRODUCTION: ("000000000000" + order.idordersap).slice(-12),
                } : null
            ]
        }
    ];

    let hardness = await App.api.ormDbHardness({ idlot: order.idlot, description: i18n('Dureza') });
    if (hardness.data.length > 0) {
        hardness = hardness.data[0].numbervalue;
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

async function createNewLotEmpty(order, quality) {
    return new Promise(async function (resolve, reject) {
        let lot = await App.api.ormDbFind('lot', { idmaterial: order.idmaterial, new: true, idorderprod: order.idordermes.toString() });
        if (!lot.data.length) {
            let oldLotReader = localStorage.getItem('oldLotReader' + order.idordermes);
            let lotRawMaterial = await App.api.ormDbFindOne('lot', { id: oldLotReader });
            let sequence = await App.api.ormDbLotSequence();
            sequence = sequence.data[0].nextval;
            let response = await App.api.ormDbCreate('lot', {
                id: sequence,
                situation: 'P',
                idmaterial: order.idmaterial,
                idlocal: order.idequipmentscheduled,
                quality: quality,
                idrun: lotRawMaterial.data && lotRawMaterial.data.idrun ? lotRawMaterial.data.idrun : '0',
                idorderprod: order.idordermes.toString(),
                new: true
            });
            order.idlot = response.data.id;
            resolve(order);
        } else {
            order.idlot = lot.data[0].id;
            resolve(order);
        }
    });
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
            ov: ov && ov.textvalue ? ov.textvalue : '-',
            item: ovitem && ovitem.textvalue ? ovitem.textvalue : '-',
            material: orderOrLot.material,
            idlot: idLot,
            order: orderOrLot.idordersap ? orderOrLot.idordersap : '-',
            idorder: orderOrLot.idordermes,
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
        }
    }
}