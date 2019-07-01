import { WebixCrudDatatable, WebixWindow, WebixCrudAddButton } from "../lib/WebixWrapper.js";
import { generateQRCode } from '../components/componentsComplement/ccQRGenerator.js';
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";

import * as modalRegisterRNC from '../extra/_modalRegisterRNC.js';
import * as _modalChoosePrinter from "../extra/_modalChoosePrinter.js";

export async function showModal(item, flag, dtMetallography, lots = null) {
    return new Promise(async function (resolve, reject) {

        let dtDetailDimensionalControlEquipmentTests = new WebixCrudDatatable("dtDetailDimensionalControlEquipmentTests");

        let local = await App.api.ormDbLotDetails({ idlot: item });
        if (local.success) {
            let rnc = {
                "idordermes": 0,
                "idlot": item
            }

            let modal = new WebixWindow({
                width: 550,
                height: 600,
                onClosed: async (modal) => {
                    modal.close();
                    if (flag === 2) {
                        await modalRegisterRNC.showModal(0, 0, rnc);
                    }
                }
            });

            modal.body = {
                view: "form",
                id: "grids",
                rows: [
                    {
                        cols: [
                            {
                                view: 'template', height: 30, template: `<strong>${i18n('Lot')}</strong>: ${local.data.idlot || ''}`
                            },
                        ]
                    },
                    {
                        cols: [
                            {
                                view: 'template', template: `<canvas id="qr" class="qr"></canvas>`
                            },
                            {
                                cols: [
                                    {
                                        rows: [
                                            {
                                                cols: [
                                                    {
                                                        view: 'template', height: 30, template: `<strong>${i18n('Client')}</strong>: ${local.data.idclient || ''}`
                                                    },
                                                    {
                                                        view: 'template', height: 30, template: `<strong>${i18n('Order')}</strong>: ${local.data.idorder || ''}`
                                                    }
                                                ]
                                            },
                                            {
                                                cols: [
                                                    {
                                                        view: 'template', height: 30, template: `<strong>${i18n('Diameter')}</strong>: ${local.data.diameter || ''}`
                                                    },
                                                    {
                                                        view: 'template', height: 30, template: `<strong>${i18n('Thickness')}</strong>: ${local.data.thickness || ''}`
                                                    }
                                                ]
                                            },
                                            {
                                                cols: [
                                                    {
                                                        view: 'template', height: 30, template: `<strong>${i18n('Length')}</strong>: ${local.data.length || ''}`
                                                    },
                                                    {
                                                        view: 'template', height: 30, template: `<strong>${i18n('Steel')}</strong>: ${local.data.steel || ''}`
                                                    }
                                                ]
                                            },
                                            {
                                                cols: [
                                                    {
                                                        view: 'template', height: 30, template: `<strong>${i18n('Pieces')}</strong>: ${local.data.valueP || ''}`
                                                    },
                                                    {
                                                        view: 'template', height: 30, template: `<strong>${i18n('Weight')}</strong>: ${local.data.valueW || ''}`
                                                    },
                                                ]
                                            },
                                            {
                                                cols: [
                                                    {
                                                        view: 'template', height: 30, template: `<strong>${i18n('Equipment')}</strong>: ${local.data.equipment || ''}`
                                                    },
                                                    {
                                                        view: 'template', height: 30, template: `<strong>${i18n('Date')}</strong>: ${moment(local.data.datetime).format("DD/MM/YYYY HH:mm") || ''}`
                                                    },
                                                ]
                                            },
                                            {
                                                cols: [
                                                    new WebixCrudAddButton('print', i18n('Print'), () => { printLabel(lots ? lots : local.data) }),
                                                    {}
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                        ]
                    },
                ]
            };

            modal.modal = true;
            modal.show();
            modal.setTitle(i18n('Ticket QR Code'));
            let qr = await generateQRCode(item);
        } else {
            webix.message(i18n('Lot not found'));
            resolve(true);
        }
    });
}

async function printLabel(orderOrLot) {
    let idprinter = await _modalChoosePrinter.showModal();
    let idLot = orderOrLot.idlot ? orderOrLot.idlot : orderOrLot.id;

    let company = await App.api.ormDbFindOne('company');
    company = company.data;

    let lot = await App.api.ormDbFindOne('lot', { id: idLot });
    lot = lot.data;

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

    let idMaterial = +lot.idmaterial;

    let cod = ("0000000000" + idLot).slice(-10) + idMaterial;
    let MatDesc = orderOrLot.description.replace(/[\\"]/g, '').substr(10);

    let idordersap = await App.api.ormDbFindOne('order', {idordermes: orderOrLot.idorder});
    idordersap = idordersap.data;

    let orderSAP = '-';
    if(idordersap){
        orderSAP = idordersap;
    }

    if (idprinter) {
        let print = {
            test: false,
            ip: idprinter.ip,
            layout: idprinter.idlayout,
            company: company.name,
            finishing: lotcharacteristicfinishing,
            barCodeAndQRCode: cod,
            client: orderOrLot.idclient ? orderOrLot.idclient : '-',
            idmaterial: +lot.idmaterial,
            netWeight: orderOrLot.valueW ? Math.trunc(orderOrLot.valueW) : Math.trunc(orderOrLot.weight),
            grossWeight: orderOrLot.valueW ? Math.trunc(orderOrLot.valueW) : Math.trunc(orderOrLot.weight),
            un: lotcharacteristic && lotcharacteristic.textvalue ? lotcharacteristic.textvalue : '-',
            material: MatDesc,
            idlot: idLot,
            idorder: orderOrLot.idorder,
            order: orderSAP ? orderSAP : null,
            ov: ov && ov.textvalue ? ov.textvalue : '-',
            item: ovitem && ovitem.textvalue ? ovitem.textvalue : '-',
            qtdPieces: orderOrLot.pieces,
            length: orderOrLot.length ? orderOrLot.length : 0,
            total: orderOrLot.length ? Number(orderOrLot.pieces) * Number(orderOrLot.length) : 0,
            date: moment().format('DD/MM/YYYY HH:mm'),
            iduser: localStorage.getItem('login'),
        };

        await App.api.ormDbPrint(print);
        return true;
    } else {
        return false;
    }

}