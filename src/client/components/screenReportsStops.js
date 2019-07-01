import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputDate, WebixInputSelect, WebixBuildReponsiveTopMenu } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

import * as modalSpecialInstruction from '../extra/_modalSpecialInstruction.js';

export async function showScreen(event) {

    let dtStops = new WebixCrudDatatable("dtStops");
    dtStops.footer = true;

    /* FILTER */
    let filter = { 
        startdate: moment().subtract(1, 'd').format("YYYY/MM/DD"), 
        enddate: moment().format("YYYY/MM/DD"), 
        idequipment: null
    };

    /* DATATABLE  */
    dtStops.columns = [
        {
            id: "idequipment",
            header: [i18n("Equipment"),{ content: "textFilter" }],
            width: 80,
            sort: "string",
            footer: { text:"Total:", colspan:2 }
        },
        {
            id: "reasonsdescription",
            header: [i18n("Stop Description"),{ content: "textFilter" }],
            sort: "string",
            width: 300,
            fillspace: true
        },
        {
            id: "diffinmin",
            header: [i18n("Stopping"),{ content: "textFilter" }],
            sort: "string",
            width: 80,
            footer: { content: "summColumn" }
        },
        {
            id: "startdate",
            header: [i18n("Start"), { content: "dateFilter" }],
            sort: "string",
            format: (value) => {return  value ? moment(value).format("DD/MM/YYYY HH:mm") : '-' },
            width: 110
        },
        {
            id: "enddate",
            header: [i18n("End"), { content: "dateFilter" }],
            sort: "string",
            format: (value) => {return  value ? moment(value).format("DD/MM/YYYY HH:mm") : '-' },
            width: 110
        },
        {
            id: "iduser",
            header: [i18n("responsible"), { content: "textFilter" }],
            sort: "string",
            width: 120
        },
        {
            id: "materialcons",
            header: [i18n("consumed"), { content: "textFilter" }],
            sort: "string",
            width: 120
        },
        {
            id: "materialproduct",
            header: [i18n("produced"), { content: "textFilter" }],
            sort: "string",
            width: 120
        },
        {
            id: "idordermes",
            header: [i18n("order"), { content: "textFilter" }],
            sort: "string",
            width: 60
        },
        {
            id: "pendencystatus",
            header: [i18n("status") , { content: "textFilter" }],
            sort: "string",
            width: 80
        }
    ];
    let allReportStops = await App.api.ormDbReportStops(filter);
    dtStops.data = allReportStops.data;
    dtStops.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtStops", event);
        }
    };

    // DATA
    let dateFilter = new WebixInputDate('period', i18n('Period'),  {
            view: 'daterangepicker',
            id: 'iddateFilter',
            onChange: searchOrdersByFilter
        },
        {
            start: filter.startdate,
            end: filter.enddate
        }
    );

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

    /* GRAPHS COUNT */
    let dataCount = await generatorGraphsCount(filter); 
    let graphCoun = {
        cols:[{
            rows:[{
                css: "custom_legend",
                view: "chart",
                id: "countGraph",
                type:"pie",
                value:"#value#",
                color:"#color#",
                legend: {
                    width: 250,
                    valign: "middle",
                    template: "#legend# - #value#",
                },
                pieInnerText:"#value#",
                dynamic: true,
                shadow:0,
                data: dataCount
            }]
        }]  
    };

    /* GRAPHS TIME */
    let dataTime = await generatorGraphsTime(filter);
    let graphTime = {
        cols:[{
            rows:[{
                css: "custom_legend",
                view: "chart",
                id: "timeGraph",
                type:"pie",
                value:"#value#",
                color:"#color#",
                legend: {
                    width: 250,
                    valign: "middle",
                    template: "#legend# - #value#",
                },
                pieInnerText:"#value#",
                shadow:0,
                data: dataTime
            }]
        }]  
    };

    /* MESSAGE */
    let labelCount = dataCount.length == 0 ? i18n('No results found') : '';
    let textMessageCount = { view: "label", id: "messageCount", label: labelCount, align: "center" };

    let labelTime = dataTime.length == 0 ? i18n('No results found') : '';
    let textMessageTime = { view: "label", id: "messageTime", label: labelTime, align: "center" };

    // Accordion
    let accordion = {
        multi:true,
        view:"accordion",
        type:"wide",            
        rows:[{ 
                header: i18n("data"), 
                body: dtStops
            }, { 
                header: i18n("Graphs"), 
                body: {
                    cols:[{ 
                            header: i18n("Count"), 
                            body: {rows: [textMessageCount,graphCoun]}
                        }, { 
                            header: i18n("Time"), 
                            body: {rows: [textMessageTime,graphTime]}
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
                equipments,
            ]
        },
            accordion
        ]
    }

    let menu = createSimpleCrudMenu(i18n('Stops Reports'), dtStops);
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);

    await util.datatableColumsGet('dtStops', event);
}

