import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputDate, WebixInputText, WebixBuildReponsiveTopMenu, WebixInputSelect } from "../lib/WebixWrapper.js";
import { optionsInterface, optionsStatusInterface } from "../components/optionsScreens.js"
import * as util from "../lib/Util.js";

import * as modalXml from '../extra/_modalReadXml.js';

export async function showScreen(event) {

    let dtLog = new WebixCrudDatatable("dtLog");
    
    let tables = await App.api.ormDbFind('logdata')
    tables = tables.data;

    tables = await getUnique(tables, 'tablename')
    
    let cont = 1;
    
    tables = tables.map( (elem) => {
        return {
            id: elem.tablename,
            value: elem.tablename
        }
    })

    tables.unshift({id: 'all', value: i18n('All')});

    let selectTable = new WebixInputSelect("table", i18n("Table"), tables, {
        template: function (obj) {
            return obj.value;
        },
    })
     
    let logkey = new WebixInputText("logkey", i18n("Log Key"))

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


    // Datatable
    dtLog.columns = [
        {
            id: "logkey",
            header: [i18n("Log Key"), { content: "textFilter" }],
            fillspace: true,
            sort: "string"
        },
        {
            id: "tablename",
            header: [i18n("Table Name"), { content: "textFilter" }],
            fillspace: true,
            sort: "string"
        },
        {
            id: "fieldname",
            header: [i18n("Field Name"), { content: "textFilter" }],
            fillspace: true,
            sort: "string"
        },
        {
            id: "olddata",
            header: [i18n("Old Data"), { content: "textFilter" }],
            fillspace: true,
            sort: "string"
        },
        {
            id: "newdata",
            header: [i18n("New Data"), { content: "textFilter" }],
            fillspace: true,
            sort: "string"
        },
        {
            id: "iduser",
            header: [i18n("User"), { content: "textFilter" }],
            fillspace: true,
            sort: "string"
        },
        {
            id: "dtcreated",
            header: i18n("Created date"),
            fillspace: true,
            format: (value) => { return moment(value).format("DD/MM/YYYY") },
            sort: "date"
        },
        {
            id: "dtupdated",
            header: i18n("Last update"),
            fillspace: true,
            format: (value) => { return moment(value).format("DD/MM/YYYY") },
            sort: "date"
        }
    ];
    
    dtLog.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtLog", "security.interface");
        }
    };

    const grids = {
        view: 'form',
        id: "form",
        rows: [{
            cols: [
                selectTable,
                logkey,
                dateFilter,
            ]
        }, 
        {
            height: 20
        },
        {
            cols: [
                dtLog
            ]
        }
        ]
    };

    let menu = createSimpleCrudMenu(i18n('Log Data'), dtLog);
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);

    await util.datatableColumsGet('dtLog', "security.logdata");
}

function createSimpleCrudMenu(title, dtLog) {
    let menu = WebixBuildReponsiveTopMenu(title, [{
        id: "btnSearch",
        icon: "fas fa-search",
        label: i18n('Search'),
        click: async () => {
            validateDate();
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
        
        if (startdate != null) { 
            if (enddate != null) { 
                searchLogByFilter(); 
            } 
        } else { 
            searchLogByFilter(); 
        }
    }
}

/**
 * Função responsável por pesquisar Log pelo filtro
 */
async function searchLogByFilter() {

    let table = $$('cmbTable').getValue();
    let logkey = $$('txtLogkey').getValue();
    let idDateFilter = $$('idDateFilter').getValue();
    let startdate = moment(idDateFilter.start).format('YYYY-MM-DD') == 'Invalid date' ? moment().format('YYYY-MM-DD') : moment(idDateFilter.start).format('YYYY-MM-DD');
    let enddate = moment(idDateFilter.end).format('YYYY-MM-DD') == 'Invalid date' ? moment().format('YYYY-MM-DD') : moment(idDateFilter.end).format('YYYY-MM-DD');

    console.log(table, logkey, startdate, enddate)

    // Pesquisando no banco mediante os filtros.

    let resultLog = await App.api.ormDbFindLogdata({
        table: table == "" || !table ? 'All' : table,
        logkey: logkey,
        startdate: startdate ? startdate : null,
        enddate: enddate ? enddate : null
    })
    
    $$('dtLog').clearAll();

    if (resultLog.data.length > 0) {
        $$('dtLog').parse(resultLog.data, "json");
    } else {
        webix.message({ text: i18n('No results were found for this search.') });
    }

}

async function getUnique(arr, comp) {

    const unique = arr
        .map(e => e[comp])

        // store the keys of the unique objects
        .map((e, i, final) => final.indexOf(e) === i && i)

        // eliminate the dead keys & store unique objects
        .filter(e => arr[e]).map(e => arr[e]);

    return unique;
}