import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputDate, WebixInputText, WebixBuildReponsiveTopMenu, WebixInputSelect } from "../lib/WebixWrapper.js";
import { optionsInterface, optionsStatusInterface } from "../components/optionsScreens.js"
import * as util from "../lib/Util.js";

import * as modalXml from '../extra/_modalReadXml.js';

export async function showScreen(event) {

    let dtInterface = new WebixCrudDatatable("dtInterface");

    // Tipo Interface
    optionsInterface.unshift({ id: "All", value: i18n('All') });
    let typeInterface = new WebixInputSelect("interface", i18n("Interface"), optionsInterface, {
        template: function (obj) {
            return obj.value;
        },
        "onChange": validateDate
    })

    // Status Interface
    optionsStatusInterface.unshift({ id: "All", value: i18n('All') });
    let statusInterface = new WebixInputSelect("status", i18n("Status"), optionsStatusInterface, {
        template: function (obj) {
            return obj.value;
        },
        "onChange": validateDate
    })

    // Data
    let dateFilter = new WebixInputDate('period', i18n('Period'), {
        view: 'daterangepicker',
        id: 'idDateFilter',
        onChange: validateDate
    },
        {
            start: moment().subtract(5, 'd').format("YYYY/MM/DD"),
            end: moment().format("YYYY/MM/DD")
        }
    );
    
    let idOrderMES = new WebixInputText("idOrderMES", i18n("Order MES"));
    let idOrderSAP = new WebixInputText("idOrderSAP", i18n("Order SAP"));
    let idLot = new WebixInputText("idLot", i18n("Lot"));

    // Datatable
    dtInterface.columns = [
        {
            id: "id",
            header: [i18n("ID"), { content: "textFilter" }],
            width: 70,
            sort: "int"
        },
        {
            id: "idinterface",
            header: [i18n("Interface"), { content: "textFilter" }],
            width: 65,
            sort: "string"
        },
        {
            id: "idordermes",
            header: [i18n("OP"), { content: "textFilter" }],
            width: 70,
            sort: "int"
        },
        {
            id: "dtcreated",
            header: [i18n("Date"), { content: "dateFilter" }],
            format: (value) => { return moment(value).format("DD/MM/YYYY HH:mm:ss") },
            width: 135,
            sort: "date",
        },
        {
            id: "idstatus",
            header: [i18n("Status"), { content: "textFilter" }],
            width: 50,
            sort: "string"
        },
        {
            id: "messagestatus",
            header: [i18n("Status Message"), { content: "textFilter" }],
            width: 370,
            sort: "string"
        },
        {
            id: "iduser",
            header: [i18n("User"), { content: "textFilter" }],
            width: 65,
            sort: "string"
        },
        {
            id: "view",
            header: i18n("XML"),
            width: 70,
            template: () => {
                return "<div class='webix_el_button'><button class='webixtype_movement'>" + i18n('View') + "</button></div>"
            }
        },
        {
            id: "idordersap",
            header: [i18n("OrderSAP"), { content: "textFilter" }],
            width: 80,
            sort: "string"
        },
        {
            id: "idmaterial",
            header: [i18n("Material"), { content: "textFilter" }],
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
            id: "weight",
            header: [i18n("Weight"), { content: "textFilter" }],
            width: 80,
            sort: "string"
        }
    ];
    dtInterface.onClick = {
        webixtype_movement: async function (ev, id) {
            let data = this.getItem(id, dtInterface);
            await modalXml.showModal(data.messageinterface);
        }
    };
    dtInterface.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtInterface", "security.interface");
        }
    };

    const grids = {
        view: 'form',
        id: "form",
        rows: [{
            cols: [
                typeInterface,
                statusInterface,
                dateFilter,
            ]
        }, {
            cols: [
                idOrderMES,
                idOrderSAP,
                idLot,
            ]
        }, {
            cols: [
                dtInterface
            ]
        }
        ]
    };

    let menu = createSimpleCrudMenu(i18n('Interface'), dtInterface);
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);

    await util.datatableColumsGet('dtInterface', "security.interface");
}

