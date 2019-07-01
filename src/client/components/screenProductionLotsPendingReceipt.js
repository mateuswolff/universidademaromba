import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixBuildReponsiveTopMenu, WebixCrudDatatable, WebixInputSelect } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

import * as  _modalQRCode from "../extra/_modalQRCode.js";
import * as  _modalReadQR from "../extra/_modalReadQR.js";
import * as  _modalRegisterRNC from "../extra/_modalRegisterRNC.js";

export async function showScreen(event) {

    //let dtLotsPendingReceipt = new WebixCrudDatatable();
    let dtLotsPendingReceipt = {
        view: "datatable",
        id: "dtLotsPendingReceipt",
        dragColumn: true,
        css: "custom-datatable grid-receipt",
        rowHeight: 60,
        resizeColumn: true,
        on: {
            "onAfterColumnDrop": function () {
                util.datatableColumsSave("dtLotsPendingReceipt", event);
            }
        },
        columns: [
            { id: "status", header: "", width: 35, css: "center", template: "{common.checkbox()}" },
            { id: "id", header: [i18n("Lot"), { content: "textFilter" }], sort: "string", width: 75 },
            { id: "local", header: [i18n("Local"), { content: "textFilter" }], sort: "string", width: 150 },
            { id: "namematerial", header: [i18n("Material"), { content: "textFilter" }], sort: "string", width: 250 },
            {
                id: "dtcreated",
                header: [i18n("Date"), { content: "dateFilter" }],
                format: (value) => { return value ? moment(value).format("DD/MM/YYYY") : '-' },
                width: 100
            },
        ],
    }

    //Html template com número de lotes pendentes
    let sumLots = 0
    let totalLots = { id: 'totalLots', height: 25, view: 'template', css: "font-16", template: `<strong>${i18n('Number of Pending Lots') + ': ' + sumLots}</strong>` }

    //Html template com número de lotes selecionados
    let sumSelectedLots = 0
    let totalSelectedLots = { id: 'totalSelectedLots', height: 25, view: 'template', css: "pull-right font-16", template: `<strong>${i18n('Number of Selected Lots') + ': ' + sumSelectedLots}</strong>` }

    let dtReceiptBasket = {
        view: "datatable",
        id: "dtReceiptBasket",
        css: "custom-datatable grid-receipt",
        dragColumn: true,
        rowHeight: 60,
        editable: true,
        checkboxRefresh: true,
        resizeColumn: true,
        on: {
            onCheck: async function (row, column, state) {

                if(state == 0 && column == 'detet'){
                    let datatable = $$('dtReceiptBasket').serialize();
                    let lot = datatable.find( x => x.id == row);
    
                    let item = {
                        idlot: row,
                        material: lot.idmaterial
                    }
    
                    await _modalRegisterRNC.showModal(null, 0, item, 'production');
                }
            }
        },
        columns: [
            { id: "status", header: "", width: 35, css: "center", template: "{common.checkbox()}" },
            { id: "id", header: [i18n("Lot"), { content: "textFilter" }], sort: "string", width: 75 },
            { id: "namematerial", header: [i18n("Material"), { content: "textFilter" }], sort: "string", width: 250 },
            {
                id: "dtcreated",
                header: [i18n("Date"), { content: "dateFilter" }],
                format: (value) => { return value ? moment(value).format("DD/MM/YYYY") : '-' },
                fillspace: true,
                minWidth: 90
            },
            {
                id: "detet", header: i18n("Detet"), sort: "string", width: 100, template: custom_checkbox,

            },
        ],

    }

    let options = [i18n('approved'), i18n('disapproved')];

    let allLots = await App.api.ormDbFindLotsPending();
    allLots = allLots.data

    allLots.map(elem => {
        if (elem.materialgroup == "BO" && (elem.steel == "316" || elem.steel == "316L")) {
            elem.detet = 1 //Para setar o checkbox como Aprovado por padrão
        }
        else {
            elem.detet = 2 //Identificador auxiliar para quando o lote não precisar de Detet
        }
    })

    let allLocals = await App.api.ormDbFind('local');
    let local;

    let locals = new WebixInputSelect('locals', i18n('Locals'), allLocals.data, {
        template: (obj) => {
            return obj.description;
        },
        onChange: (obj) => {
            local = obj;
        }
    });

    dtLotsPendingReceipt.data = allLots;

    let lotRead = {
        view: "text",
        label: i18n("Lot Read"),
        name: "txtreadlot",
        css: "received",
        id: "txtreadlot",
        labelPosition: "top",
        on: {
            //onBlur: saveLotRead,
            onEnter: saveLotRead
        },
    };

    let lotReadbutton = {
        view: "button", label: i18n("Read"), css: "received", with: 30, click: async () => {
            let digitReadRawMateroal = $$('txtreadlot').getValue();

            
            if (digitReadRawMateroal) {
                saveLotRead();
            } else {
                saveLotRead();
            };
        }
    };

    let shift = await util.findMyShift();

    const received = {
        view: "button",
        id: "received",
        css: "received",
        width: 300,
        click: async () => {

            let item = $$('dtReceiptBasket').serialize();

            if (local === undefined) {
                webix.message(i18n('To move a Coil, you have to select some local!'));
            }
            else if (item.length == 0) {
                webix.message(i18n('Select some lots to move!'));
            }
            else {

                item.map((elem) => {
                    elem.idlot = elem.id;
                    elem.iduser = localStorage.getItem('login');
                    elem.idlocal = local;
                    elem.idshift = shift
                });

                let resultCheck = await App.api.ormDbSaveUpdatePoolReceived(item);
                allLots = await App.api.ormDbFindLotsPending();

                if (resultCheck.success) {

                    webix.message(i18n('Save successfully!'));

                    await showScreen();
                } else {
                    webix.message(i18n('An error has occurred'));
                }

            }
        },
        value: i18n("Received"),
        align: "left",
    }

    let btnDoubleArrowRight = { view: "button", css: "font-button", type: "icon", icon: "fas fa-angle-double-right", height: 40, width: 50, click: doubleArrowRight }
    let btnArrowRight = { view: "button", css: "font-button", type: "icon", icon: "fas fa-angle-right", height: 40, width: 50, click: arrowRight }
    let btnArrowLeft = { view: "button", css: "font-button", type: "icon", icon: "fas fa-angle-left", height: 40, width: 50, click: arrowLeft }
    let btnDoubleArrowLeft = { view: "button", css: "font-button", type: "icon", icon: "fas fa-angle-double-left", height: 40, width: 50, click: doubleArrowLeft }

    let grids = {
        view: 'form',
        id: "idLotsPendingReceipt",
        css: "font-button",
        rows: [
            {
                cols: [
                    totalLots,
                    totalSelectedLots,
                ]
            },
            {
                cols: [
                    {
                        rows: [
                            dtLotsPendingReceipt,
                            {
                                cols: [
                                    lotRead,
                                    lotReadbutton
                                ]
                            }
                        ]
                    },
                    {
                        rows: [
                            {},
                            btnDoubleArrowRight,
                            btnArrowRight,
                            btnArrowLeft,
                            btnDoubleArrowLeft,
                            {}
                        ]
                    },
                    {
                        rows: [
                            dtReceiptBasket,
                            {
                                cols: [
                                    locals,
                                    received
                                ]
                            }
                        ]
                    },
                ]
            }
        ]
    }

    let menu = createSimpleCrudMenu(i18n('Lots Pending Receipt'), dtLotsPendingReceipt);
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);

    countGrids();
    $$('txtreadlot').focus();
}

