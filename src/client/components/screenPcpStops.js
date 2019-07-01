import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { optionsStatus } from "../components/optionsScreens.js"
import { WebixCrudDatatable, WebixInputDate, WebixInputText, WebixBuildReponsiveTopMenu, WebixInputSelect } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

import * as modalStops from '../extra/_modalStops.js';

export async function showScreen(event) {

    let dtStops = new WebixCrudDatatable("dtStops");

    // Stop
    let stop = new WebixInputText("idStop", i18n("Stop"));

    // OP
    let op = new WebixInputText("idOp", i18n("OP"));

    // Equipment
    let allEquipment = await App.api.ormDbFind('equipment', { status: true });
    allEquipment.data.sort(function (a, b) {
        if (a.description < b.description) return -1;
        if (a.description > b.description) return 1;
        return 0;
    });
    allEquipment.data.unshift({ id: "All", description: i18n('All') });

    let equipments = new WebixInputSelect('equipaments', i18n('Equipment'), allEquipment.data, {
        template: function (obj) {
            return obj.description;
        }
    });

    // Data
    let dateFilter = new WebixInputDate('period', i18n('Period'), {
        view: 'daterangepicker',
        id: 'idDateFilter',
    },
        {
            start: moment().subtract(30, 'd').format("YYYY/MM/DD"),
            end: moment().format("YYYY/MM/DD")
        }
    );

    // Stop Type
    let data = [];
    data.push({ id: "PERFORMED", description: i18n('PERFORMED') });
    data.push({ id: "PLANNED", description: i18n('PLANNED') });
    data.sort(function (a, b) {
        if (a.description < b.description) return -1;
        if (a.description > b.description) return 1;
        return 0;
    });
    data.unshift({ id: "All", description: i18n('All') });

    let stopType = new WebixInputSelect('stopType', i18n('Stop Type'), data, {
        template: function (obj) {
            return obj.description;
        },
    });

    // User
    let idUser = new WebixInputText("idUser", i18n("User"));

    // Datatable
    dtStops.columns = [
        {
            id: "id",
            header: [i18n("Stop"), { content: "textFilter" }],
            width: 80,
            fillspace: true,
            sort: "int"
        },
        {
            id: "idorder",
            header: [i18n("OP"), { content: "textFilter" }],
            width: 80,
            fillspace: true,
            sort: "int"
        },
        {
            id: "idequipment",
            header: [i18n("Equipment"), { content: "textFilter" }],
            width: 100,
            fillspace: true,
            sort: "string"
        },

        // {
        //     id: "startdate",
        //     header: [i18n("Date Start"), { content: "textFilter" }],
        //     format: (value) => { return  value ? moment(value).format("DD/MM/YY") : '-' },
        //     width: 100,
        //     fillspace: true,
        //     sort: "string"
        // },

        {
            id: "startdate",
            header: [i18n("Date Start"), { content: "dateFilter" }],
            format: webix.Date.dateToStr("%d/%m/%y"),
            width: 150,
            fillspace: true,
            sort: "date",
        },

        {
            id: "starthour",
            header: [i18n("Hour Start"), { content: "textFilter" }],
            format: (value) => { return value ? moment(value).format("HH:mm:ss") : '-' },
            width: 100,
            fillspace: true,
            sort: "string"
        },

        // {
        //     id: "enddate",
        //     header: [i18n("Date End"), { content: "textFilter" }],
        //     format: (value) => { return  value ? moment(value).format("DD/MM/YY") : '-' },
        //     width: 100,
        //     fillspace: true,
        //     sort: "string"
        // },

        {
            id: "enddate",
            header: [i18n("Date End"), { content: "dateFilter" }],
            format: webix.Date.dateToStr("%d/%m/%y"),
            width: 150,
            fillspace: true,
            sort: "date",
        },

        {
            id: "endhour",
            header: [i18n("Hour End"), { content: "textFilter" }],
            format: (value) => { return value ? moment(value).format("HH:mm:ss") : '-' },
            width: 100,
            fillspace: true,
            sort: "string"
        },

        {
            id: "diffinmin",
            header: [i18n("Duration") + " (Min)", { content: "textFilter" }],
            width: 100,
            fillspace: true,
            sort: "int"
        },
        {
            id: "stoptype",
            header: [i18n("Stop Type"), { content: "textFilter" }],
            width: 100,
            fillspace: true,
            sort: "string"
        },
        {
            id: "iduser",
            header: [i18n("User"), { content: "textFilter" }],
            width: 100,
            fillspace: true,
            sort: "string"
        }
    ];
    dtStops.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtStops", event);
        }
    };

    const grids = {
        view: 'form',
        id: "form",
        rows: [{
            cols: [
                stop,
                op,
                equipments,
                dateFilter,
                stopType,
                idUser
            ]
        }, {
            cols: [
                dtStops
            ]
        }
        ]
    };

    let menu = createSimpleCrudMenu(i18n('Stops'), dtStops);
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);

    await util.datatableColumsGet('dtStops', event);
}

