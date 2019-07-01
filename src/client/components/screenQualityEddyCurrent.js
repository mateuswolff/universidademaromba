import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixBuildReponsiveTopMenu, WebixInputText, WebixInputSelect } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

import * as _modalEddyCurrent from '../extra/_modalEddyCurrent.js';

export async function showScreen(event) {

    let allEquipment = await App.api.ormDbFind('equipment', { status: true });
    allEquipment.data.sort(function(a,b) {
        if(a.description < b.description) return -1;
        if(a.description > b.description) return 1;
        return 0;
    });	
    allEquipment.data.push({id: "all", description: i18n("All")})

    let dtEddyCurrent = new WebixCrudDatatable("dtEddyCurrent");

    // Eddy Current
    dtEddyCurrent.columns = [
        {
            id: "idequipment",
            header: [i18n("Equipaments"), { content: "textFilter" }],
            width: 100,
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
            id: "date",
            header: [i18n("Date Reg."), { content: "textFilter" }],
            format: (value) => { return moment(value).format("DD/MM/YYYY HH:mm") },
            width: 150,
            fillspace: true,
            sort: "string"
        },
        {
            id: "diameter",
            header: [i18n("Diameter"), { content: "textFilter" }],
            width: 80,
            fillspace: true,
            sort: "int"
        },
        {
            id: "thickness",
            header: [i18n("thickness"), { content: "textFilter" }],
            width: 80,
            fillspace: true,
            sort: "int"
        },
        {
            id: "phase",
            header: [i18n("Phase"), { content: "textFilter" }],
            width: 80
        },
        {
            id: "frequency",
            header: [i18n("Frequency"), { content: "textFilter" }],
            width: 80,
            fillspace: true,
            sort: "int"
        },
        {
            id: "velocity",
            header: [i18n("Speed"), { content: "textFilter" }],
            width: 50,
            fillspace: true,
            sort: "int"
        },
        {
            id: "sensitivity",
            header: [i18n("Sensitivity"), { content: "textFilter" }],
            width: 80,
            fillspace: true,
            sort: "int"
        },
        {
            id: "iduser",
            header: [i18n("User Resp."), { content: "textFilter" }],
            width: 100,
            fillspace: true,
            sort: "string"
        }
    ];
    dtEddyCurrent.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtEddyCurrent", event);
        }
    };

    const grids = {
        view: 'form',
        minWidth: 800,
        id: "form",
        rows: [{
            cols: [
                new WebixInputSelect('idequipment', i18n('Equipment'), allEquipment.data,
                    {
                        template: function (obj) {
                            return obj.description;
                        }
                    }),
                new WebixInputText('idordermes', i18n('Order')),
                {
                    view: "daterangepicker",
                    editable: true,
                    labelPosition: "top",
                    name: "drpInterval",
                    id: "txdrpInterval",
                    label: i18n('Interval'),
                    value: { start: new Date(), end: webix.Date.add(new Date(), -7, "day") }
                },
            ],
        },
            dtEddyCurrent
        ]
    };

    let menu = createSimpleCrudMenu(i18n('EDDY Current Record'), dtEddyCurrent);
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);

    await util.datatableColumsGet('dtEddyCurrent', event);
}

function createSimpleCrudMenu(title, dtEddyCurrent) {

    let menu = WebixBuildReponsiveTopMenu(title, [
        {
            id: "search",
            label: "Search",
            icon: "fas fa-search",
            click: async () => {
                search();
            }
        },
        {
            id: "btnAdd",
            label: "Add",
            icon: "fas fa-plus",
            click: async () => {
                _modalEddyCurrent.showModal("dtEddyCurrent", 0);
            }
        }, {
            id: "btnRemove",
            icon: "fas fa-trash-alt",
            label: "Remove",
            click: async () => {

                let grid = $$('dtEddyCurrent');
                let item = grid.getSelectedItem();

                if (item == null) {

                    webix.message(i18n('An item must be selected'));
                    return;

                } else {

                    webix.confirm({
                        title: i18n("Do you want to delete this record?"),
                        ok: i18n("Yes! Remove"),
                        cancel: i18n("No! Cancel"),
                        text: `<strong>` + i18n('Equipment') + ` nº </strong> ${item.idequipment} <br>
                    <strong>`+ i18n('OP') + ` nº </strong> ${item.idorder} <br>
                    <strong>`+ i18n('Register Date') + ` nº </strong>` + moment(item.date).format('DD/MM/YYYY') + `<br>`,
                        callback: async function (result) {
                            if (result) {
                                await App.api.ormDbDelete({ "idsequence": item.idsequence }, 'eddycurrent');
                                $$('dtEddyCurrent').clearAll();
                                let filter = { idsequence: null };
                                let allEddyCurrent = await App.api.ormDbEddyCurrent(filter);
                                $$('dtEddyCurrent').parse(allEddyCurrent.data, "json");
                                webix.message(i18n('Item removed successfully'));
                            }
                        }
                    });
                    return;

                }

            }

        }, {
            id: "btnEdit",
            icon: "fas fa-edit",
            label: "Edit",
            click: async () => {

                let grid = $$('dtEddyCurrent');
                let item = grid.getSelectedItem();

                if (item == null) {
                    webix.message(i18n('An item must be selected'));
                    return;
                } else {
                    _modalEddyCurrent.showModal("dtEddyCurrent", item.idsequence);
                    return;
                }

            }

        }]);

    return menu;
}

async function search() {
    let idordermes = $$('form').elements.idordermes.getValue() != "" ? $$('form').elements.idordermes.getValue() : null
    let idequipment = $$('form').elements.idequipment.getValue() != "" ? $$('form').elements.idequipment.getValue() : null
    
    let interval = $$('form').elements.drpInterval.getValue() != "" ? $$('form').elements.drpInterval.getValue() : null;
    let dateInterval = null;

    if (interval){
        let format = webix.Date.dateToStr("%Y%m%d");
        dateInterval = {}
        dateInterval.begin = format(interval.start);
        dateInterval.end = format(interval.end);
    } 


    let filter = { idsequence: null, idordermes: idordermes, idequipment:idequipment, interval: dateInterval };
    let allEddyCurrent = await App.api.ormDbEddyCurrent(filter);
    $$('dtEddyCurrent').clearAll();
    $$('dtEddyCurrent').parse(allEddyCurrent.data);

    if (interval != null && interval.begin && interval.end)
    sql += `and to_char(c.dtcreated :: DATE, 'yyyymmdd') between '${interval.begin}' and  '${interval.end}'`
}