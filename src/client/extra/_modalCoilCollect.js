import { WebixWindow, WebixCrudAddButton } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";

import * as screenProductionCoilCollect from '../components/screenProductionCoilCollect.js';
import * as _modalRegisterRNC from './_modalRegisterRNC.js';
import * as _modalChoosePrinter from './_modalChoosePrinter.js';
import * as util from "../lib/Util.js";

export async function showModal(cuttingPlan, equipment) {
    cuttingPlan = await App.api.ormDbFindAllCoilCutPlanById({ id: cuttingPlan });
    cuttingPlan = cuttingPlan.data[0];


    return new Promise(async function (resolve, reject) {

        let ordersCutting = await reloadScreen(cuttingPlan, equipment);

        let modal = new WebixWindow({
            width: 940,
        });

        const padding = ({
            view: "label",
            label: i18n(""),
        });

        modal.body = {
            view: "form",
            id: "mdCollectByItem",
            rows: [
                {
                    view: "datatable",
                    id: 'dtOrderCuttingPlan',
                    columns: [
                        { id: "package", header: i18n('Package'), width: 80 },
                        { id: "idordermes", header: i18n('ID Order MES'), width: 80 },
                        { id: "description", header: i18n('Material'), fillspace: true },
                        { id: "width", header: i18n('Width') },
                        { id: "quantity", header: i18n('Quantity') },
                    ],
                    // autoheight: true,
                    maxHeight: 400,
                    rowHeight: 60,
                    select: 'row',
                    data: ordersCutting
                },
                {
                    cols: [
                        new WebixCrudAddButton('requestMoving', i18n('Request moving'), async () => {
                            let moverequest = {
                                idequipment: equipment,
                                idlot: cuttingPlan.idlot,
                                idlocal: equipment,
                                situationmovement: 'P',
                                idtransportresource: null,
                                momentdate: new Date(),
                                idmovimentuser: null,
                                idexchangelot: null,
                                exchangedate: null,
                                idexchangeuser: null,
                                iduser: localStorage.getItem('login')
                            };

                            let item = await App.api.ormDbCreate('moverequest', moverequest);
                            if (item.success) {
                                $$('btnRequestMoving').disable();
                                webix.message(i18n('Requested Movement!'))
                                screenProductionCoilCollect.loadTableCoilCollection(equipment);
                            }

                        }, {
                                width: 100,
                                height: 90,
                                disabled: cuttingPlan.situation != 'NOT_REALIZED'
                            }),

                        new WebixCrudAddButton('package', i18n('Close package'), async () => {
                            let item = $$('dtOrderCuttingPlan').getSelectedItem();
                            let dtable = $$('dtOrderCuttingPlan').serialize();
                            let last = dtable.length == 1 ? true : false

                            if (item) {

                                let allocated = await App.api.ormDbFind('allocation', { idorder: item.idordermes });
                                allocated = allocated.data[0];

                                let weight = allocated.weight.toFixed(3);

                                var w = webix.ui({
                                    view: "window",
                                    height: 200,
                                    width: 400,
                                    modal: true,
                                    position: "center",
                                    css: "font-18",
                                    head: i18n("Are you sure you want to create a Lot?"),
                                    body: {
                                        view: "form",
                                        id: "formweight",
                                        elements: [
                                            {
                                                rows: [
                                                    { view: "text", name: "lotweight", label: i18n('Lot weight'), labelWidth: 150, value: weight, attributes: { type: "number" } },
                                                    //padding,
                                                    {
                                                        view: "checkbox",
                                                        id: "checkPendency",
                                                        label: i18n("Generate RNC"),
                                                        labelWidth: 150,
                                                    },
                                                    {
                                                        cols: [
                                                            {
                                                                view: "button", label: i18n("No! Thank you"), click: function () {
                                                                    w.close();
                                                                }
                                                            },
                                                            {
                                                                view: "button", label: i18n("Yes! Create"), click: async function () {
                                                                    weight = $$('formweight').elements.lotweight.getValue()

                                                                    let quantityLotGenerated = await App.api.ormDbFind('cuttingplanhistory', { idcuttingplan: cuttingPlan.idcoilcuttingplan, idlotconsumed: cuttingPlan.idlot, idmaterial: item.idmaterial, quantity: item.itemQuantity });
                                                                    quantityLotGenerated = quantityLotGenerated.success && quantityLotGenerated.data.length ? quantityLotGenerated.data.length : 1;
                                                                    if (Number((item.itemQuantity.split("/"))[0]) > Number((item.itemQuantity.split("/"))[1])) {
                                                                        webix.message(i18n('All packages related to this item have already been generated.'));
                                                                    } else {

                                                                        let result = await App.api.ormDbCreateLotCoil({
                                                                            idmaterial: item.idmaterial,
                                                                            idequipmentscheduled: equipment,
                                                                            quantity: 1,
                                                                            lotweight: cuttingPlan.weight,
                                                                            weight: weight,
                                                                            idrun: cuttingPlan.idrun,
                                                                            quality: cuttingPlan.quality,
                                                                            usercreatelot: localStorage.getItem('login'),
                                                                            idcuttingplan: cuttingPlan.idcoilcuttingplan,
                                                                            idshift: await util.findMyShift(),
                                                                            idlotconsumed: cuttingPlan.idlot,
                                                                            idrawmaterial: item.idrawmaterial,
                                                                            idordermes: item.idordermes,
                                                                            idordersap: item.idordersap,
                                                                            saleorder: item.saleorder,
                                                                            width: item.width,
                                                                            last: last,
                                                                            quantity: (item.itemQuantity ? Number((item.itemQuantity.split("/"))[0]) : 1) + '/' + item.fullQuantity,
                                                                            rnc: $$('checkPendency').getValue() == 1 ? true : false
                                                                        });


                                                                        if (result.success) {

                                                                            item.idlot = result.data.idlot;

                                                                            if ($$('checkPendency').getValue() == 1) {
                                                                                let rnc = await _modalRegisterRNC.showModal(null, null, item, 'production');
                                                                            }

                                                                            item.idequipment = equipment;
                                                                            item.weight = parseFloat(weight).toFixed(2);
                                                                            item.result = result.data;
                                                                            item.steel = item.description.split(" ")[1];
                                                                            item.idcoilcuttingplan = cuttingPlan.idcoilcuttingplan
                                                                            webix.message(i18n("Lot Generated!"));
                                                                            printLabel(item);
                                                                            let itens = await reloadScreen(cuttingPlan, equipment);
                                                                            if (!itens.length) {
                                                                                $$('btnFinish').enable();
                                                                                $$('btnPackage').disable();
                                                                            }

                                                                            $$('dtOrderCuttingPlan').clearAll();
                                                                            $$('dtOrderCuttingPlan').parse(itens);

                                                                            reloadMeasurements(cuttingPlan.idlot)

                                                                            w.close();
                                                                        }
                                                                        else {
                                                                            webix.message(result.data);
                                                                        }

                                                                        w.close();
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                });

                                w.show();

                            } else {
                                webix.message(i18n('Please select an item'));
                            }

                        }, {
                                width: 100,
                                height: 90,
                                disabled: cuttingPlan.situation != "IN_FRONT_OF" ? true : false
                            }),
                        new WebixCrudAddButton('finish', i18n('Finish'), async () => {
                            let iduser = localStorage.getItem('login');
                            let result = await App.api.ormDbUpdate({ id: cuttingPlan.idcoilcuttingplan }, 'coilcuttingplan', { situation: 'R', iduser: iduser });
                            if (result.success) {
                                webix.message(i18n('Plan collected successfully'));
                                await App.api.ormDbUpdate({
                                    idequipment: equipment,
                                    stopdate: null
                                }, 'orderprodhistory',
                                    {
                                        stopdate: new Date(),
                                        iduser: iduser
                                    })

                                localStorage.setItem('selectedEquipmentCoil', equipment);
                                modal.close();
                                window.location.reload()

                            } else {
                                webix.message('Error while collecting plan');
                                console.error(result);
                            }
                        }, {
                                width: 100,
                                height: 90,
                                disabled: ordersCutting.length
                            }),
                        //{},
                        {
                            view: "fieldset",
                            label: i18n("Measurements"),
                            height: 80,
                            borderless: true,
                            body: {
                                rows: [
                                    {
                                        cols: [
                                            {
                                                rows: [
                                                    { view: "text", name: "realweight", id: "realweight", label: i18n('Real weight'), labelWidth: 90, attributes: { type: "number" } },
                                                    {
                                                        cols: [
                                                            { view: "text", name: "begingthickness", id: "begingthickness", label: i18n('Begin Thickenss'), labelWidth: 90, attributes: { type: "number" } },
                                                            { width: 20 },
                                                            { view: "text", name: "middlethickness", id: "middlethickness", label: i18n('Middle'), labelWidth: 40, attributes: { type: "number" } },
                                                            { width: 20 },
                                                            { view: "text", name: "endthickness", id: "endthickness", label: i18n('End '), labelWidth: 40, attributes: { type: "number" } },
                                                        ]
                                                    },
                                                    { view: "text", name: "reallength", id: "reallength", label: i18n('Real length'), labelWidth: 90, attributes: { type: "number" } },
                                                ]
                                            },
                                            {
                                                width: 10
                                            },
                                            new WebixCrudAddButton('save', i18n('Save'), async () => {

                                                let realweight = $$('realweight').getValue();
                                                let begingthickness = $$('begingthickness').getValue();
                                                let middlethickness = $$('middlethickness').getValue();
                                                let endthickness = $$('endthickness').getValue();
                                                let reallength = $$('reallength').getValue();

                                                let saved = await App.api.ormDbUpdate({ id: cuttingPlan.idlot }, 'lot', {
                                                    realweight: realweight != '' ? realweight : null,
                                                    thicknessbegin: begingthickness != '' ? begingthickness : null,
                                                    thicknessmiddle: middlethickness != '' ? middlethickness : null,
                                                    thicknessend: endthickness != '' ? endthickness : null,
                                                    reallength: reallength != '' ? reallength : null
                                                })

                                                if (saved.success)
                                                    webix.message(i18n('Saved Successfully!'))
                                                else
                                                    webix.message(i18n('There is an error! Please contact the support!'))


                                            }, {
                                                    width: 80,
                                                })
                                        ]
                                    }
                                ]
                            }
                        }
                    ]
                }]
        };

        modal.modal = true;
        modal.show();
        modal.setTitle(i18n('Coil Collect'));

        await reloadMeasurements(cuttingPlan.idlot);

    });
}

async function reloadMeasurements(idlot) {

    let lot = await App.api.ormDbFind('lot', { id: idlot });
    lot = lot.data[0];

    $$('realweight').setValue(lot.realweight ? lot.realweight : '')
    $$('begingthickness').setValue(lot.thicknessbegin ? lot.thicknessbegin : '')
    $$('middlethickness').setValue(lot.thicknessmiddle ? lot.thicknessmiddle : '')
    $$('endthickness').setValue(lot.thicknessend ? lot.thicknessend : '')
    $$('reallength').setValue(lot.reallength ? lot.reallength : '')

}

async function reloadScreen(cuttingPlan, equipment) {

    let ordersCutting = await App.api.ormDbFindCoilCutPlan({ idcuttingplan: cuttingPlan.idcoilcuttingplan });

    ordersCutting = ordersCutting.success ? ordersCutting.data : [];
    ordersCutting = await prepareMatrix(ordersCutting);
    const ordersCuttingNative = [...ordersCutting];

    for (let i = 0; i < ordersCuttingNative.length; i++) {
        let obj = ordersCuttingNative[i];
        let quantityLotGenerated = await App.api.ormDbFind('cuttingplanhistory', { idcuttingplan: cuttingPlan.idcoilcuttingplan, idlotconsumed: cuttingPlan.idlot, idmaterial: obj.idmaterial, quantity: obj.itemQuantity });
        quantityLotGenerated = quantityLotGenerated.success ? quantityLotGenerated.data.length : 0;
        if (quantityLotGenerated >= 1) {
            ordersCutting = ordersCutting.filter((item) => {
                if (item.idmaterial == obj.idmaterial && item.itemQuantity == obj.itemQuantity) {
                    return false;
                } else {
                    return true;
                }
            });
            if (!ordersCutting.length) {
                ordersCutting = [];
                break;
            }
        }
    }

    let ordersAllCutting = await App.api.ormDbFindOrderAllocationCoilCutPlan({ idlot: cuttingPlan.idlot, idccp: cuttingPlan.idcoilcuttingplan });
    ordersAllCutting = ordersAllCutting.data;

    ordersCutting = ordersCutting.map((item, index) => {
        item.package = index + 1;
        let index2 = ordersAllCutting.findIndex(x => x.idmaterial == item.idmaterial && x.orderstatus != 'FINISHED')

        if (index2 != -1) {
            item.idordermes = ordersAllCutting[index2].idordermes;
            item.idordersap = ordersAllCutting[index2].idordersap;
            item.saleorder = ordersAllCutting[index2].saleorder;
            item.idrawmaterial = ordersAllCutting[index2].idrawmaterial;
            ordersAllCutting.splice(index2, 1)
        }

        return item;
    });

    return ordersCutting;
}


function prepareMatrix(array) {
    let arr = [];
    for (let i = 0; i < array.length; i++) {
        let element = array[i];
        let newArr = [...Array(element.quantity)].map((_, i) => {
            return {
                description: element.description,
                width: element.width,
                quantity: 1,
                idmaterial: element.idmaterial,
                fullQuantity: element.quantity,
                itemQuantity: i + 1 + '/' + element.quantity
            }
        });
        arr = arr.concat(newArr);
    }
    return arr;
}

async function printLabel(item) {

    let company = await App.api.ormDbFindOne('company');
    company = company.data;

    let mat = Number(item.idmaterial)
    let cod = ("0000000000" + item.result.idlot).slice(-10) + mat.toString();

    let lotcharacteristic = await App.api.ormDbFindOne('lotcharacteristic', { idlot: item.result.idlot, name: 'CG_CODIGO_ORIGEM' });
    lotcharacteristic = lotcharacteristic.data;

    let lotcharacteristicfinishing = await App.api.ormDbFindOne('lotcharacteristic', { idlot: item.result.idlot, name: 'CG_DEPOSITO_DESTINO' });
    lotcharacteristicfinishing = lotcharacteristicfinishing.data ? lotcharacteristicfinishing.data.textvalue : null;

    if (lotcharacteristicfinishing != 'P1' && lotcharacteristicfinishing != 'P2' && lotcharacteristicfinishing != 'P3') {
        lotcharacteristicfinishing = '';
    }

    let ov = await App.api.ormDbFindOne('lotcharacteristic', { idlot: item.result.idlot, name: 'CG_PEDIDO' });
    ov = ov.data;

    let ovitem = await App.api.ormDbFindOne('lotcharacteristic', { idlot: item.result.idlot, name: 'CG_ITEM' });
    ovitem = ovitem.data;

    let printer = await App.api.ormDbEquipmentPrinter({ idequipment: item.idequipment });
    if (printer.data.length && printer.data[0].ip) {
        let print = {
            test: false,
            ip: printer.data[0].ip,
            layout: printer.data[0].idlayout,
            company: company.center + ' - ' + company.name,
            finishing: lotcharacteristicfinishing,
            barCodeAndQRCode: cod,
            client: item.result.idclient ? item.result.idclient : '-',
            idmaterial: +item.idMaterial,
            netWeight: item.weight,
            grossWeight: item.weight,
            un: lotcharacteristic && lotcharacteristic.textvalue ? lotcharacteristic.textvalue : '-',
            material: item.description ? item.description : '-',
            idlot: item.result.idlot,
            idorder: item.idordermes,
            order: item.idordersap ? item.idordersap: '-',
            ov: ov && ov.textvalue ? ov.textvalue : '-',
            item: ovitem && ovitem.textvalue ? ovitem.textvalue : '-',
            qtdPieces: 1,
            length: item.lengthm ? item.lengthm : 0,
            total: 0,
            date: moment().format('DD/MM/YYYY HH:mm'),
            iduser: localStorage.getItem('login'),
        }


        await App.api.ormDbPrint(print);
        //Para Ribeirão é necessário imprimir duas etiquetas
        await App.api.ormDbPrint(print);

        return true;
    } else {
        let idprinter = await _modalChoosePrinter.showModal();
        let print = {
            test: false,
            ip: idprinter.ip,
            layout: idprinter.idlayout,
            company: company.center + ' - ' + company.name,
            finishing: lotcharacteristicfinishing,
            barCodeAndQRCode: cod,
            client: item.result.idclient ? item.result.idclient : '-',
            idmaterial: +item.idMaterial,
            netWeight: item.weight,
            grossWeight: item.weight,
            un: lotcharacteristic && lotcharacteristic.textvalue ? lotcharacteristic.textvalue : '-',
            material: item.material ? item.material : '-',
            idlot: item.result.idlot,
            idorder: item.idordermes,
            order: item.idordersap,
            ov: ov && ov.textvalue ? ov.textvalue : '-',
            item: ovitem.saleorderitem ? ovitem.saleorderitem : '-',
            qtdPieces: 1,
            length: item.lengthm ? item.lengthm : 0,
            total: 0,
            date: moment().format('DD/MM/YYYY HH:mm'),
            iduser: localStorage.getItem('login'),

        }
        await App.api.ormDbPrint(print);
        return true;
    }
}
