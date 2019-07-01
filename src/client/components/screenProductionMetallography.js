import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixBuildReponsiveTopMenu, WebixInputText, WebixInputDate, WebixInputSelect } from "../lib/WebixWrapper.js";
import * as util from '../lib/Util.js';

import * as modalMetallography from '../extra/_modalMetallography.js';
import * as permission from '../control/permission.js';

export async function showScreen(event) {

    let dtMetallography = new WebixCrudDatatable("dtMetallography");

    // Type Situtation
    let typeSituation = {
        view: "radio",
        name: "typeSituation",
        value: 'P',
        options: [
            { value: i18n("Pending"), id: 'P' },
            { value: i18n("Realized"), id: 'R' }
        ],
        on: {
            "onChange": validateDate
        }
    };

    // OP
    let op = new WebixInputText("idOp", i18n("OP"), { onBlur: async (obj) => { validateDate(); } });
    
    // Lote
    let lot = new WebixInputText("idLot", i18n("Lot"), { onBlur: async (obj) => { validateDate(); } });

    // Data
    let dateFilter = new WebixInputDate('period', i18n('Period'), {
        view: 'daterangepicker',
        id: 'idDateFilter',
        onChange: validateDate
    },
        {
            start: moment().subtract(30, 'd').format("YYYY/MM/DD"),
            end: moment().format("YYYY/MM/DD")
        }
    );

    // Situation
    let data = [];
    data.push({ id: "All", description: i18n("ALL") });
    data.push({ id: "Approved", description: i18n('Approved') });
    data.push({ id: "Reproved", description: i18n('Reproved') });
    let situation = new WebixInputSelect('situation', i18n('Situation'), data, {
        template: function (obj) {
            return obj.description;
        },
        "onChange": validateDate
    });

    let allMetallography = await App.api.ormDbFind('metallography', {validation: null});
    dtMetallography.data = allMetallography.data;
    dtMetallography.columns = [
        {
            id: "id",
            header: [i18n("ID"), { content: "textFilter" }],
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
            id: "idlot",
            header: [i18n("Lot"), { content: "textFilter" }],
            width: 80,    
            fillspace: true,
            sort: "int"
        },
        {
            id: "validation",
            header: [i18n("Situation"), { content: "textFilter" }],
            format: (value) => { return  (value == "") ? "" : (value == "true") ? i18n('Approved') : i18n('Reproved')},
            width: 80,    
            fillspace: true,
            sort: "string"
        },
        {
            id: "dtcreated",
            header: [i18n("Date"), { content: "textFilter" }],
            format: (value) => { return  value ? moment(value).format("DD/MM/YYYY HH:mm") : '' },
            width: 150,    
            fillspace: true,
            sort: "data"
        },
        {
            id: "iduser",
            header: [i18n("User"), { content: "textFilter" }],
            width: 100,    
            fillspace: true,
            sort: "string"
        }
    ];
    dtMetallography.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtMetallography", event);
        }
    };

    let register = {
        view: "button",
        id: "btnRegister",
        height: 80,
        click: () => {
    
            let grid = $$('dtMetallography');
            let item = grid.getSelectedItem();
    
            if (item == null) {
    
                webix.message(i18n('An Methallography must be selected'));
                return;
    
            } else {
    
                modalMetallography.showModal(item, "dtMetallography");
                return;
    
            }
        },
        value: i18n('Register'),
    }

    const grids = {
        view: 'form',
        minWidth: 800,
        id: "form",
        rows: [{
                cols: [
                    typeSituation
                ]      
            }, {
                cols: [
                    op,
                    lot,
                    dateFilter,
                    situation
                ]      
            }, {
                cols: [
                    dtMetallography
                ]      
            }, {
                cols: [
                    register
                ]
            }
        ]
    };
    
    let menu = createSimpleCrudMenu(i18n('Metallography'), );
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);

    await util.datatableColumsGet('dtMetallography', event);
}

function createSimpleCrudMenu(title) {
    let menu = WebixBuildReponsiveTopMenu(title, []);
    return menu;
}

/**
 * Função validar data
 */
async function validateDate() {
    let idDateFilter = $$('idDateFilter').getValue();
    let startdate = moment(idDateFilter.start).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilter.start).format('YYYY-MM-DD');
    let enddate = moment(idDateFilter.end).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilter.end).format('YYYY-MM-DD');
    if (startdate != null) { if (enddate != null) { searchMetallographyByFilter(); } } else { searchMetallographyByFilter(); }
}

/**
 * Função responsável por pesquisar paradas pelo filtro
 */
async function searchMetallographyByFilter() {

    let item = $$('form').elements.typeSituation.getValue();

    // Verifico se o Usuário tem Permissão para Movimentar
    let buttonStatus = await permission.checkObjectPermission('production.metallography.btnRegister');

    if (buttonStatus) {
        if (item == "P") {
            $$("btnRegister").enable(); 
        } else {
            $$("btnRegister").disable();  
        }
    }  

    let idOp = $$('form').elements.idOp.getValue(); 
    let idLot = $$('form').elements.idLot.getValue(); 
    let idDateFilter = $$('idDateFilter').getValue();
    let startdate = moment(idDateFilter.start).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilter.start).format('YYYY-MM-DD');
    let enddate = moment(idDateFilter.end).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilter.end).format('YYYY-MM-DD');
    let situation = $$('form').elements.situation.getValue(); 

    // Pesquisando no banco mediante os filtros.
    let allMetallography = await App.api.ormDbAllMetallography({
        typeSituation: item,
        idOp: idOp != "" ? idOp : null,
        idLot: idLot != "" ? idLot : null,
        startdate: startdate ? startdate : null,
        enddate: enddate ? enddate : null,
        situation: situation != "All" && situation != "" ? situation == "Approved" ? true : false : null
    });

    $$('dtMetallography').clearAll();

    if (allMetallography.data.length > 0) {
        $$('dtMetallography').parse(allMetallography.data, "json");
    } else {
        webix.alert({ text: i18n('No results were found for this search.') });
    }

}