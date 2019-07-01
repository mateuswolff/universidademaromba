import { i18n } from "../../lib/I18n.js";
import { WebixWindow } from "../../lib/WebixWrapper.js";
import { App } from "../../lib/App.js";
import * as util from "../../lib/Util.js";

export async function create(order, hiddenOnTubes = true) {

    let lotConsumeds = await App.api.ormDbLotConsumedPerLotGenerate({ idorder: order.idordermes });
    if (lotConsumeds.data.length > 0)
        localStorage.setItem('oldLotReader' + order.idordermes, lotConsumeds.data[0].idlot);

    let orderSecondary = null;
    let orderSecondaryMaterial = null;
    if (!hiddenOnTubes) {
        orderSecondary = await App.api.ormDbFindOne('order', { idorderplanned: order.idordermes });
        orderSecondary = orderSecondary.data;
        if(orderSecondary) {
            orderSecondaryMaterial = await App.api.ormDbFindOne('material', { id: orderSecondary.idmaterial });
            orderSecondaryMaterial = orderSecondaryMaterial.data;
        }
    }

    let norm = await App.api.ormDbGetNormByMaterial({idmaterial: order.idmaterial})
    norm = norm.data ? norm.data[0] : null

    let piecesExpected = await util.calcWeightParts(order.idmaterial, 'piecies', order.weight);
    //let piecesExpected2 = await util.calcWeightParts(order.idmaterial, 'piecies', order.weight);
    //let allRawLots = await App.api.ormDbRawMaterialAllocation({ rawmaterial: order.rawmaterial, idrawmaterial: order.idrawmaterial, idmaterial: order.idmaterial });
    //let piecesExpected2 = await util.calcWeightPartsTwo(order.rawmaterial, order.idrawmaterial, order.idmaterial,"partsPackages", order.expectedquantity);


    let productivitymaterial = await App.api.ormDbFindOne('productivitymaterial', { idequipment: order.idequipmentscheduled, idmaterial: order.idmaterial });
    return {
        view: "form",
        scroll: false,
        elementsConfig: { margin: 5 },
        // height: 40,
        elements: [
            {
                view: "fieldset",
                label: i18n("Information order"),
                borderless: true,
                body: {
                    rows: [
                        {
                            height: 28,
                            cols: [
                                {
                                    view: 'template', width: 250, template: `<strong>${i18n('Order Production')}:</strong> ${order.idordermes}`
                                },
                                {
                                    view: 'template', width: 250, template: `<strong>${i18n('SAP Order Production')}:</strong> ${+order.idordersap}`
                                },
                                {
                                    view: 'template', template: `<strong>${i18n('Product')}:</strong> ${order.material}`
                                },
                                {
                                    view: 'template', width: 100, template: `<strong>${i18n('Status')}:</strong> <span style="${order.urgency == 'URGENT' ? 'color: red' : 'color: green'}">${i18n(order.urgency)}</span>`
                                }
                            ]
                        },
                        {
                            cols: [
                                {
                                    view: 'template', /*width: 180,*/ template: `<strong>${i18n('Weigth')}:</strong> ${order.weight}`
                                },
                                {
                                    view: 'template', /*width: 180,*/ template: `<strong>${i18n('Pieces')}:</strong> ${piecesExpected}`
                                },
                                // {
                                //     view: 'template', template: `<strong>${i18n('Situation')}:</strong> ${i18n(order.orderstatus)}`
                                // },
                                {
                                    view: 'template', template: `<strong>${i18n('Standard Speed')}:</strong> ${productivitymaterial.data && productivitymaterial.data.productivityvalue ? productivitymaterial.data.productivityvalue : '-'}`
                                },
                                {
                                    view: 'template', template: `<strong>${i18n('Norm')}:</strong> ${norm ? norm.norm : ' - '} `
                                },
                                {
                                    view: 'template', template: `<strong>${i18n('Request Date')}:</strong> ${moment(order.requestdate).format('DD/MM/YYYY')}`
                                    
                                },
                                {
                                    view: 'button', value: i18n('Lots generated'), inputHeight: 30, width: 150,
                                    click: () => {
                                        showModal(order, orderSecondary);
                                    }
                                }
                            ]
                        },
                        {
                            hidden: hiddenOnTubes,
                            cols: [
                                {
                                    view: 'template', template: `<strong>${i18n('Secondary Order')}:</strong> ${orderSecondary && orderSecondary.idordermes ? orderSecondary.idordermes + ' - ' + orderSecondaryMaterial.description : '-'}`
                                },
                                {
                                    view: 'template', width: 200, template: `<strong>${i18n('Expected quantity')}:</strong> ${orderSecondary && orderSecondary.plannedorderquantity ? parseInt(orderSecondary.plannedorderquantity) : '-'}`
                                },
                            ]
                        }
                    ]
                }
            }
        ]
    };
}

async function showModal(order, orderSecondary) {
    let lots = await App.api.ormDbLotsGeneratedPerOrder({ idorder: order.idordermes });
    let lotsSecondary = { data: [] };

    if (orderSecondary && orderSecondary.idordermes)
        lotsSecondary = await App.api.ormDbLotsGeneratedPerOrder({ idorder: orderSecondary.idordermes });

    lots.data = lots.data.concat(lotsSecondary.data);

    let modal = new WebixWindow({
        width: 600,
        height: 400
    });
    modal.body = {
        id: "formChangeEquipment",
        padding: 20,
        rows: [{
            view: "datatable",
            scroll: true,
            columns: [
                { id: "idorder", header: i18n('Order'), fullspace: true },
                { id: "idlot", header: i18n('Lot'), fullspace: true },
                { id: "quantity", header: i18n('Quantity of parts'), fullspace: true },
                { id: "weight", header: i18n('Lot weight generated'), fullspace: true },
                { id: "lotconsumed1", header: i18n('First lot consumed'), fullspace: true },
                { id: "lotweight1", header: i18n('Weight consumed'), fullspace: true },
                { id: "lotconsumed2", header: i18n('Second lot consumed'), fullspace: true },
                { id: "lotweight2", header: i18n('Weight consumed'), fullspace: true },
            ],
            data: lots.data
        }]
    };
    modal.modal = true;
    modal.show();
    modal.setTitle(i18n("Lots generated"));
}