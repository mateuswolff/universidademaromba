import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixDatatable, WebixBuildReponsiveTopMenu, WebixInputSelect, WebixCrudDatatable, WebixCrudAddButton } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

import * as screenPcpAllocation from "../components/screenPcpAllocation.js";

import * as modalProductionOrderCreate from '../extra/_modalProductionOrderCreate.js';

let allAllocatedRawMaterials = [];
let allOrderSecondary = [];

export async function showScreen(event) {

    let dtscheduledOrder = new WebixDatatable("dtscheduledOrder");
    dtscheduledOrder.select = false;
    dtscheduledOrder.scrollX = false;


    let fieldOrdersSequence = async () => {

        let idequipment = $$('cmbEquipmentsSequence').getValue();

        $$('dtscheduledOrder').clearAll();

        allscheduledOrder = await App.api.ormDbGetBuffer({ idequipment: idequipment });

        if (allscheduledOrder.data.length > 0) {

            for (let i = 0; i < allscheduledOrder.data.length; i++) {

                if (allscheduledOrder.data[i].equipmentscheduledtype == 'CUT') {


                    // Number Cutting Calculate and LeftOver
                    let so = allscheduledOrder.data[i].lengthm;

                    if (allscheduledOrder.data[i].lengthm < allscheduledOrder.data[i].lengthrm)
                        so = parseFloat(allscheduledOrder.data[i].lengthm) + 3;

                    //let so = parseFloat($$('dtscheduledOrder').getSelectedItem().lengthm) + 3;  // Sequence Order
                    let rm = allscheduledOrder.data[i].lengthrm;                                                       // Raw Material
                    let ct = parseInt(rm / so);                                                 // Cutting Tubes Number
                    let leftOver = rm - (so * ct);                                              // LeftOver

                    if (leftOver)
                        allscheduledOrder.data[i].leftover = leftOver.toFixed(2);

                    let totalPieces = 0;

                    if (allscheduledOrder.data[i].sumpiecesallocated) {
                        totalPieces = ct * allscheduledOrder.data[i].sumpiecesallocated;
                        allscheduledOrder.data[i].expectedpieces = totalPieces
                    }
                    else if (allscheduledOrder.data[i].sumallocation) {
                        let aux = await util.calcWeightParts(allscheduledOrder.data[i].idrawmaterial, 'piecies', allscheduledOrder.data[i].sumallocation);

                        totalPieces = ct * aux
                        allscheduledOrder.data[i].expectedpieces = totalPieces
                    }

                }
                else {
                    let aux = await util.calcWeightParts(allscheduledOrder.data[i].idmaterial, 'piecies', allscheduledOrder.data[i].weight);
                    allscheduledOrder.data[i].expectedpieces = aux ? aux : null
                }
            }

            $$('dtscheduledOrder').parse(allscheduledOrder.data, "json");
        } else {
            webix.message({ text: i18n('No results were found for this search.') });
        }

        await util.loading("none");
    }

    /* Equipments */
    let allEquipment = await App.api.ormDbFind('equipment', { status: true });
    allEquipment.data.sort(function (a, b) {
        if (a.description < b.description) return -1;
        if (a.description > b.description) return 1;
        return 0;
    });
    let oItem = {
        id: "-",
        description: i18n("All")
    };
    allEquipment.data.unshift(oItem);

    let equipments = new WebixInputSelect('equipmentsSequence', i18n('Equipments'), allEquipment.data, {
        template: function (obj) {
            return obj.description;
        },
        "onChange": fieldOrdersSequence
    });

    /* Sequence Order */
    let titlescheduledOrder = ({
        view: "label",
        label: i18n("Orders"),
        inputWidth: 100,
        align: "left"
    });

    let allscheduledOrder = "";

    dtscheduledOrder.on = {
        "onItemClick": async function () {

        }
    };

    function status(value, obj) {
        if (obj.status) return "row-marked";
        return "";
    }

    dtscheduledOrder.columns = [
        { id: "status", header: "", width: 35, css: "center", template: "{common.checkbox()}", cssFormat: status },
        {
            id: "idordermes",
            header: [i18n("Order MES"), { content: "textFilter" }],
            fillspace: true,
            sort: "int", cssFormat: status
        },
        {
            id: "idordersap",
            header: [i18n("Order SAP"), { content: "textFilter" }],
            sort: "int",
            fillspace: true, cssFormat: status
        },
        {
            id: "material",
            header: [i18n("Material to Produce"), { content: "textFilter" }],
            sort: "string",
            fillspace: true, cssFormat: status
        },
        {
            id: "rawmaterial",
            header: [i18n("Raw Material"), { content: "textFilter" }],
            sort: "string",
            fillspace: true, cssFormat: status
        },
        {
            id: "equipmentscheduled",
            header: [i18n("Equipment Scheduled"), { content: "textFilter" }],
            sort: "string",
            fillspace: true, cssFormat: status
        },
        {
            id: "equipmentexpected",
            header: [i18n("Equipment Expected"), { content: "textFilter" }],
            sort: "string",
            fillspace: true, cssFormat: status
        },
        {
            id: "weight",
            header: [i18n("Expected Weight"), { content: "textFilter" }],
            sort: "int",
            fillspace: true, cssFormat: status
        },
        {
            id: "expectedpieces",
            header: [i18n("Expected Pieces"), { content: "textFilter" }],
            sort: "int",
            fillspace: true, cssFormat: status,
        },
        {
            id: "leftover",
            header: [i18n("Left Over"), { content: "textFilter" }],
            sort: "int",
            fillspace: true, cssFormat: status,
        },
        {
            id: "allocatedweight",
            header: [i18n("Allocated Weight"), { content: "textFilter" }],
            sort: "int",
            fillspace: true, cssFormat: status
        },
        {
            id: "statusallocation",
            header: [i18n("Status"),
            { content: "textFilter" }],
            sort: "string",
            width: 55,
            template: (item) => (item.statusallocation === "0") ? `<div class='red'></div>` : `<div class='green'></div>`
        },
        {
            id: "numberPlannedHours",
            header: [i18n("Hours"), { content: "textFilter" }],
            sort: "string",
            fillspace: true, cssFormat: status
        },
    ];

    dtscheduledOrder.checkboxRefresh = true;

    dtscheduledOrder.on = {
        "onItemClick": async function () {

        },
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtscheduledOrder", event);
        }
    };

    let equipmentsToProgram = new WebixInputSelect('equipmentsToProgram', i18n('Equipments'), allEquipment.data, {
        template: function (obj) {
            return obj.description;
        }
    });

    const grids = {
        view: 'form',
        minWidth: 800,
        id: "sequence",
        rows: [
            {
                cols: [
                    equipments,
                ]
            },
            titlescheduledOrder,
            {
                cols: [
                    dtscheduledOrder,
                ]
            },
            {
                cols: [
                    new WebixCrudAddButton('allocation', i18n('Allocation'), async () => {

                        let selected = $$('dtscheduledOrder').serialize().filter(x => x.status == 1);
                        let equipmentSelected = $$('cmbEquipmentsSequence').getValue();

                        if (selected.length > 0 && equipmentSelected != "")
                            await screenPcpAllocation.showScreen(null, selected, equipmentSelected);
                        else
                            webix.message(i18n('Please, select an Equipment and an Order to Allocate!'))

                    }, { height: 80 }),
                    new WebixCrudAddButton('program', i18n('To Program'), async () => {

                        let selected = $$('dtscheduledOrder').serialize().filter(x => x.status == 1);

                        if (selected.length > 0) {
                            let window = webix.ui({
                                view: "window",
                                height: 400,
                                width: 380,
                                modal: true,
                                position: "center",
                                head: i18n('Chose an equipment to Program'),
                                body: {
                                    view: "form",
                                    elements: [
                                        equipmentsToProgram,
                                        {
                                            cols: [
                                                {
                                                    view: "button", label: i18n('Cancel'), click: async function () {
                                                        window.close();
                                                    }
                                                },
                                                {
                                                    view: "button", label: "Ok", click: async function () {

                                                        let equipmentSelected = $$('cmbEquipmentsToProgram').getValue();

                                                        if(equipmentSelected != "" && equipmentSelected != null){
                                                            let obj = {
                                                                equipmentSelected: equipmentSelected,
                                                                iduser: localStorage.getItem('login')
                                                            }
    
                                                            let result = await App.api.programOrders(selected, obj);
    
                                                            if (result.success) {
                                                                webix.message(i18n('Saved successfully!'));
                                                                window.close();
                                                                fieldOrdersSequence();
                                                            }
                                                        }
                                                        else {
                                                            webix.message(i18n('Please select an equipment!'))
                                                        }

                                                    }
                                                }
                                            ]

                                        }
                                    ]
                                }
                            });

                            window.show();
                        }
                        else {
                            webix.message(i18n('Please, select an order to Program!'))
                        }

                    }, { height: 80 }),

                ]
            }
        ],
    }

    let menu = createSimpleCrudMenu(i18n('Buffer'));
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);

    await util.datatableColumsGet('dtscheduledOrder', event);

}

function createSimpleCrudMenu(title) {

    let menu = WebixBuildReponsiveTopMenu(title, [
        {
            id: "btnSave",
            icon: "fas fa-plus-square",
            label: i18n("Create a Production Order"),
            click: async () => {
                let orderCreated = await modalProductionOrderCreate.showModal(null, 'buffer', null, null);
            }
        }
    ]);

    return menu;
}