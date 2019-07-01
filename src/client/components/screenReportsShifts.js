import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputDate, WebixInputSelect, WebixBuildReponsiveTopMenu } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen(event) {

    let dtShifts = new WebixCrudDatatable("dtShifts");
    dtShifts.footer = true;

    /* FILTER */
    let filter = { 
        startdate: moment().subtract(1, 'd').format("YYYY/MM/DD"), 
        enddate: moment().format("YYYY/MM/DD"), 
        idshift: null, 
        idequipment: null
    };

    // ReportS SHIFTS
    dtShifts.columns = [
        {
            id: "idequipment",
            header: [i18n("Equipments"), { content: "selectFilter" }],
            sort: "string",
            fillspace: true,
            footer: {text:"Total:", colspan:3}
        },
        {
            id: "dtcreated",
            header: [i18n("Date"), { content: "textFilter" }],
            sort: "date",
            format: (value) => { return value ? moment(value).format("DD/MM/YYYY") : '' },
            fillspace: true
        },
        {
            id: "idmaterial",
            header: [i18n("Material"), { content: "textFilter" }],
            sort: "string",
            width: 180
        },
        {
            id: "steel",
            header: [i18n("Steel"), { content: "textFilter" }],
            sort: "string",
            fillspace: true
        },
        {
            id: "thickness",
            header: [i18n("Thickness"), { content: "textFilter" }],
            sort: "string",
            fillspace: true
        },
        {
            id: "diameter",
            header: [i18n("Diameter"), { content: "textFilter" }],
            sort: "string",
            fillspace: true
        },
        {
            id: "width",
            header: [i18n("Width"), { content: "textFilter" }],
            sort: "string",
            fillspace: true
        },
        {
            id: "length",
            header: [i18n("Length"), { content: "textFilter" }],
            sort: "string",
            fillspace: true
        },
        {
            id: "weight", header: "Votes", footer: { content: "summColumn" },
            header: [i18n("Weight"), { content: "textFilter" }],
            sort: "string",
            fillspace: true
        },
        {
            id: "pieces",
            header: [i18n("Pieces"), { content: "textFilter" }],
            sort: "string",
            footer: { content: "summColumn" },
            fillspace: true
        },
        {
            id: "idlot",
            header: [i18n("Lot"), { content: "textFilter" }],
            sort: "string",
            fillspace: true
        },
        {
            id: "idrun",
            header: [i18n("Run"), { content: "textFilter" }],
            sort: "string",
            fillspace: true
        },
        {
            id: "idorder",
            header: [i18n("OP"), { content: "textFilter" }],
            sort: "string",
            fillspace: true
        },
        {
            id: "saleorder",
            header: [i18n("Sale order"), { content: "selectFilter" }],
            sort: "string",
            fillspace: true
        },
        {
            id: "saleorderitem",
            header: [i18n("Sale order item"), { content: "selectFilter" }],
            sort: "string",
            fillspace: true
        },
        {
            id: "idshift",
            header: [i18n("Shifts"), { content: "selectFilter" }],
            sort: "string",
            fillspace: true
        }
    ];
    let allReportShifts = await App.api.ormDbReportShifts(filter);
    dtShifts.data = allReportShifts.data;
    dtShifts.scroll = false;
    dtShifts.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtShifts", event);
        }
    };

    // SHIFTS
    let allShifts = await App.api.ormDbFind('shift', { status: true });

    allShifts = allShifts.data.map((item) => {
        return {
            id: item.id,
            value: item.id
        }
    });

    let shifts = {
        view: "multicombo",
        label: i18n("Shifts"),
        labelPosition: "top",
        id: "cmbShifts",
        type: "wide",
        suggest: {
            body: {
                data: allShifts
            }
        },
        on: {
            "onChange": searchOrdersByFilter
        }
    };

    // EQUIPMENT
    let allEquipment = await App.api.ormDbFind('equipment', { status: true });
    allEquipment.data.sort(function(a,b) {
        if(a.description < b.description) return -1;
        if(a.description > b.description) return 1;
        return 0;
    });
    allEquipment.data.unshift({ id: "All", description: i18n('All') });

    let equipments = new WebixInputSelect('equipaments', i18n('Equipment'), allEquipment.data, {
        template: function (obj) {
            return obj.description;
        },
        "onChange": searchOrdersByFilter
    });

    // date
    let dateFilter = new WebixInputDate('period', i18n('Period'), {
        view: 'daterangepicker',
        id: 'iddateFilter',
        onChange: searchOrdersByFilter
    },
        {
            start: filter.startdate,
            end: filter.enddate
        }
    );

    let dataShifts = await generatorGraphsShifts(filter);
    let graphShifts = {
        cols: [{
            rows: [{
                view: "chart",
                id: "shiftsGraph",
                type: "pie",
                value: "#value#",
                color: "#color#",
                label:"#legend#",
                pieInnerText: "#value#",
                shadow: 0,
                data: dataShifts
            }]
        }]
    };

    /* MESSAGE */
    let labelShifts = dataShifts.length == 0 ? i18n('No results found') : '';
    let textMessageShifts = { view: "label", id: "messageShifts", label: labelShifts, align: "center" };
    
    // Accordion
    let accordion = {
        multi: true,
        view: "accordion",
        type: "wide",
        rows: [{
            header: i18n("data"),
            body: {
                rows: [
                    dtShifts,
                ]
            }
        }, {
            header: i18n("Shifts"),
            body: {rows: [textMessageShifts,graphShifts]}
        },
        ]
    };

    const grids = {
        view: 'form',
        id: "form",
        autoheight: false,
        rows: [{
            cols: [
                dateFilter,
                shifts,
                equipments,
            ]
        },
            accordion
        ]
    }

    let menu = createSimpleCrudMenu(i18n('Production Shifts Reports'), dtShifts);
    App.replaceMainMenu(menu);
    
    await util.datatableColumsGet('dtShifts', event);

    await App.replaceMainContent(grids);
    $$("dtShifts").data.attachEvent("onStoreUpdated", function (id, obj, mode) {
        if (mode == "add" || mode == "update" || mode == "delete") {
            updateSummVotes();
        }
    });
    
    updateSummVotes();
}

