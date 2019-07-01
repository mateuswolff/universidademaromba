import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputSelect, WebixInputText, WebixInputDate, WebixBuildReponsiveTopMenu } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

import * as modalRegisterRNC from '../extra/_modalRegisterRNC.js';
import * as modalPendencyRelease from '../extra/_modalPendencyRelease.js';

export async function showScreen(event) {

    let dtSearchRNC = new WebixCrudDatatable("dtSearchRNC");

    /* Stops */
    dtSearchRNC.columns = [
        {
            id: "id",
            width: 100,
            header: [i18n("RNC"), { content: "textFilter" }],
            sort: "int"
        },
        {
            id: "pendencyType",
            width: 250,
            header: [i18n("Pendency Type"), { content: "textFilter" }],
            sort: "string"
        },
        {
            id: "pendencystatus",
            width: 100,
            header: [i18n("Pendency Status"), { content: "textFilter" }],
            format: (elem) => {
                switch (elem) {
                    case "S":
                        return i18n("Scrapped");
                    case "C":
                        return i18n("Canceled");
                    case "A":
                        return i18n("Active");
                    case "P":
                        return i18n("Waiting Rework");
                    case "L":
                        return i18n("Released");
                }
            },
            sort: "string",
        },
        {
            id: "team",
            width: 100,
            header: [i18n("Team"), { content: "textFilter" }],
            sort: "string",
        },
        {
            id: "pendencydate",
            header: [i18n("RNC Date"), { content: "textFilter" }],
            format: (value) => { if (value) { return moment(value).format("DD/MM/YYYY HH:mm:ss") } else { return ""; } },
            sort: "string",
        },
        {
            id: "releaseddate",
            width: 160,
            header: [i18n("RNC Release Date"), { content: "dateFilter" }],
            format: (value) => { if (value) { return moment(value).format("DD/MM/YYYY HH:mm:ss"); } else { return ""; } },
            sort: "string",
        },
        {
            id: "iduser",
            header: [i18n("User Resp."), { content: "textFilter" }],
            sort: "string",
        },
        {
            id: "idlot",
            header: [i18n("Lot"), { content: "textFilter" }],
            sort: "string",
        },
        {
            id: "idMaterial",
            header: [i18n("Material"), { content: "textFilter" }],
            sort: "string",
        },
        {
            id: "steel",
            header: [i18n("Steel"), { content: "textFilter" }],
            sort: "string",
        },
        {
            id: "thickness",
            header: [i18n("Thickness"), { content: "textFilter" }],
            sort: "string",
        },
        {
            id: "diameter",
            header: [i18n("Diameter"), { content: "textFilter" }],
            sort: "string",
        },
        {
            id: "width",
            header: [i18n("Width"), { content: "textFilter" }],
            sort: "string",
        },
        {
            id: "length",
            header: [i18n("Length"), { content: "textFilter" }],
            sort: "string",
        },
        {
            id: "parts",
            header: [i18n("Parts"), { content: "textFilter" }],
            sort: "string",
        },
        {
            id: "weight",
            header: [i18n("Weight"), { content: "textFilter" }],
            sort: "string",
        }
    ];
    dtSearchRNC.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtSearchRNC", event);
        }
    };

    // RNC
    let rnc = new WebixInputText("idRnc", i18n("RNC"), { onBlur: async (obj) => { validateDate(); } });

    // PENDENCY TYPE
    let allPendencyType = await App.api.ormDbFind('pendencytype', { status: true });
    allPendencyType.data.sort(function (a, b) {
        if (a.description < b.description) return -1;
        if (a.description > b.description) return 1;
        return 0;
    });
    allPendencyType.data.unshift({ id: "All", description: i18n('All') });

    let pendencyType = new WebixInputSelect('pendencyType', i18n("Pendency Type"), allPendencyType.data, {
        template: function (obj) {
            return obj.description;
        },
    });

    // Pendency Status
    let allPendencyStatus = [];
    allPendencyStatus.push({ id: "A", description: i18n('Active') });
    allPendencyStatus.push({ id: "C", description: i18n('Canceled') });
    allPendencyStatus.push({ id: "L", description: i18n('Released') });
    allPendencyStatus.push({ id: "P", description: i18n('Waiting Rework') });
    allPendencyStatus.push({ id: "S", description: i18n('Scrapped') });
    allPendencyStatus.sort(function (a, b) {
        if (a.description < b.description) return -1;
        if (a.description > b.description) return 1;
        return 0;
    });
    allPendencyStatus.unshift({ id: "All", description: i18n('All') });

    let pendencyStatus = new WebixInputSelect('pendencyStatus', i18n('Pendency Status'), allPendencyStatus, {
        template: function (obj) {
            return obj.description;
        },
    });

    // Lot
    let lot = new WebixInputText("idLot", i18n("Lot"));

    // DATA RNC
    let dateFilterRnc = new WebixInputDate('dateFilterRnc', i18n('RNC Date'), {
        view: 'daterangepicker',
        id: 'idDateFilterRnc',
    }
    );

    // DATA LIBERACAO RNC
    let dateFilterRelease = new WebixInputDate('dateFilterRelease', i18n('RNC Release Date'), {
        view: 'daterangepicker',
        id: 'idDateFilterRelease',
    }
    );

    // Area RNC
    let allAreaRNC = [];
    allAreaRNC.push({ id: "P", description: i18n('Production') });
    allAreaRNC.push({ id: "Q", description: i18n('Quality') });
    allAreaRNC.sort(function (a, b) {
        if (a.description < b.description) return -1;
        if (a.description > b.description) return 1;
        return 0;
    });
    allAreaRNC.unshift({ id: "All", description: i18n('All') });

    // let areaRNC = new WebixInputSelect('areaRNC', i18n('Area RNC'), allAreaRNC, {
    //     template: function (obj) {
    //         return obj.description;
    //     },
    // });

    const grids = {
        view: 'form',
        minWidth: 800,
        id: "form",
        rows: [{
            cols: [
                rnc,
                pendencyType,
                pendencyStatus,
                lot,
                dateFilterRnc,
                dateFilterRelease,
                //areaRNC
            ]
        },
        {
            cols: [
                dtSearchRNC
            ]
        }
        ]
    };

    let menu = createSimpleCrudMenu(i18n('Search RNC'), dtSearchRNC);
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);

    await util.datatableColumsGet('dtSearchRNC', event);
}