function createSimpleCrudMenu(title, dtInterface) {
    let menu = WebixBuildReponsiveTopMenu(title, [{
        id: "btnResend",
        label: "Resend",
        icon: "fas fa-plus",
        click: async () => {

            let grid = $$('dtInterface');
            let item = grid.getSelectedItem();

            if (item == null) {

                webix.message(i18n('An item must be selected'));
                return;

            } else {

                let value = {
                    "idstatus": "NEW",
                    "messagestatus": null
                };

                webix.confirm({
                    title: i18n("Do you want to resend the interface?"),
                    ok: i18n("Yes! Resend"),
                    cancel: i18n("No! Cancel"),
                    text: `<strong> ${i18n("Interface")} nº </strong> ${item.id}`,
                    callback: async function (result) {
                        if (result) {

                            let sequence = await App.api.ormDbInterfaceSequence();
                            sequence = sequence.data[0].nextval;

                            let messageinterface = item.messageinterface.replace("<SEQUENCE>" + item.id.toString() + "</SEQUENCE>" , "<SEQUENCE>" + sequence + "</SEQUENCE>")

                            result = await App.api.ormDbCreate('interface', {
                                date: new Date(),
                                id: sequence,
                                idinterface: item.idinterface,
                                idordermes: item.idordermes,
                                idstatus: 'NEW',
                                iduser: localStorage.getItem('login'),
                                messageinterface: messageinterface,
                                dtcreated: item.dtcreated,
                                idordersap: item.idordersap ? item.idordersap : null,
                                idlot: item.idlot ? item.idlot : null,
                                idmaterial: item.idmaterial ? item.idmaterial : null,
                                weight: item.weight ? item.weight : null

                            })

                            await App.api.ormDbUpdate({id: item.id}, 'interface', {idstatus: 'RSD', iduser: localStorage.getItem('login')})

                            webix.message(i18n('Resend successfully'));

                            let idInterface = $$('cmbInterface').getValue();
                            let idStatus = $$('cmbStatus').getValue();
                            let idDateFilter = $$('idDateFilter').getValue();
                            let startdate = moment(idDateFilter.start).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilter.start).format('YYYY-MM-DD');
                            let enddate = moment(idDateFilter.end).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilter.end).format('YYYY-MM-DD');
                            let idOrderMES = $$('form').elements.idOrderMES.getValue();
                            let idOrderSAP = $$('form').elements.idOrderSAP.getValue(); 
                            let idLot = $$('form').elements.idLot.getValue();

                            let allInterface = await App.api.ormDbAllInterface({
                                idInterface: idInterface != "All" && idInterface != "" ? idInterface : null,
                                idStatus: idStatus != "All" && idStatus != "" ? idStatus : null,
                                startdate: startdate ? startdate : null,
                                enddate: enddate ? enddate : null,
                                idordermes: idOrderMES ? idOrderMES : null,
                                idordersap: idOrderSAP ? idOrderSAP : null,
                                idlot: idLot ? idLot : null
                            });

                            $$('dtInterface').clearAll();
                            $$('dtInterface').parse(allInterface.data);

                        }
                    }
                });
                return;

            }

        },
    }, {
        id: "btnRefresh",
        icon: "fas fa-redo",
        label: "Refresh",
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
        if (startdate != null) { if (enddate != null) { searchInterfaceByFilter(); } } else { searchInterfaceByFilter(); }
    }
}

/**
 * Função responsável por pesquisar interface pelo filtro
 */
async function searchInterfaceByFilter() {

    let idInterface = $$('cmbInterface').getValue();
    let idStatus = $$('cmbStatus').getValue();
    let idDateFilter = $$('idDateFilter').getValue();
    let startdate = moment(idDateFilter.start).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilter.start).format('YYYY-MM-DD');
    let enddate = moment(idDateFilter.end).format('YYYY-MM-DD') == 'Invalid date' ? null : moment(idDateFilter.end).format('YYYY-MM-DD');
    let idOrderMES = $$('form').elements.idOrderMES.getValue();
    let idOrderSAP = $$('form').elements.idOrderSAP.getValue(); 
    let idLot = $$('form').elements.idLot.getValue(); 


    // Pesquisando no banco mediante os filtros.
    let allInterface = await App.api.ormDbAllInterface({
        idInterface: idInterface != "All" && idInterface != "" ? idInterface : null,
        idStatus: idStatus != "All" && idStatus != "" ? idStatus : null,
        startdate: startdate ? startdate : null,
        enddate: enddate ? enddate : null,
        idordermes: idOrderMES ? idOrderMES : null,
        idordersap: idOrderSAP ? idOrderSAP : null,
        idlot: idLot ? idLot : null
    });

    $$('dtInterface').clearAll();

    if (allInterface.data.length > 0) {
        $$('dtInterface').parse(allInterface, "json");
    } else {
        webix.message({ text: i18n('No results were found for this search.') });
    }

}