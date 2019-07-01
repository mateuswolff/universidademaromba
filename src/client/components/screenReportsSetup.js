import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputDate, WebixInputSelect, WebixBuildReponsiveTopMenu, WebixCrudAddButton } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

import * as ccTableReportsSetup from './componentsComplement/ccTableReportsSetup.js';
import * as ccChartSetup from './componentsComplement/ccChartSetup.js';
// import * as ccChartSetup from './screeRe.js';

export async function showScreen(start = null, end = null, equipment = null, event = null) {
   
    /* FILTER */
    let filter = {
        startdate: start ? start : moment().subtract(7, 'd').format("YYYY/MM/DD"),
        enddate: end ? end : moment().format("YYYY/MM/DD"),
        idequipment: equipment ? equipment : null
    };

    let allEquipment = await App.api.ormDbFind('equipment', { status: true });
    allEquipment.data.sort(function (a, b) {
        if (a.description < b.description) return -1;
        if (a.description > b.description) return 1;
        return 0;
    });
    allEquipment.data.unshift({ id: "All", description: i18n('All') });

    let results = await App.api.ormDbReportSetup(filter);

    let accordion = {
        multi: true,
        view: "accordion",
        type: "wide",
        rows: [{
            header: i18n("data"),
            body: await ccTableReportsSetup.create(results.data.table, event)
        }, {
            header: i18n("Graphs"),
            body: await ccChartSetup.create(results.data.chart)
        }]
    };

    const grids = {
        view: 'form',
        minWidth: 800,
        id: "form",
        autoheight: false,
        rows: [{
            height: 30,
            cols: [
                new WebixInputDate('period', i18n('Period'), {
                    view: 'daterangepicker',
                    id: 'iddateFilter',
                    labelPosition: 'left'
                }, {
                        start: filter.startdate,
                        end: filter.enddate
                    }
                ),
                new WebixInputSelect('equipaments', i18n('Equipment'), allEquipment.data, {
                    template: function (obj) {
                        return obj.description;
                    },
                    value: equipment ? equipment : 'All',
                    labelPosition: 'left'
                }),
                {
                    cols: [
                        new WebixCrudAddButton('search', i18n('Search'), () => {
                            let date = $$('iddateFilter').getValue();
                            let equipment = $$('cmbEquipaments').getValue() === 'All' || $$('cmbEquipaments').getValue() === "" ? null : $$('cmbEquipaments').getValue();

                            showScreen(moment(date.start).format('YYYY/MM/DD'), moment(date.end).format('YYYY/MM/DD'), equipment);
                        })
                    ]
                }
            ]
        },
            accordion
        ]
    };


    let menu = createSimpleCrudMenu(i18n('Setup Reports'), null);
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);
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
                filename: i18n("Setup Report") + " " + dateString
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
                filename: i18n("Setup Report") + " " + dateString,
                orientation: "landscape",
                autowidth: true
            });
        }
    }]);

    return menu;
}