function createSimpleCrudMenu(title, dtSearchRNC) {

    let menu = WebixBuildReponsiveTopMenu(title, [
        {
            id: "search",
            label: "Search",
            icon: "fas fa-search",
            click: validateDate
            
        },
        {
            id: "btnAdd",
            label: "Add",
            icon: "fas fa-plus",
            click: async () => {
                let test = await modalRegisterRNC.showModal(null, null, null, 'search');
                validateDate();
            }
        },
        {
            id: "btnPendencyrelease",
            icon: "fas fa-calendar-check",
            label: i18n("Pendency Release"),
            click: async () => {

                let grid = $$('dtSearchRNC');
                let item = grid.getSelectedItem();

                if (item == null) {
                    webix.alert(i18n('An item must be selected'));
                    return;
                } else if (item.pendencystatuscode == "S") {
                    webix.alert(i18n('The selected Lot was scrapped!'));
                    return;
                } else if (item.pendencystatuscode == "L") {
                    webix.alert(i18n('The selected Pendency was Released!'));
                    return;
                }
                else if (item.pendencystatuscode == "C") {
                    webix.alert(i18n('The selected Pendency was Canceled!'));
                    return;
                }
                else if (item.pendencystatuscode == "P") {
                    webix.alert(i18n('The selected Pendency is waiting for a Rework!'));
                    return;
                }
                else {
                    let data = $$('dtSearchRNC').getSelectedItem();
                    await modalPendencyRelease.showModal(data);
                    validateDate();
                    return;
                }

            }

        },
        {
            id: "btnCancel",
            icon: "fas fa-ban",
            label: "Cancel",
            click: async () => {

                let grid = $$('dtSearchRNC');
                let item = grid.getSelectedItem();

                if (item == null) {
                    webix.alert(i18n('An item must be selected'));
                    return;
                } else {
                    if (item.pendencystatuscode == 'C') {
                        webix.alert(i18n('This Pendency is already canceled'));
                        return;
                    } else if (item.pendencystatuscode == 'L') {
                        webix.alert(i18n('This Pendency was Released'));
                        return;
                    }
                    else if (item.pendencystatuscode == 'S') {
                        webix.alert(i18n('This Lot was Scrapped'));
                        return;
                    }
                    else {
                        webix.confirm({
                            title: i18n("Do you want to cancel this record?"),
                            ok: i18n("Yes! Remove"),
                            cancel: i18n("No! Cancel"),
                            text: `<strong>RNC</strong> ${item.id}`,
                            callback: async function (result) {
                                if (result) {

                                    let registerRNC = {
                                        "status": false,
                                        "pendencystatus": "C"
                                    };

                                    let pendencyrelease = {
                                        "situation": "C"
                                    }

                                    App.api.ormDbUpdate({ "id": item.id }, 'pendency', registerRNC).then((res) => {

                                        App.api.ormDbUpdate({ "idpendency": item.id }, 'pendencyrelease', pendencyrelease).then((res) => {

                                            webix.message(i18n('Item canceled successfully'));
                                            //updateTable();
                                            validateDate();
                                        });

                                    });

                                }
                            }
                        });
                        return;
                    }
                }
            }
        }, {
            id: "btnEdit",
            icon: "fas fa-edit",
            label: "Edit",
            click: async () => {

                let grid = $$('dtSearchRNC');
                let item = grid.getSelectedItem();

                if (item == null) {
                    webix.alert(i18n('An item must be selected'));
                    return;
                }
                else if (item.pendencystatuscode == 'C') {
                    webix.alert(i18n('This Pendency is already canceled'));
                    return;
                } else if (item.pendencystatuscode == 'L') {
                    webix.alert(i18n('This Pendency was Released'));
                    return;
                }
                else if (item.pendencystatuscode == 'S') {
                    webix.alert(i18n('This Lot was Scrapped'));
                    return;
                }
                else if (item.pendencystatuscode == 'P') {
                    webix.alert(i18n('This Pendency is waiting for a rework'));
                    return;
                }
                else {
                    modalRegisterRNC.showModal(null, null, null, 'edit', item);
                    return;
                }

            }

        }]);

    return menu;
}

