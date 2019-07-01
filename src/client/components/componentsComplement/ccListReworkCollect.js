import { i18n } from "../../lib/I18n.js";
import { App } from "../../lib/App.js";
import * as util from "../../lib/Util.js";

import { WebixWindow, WebixLabel, WebixCrudDatatable, WebixCrudAddButton } from "../../lib/WebixWrapper.js";
import * as _modalCollect from "../../extra/_modalCollect.js";
import * as  screenProductionProgram from "../screenProductionProgramStart.js";

export async function create(event) {
    let iduser = localStorage.getItem('login');

    let reworkNotCollected = await App.api.ormDbFindAllReworkNotCollected(iduser);
    reworkNotCollected = reworkNotCollected.success ? reworkNotCollected.data : [];


    let reworkCollected = await App.api.ormDbFindAllReworkCollected();
    reworkCollected = reworkCollected.success ? reworkCollected.data : [];

    return [{
        header: i18n('Items for collection'),
        body: {
            view: "datatable",
            id: "dtReworkNotCollect",
            dragColumn: true,
            leftSplit: 1,
            on: {
                "onAfterColumnDrop": function () {
                    util.datatableColumsSave("dtReworkNotCollect", event);
                }
            },
            rowHeight: 50,
            fixedRowHeight: false,
            select: 'row',
            rowLineHeight: 25,
            columns: [
                { id: "idlot", header: i18n('Lot'), width: 140, css: { 'word-wrap': 'break-word' } },
                { id: "idordermes", header: i18n('Order MES'), width: 100, css: { 'word-wrap': 'break-word' } },
                { id: "idordersap", header: i18n('Order SAP'), width: 100, css: { 'word-wrap': 'break-word' } },
                { id: "datependency", header: i18n('Date'), fillspace: true, css: { 'word-wrap': 'break-word' }, format: (item) => { return moment(item).format('DD/MM/YY hh:mm:ss') } },
                { id: "material", header: i18n('Material'), fillspace: true, css: { 'word-wrap': 'break-word' } },
                { id: "pendency", header: i18n('Pendency'), width: 70, css: { 'word-wrap': 'break-word' } },
                { id: "pendencytype", header: i18n('Pendency type'), fillspace: true, css: { 'word-wrap': 'break-word' } },
                { id: "reworktype", header: i18n('Rework type'), fillspace: true, css: { 'word-wrap': 'break-word' } },
            ],
            ready: function () {
                this.adjustRowHeight("pendency");
            },
            data: reworkNotCollected,
            css: "wrap"
        }
    }, {
        header: i18n('Items collected in the last 24 hours'),
        collapsed: true,
        body: {
            view: "datatable",
            id: "dtReworkCollect",
            rowHeight: 50,
            fixedRowHeight: false,
            rowLineHeight: 25,
            columns: [
                { id: "idlot", header: i18n('Lot'), width: 140, css: { 'word-wrap': 'break-word' } },
                { id: "idordermes", header: i18n('Order MES'), width: 100, css: { 'word-wrap': 'break-word' } },
                { id: "idordersap", header: i18n('Order SAP'), width: 100, css: { 'word-wrap': 'break-word' } },
                { id: "datependency", header: i18n('Date'), fillspace: true, css: { 'word-wrap': 'break-word' }, format: (item) => { return moment(item).format('DD/MM/YY hh:mm:ss') } },
                { id: "material", header: i18n('Material'), fillspace: true, css: { 'word-wrap': 'break-word' } },
                { id: "pendency", header: i18n('Pendency'), width: 70, css: { 'word-wrap': 'break-word' } },
                { id: "pendencytype", header: i18n('Pendency type'), fillspace: true, css: { 'word-wrap': 'break-word' } },
                { id: "reworktype", header: i18n('Rework type'), fillspace: true, css: { 'word-wrap': 'break-word' } },
            ],
            ready: function () {
                this.adjustRowHeight("pendency");
            },
            data: reworkCollected,
            css: "wrap"
        }
    }]
}

export async function collect() {
    let item = $$('dtReworkNotCollect').getSelectedItem();

    if (item) {
        
        let allitems = $$('dtReworkNotCollect').serialize();
        
        let last = allitems.filter(e => e.idlot == item.idlot);

        item.last = last.length > 1 ? false : true;

        if (item.idordermes) {
            let result = await _modalCollect.showModal(item);
            if (result.success) {
                updatescreen();
            };
        }
        else {
            webix.message(i18n("You can't collect a rework without a Producition Order!"));
        }
    } else {
        webix.message(i18n('Please select any item!'));
    }
}

export async function linkOrder() {
    let item = $$('dtReworkNotCollect').getSelectedItem();
    if (item && !item.idordermes) {

        let dtOrders = new WebixCrudDatatable("dtOrders");
        dtOrders.rowHeight = 50;

        dtOrders.columns = [
            {
                id: "idordermes",
                header: [i18n("Order MES"), { content: "textFilter" }],
                sort: "string",
                width: 100
            },
            {
                id: "idordersap",
                header: [i18n("Order SAP"), { content: "textFilter" }],
                sort: "string",
                width: 100
            },
            {
                id: "material",
                header: [i18n("Material"), { content: "textFilter" }],
                sort: "string",
                fillspace: true
            },
            {
                id: "rawmaterial",
                header: [i18n("Raw Material"), { content: "textFilter" }],
                sort: "string",
                fillspace: true
            }
        ]

        let orders = await App.api.ormDbFindAllReworkOrder();
        orders = orders.data

        dtOrders.data = orders;

        let modal = new WebixWindow({
            width: 700,
            height: 600
        });
        modal.body = {
            padding: 20,
            rows: [
                new WebixLabel('select', i18n('Select an Order to associate to ') + item.reworktype + ':', { align: "left", height: 30 }),
                {
                    height: 20
                },
                dtOrders,
                {
                    height: 20
                },
                {
                    cols: [
                        {},
                        new WebixCrudAddButton('associate', i18n('Associate'), async () => {
                            let orderitem = $$('dtOrders').getSelectedItem();
                            if (orderitem) {
                                webix.confirm(i18n('Are you sure you want to associate the Order ') + orderitem.idordermes + i18n(' to ') + item.reworktype + '?', async (result) => {
                                    if (result) {
                                        let iduser = localStorage.getItem('login');
                                        let res = await App.api.ormDbAssociateOrderRework({ order: orderitem, rework: item, iduser: iduser })

                                        if (res.success) {
                                            modal.close();
                                            updatescreen();
                                        }
                                    }
                                })
                            }
                            else {
                                webix.message(i18n("Please, select an Order to associate!"))
                            }
                        }, { width: 130, height: 70 }),
                        {},
                    ]
                }
            ]
        };
        modal.modal = true;
        modal.show();
        modal.setTitle(i18n("Associate OP"));
    } else if(item && item.idordermes){
        webix.message(i18n('This rework item already has an associated order!'));
    } 
    else {
        webix.message(i18n('Please select any item!'));
    }
}

async function updatescreen() {
    let reworkNotCollected = await App.api.ormDbFindAllReworkNotCollected();
    reworkNotCollected = reworkNotCollected.success ? reworkNotCollected.data : [];

    let reworkCollected = await App.api.ormDbFindAllReworkCollected();
    reworkCollected = reworkCollected.success ? reworkCollected.data : [];

    $$('dtReworkNotCollect').clearAll();
    $$('dtReworkNotCollect').parse(reworkNotCollected, 'json');

    $$('dtReworkCollect').clearAll();
    $$('dtReworkCollect').parse(reworkCollected, 'json');
}