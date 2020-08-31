import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputDate, WebixInputSelect, WebixBuildReponsiveTopMenu } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";


export async function showScreen(event) {

    let dtClientes = new WebixCrudDatatable("dtClientes");

    /* FILTER */
    let filter = { 
        startdate: moment().subtract(1, 'd').format("YYYY/MM/DD"), 
        enddate: moment().format("YYYY/MM/DD"), 
    };

    /* DATATABLE  */
    dtClientes.columns = [
        {
            id: "id",
            header: ["Matrícula",{ content: "textFilter" }],
            width: 80,
            sort: "string",
            footer: { text:"Total:", colspan:2 }
        },
        {
            id: "nome",
            header: ["Nome",{ content: "textFilter" }],
            sort: "string",
            width: 300,
            fillspace: true
        },
        {
            id: "celular",
            header: ["Celular",{ content: "textFilter" }],
            sort: "string",
            width: 80,
            fillspace: true,
            footer: { content: "summColumn" }
        },
        {
            id: "email",
            header: ["email", { content: "dateFilter" }],
            sort: "string",
            fillspace: true,
            width: 110
        },
        {
            id: "parcelas",
            header: [i18n("Parcelas"), { content: "dateFilter" }],
            sort: "string",
            fillspace: true,
            width: 110
        }
    ];
    let relatorio = await App.api.ormDbRelatorioInadimplentes();

    dtClientes.data = relatorio.data;
    dtClientes.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtClientes", event);
        }
    };

    // DATA
    let dateFilter = new WebixInputDate('period', i18n('Período'),  {
            view: 'daterangepicker',
            id: 'iddateFilter',
            onChange: searchOrdersByFilter
        },
        {
            start: filter.startdate,
            end: filter.enddate
        }
    );


    /* GRAPHS COUNT */
    let dataCount = await generatorGraphsCount(filter); 

    let graphCoun = {
        cols:[{
            rows:[{
                css: "custom_legend",
                view: "chart",
                id: "countGraph",
                type:"donut",
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
    // let dataTime = await generatorGraphsTime(filter);
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
                data: []
            }]
        }]  
    };

    /* MESSAGE */
    let labelCount = dataCount.length == 0 ? i18n('No results found') : '';
    let textMessageCount = { view: "label", id: "messageCount", label: labelCount, align: "center" };

    // let labelTime = dataTime.length == 0 ? i18n('No results found') : '';
    // let textMessageTime = { view: "label", id: "messageTime", label: labelTime, align: "center" };

    // Accordion
    let accordion = {
        multi:true,
        view:"accordion",
        type:"wide",            
        rows:[{ 
                header: i18n("Clientes Inadimplentes"), 
                body: dtClientes
            }, { 
                header: i18n("Gráficos"), 
                body: {
                    cols:[{ 
                            header: i18n("Adimplentes"), 
                            body: {rows: [textMessageCount,graphCoun]}
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
                dateFilter
            ]
        },
            accordion
        ]
    }

    let menu = createSimpleCrudMenu(i18n('Stops Reports'), dtClientes);
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);

    await util.datatableColumsGet('dtClientes', event);
}

/**
 * Função responsável para criar o menu
 */
function createSimpleCrudMenu(title, dtClientes) {
    
    let menu = WebixBuildReponsiveTopMenu(title, [{
        id: "btnXLS",
        icon: "fas fa-file-excel",
        label: i18n("Export") + " XLS",
        click: async () => {
            let grid = $$(dtClientes.id);
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
            let grid = $$(dtClientes.id);
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

    
    /* Filtro */
    let filter = { 
        startdate: startdate ? startdate : null,
        enddate: enddate ? enddate : null,
    };

    /* Pesquisando no banco mediante os filtros. */
    let allStops = await App.api.ormDbReportStops(filter);

    $$('dtClientes').clearAll();
    $$('countGraph').clearAll();
    $$('timeGraph').clearAll();

    if(allStops.data.length > 0 ) {
        $$('dtClientes').parse(allStops.data, "json");
    } else {
        webix.alert({ text: i18n('No results were found for this search.') });
    }

    let dataCount = await generatorGraphsCount(filter);
    $$('countGraph').parse(dataCount, "json");

    let infoCount =  dataCount.length == 0 ? i18n('No results found') : '';
    $$("messageCount").setValue(infoCount);

    // let dataTime = await generatorGraphsTime(filter);
    // $$('timeGraph').parse(dataTime, "json");

    let infoTime =  dataTime.length == 0 ? i18n('No results found') : '';
    $$("messageTime").setValue(infoTime);

}

/**
 * Função responsável para gerar os dados para o Gráfico - Contagem
 */
async function generatorGraphsCount(filter) {

    // Pesquisando no banco mediante os filtros.
    let allGraphsCount = await App.api.ormDbRelatorioAdimplentes();

    console.log(allGraphsCount)
    allGraphsCount = allGraphsCount.data;

    let data = [];

    for (let i = 0; i < allGraphsCount.length; i++){

        if (allGraphsCount[i].quantidade > 0) {

            data.push({
                value: allGraphsCount[i].quantidade, 
                legend: allGraphsCount[i].status,
                color: allGraphsCount[i].color
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