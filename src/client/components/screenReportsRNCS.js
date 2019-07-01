import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputDate, WebixInputSelect, WebixBuildReponsiveTopMenu } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen(event) {

    let dtRNCS = new WebixCrudDatatable("dtRNCS");
    dtRNCS.footer = true;

    /* FILTER */
    let filter = { 
        startdate: moment().subtract(1, 'd').format("YYYY/MM/DD"), 
        enddate: moment().format("YYYY/MM/DD"), 
        idshifts: null, 
        pendencystatus: null
    };

    /* DATATABLE  */
    dtRNCS.columns = [
        {
            id: "id",
            header: [i18n("RNC"), { content: "textFilter" }],
            width: 50,
            sort: "string",
            footer: { text:"Total:", colspan:3 }
        }, 
        {
            id: "idorder",
            header: [i18n("OP"), { content: "textFilter" }],
            width: 50,
            sort: "string"
        }, 
        {
            id: "production",
            header: [i18n("Production"), { content: "textFilter" }],
            format: (value) => { return value == 1 ? 'X' : '' },
            width: 80,
            sort: "string"
        },
        {
            id: "quality",
            header: [i18n("Quality"), { content: "textFilter" }],
            format: (value) => { return value == 1 ? 'X' : '' },
            width: 80,
            sort: "string"
        },
        {
            id: "description",
            header: [i18n("Pendency Type"), { content: "textFilter" }],
            width: 180,
            sort: "string"
        },
        {
            id: "idlot",
            header: [i18n("Lot"), { content: "textFilter" }],
            width: 80,
            sort: "string"
        },
        {
            id: "saleorder",
            header: [i18n("Sale Order"), { content: "textFilter" }],
            width: 100,
            sort: "string"
        },
        {
            id: "saleorderitem",
            header: [i18n("Sale Order Item"), { content: "textFilter" }],
            width: 100,
            sort: "string"
        },
        {
            id: "material",
            header: [i18n("Material"), { content: "textFilter" }],
            width: 100,
            sort: "string"
        },
        {
            id: "steel",
            header: [i18n("Steel"), { content: "textFilter" }],
            width: 100,
            sort: "string"
        },
        {
            id: "thickness",
            header: [i18n("Thickness"), { content: "textFilter" }],
            width: 100,
            sort: "string"
        },
        {
            id: "diameter",
            header: [i18n("Diameter"), { content: "textFilter" }],
            width: 100,
            sort: "string"
        },
        {
            id: "width",
            header: [i18n("Width"), { content: "textFilter" }],
            width: 100,
            sort: "string"
        },
        {
            id: "length",
            header: [i18n("Length"), { content: "textFilter" }],
            width: 100,
            sort: "string"
        },
        {
            id: "weight",
            header: [i18n("Weight"), { content: "textFilter" }],
            width: 100,
            sort: "string", 
            footer: { content: "summColumn" }
        },
        {
            id: "parts",
            header: [i18n("Parts"), { content: "textFilter" }],
            width: 100,
            sort: "string", 
            footer: { content: "summColumn" }
        },
        {
            id: "pendencydate",
            header: [i18n("Pendency date"), { content: "textFilter" }],
            format: (value) => { return value ? moment(value).format("DD/MM/YYYY") : '' },
            width: 150, 
            sort: "string"
        },
        {
            id: "pendencystatus",
            header: [i18n("Pendency Status"), { content: "textFilter" }],
            width: 100,
            sort: "string"
        },
        {
            id: "chkmd",
            header: [i18n("CHK MD"), { content: "textFilter" }],
            width: 100,
            sort: "string"
        },
        {
            id: "chkScrap",
            header: [i18n("CHK Scrap"), { content: "textFilter" }],
            width: 100,
            sort: "string"
        },
        {
            id: "reworkResults",
            header: [i18n("Rework Results"), { content: "textFilter" }],
            width: 100,
            sort: "string"
        }
    ];
    let allReportRNCS = await App.api.ormDbReportRNC(filter);
    dtRNCS.data = allReportRNCS.data;
    dtRNCS.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtRNCS", event);
        }
    };

    // SHIFTS
    let allShifts = await App.api.ormDbFind('shift', { status: true });
    allShifts = allShifts.data.map((item) => { return { id: item.id, value: i18n(item.id) } });
    allShifts.sort(function(a,b) { if(a.id < b.id) return -1; if(a.id > b.id) return 1; return 0; });

    let shifts = {
        view: "multicombo",
        label: i18n("Shifts"),
        id: "cmbShifts",
        suggest: {
            body:{
              data: allShifts
            }
        },
        labelPosition: "top",
        on: {
            "onChange": searchOrdersByFilter         
        }
    };

    // Pendency Status
    let allPendency = [];
    allPendency.push({id: "A", description: i18n('Active') });
    allPendency.push({id: "C", description: i18n('Canceled')});
    allPendency.push({id: "L", description: i18n('Released')});
    allPendency.push({id: "S", description: i18n('Scrapped')});

    allPendency.sort(function(a,b) {
        if(a.description < b.description) return -1;
        if(a.description > b.description) return 1;
        return 0;
    });
    allPendency.unshift({ id: "All", description: i18n('All') });

    let pendency = new WebixInputSelect('pendencystatus', i18n('Pendency Status'), allPendency, {
        template: function (obj) {
            return obj.description;
        },
        "onChange": searchOrdersByFilter         
    });

    // Type Team
    let allTypeTeam = [];
    allTypeTeam.push({id: "P", description: i18n('Production') });
    allTypeTeam.push({id: "PQ", description: i18n('Production / Quality')});
    allTypeTeam.push({id: "Q", description: i18n('Quality')});
    allTypeTeam.push({id: "QP", description: i18n('Quality / Production')});

    allTypeTeam.sort(function(a,b) {
        if(a.description < b.description) return -1;
        if(a.description > b.description) return 1;
        return 0;
    });
    allTypeTeam.unshift({ id: "All", description: i18n('All') });

    let typeTeam = new WebixInputSelect('typeTeam', i18n('Type Team'), allTypeTeam, {
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

    /* GRAPHS TYPE RNC */
    let dataRNC = await generatorGraphsTypeRNC(filter); 
    let graphTypeRNC = {
        cols:[{
            rows:[{
                view: "chart",
                id: "rncsGraph",
                type:"pie",
                value:"#value#",
                color:"#color#",
                label:"#legend#",
                pieInnerText:"#value#",
                dynamic: true,
                shadow:0,
                data: dataRNC
            }]
        }]  
    };

    /* GRAPHS SHIFTS */
    let dataShifts = await generatorGraphsShifts(filter);
    let graphShifts = {
        cols:[{
            rows:[{
                view: "chart",
                id: "shiftsGraph",
                type:"pie",
                value:"#value#",
                color:"#color#",
                label:"#legend#",
                pieInnerText:"#value#",
                dynamic: true,
                shadow:0,
                data: dataShifts
            }]
        }]  
    };

    /* MESSAGE */
    let labelRNC = dataRNC.length == 0 ? i18n('No results found') : '';
    let textMessageRNC = { view: "label", id: "messageRNC", label: labelRNC, align: "center" };

    let labelShifts = dataShifts.length == 0 ? i18n('No results found') : '';
    let textMessageShifts = { view: "label", id: "messageShifts", label: labelShifts, align: "center" };

    // Accordion
    let accordion = {
        multi:true,
        view:"accordion",
        type:"wide",            
        rows:[{ 
                header: i18n("data"), 
                body: dtRNCS
            }, { 
                header: i18n("Graphs"), 
                body: {
                    cols:[{ 
                            header: i18n("Type RNC"), 
                            body: {rows: [textMessageRNC,graphTypeRNC]}
                        }, { 
                            header: i18n("Shifts"), 
                            body: {rows: [textMessageShifts,graphShifts]}
                        }
                    ]
                }
            }
        ]
    };
    
    const grids = {
        view: 'form',
        minWidth: 800,
        id: "form",
        autoheight: false,
        rows: [{
            cols: [
                dateFilter,
                shifts,
                pendency,
                typeTeam
            ]
        },
            accordion
        ]
    }

    let menu = createSimpleCrudMenu(i18n('RNCS Reports'), dtRNCS);
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);

    await util.datatableColumsGet('dtRNCS', event);
}

