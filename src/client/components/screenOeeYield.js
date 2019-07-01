import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputDate, WebixInputSelect, WebixBuildReponsiveTopMenu } from "../lib/WebixWrapper.js";
import * as util from "../../lib/Util.js";

export async function showScreen(event) {

    let dtWeightOP = new WebixCrudDatatable("dtWeightOP");

    let dtWeightScrap = new WebixCrudDatatable("dtWeightScrap");

    let start = moment().subtract(30, 'D').format("YYYY/MM/DD");
    let end = moment().format("YYYY/MM/DD");

    let data = await App.api.ormDbKpiYield({
        startdate: start ? start : null,
        enddate: end ? end : null,
        idequipment: null
    });

    let allWeightOP = await App.api.ormDbWeightOP({
        startdate: start ? start : null,
        enddate: end ? end : null,
        idequipment: null
    });

    let allWeightScrap = await App.api.ormDbWeightScrap({
        startdate: start ? start : null,
        enddate: end ? end : null,
        idequipment: null
    });

    let multiple_dataset = await data.data.map(
        (item) => {
            return {
                date: moment(item.date).format('DD/MM'),
                sales: item.sales,
                sales2: item.sales2
            }
        }
    )

    // EQUIPMENT
    let allEquipment = await App.api.ormDbFind('equipment', {status: true});
    allEquipment.data.sort(function(a,b) {
        if(a.description < b.description) return -1;
        if(a.description > b.description) return 1;
        return 0;
    });
    allEquipment.data.unshift({ id: "All", description: i18n('All') });

    let equipments = new WebixInputSelect('equipaments', i18n('Equipment'), allEquipment.data, {
        template: function (obj) {
            return obj.description;
        }
    });

    // DATE
    let dateFilter = new WebixInputDate('period', i18n('Period'),  {
            view: 'daterangepicker',
            id: 'idDateFilter',
        },
        {
            start: moment().subtract(30, 'D').format("YYYY/MM/DD"),
            end: moment().format("YYYY/MM/DD")
        }
    );

    let searchKPI = {
        view: "button",
        id: "btnSearch",
        width: 80,
        click: async () => {
  
            let idequipment = $$('cmbEquipaments').getValue();
            let idDateFilter = $$('idDateFilter').getValue();
            let startdate = moment(idDateFilter.start).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilter.start).format('YYYY-MM-DD');
            let enddate = moment(idDateFilter.end).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilter.end).format('YYYY-MM-DD');
            
            let data = await App.api.ormDbKpiYield({
                startdate: startdate ? startdate : null,
                enddate: enddate ? enddate : null,
                idequipment: idequipment != "Todos" && idequipment != "" ? idequipment : null
            });

            multiple_dataset = await data.data.map(
                (item) => {
                    return {
                        date: moment(item.date).format('DD/MM'),
                        sales: item.sales,
                        sales2: item.sales2
                    }
                }
            )

            let allWeightOP = await App.api.ormDbWeightOP({
                startdate: startdate ? startdate : null,
                enddate: enddate ? enddate : null,
                idequipment: idequipment != "Todos" && idequipment != "" ? idequipment : null
            });

            let allWeightScrap = await App.api.ormDbWeightScrap({
                startdate: startdate ? startdate : null,
                enddate: enddate ? enddate : null,
                idequipment: idequipment != "Todos" && idequipment != "" ? idequipment : null
            });
                
            $$('dtWeightOP').clearAll();
            $$('dtWeightScrap').clearAll();
            $$('kpiGraph').clearAll();

            if(allWeightOP.data.length > 0 ) {
                $$('dtWeightOP').parse(allWeightOP.data, "json");
                $$('dtWeightScrap').parse(allWeightScrap.data, "json");
                $$('kpiGraph').parse(multiple_dataset, "json");
            } else {
                webix.message({text: i18n('No results were found for this search.')});
            }   

        },
        value: i18n('Search'),
    }

    // GRAPH
    let chartKpiQuality = {
        view:"chart",
        container:"chartDiv",
        id: "kpiGraph",
        type:"line",
        xAxis:{
            template:"#date#"
        },
        yAxis:{
            start:1000,
            step: 1000,
            end: 10000
        },
        legend:{
            values:[{text:i18n("Weight OP"),color:"#1293f8"},{text:i18n("Weight Scrap"),color:"#66cc00"}],
            align:"right",
            valign:"middle",
            layout:"y",
            width: 100,
            margin: 8
        },
        series:[
            {
                value:"#sales#",
                item:{
                    borderColor: "#1293f8",
                    color: "#ffffff"
                },
                line:{
                    color:"#1293f8",
                    width:3
                },
                tooltip:{
                    template:"#sales#"
                }
            },
            {
                value:"#sales2#",
                item:{
                    borderColor: "#66cc00",
                    color: "#ffffff"
                },
                line:{
                    color:"#66cc00",
                    width:3
                },
                tooltip:{
                    template:"#sales2#"
                }
            }
        ],
        data:  multiple_dataset
    };

    // Datatable Weight OP
    dtWeightOP.columns = [
        {
            id: "requestdate",
            header: i18n("Date"),
            format: (item) => {
                return moment(item).format('DD/MM/YYYY');
            },
            sort:"string",
            fillspace: true
        },
        {
            id: "idequipmentscheduled",
            header: i18n("Equipment"),
            fillspace: true
        },
        {
            id: "plannedorderquantity",
            header: i18n("Weight"),
            fillspace: true
        }
    ];
    dtWeightOP.data = allWeightOP.data;
    dtWeightOP.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtWeightOP", event);
        }
    };

    // Datatable Weight Scrap
    dtWeightScrap.columns = [
        {
            id: "dtcreated",
            header: i18n("Date"),
            format: (item) => {
                return moment(item).format('DD/MM/YYYY');
            },
            sort:"string",
            fillspace: true
        },
        {
            id: "idequipment",
            header: i18n("Equipment"),
            fillspace: true
        },
        {
            id: "weight",
            header: i18n("Weight"),
            fillspace: true
        }
    ];
    dtWeightScrap.data = allWeightScrap.data;
    dtWeightScrap.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtWeightScrap", event);
        }
    };

    let titleWeightOP = ({
        view: "label",
        label: `<b>`+i18n("Weight OP")+`</b>`,
        inputWidth: 100,
        align: "left"
    });

    let titleWeightScrap = ({
        view: "label",
        label: `<b>`+i18n("Weight Scrap")+`</b>`,
        inputWidth: 100,
        align: "left"
    });

    const grids = {
        view: 'form',
        minWidth: 800,
        id: "form",
        rows: [{
            cols: [
                dateFilter,
                equipments,
                searchKPI
            ]
            },
            chartKpiQuality,
            {
                cols: [
                    titleWeightOP,
                    titleWeightScrap
                ]
            },
            {
                cols: [
                    dtWeightOP,
                    dtWeightScrap
                ]
            }
        ]
    };
    
    let menu = createSimpleCrudMenu(i18n('KPI Quality'));
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);

    await util.datatableColumsGet('dtWeightOP', event);
    await util.datatableColumsGet('dtWeightScrap', event);
}

function createSimpleCrudMenu(title) {
    let menu = WebixBuildReponsiveTopMenu(title, []);
    return menu;
}