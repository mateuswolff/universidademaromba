
import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixBuildReponsiveTopMenu, WebixInputCombo, WebixInputDate } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

import * as ccT0Graph from "./componentsComplement/ccT0Graph.js";
import * as ccT1Graph from "./componentsComplement/ccT1Graph.js";
import * as ccT2Graph from "./componentsComplement/ccT2Graph.js";
import * as ccT3Graph from "./componentsComplement/ccT3Graph.js";
import * as ccOeeGraph from "./componentsComplement/ccOeeGraph.js";


export async function showScreen() {

    // EQUIPMENT
    let allEquipment = await App.api.ormDbFind('equipment', { status: true });
    allEquipment.data.sort(function (a, b) {
        if (a.description < b.description) return -1;
        if (a.description > b.description) return 1;
        return 0;
    });

    let equipments = new WebixInputCombo('equipments', i18n('Equipment'), allEquipment.data, {
        template: function (obj) {
            return obj.description;
        }
    });

    // DATE
    let dateFilter = new WebixInputDate('period', i18n('Period'), {
        view: 'daterangepicker',
        id: 'idDateFilter',
    },
        {
            start: moment().subtract(30, 'D').format("YYYY/MM/DD"),
            end: moment().format("YYYY/MM/DD")
        }
    );

    let body = {
        view: 'form',
        id: "oee",
        elements: [
            {
                cols: [
                    dateFilter,
                    equipments,
                ]
            },
            {
                height: 20
            },
            {
                view: 'tabview',
                id: "tabOee",
                cells: [
                    await ccT0Graph.createT0(),
                    await ccT1Graph.createT1(),
                    await ccT2Graph.createT2(),
                    await ccT3Graph.createT3(),
                    await ccOeeGraph.createOee()
                ]
            }
        ]
    };

    App.replaceMainMenu(WebixBuildReponsiveTopMenu('OEE', [
        {
            id: "btnRefresh",
            icon: "fas fa-search",
            label: ` ` + i18n("Search"),
            click: fillGraph
        }
    ]))
    App.replaceMainContent(body);


}

async function fillGraph() {

    let dateFilter = $$('idDateFilter').getValue();
    let idequipment = $$('cmbEquipments').getValue();

    if (idequipment != "") {

        dateFilter.start = dateFilter.start ? moment(dateFilter.start).subtract(30, 'D').format("YYYY-MM-DD") : moment().subtract(30, 'D').format("YYYY-MM-DD")
        dateFilter.end = dateFilter.end ? moment(dateFilter.end).subtract(30, 'D').format("YYYY-MM-DD") : dateFilter.start

        let filter = {
            initialdate: dateFilter.start,
            finaldate: dateFilter.end,
            idequipment: idequipment
        }
        let oeeData = await App.api.ormDbLoadOee(filter);

        await ccT0Graph.changeData(oeeData);
        await ccT1Graph.changeData(oeeData);
        await ccT2Graph.changeData(oeeData);
        await ccT3Graph.changeData(oeeData);
        await ccOeeGraph.changeData(oeeData);
    }
    else {
        webix.message(i18n('Please, select an Equipment!'))
    }

}



