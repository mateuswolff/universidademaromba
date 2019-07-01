import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";
import { WebixWindow, WebixDatatable } from "../lib/WebixWrapper.js";

export async function showModal(equipment) {
    let stops = [];
    let details = await App.api.getEquipmentDetail(equipment);

    if (details && details.length == 1)
        details = details[0];

    if (details.idordermes)
        stops = await App.api.ormDbAllStopEquipment({ idequipment: equipment, idorder: details.idordermes });

    let dtStops = new WebixDatatable('dtStops');
    
    dtStops.columns = [
        { id: "stoptype", header: [i18n("Type"), { content: "textFilter" }], width: 100 },
        {
            id: "startdate",
            header: [i18n("Start"), { content: "dateFilter" }],
            format: (value) => { return value ? moment(value).format("DD/MM/YYYY HH:mm") : '' },
            width: 115
        },
        {
            id: "enddate",
            header: [i18n("End"), { content: "dateFilter" }],
            format: (value) => { return value ? moment(value).format("DD/MM/YYYY HH:mm") : '' },
            width: 115
        },
        { id: "stopreasondescription", header: [i18n("Reason"), { content: "selectFilter" }], width: 100 },
        { id: "stopreasondescription", header: [i18n("Type"), { content: "selectFilter" }], width: 100 },
        { id: "letter", header: [i18n("Letter"), { content: "selectFilter" }], width: 80 }
    ];
    dtStops.data = stops.data;

    let stopsByType = await App.api.getTotalStopsByType(equipment);

    let stopsByTypeChart = {
        view: "chart",
        type: "pie",
        value: "#minutes#",
        pieInnerText: "#minutes#",
        shadow: 0,
        legend: {
            width: 300,
            align: "right",
            valign: "middle",
            template: "#reason#",
        },
        data: stopsByType
    }

    // Get last 7 days equipments produtivity
    let productivity = await App.api.ormDbproductivityperequipment({ idequipment: equipment });

    var productivityDataset = productivity.data.map((elem) => {
        let testDate = new Date(elem.date)
        return {
            value: elem.velocity,
            date: ("00" + testDate.getDate()).slice(-2) + '/' + ("00" + testDate.getMonth()).slice(-2)
        }
    })

    let productivityChart = {

        view: "chart",
        type: "bar",
        value: "#value#",
        barWidth: 30,
        radius: 0,
        tooltip: {
            template: "#value#"
        },
        xAxis: {
            template: "#date#",
            title: i18n("Date")
        },
        yAxis: {
            title: i18n("Velocity")
        },
        data: productivityDataset
    }

    var grid = {
        view: "dashboard", id: "grid",
        gridColumns: 5, gridRows: 2,
        cellHeight: 120,
        cells: [
            {
                view: "panel",
                css: "panelBox",
                x: 0, y: 0, dx: 1, dy: 1,
                header: i18n("Urgency"),
                body: {
                    template: "<p class='title'>" + details.urgency ? details.urgency : '-' + "</p>", css: "draft"
                }
            },
            {
                view: "panel",
                css: "panelBox",
                x: 1, y: 0, dx: 1, dy: 1,
                header: i18n("Order"),
                body: {
                    template: "<p class='title'>" + details.idordermes ? details.idordermes : '-' + "</p>", css: "draft"
                }
            },
            {
                view: "panel",
                css: "panelBox",
                x: 2, y: 0, dx: 1, dy: 1,
                header: i18n('Allocated Lots'),
                body: {
                    template: "<p class='title'>" + details.qtd_total_lotes_alocados ? details.qtd_total_lotes_alocados : '-' + "</p>", css: "draft"
                }
            },
            {
                view: "panel",
                css: "panelBox",
                x: 3, y: 0, dx: 1, dy: 1,
                header: i18n("Consumed Lots"),
                body: {
                    template: "<p class='title'>" + details.qtd_lotes_consumidos ? details.qtd_lotes_consumidos : '-' + "</p>", css: "draft"
                }
            },
            {
                view: "panel",
                css: "panelBox",
                x: 4, y: 0, dx: 1, dy: 1,
                header: i18n("Generated Lots"),
                body: {
                    template: "<p class='title'>" + details.qtd_lotes_gerados ? details.qtd_lotes_gerados : '-' + "</p>", css: "draft"
                }
            },
            {
                view: "panel",
                css: "panelBox",
                resize: true,
                x: 0, y: 1, dx: 2, dy: 2,
                header: i18n("Stops for this order"),
                body: dtStops
            },
            {
                view: "panel",
                css: "panelBox",
                resize: true,
                x: 2, y: 1, dx: 3, dy: 4,
                header: i18n("Stops on last 2 days"),
                body: stopsByTypeChart
            },
            {
                view: "panel",
                css: "panelBox",
                resize: true,
                x: 0, y: 3, dx: 2, dy: 2,
                header: i18n("Productivity (last 7 days)"),
                body: productivityChart
            }
        ]
    };

    var toolbar = {
        view: "toolbar", elements: [
            { view: "label", template: details.id + ' - ' + details.description }
        ]
    };

    let modal = new WebixWindow({
        onClosed: (modal) => {
            modal.close();
        }
    });

    modal.body = {
        view: "scrollview",
        body: {
            rows: [
                toolbar,
                grid
            ]
        }
    };

    modal.modal = true;
    modal.fullscreen = true;
    modal.show();
    modal.setTitle(i18n("Equipment Detail"));
}