import { WebixWindow, WebixInputNumber, WebixInputText, WebixCrudAddButton } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";
import * as util from "../lib/Util.js";

export async function showModal(reworkresult) {
    return new Promise(async function (resolve, reject) {

        let reworkResults = await App.api.ormDbFindAllReworkItemByKey({ idlot: reworkresult.idlot, idpendency: reworkresult.pendency, idreworktype: reworkresult.idreworktype });
        reworkResults = reworkResults.success ? reworkResults.data : [];

        let modal = new WebixWindow({
            height: 600,
        });

        modal.body = {
            view: "form",
            id: "mdCollectByItem",
            rows: reworkResults.map((item) => {
                if (item.typevalue == 'HOUR') {
                    return {
                        label: item.description,
                        id: 'collect_' + item.idreworkitem,
                        name: 'collect_' + item.idreworkitem,
                        view: "datepicker",
                        type: "time",
                        stringResult: true
                    }
                } else if (item.typevalue == 'NUMBER') {
                    return {
                        view: "text",
                        id: 'collect_' + item.idreworkitem,
                        name: 'collect_' + item.idreworkitem,
                        attributes: { type: "number" },
                        label: item.description
                    }
                } else if (item.typevalue == 'TEXT') {
                    return {
                        view: "text",
                        id: 'collect_' + item.idreworkitem,
                        name: 'collect_' + item.idreworkitem,
                        label: item.description
                    }
                }
            })
        };

        modal.body.rows.push({ height: 15 });
        modal.body.rows.push({
            cols: [{}, {
                view: "button",
                id: "my_button",
                value: i18n('Save'),
                width: 100,
                height: 80,
                click: async () => {
                    let data = $$('mdCollectByItem').getValues();
                    let save = [];
                    Object.keys(data).forEach((key, index) => {
                        save.push({
                            description: "Início",
                            hourvalue: reworkResults[index].typevalue == "HOUR" ? data[key] : null,
                            idlot: reworkResults[index].idlot,
                            idpendency: reworkResults[index].idpendency,
                            idreworkitem: Number(key.replace(/collect_/g, '')),
                            idreworktype: reworkResults[index].idreworktype,
                            numbervalue: reworkResults[index].typevalue == "NUMBER" ? data[key] : null,
                            textvalue: reworkResults[index].typevalue == "TEXT" ? data[key] : null,
                        });
                    });

                    let result = await App.api.ormDbUpdateCollect({ collects: save });
                    if (result.success) {

                        if (reworkresult.last) {

                            await new Promise(async function (resolve, reject) {

                                let modalN = new WebixWindow({
                                    width: 400,
                                    height: 300
                                });

                                modalN.body = {
                                    padding: 20,
                                    rows: [
                                        new WebixInputNumber('pieces', i18n('Number of pieces'), {
                                            width: 300,
                                            onBlur: async () => {
                                                let weight = $$('txtPieces').getValue();
                                                let value = await util.calcWeightParts(reworkresult.idlot, "weight", weight);
                                                $$('txtWeight').setValue(Number(value).toFixed(3))
                                            }
                                        }),
                                        new WebixInputNumber('weight', i18n('Weight'), {
                                            disabled: true
                                        }),
                                        {
                                            height: 20
                                        },
                                        //new WebixInputNumber('lengtt', i18n('Length of pieces')),
                                        {
                                            cols: [
                                                {},
                                                new WebixCrudAddButton('ok', i18n('OK'), async () => {

                                                    reworkresult.newWeight = $$('txtWeight').getValue()
                                                    reworkresult.newPieces = $$('txtPieces').getValue()
                                                    reworkresult.iduser = localStorage.getItem('login');
                                                    reworkresult.idshift = await util.findMyShift();

                                                    let lotgenerated = await App.api.ormDbGenerateLotRework(reworkresult);
                                                    if (lotgenerated.data.last) {

                                                        await webix.confirm(i18n('There is no more associated lot. Do you want to finish the Rework Order ') + reworkresult.idordermes + '?', async (result) => {
                                                            if (result) {
                                                                await finishOrder(reworkresult)
                                                                resolve('finished')
                                                                modalN.close();
                                                            }
                                                            else {
                                                                modalN.close();
                                                                resolve('finished')
                                                            }
                                                        },
                                                        )
                                                    }
                                                    else {
                                                        modalN.close();
                                                        resolve('finished')
                                                    }
                                                }, { height: 50, width: 120 }),
                                                {}
                                            ],
                                        },
                                    ]
                                };
                                modalN.modal = true;
                                modalN.show();
                                modalN.setTitle(i18n("New Lot data"));


                            });

                        }

                        webix.message(i18n('Collect successfully.'));
                        modal.close();
                        resolve(result);
                    } else {
                        webix.message(i18n('An error occurred while performing the collection.'));
                        reject();
                    }
                }
            }, {}]
        });

        modal.modal = true;
        modal.show();
        modal.setTitle(i18n('Collect rework'));
    });
}


async function finishOrder(order) {

    let lotgeneratedweight = await App.api.getWeightConsumed(order.idordermes);
    
    let idmaterialTemp = null;
    let idlotTemp = null;

    let produced = [];
    let scrapp = [];

    if (lotgeneratedweight.length == 0) {
        produced = null

        scrapp = [
            {
                MATERIALCONSUMED: order.idmaterial,
                LOTCONSUMED: ("00000000000000" + order.idlot).slice(-10),
                END: "X"
            }
        ]


    }
    else {
        produced = [
            {
                LOTCONSUMED: lotgeneratedweight.map(elem => {
    
                    idmaterialTemp = elem.idmaterial;
                    idlotTemp = elem.lotconsumed ? ("00000000000000" + elem.lotconsumed).slice(-10) : null;
    
                    return {
                        WEIGHTCONSUMED: (elem.sum.toFixed(3) - 0.0005).toFixed(3),
                        ORDERPRODUCTION: elem.idordersap ? ("000000000000" + elem.idordersap).slice(-12) : null,
                        MATERIALCONSUMED: elem.idmaterial,
                        LOTCONSUMED: ("00000000000000" + elem.lotconsumed).slice(-10)
                    }
                })
            }
        ]

        scrapp = [
            {
                MATERIALCONSUMED: idmaterialTemp,
                LOTCONSUMED: idlotTemp,
                END: "X"
            }
        ]
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
        scrapp: scrapp,
        produced: produced
    });

    interfaceSave.idordermes = order.idordermes;
    interfaceSave.idordersap = order.idordersap ? order.idordersap : null

    await App.api.ormDbCreate('interface', interfaceSave);
    await App.api.ormDbUpdate({ idordermes: order.idordermes }, 'order', { orderstatus: "FINISHED" });

}