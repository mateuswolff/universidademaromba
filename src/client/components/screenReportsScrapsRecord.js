import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputText, WebixInputSelect, WebixInputDate, WebixBuildReponsiveTopMenu } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen(event) {

    let dtScrapsRecord = new WebixCrudDatatable("dtScrapsRecord");

    // OP
    let op = new WebixInputText("idOp", i18n("OP"), { onBlur: async (obj) => { searchScrapsByFilter(); } });

    // Equipment
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
        "onChange": searchScrapsByFilter
    });

    // Data
    let dateFilter = new WebixInputDate('period', i18n('Period'), {
        view: 'daterangepicker',
        id: 'idDateFilter',
        onChange: searchScrapsByFilter
    },
        {
            start: moment().subtract(1, 'd').format("YYYY/MM/DD"),
            end: moment().format("YYYY/MM/DD")
        }
    );

    // Stops
    dtScrapsRecord.columns = [
        {
            id: "idequipment",
            header: i18n("Equipment"),
            width: 120,
            fillspace: true,
            sort: "int"
        },
        {
            id: "rawmaterial",
            header: i18n("Raw Material"),
            width: 120,
            fillspace: true,
            sort: "int"
        },
        {
            id: "idclient",
            header: i18n("Client"),
            width: 120,
            fillspace: true,
            sort: "int"
        },
        {
            id: "idorder",
            header: i18n("OP"),
            width: 80,
            fillspace: true,
            sort: "int"
        },
        {
            id: "idscrapsequence",
            header: i18n("Scrap Sequence"),
            width: 120,
            fillspace: true,
            sort: "int"
        },
        {
            id: "descriptionreason",
            header: i18n("Defect"),
            width: 80,
            fillspace: true,
            sort: "int"
        },
        {
            id: "dtcreated",
            header: i18n("Date"),
            format: (value) => { return moment(value).format("DD/MM/YYYY HH:mm:ss") },
            width: 150,
            fillspace: true,
            sort: "string"
        },
        {
            id: "idoperation",
            header: i18n("Operation"),
            width: 100,
            fillspace: true,
            sort: "int"
        },
        {
            id: "weight",
            header: i18n("Weight"),
            width: 100,
            fillspace: true,
            sort: "int"
        },
        {
            id: "quantity",
            header: i18n("Pieces"),
            width: 100,
            fillspace: true,
            sort: "int"
        }, 
        {
            id: "iduser",
            header: i18n("User"),
            width: 100,
            fillspace: true,
            sort: "string"
        }
    ];
    dtScrapsRecord.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtScrapsRecord", event);
        }
    };

    const grids = {
        view: 'form',
        minWidth: 800,
        id: "form",
        rows: [{
            cols: [
                op,
                equipments,
                dateFilter,
            ]
        }, {
            cols: [
                dtScrapsRecord,
            ]
        }
    ]}
    
    let menu = createSimpleCrudMenu(i18n('Scraps Record Reports'), dtScrapsRecord);
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);

    await util.datatableColumsGet('dtScrapsRecord', event);
}

function createSimpleCrudMenu(title, dtScrapsRecord) {
    
    let menu = WebixBuildReponsiveTopMenu(title, [{
        id: "btnXLS",
        icon: "fas fa-file-excel",
        label: i18n("Export") + " XLS",
        click: async () => {
            let grid = $$(dtScrapsRecord.id);
            let dateString = Date();
            webix.toExcel(grid, {
                filename: i18n("Scraps Record") +" "+ dateString,
                orientation:"portrait",
                autowidth:true
            });
        }
    },
    {
        id: "btnPDF",
        icon: "fas fa-file-pdf",
        label: i18n("Export") + " PDF",
        click: async () => {
            let grid = $$(dtScrapsRecord.id);
            let dateString = Date();
            webix.toPDF(grid, {
                filename: i18n("Scraps Record") +" "+ dateString,
                orientation:"portrait",
                autowidth:true
            });
        }
    }]);

    return menu;
}

/**
 * Função responsável por pesquisar sucatas pelo filtro
 */
async function searchScrapsByFilter() {

    let idOp =  $$('form').elements.idOp.getValue(); 
    let idequipment = $$('cmbEquipaments').getValue();
    let idDateFilter = $$('idDateFilter').getValue();
    let startdate = moment(idDateFilter.start).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilter.start).format('YYYY-MM-DD');
    let enddate = moment(idDateFilter.end).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilter.end).format('YYYY-MM-DD');

    // Pesquisando no banco mediante os filtros.
    let allScrapsRecord = await App.api.ormDbAllScraps({
        idOp: idOp != "" ? idOp : null,
        idEquipment: idequipment != "Todos" && idequipment != "" ? idequipment : null,
        startdate: startdate ? startdate : null,
        enddate: enddate ? enddate : null
    });

    $$('dtScrapsRecord').clearAll();

    if (allScrapsRecord.data.length > 0) {
        $$('dtScrapsRecord').parse(allScrapsRecord.data, "json");
    } else {
        webix.alert({ text: i18n('No results were found for this search.') });
    }

}