function createSimpleCrudMenu(title, dtStops) {

    let menu = WebixBuildReponsiveTopMenu(title, [
        {
            view: "button",
            type: "icon",
            id: "btnSearch",
            label: i18n('Search'),
            icon: "fas fa-search",
            click: () => {
                validateDate();
            },
        },
        {
            id: "btnAdd",
            label: "Add",
            icon: "fas fa-plus",
            click: async () => {
                modalStops.showModal('PLANNED', dtStops, 0, null);
            }
        }, {
            id: "btnRemove",
            icon: "fas fa-trash-alt",
            label: "Remove",
            click: async () => {

                let grid = $$('dtStops');
                let item = grid.getSelectedItem();

                if (item == null) {

                    webix.message(i18n('An item must be selected'));
                    return;

                } else {

                    webix.confirm({
                        title: i18n("Do you want to delete this record?"),
                        ok: i18n("Yes! Remove"),
                        cancel: i18n("No! Cancel"),
                        text: `<strong> ${i18n("STOP")} nº </strong> ${item.id}`,
                        callback: async function (result) {
                            if (result) {
                                await App.api.ormDbDelete({ "id": item.id }, 'stop');
                                $$('dtStops').clearAll();
                                let allStops = await App.api.ormDbFind('stop');
                                $$('dtStops').parse(allStops.data, "json");
                                webix.message(i18n('Item removed successfully'));
                            }
                        }
                    });
                    return;

                }

            }
        }, {
            id: "btnEdit",
            icon: "fas fa-edit",
            label: "Edit",
            click: async () => {

                let grid = $$('dtStops');
                let item = grid.getSelectedItem();

                if (item == null) {
                    webix.message(i18n('An item must be selected'));
                    return;
                } else {
                    modalStops.showModal(item.stoptype, dtStops, item.id, null);
                    return;
                }

            }
        }, {
            id: "btnXls",
            icon: "fas fa-file-excel",
            label: i18n("Export") + " XLS",
            click: async () => {
                let grid = $$(dtStops.id);
                let dateString = Date();
                webix.toExcel(grid, {
                    filename: i18n("Stops") + " " + dateString,
                    orientation: "portrait",
                    autowidth: true
                });
            }
        },
        {
            id: "btnPdf",
            icon: "fas fa-file-pdf",
            label: i18n("Export") + " PDF",
            click: async () => {
                let grid = $$(dtStops.id);
                let dateString = Date();
                webix.toPDF(grid, {
                    filename: i18n("Stops") + " " + dateString,
                    orientation: "portrait",
                    autowidth: true
                });
            }
        }]);

    return menu;
}

/**
 * Função validar data
 */
async function validateDate() {
    if ($$('idDateFilter')) {
        let idDateFilter = $$('idDateFilter').getValue();
        let startdate = moment(idDateFilter.start).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilter.start).format('YYYY-MM-DD');
        let enddate = moment(idDateFilter.end).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilter.end).format('YYYY-MM-DD');
        searchStopsByFilter()
        
        // if (startdate != null) {
        //      if (enddate != null) {
        //           searchStopsByFilter(); 
        //     } 
        // } else { searchStopsByFilter(); }
    }
}

/**
 * Função responsável por pesquisar paradas pelo filtro
 */
async function searchStopsByFilter() {

    let idStop = $$('form').elements.idStop.getValue();
    let idOp = $$('form').elements.idOp.getValue();
    let idequipment = $$('cmbEquipaments').getValue();
    let idDateFilter = $$('idDateFilter').getValue();
    let startdate = moment(idDateFilter.start).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilter.start).format('YYYY-MM-DD');
    let enddate = moment(idDateFilter.end).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilter.end).format('YYYY-MM-DD');
    let stopType = $$('form').elements.stopType.getValue();
    let idUser = $$('form').elements.idUser.getValue();

    // Pesquisando no banco mediante os filtros.
    let allStops = await App.api.ormDbAllStops({
        idStop: idStop != "" ? idStop : null,
        idOp: idOp != "" ? idOp : null,
        idEquipment: idequipment != "All" && idequipment != "" ? idequipment : null,
        startdate: startdate ? startdate : null,
        enddate: enddate ? enddate : null,
        stopType: stopType != "All" && stopType != "" ? stopType : null,
        idUser: idUser != "" ? idUser : null
    });

    $$('dtStops').clearAll();

    let temp = [];

    for (let item of allStops.data) {
        item.startdate = new Date(item.startdate);
        item.starthour = new Date(item.starthour);
        item.enddate = new Date(item.enddate);
        item.endhour = new Date(item.endhour);
        temp.push(item);
    }

    if (temp.length > 0) {
        $$('dtStops').parse(temp, "json");
    } else {
        webix.message({ text: i18n('No results were found for this search.') });
    }

}