async function doubleArrowRight() {
    let itens = $$('dtLotsPendingReceipt').serialize();

    itens.map(elem => {
        elem.status = 0;
    })
    $$('dtReceiptBasket').parse(itens);
    $$('dtLotsPendingReceipt').clearAll();

    countGrids()
}

async function arrowRight() {
    let itens = $$('dtLotsPendingReceipt').serialize();
    let rows = itens.filter(x => x.status == 1);

    rows.forEach((elem) => {
        elem.status = 0;
        $$('dtLotsPendingReceipt').remove(elem.id)
    })

    $$('dtReceiptBasket').parse(rows);

    countGrids()
}

async function arrowLeft() {
    let itens = $$('dtReceiptBasket').serialize();
    let rows = itens.filter(x => x.status == 1);

    rows.forEach((elem) => {
        elem.status = 0;
        $$('dtReceiptBasket').remove(elem.id)
    })

    $$('dtLotsPendingReceipt').parse(rows);

    countGrids()
}

async function doubleArrowLeft() {
    let itens = $$('dtReceiptBasket').serialize();

    itens.map(elem => {
        elem.status = 0;
    })
    $$('dtLotsPendingReceipt').parse(itens);
    $$('dtReceiptBasket').clearAll();

    countGrids()
}

async function countGrids() {
    $$('totalLots').setHTML(`<strong>${i18n('Number of Pending Lots') + ': ' + $$('dtLotsPendingReceipt').count()}</strong>`)
    $$('totalSelectedLots').setHTML(`<strong>${i18n('Number of Selected Lots') + ': ' + $$('dtReceiptBasket').count()}</strong>`)
}

export async function saveLotRead() {

    let idlot = $$('txtreadlot').getValue();
    idlot = idlot.trim();
    $$('txtreadlot').setValue()

    if (idlot && idlot != '') {

        if (idlot.toString().length > 7)
            idlot = idlot.toString().slice(0, 10);

        idlot = Number(idlot)
    }
    else {
        idlot = await _modalReadQR.showModal();
    }

    let itens = $$('dtLotsPendingReceipt').serialize();

    let rowLot = itens.findIndex(x => x.id == idlot);
    let rowLot2 = itens.find(x => x.id == idlot);

    if (rowLot != -1) {

        rowLot2.status = 0;

        $$('dtReceiptBasket').parse(rowLot2)
        $$('dtLotsPendingReceipt').remove(rowLot2.id)

        //itens[rowLot].status = 1;

        $$('txtreadlot').setValue('')
        webix.message(i18n('The lot read was @n').replace('@n', idlot));
        $$('txtreadlot').focus();

    }
    else {
        webix.message(i18n('The lot @n was not found!').replace('@n', idlot));
        $$('txtreadlot').setValue('');
    }
}

function createSimpleCrudMenu(title) {

    let menu = WebixBuildReponsiveTopMenu(title, []);

    return menu;
}

function custom_checkbox(obj, common, value) {
    if (value == 2)
        return "<div class='blocked-margin'>&nbsp</div>";
    else if (value == 0)
        return "<div class='webix_table_checkbox notchecked testdetet'>" + i18n('DISAPPROVED') + "</div>";
    else
        return "<div class='webix_table_checkbox checked testdetet'>" + i18n('APPROVED') + "</div>";
};