/**
 * Função responsável para criar o menu
 */
function createSimpleCrudMenu(title, dtRNCS) {
    
    let menu = WebixBuildReponsiveTopMenu(title, [{
        id: "btnXLS",
        icon: "fas fa-file-excel",
        label: i18n("Export") + " XLS",
        click: async () => {
            let grid = $$(dtRNCS.id);
            let dateString = date();
            webix.toExcel(grid, {
                filename: i18n("RNCS Report") +" "+ dateString
            });
        }
    },
    {
        id: "btnPDF",
        icon: "fas fa-file-pdf",
        label: i18n("Export") + " PDF",
        click: async () => {
            let grid = $$(dtRNCS.id);
            let dateString = date();
            webix.toPDF(grid, {
                filename: i18n("RNCS Report") +" "+ dateString,
                orientation:"landscape",
                autowidth:true
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
    let pendencystatus = $$('cmbPendencystatus').getValue();
    let idshift = $$('cmbShifts').getValue();
    let idshifts = idshift.replace(/,/g, "', '"); 
    let typeTeam = $$('cmbTypeTeam').getValue();

     /* Filtro */
     let filter = { 
        startdate: startdate ? startdate : null,
        enddate: enddate ? enddate : null,
        idshifts: idshifts ? idshifts : null, 
        pendencystatus: pendencystatus != "All" && pendencystatus != "" ? pendencystatus : null,
        typeTeam: typeTeam != "All" && typeTeam != "" ? typeTeam : null
    };

    // Pesquisando no banco mediante os filtros.
    let allRNCS = await App.api.ormDbReportRNC(filter);

    $$('dtRNCS').clearAll();
    $$('rncsGraph').clearAll();
    $$('shiftsGraph').clearAll();

    if(allRNCS.data.length > 0 ) {
        $$('dtRNCS').parse(allRNCS.data, "json");
    } else {
        webix.alert({ text: i18n('No results were found for this search.') });
    }

    let dataRNC = await generatorGraphsTypeRNC(filter);
    $$('rncsGraph').parse(dataRNC, "json");

    let infoRNC =  dataRNC.length == 0 ? i18n('No results found') : '';
    $$("messageRNC").setValue(infoRNC);

    let dataShifts = await generatorGraphsShifts(filter);
    $$('shiftsGraph').parse(dataShifts, "json");

    let infoShifts =  dataShifts.length == 0 ? i18n('No results found') : '';
    $$("messageShifts").setValue(infoShifts);

}

/**
 * Função responsável para gerar os dados para o Gráfico - TYPE RNC
 */
async function generatorGraphsTypeRNC(filter) {

    // Pesquisando no banco mediante os filtros.
    let allGraphsRNCS = await App.api.ormDbGraphsRNC(filter);
    allGraphsRNCS = allGraphsRNCS.data;

    let data = [];

    for (let i = 0; i < allGraphsRNCS.length; i++){

        if (allGraphsRNCS[i].cont > 0) {

            let color = await util.generatorColor();

            data.push({
                value: allGraphsRNCS[i].cont, 
                legend: allGraphsRNCS[i].description,
                color: color
            });

        }

    }

    return data;
}

/**
 * Função responsável para gerar os dados para o Gráfico - Shifts
 */
async function generatorGraphsShifts(filter) {

    // Pesquisando no banco mediante os filtros.
    let allGraphsShifts = await App.api.ormDbGraphsRNCShifts(filter);
    allGraphsShifts = allGraphsShifts.data;

    let data = [];

    for (let i = 0; i < allGraphsShifts.length; i++){

        if (allGraphsShifts[i].cont>0) {
        
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