/**
 * Função validar data
 */
async function validateDate() {
    let idDateFilterRnc = $$('idDateFilterRnc').getValue();
    let startDateRnc = moment(idDateFilterRnc.start).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilterRnc.start).format('YYYY-MM-DD');
    let endDateRnc = moment(idDateFilterRnc.end).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilterRnc.end).format('YYYY-MM-DD');

    let idDateFilterRelease = $$('idDateFilterRelease').getValue();
    let startDateRelease = moment(idDateFilterRelease.start).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilterRelease.start).format('YYYY-MM-DD');
    let endDateRelease = moment(idDateFilterRelease.end).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilterRelease.end).format('YYYY-MM-DD');

    let status = 0;
    if (startDateRnc != null) { if (endDateRnc == null) { status++; } }
    if (startDateRelease != null) { if (endDateRelease == null) { status++; } }

    if (status == 0) { searchRNCByFilter(); }
}

/**
 * Função responsável por pesquisar RNC pelo filtro
 */
async function searchRNCByFilter() {

    let idRnc = $$('form').elements.idRnc.getValue();
    let pendencyType = $$('form').elements.pendencyType.getValue();
    let pendencyStatus = $$('form').elements.pendencyStatus.getValue();
    let idLot = $$('form').elements.idLot.getValue();
    let idDateFilterRnc = $$('idDateFilterRnc').getValue();
    let startDateRnc = moment(idDateFilterRnc.start).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilterRnc.start).format('YYYY-MM-DD');
    let endDateRnc = moment(idDateFilterRnc.end).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilterRnc.end).format('YYYY-MM-DD');
    let idDateFilterRelease = $$('idDateFilterRelease').getValue();
    let startDateRelease = moment(idDateFilterRelease.start).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilterRelease.start).format('YYYY-MM-DD');
    let endDateRelease = moment(idDateFilterRelease.end).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilterRelease.end).format('YYYY-MM-DD');
    //let areaRNC = $$('form').elements.areaRNC.getValue();

    // Pesquisando no banco mediante os filtros.
    let allSearchRNC = await App.api.ormDbAllSearchRNC({
        idRnc: idRnc != "" ? idRnc : null,
        pendencyType: pendencyType != "All" && pendencyType != "" ? pendencyType : null,
        pendencyStatus: pendencyStatus != "All" && pendencyStatus != "" ? pendencyStatus : null,
        idLot: idLot != "" ? idLot : null,
        startDateRnc: startDateRnc,
        endDateRnc: endDateRnc,
        startDateRelease: startDateRelease,
        endDateRelease: endDateRelease,
        //areaRNC: areaRNC != "All" && areaRNC != "" ? areaRNC : null
    });

    $$('dtSearchRNC').clearAll();

    if (allSearchRNC.data.length > 0) {
        updateTable(allSearchRNC);
    } else {
        webix.alert({ text: i18n('No results were found for this search.') });
    }

}

/**
 * Função Atualizar GRID
 */
async function updateTable(allSearchRNC) {

    $$('dtSearchRNC').clearAll();

    allSearchRNC = allSearchRNC.data.map(
        (item) => {

            let pendencystatuscode = item.pendencystatus;

            let team = ''

            if (item.teamtype1 == 'P' && item.situation1 == 'A') {
                team = 'Production'
            }
            else if (item.teamtype1 = 'Q' && item.situation1 == 'A') {
                team = 'Quality'
            }
            else if (item.teamtype2 = 'P' && item.situation2 == 'A') {
                team = 'Production'
            }
            else if (item.teamtype2 = 'Q' && item.situation2 == 'A') {
                team = 'Quality'
            }
            else {
                team = 'Released'
            }

            return {
                id: item.id,
                idlot: item.idlot,
                idpendencytype: item.idpendencytype,
                pendencyType: item.pendencyType,
                team: i18n(team),
                iduser: item.iduser,
                pendencydate: item.pendencydate,
                pendencystatus: item.pendencystatus,
                pendencystatuscode: pendencystatuscode,
                releaseddate: item.pendencystatus == "L" ? item.dtupdated : null,
                idMaterial: item.idMaterial,
                steel: item.steel,
                thickness: item.thickness,
                diameter: item.diameter,
                width: item.width,
                length: item.length,
                weight: item.weight,
                parts: item.parts

            }

        }
    )


    $$('dtSearchRNC').parse(allSearchRNC, 'json');
}