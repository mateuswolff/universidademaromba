import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixInputSelect, WebixDatatable, WebixInputDate, WebixCrudAddButton, WebixBuildReponsiveTopMenu, WebixInputText } from "../lib/WebixWrapper.js";
import * as util from '../lib/Util.js';

import * as _modalLotConsumedPerOrder from '../extra/_modalLotConsumedPerOrder.js';
import * as _modalLotGeneratedPerOrder from '../extra/_modalLotGeneratedPerOrder.js';
import * as _modalStopsPerOrder from '../extra/_modalStopsPerOrder.js';
import * as _modalDefectPerOrder from '../extra/_modalDefectPerOrder.js';
import * as _modalScrapPerOrder from '../extra/_modalScrapPerOrder.js';
import * as _modalRNCPerOrder from '../extra/_modalRNCPerOrder.js';
import * as _modalDetailDimensionalControlTrainingTests from '../extra/_modalDetailDimensionalControlTrainingTests.js';

export async function showScreen(params = {}) {

    /* FILTER */
    let filter = {
        startdate: params.startdate ? params.startdate : moment().subtract(30, 'd').format("YYYY/MM/DD"),
        enddate: params.enddate ? params.enddate : moment().format("YYYY/MM/DD"),
        idequipment: params.idequipment ? params.idequipment : null,
        status: params.status ? params.status : null,
        id: params.id ? params.id : null,
    };

    let allEquipment = await App.api.ormDbFind('equipment');
    allEquipment.data.sort(function (a, b) {
        if (a.description < b.description) return -1;
        if (a.description > b.description) return 1;
        return 0;
    });
    allEquipment.data.unshift({ id: "All", description: i18n('All') });

    let dtOrders = new WebixDatatable("dtOrders");

    dtOrders.columns = [
        { id: "idordermes", header: [i18n("Id"), { content: "textFilter" }], width: 70, sort: "int" },
        { id: "idordersap", header: [i18n("Id SAP"), { content: "textFilter" }], sort: "int" },
        { id: "rawmaterial", header: [i18n("Raw material"), { content: "selectFilter" }], width: 250, sort: "string" },
        { id: "material", header: [i18n("Material"), { content: "selectFilter" }], width: 250, sort: "string" },
        { id: "orderstatus", header: [i18n("Status"), { content: "selectFilter" }], sort: "string" },
        { id: "ordertype", header: [i18n("Type"), { content: "selectFilter" }], sort: "string" },
        { id: "urgency", header: [i18n("Urgency"), { content: "selectFilter" }], sort: "string" },
        { id: "idclient", header: [i18n("Client"), { content: "textFilter" }], sort: "string" },
        { id: "equipment", header: [i18n("Equipment"), { content: "selectFilter" }], sort: "string" },
        { id: "requestdate", header: [i18n("Request date"), { content: "dateFilter" }], format: webix.i18n.dateFormatStr, sort: "int" },
        { id: "quantitylotconsumed", header: [i18n("Consumeds"), { content: "numberFilter" }], width: 100, sort: "int" },
        { id: "quantitylotgenerated", header: [i18n("Generateds"), { content: "numberFilter" }], width: 80, sort: "int" },
        { id: "quantitystop", header: [i18n("Stops"), { content: "numberFilter" }], width: 80, sort: "int" },
        { id: "quantitydefect", header: [i18n("Defects"), { content: "numberFilter" }], width: 80, sort: "int" },
        { id: "quantityscrap", header: [i18n("Scraps"), { content: "numberFilter" }], width: 80, sort: "int" },
        { id: "quantityrnc", header: [i18n("RNC"), { content: "numberFilter" }], width: 80, sort: "int" },
        { id: "quantitydimensionalcontrol", header: [i18n("Dimensional control"), { content: "numberFilter" }], width: 80, sort: "int" },
        { id: "resourceused", header: [i18n("Resource used"), { content: "textFilter" }], width: 500, sort: "string" }
    ];
    dtOrders.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtOrders", event);
        }
    };
    let allorder = await App.api.ormDbGetAllOrder(filter);
    dtOrders.data = allorder.data;

    let body = {
        view: "form",
        id: "frmProductionProgram",
        scroll: true,
        elements: [
            {
                rows: [
                    {
                        height: 45,
                        cols: [
                            new WebixInputDate('period', i18n('Period'), {
                                view: 'daterangepicker',
                                id: 'iddateFilter',
                            }, {
                                    start: filter.startdate,
                                    end: filter.enddate
                                }),
                            new WebixInputSelect('equipaments', i18n('Equipment'), allEquipment.data, {
                                template: function (obj) {
                                    return obj.description;
                                },
                                value: filter.idequipment ? filter.idequipment : 'All',
                            }),
                            new WebixInputSelect('status', i18n('Status'), [
                                { id: "All", value: i18n('All') },
                                { id: "PAUSED", value: i18n('PAUSED') },
                                { id: "IN_PROCESS", value: i18n('IN_PROCESS') },
                                { id: "PRODUCTION", value: i18n('PRODUCTION') },
                                { id: "FINISHED", value: i18n('FINISHED') }
                            ], {
                                    value: filter.status ? filter.status : 'All',
                                }),
                            new WebixInputText('id', i18n('Id MES or Id SAP'), null, filter.id ? filter.id : '')
                        ]
                    },
                    { height: 15 },
                    dtOrders,
                    {
                        cols: [
                            new WebixCrudAddButton('lotconsumed', i18n('Lot Consumed'), async () => {
                                let item = $$('dtOrders').getSelectedItem();
                                if (!item) {
                                    webix.message(i18n('Please select an order to continue'));
                                } else {
                                    _modalLotConsumedPerOrder.showModal(item);
                                }
                            }, { height: 80 }),
                            new WebixCrudAddButton('lotgenerated', i18n('Lot Generated'), async () => {
                                let item = $$('dtOrders').getSelectedItem();
                                if (!item) {
                                    webix.message(i18n('Please select an order to continue'));
                                } else {
                                    _modalLotGeneratedPerOrder.showModal(item);
                                }
                            }, { height: 80 }),
                            new WebixCrudAddButton('stop', i18n('Stops'), async () => {
                                let item = $$('dtOrders').getSelectedItem();
                                if (!item) {
                                    webix.message(i18n('Please select an order to continue'));
                                } else {
                                    _modalStopsPerOrder.showModal(item, true);
                                }
                            }, { height: 80 }),
                            new WebixCrudAddButton('defect', i18n('Defects'), async () => {
                                let item = $$('dtOrders').getSelectedItem();
                                if (!item) {
                                    webix.message(i18n('Please select an order to continue'));
                                } else {
                                    _modalDefectPerOrder.showModal(item, true);
                                }
                            }, { height: 80 }),
                            new WebixCrudAddButton('scrap', i18n('Scraps'), async () => {
                                let item = $$('dtOrders').getSelectedItem();
                                if (!item) {
                                    webix.message(i18n('Please select an order to continue'));
                                } else {
                                    _modalScrapPerOrder.showModal(item, true);
                                }
                            }, { height: 80 }),
                            new WebixCrudAddButton('rnc', i18n("RNC's"), async () => {
                                let item = $$('dtOrders').getSelectedItem();
                                if (!item) {
                                    webix.message(i18n('Please select an order to continue'));
                                } else {
                                    _modalRNCPerOrder.showModal(item);
                                }
                            }, { height: 80 }),
                            new WebixCrudAddButton('dimensionalControl', i18n("Dimensional Control"), async () => {
                                let item = $$('dtOrders').getSelectedItem();
                                if (!item) {
                                    webix.message(i18n('Please select an order to continue'));
                                } else {
                                    _modalDetailDimensionalControlTrainingTests.showModal(item, null, true);
                                }
                            }, { height: 80 }),
                        ]
                    },
                ],
            }
        ]
    }
    let menu = createSimpleCrudMenu(i18n('Details Order'), null);
    App.replaceMainMenu(menu);
    await App.replaceMainContent(body, () => { });

    await util.datatableColumsGet('dtOrders', event);
}

function createSimpleCrudMenu(title, dtLotsPendingReceipt) {

    let menu = WebixBuildReponsiveTopMenu(title, [{
        id: "search",
        label: "Search",
        icon: "fas fa-search",
        click: async () => {

            let date = $$('iddateFilter').getValue();
            let equipaments = $$('cmbEquipaments').getValue();
            let status = $$('cmbStatus').getValue();
            let id = $$('txtId').getValue();

            showScreen({
                startdate: date.start ? moment(date.start).format('YYYY/MM/DD') : null,
                enddate: date.end ? moment(date.end).format('YYYY/MM/DD') : null,
                idequipment: equipaments && equipaments !== 'All' ? equipaments : null,
                status: status && status !== 'All' ? status : null,
                id: id ? id : null,
            });

        }
    }, {
        id: "pdf",
        icon: "fas fa-file-pdf",
        label: i18n("Export") + " PDF",
        click: async () => {
            let grid = $$(dtLotsPendingReceipt.id);
            let dateString = Date();
            webix.toPDF(grid, {
                filename: i18n("Details order") + " " + dateString,
                orientation: "landscape",
                autowidth: true
            });
        }
    }]);

    return menu;
}