/**
 * Função responsável para criar o menu
 */
function createSimpleCrudMenu(title, dtShifts) {

    let menu = WebixBuildReponsiveTopMenu(title, [{
        id: "btnXLS",
        icon: "fas fa-file-excel",
        label: i18n("Export") + " XLS",
        click: async () => {

            let grid = $$(dtShifts.id);
            let dateString = date();
            webix.toExcel(grid, {
                filename: i18n("Shifts Reports") + " " + dateString
            });
        }
    },
    {
        id: "btnPDF",
        icon: "fas fa-file-pdf",
        label: i18n("Export") + " PDF",
        click: async () => {
            let grid = $$(dtShifts.id);
            let dateString = date();
            webix.toPDF(grid, {
                filename: i18n("Shifts Reports") + " " + dateString,
                orientation: "landscape",
                autowidth: true
            });
        }
    }]);

    return menu;
}

/**
 * Função responsável por pesquisar ordens pelo filtro
 */
async function searchOrdersByFilter() {
    let date = $$('iddateFilter').getValue();
    let startdate = moment(date.start).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(date.start).format('YYYY-MM-DD');
    let enddate = moment(date.end).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(date.end).format('YYYY-MM-DD');
    if (startdate) { if (enddate) { reloadTable(date); } } else { reloadTable(date); }
}

/**
 * Função responsável para atualizar os Dados
 */
async function reloadTable(date) {

    let startdate = moment(date.start).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(date.start).format('YYYY-MM-DD');
    let enddate = moment(date.end).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(date.end).format('YYYY-MM-DD');
    let idequipment = $$('cmbEquipaments').getValue();
    let idshift = $$('cmbShifts').getValue();
    let idshifts = idshift.replace(/,/g, "', '");

    /* FILTER */
    let filter = { 
        startdate: startdate ? startdate : null,
        enddate: enddate ? enddate : null,
        idequipment: idequipment != "All" && idequipment != "" ? idequipment : null,
        idshift: idshifts != "All" && idshifts != "" ? idshifts : null,
    };

    // Pesquisando no banco mediante os filtros.
    let allShifts = await App.api.ormDbReportShifts(filter);

    $$('dtShifts').clearAll();
    $$('shiftsGraph').clearAll();

    if (allShifts.data.length > 0) {
        $$('dtShifts').parse(allShifts.data, "json");
    } else {
        webix.alert({ text: i18n('No results were found for this search.') });
    }

    let dataShifts = await generatorGraphsShifts(filter);
    $$('shiftsGraph').parse(dataShifts, "json");

    let infoShifts =  dataShifts.length == 0 ? i18n('No results found') : '';
    $$("messageShifts").setValue(infoShifts);

}

/**
 * Função responsável para gerar os dados para o Gráfico
 */
async function generatorGraphsShifts(filter) {

    // Pesquisando no banco mediante os filtros.
    let allGraphsShifts = await App.api.ormDbGraphsShifts(filter);
    allGraphsShifts = allGraphsShifts.data;

    let data = [];

    for (let i = 0; i < allGraphsShifts.length; i++) {

        if (allGraphsShifts[i].cont > 0) {

            let color = await util.generatorColor();

            data.push({
                value: allGraphsShifts[i].cont,
                legend: allGraphsShifts[i].id,
                color: color
            });
        }
    
    }

    return data;
}

function updateSummVotes() {
    // let sumWeight = 0;
    // let sumPieces = 0;
    // $$("dtShifts").data.each(function (row) {
    //     sumWeight += (row.weight * 1) || 0;
    //     sumPieces += (row.pieces * 1) || 0;
    // });

    // $$("sumWeight").setHTML(`<strong>${i18n('Total weight')}<strong>: ${sumWeight}`);
    // $$("sumPieces").setHTML(`<strong>${i18n('Total pieces')}<strong>: ${sumPieces}`);
}