/**
 * Função responsável para criar o menu
 */
function createSimpleCrudMenu(title, dtStops) {
    
    let menu = WebixBuildReponsiveTopMenu(title, [{
        id: "btnXLS",
        icon: "fas fa-file-excel",
        label: i18n("Export") + " XLS",
        click: async () => {
            let grid = $$(dtStops.id);
            let dateString = date();
            webix.toExcel(grid, {
                filename: i18n("Stops Report") +" "+ dateString
            });
        }
    },
    {
        id: "btnPDF",
        icon: "fas fa-file-pdf",
        label: i18n("Export") + " PDF",
        click: async () => {
            let grid = $$(dtStops.id);
            let dateString = date();
            webix.toPDF(grid, {
                filename: i18n("Stops Report") +" "+ dateString,
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
    let idequipment = $$('cmbEquipaments').getValue();
    
    /* Filtro */
    let filter = { 
        startdate: startdate ? startdate : null,
        enddate: enddate ? enddate : null,
        idequipment: idequipment != "All" && idequipment != "" ? idequipment : null
    };

    /* Pesquisando no banco mediante os filtros. */
    let allStops = await App.api.ormDbReportStops(filter);

    $$('dtStops').clearAll();
    $$('countGraph').clearAll();
    $$('timeGraph').clearAll();

    if(allStops.data.length > 0 ) {
        $$('dtStops').parse(allStops.data, "json");
    } else {
        webix.alert({ text: i18n('No results were found for this search.') });
    }

    let dataCount = await generatorGraphsCount(filter);
    $$('countGraph').parse(dataCount, "json");

    let infoCount =  dataCount.length == 0 ? i18n('No results found') : '';
    $$("messageCount").setValue(infoCount);

    let dataTime = await generatorGraphsTime(filter);
    $$('timeGraph').parse(dataTime, "json");

    let infoTime =  dataTime.length == 0 ? i18n('No results found') : '';
    $$("messageTime").setValue(infoTime);

}

/**
 * Função responsável para gerar os dados para o Gráfico - Contagem
 */
async function generatorGraphsCount(filter) {

    // Pesquisando no banco mediante os filtros.
    let allGraphsCount = await App.api.ormDbGraphsStops(filter);
    allGraphsCount = allGraphsCount.data;

    let data = [];

    for (let i = 0; i < allGraphsCount.length; i++){

        if (allGraphsCount[i].count > 0) {

            let color = await util.generatorColor();

            data.push({
                value: allGraphsCount[i].count, 
                legend: allGraphsCount[i].description,
                color: color
            });

        }

    }

    return data;
}

/**
 * Função responsável para gerar os dados para o Gráfico - Tempo
 */
async function generatorGraphsTime(filter) {

    // Pesquisando no banco mediante os filtros.
    let allGraphsTime = await App.api.ormDbGraphsStops(filter);
    allGraphsTime = allGraphsTime.data;

    let data = [];

    for (let i = 0; i < allGraphsTime.length; i++){

        if (allGraphsTime[i].sum>0) {
        
            let color = await util.generatorColor();

            data.push({
                value: allGraphsTime[i].sum, 
                legend: allGraphsTime[i].description,
                color: color
            });
       
        }

    }

    return data;
}