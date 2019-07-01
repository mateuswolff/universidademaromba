import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixDatatable, WebixInputSelect, WebixBuildReponsiveTopMenu } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

import * as screenPcpBuffer from "../components/screenPcpBuffer.js";

let allocation = [];

export async function showScreen(event, orders = null, equipment = null) {

    let dtscheduled = new WebixDatatable("dtscheduled");

    let dtMaterialAllocated = new WebixDatatable("dtMaterialAllocated");

    let dtDefaultRawMaterial = new WebixDatatable("dtDefaultRawMaterial");

    let dtRawMaterial = new WebixDatatable("dtRawMaterial");

    //let dtSearchMaterial = new WebixToolbar();
    //dtSearchMaterial.id = "dtSearchMaterial";

    let allscheduledOrder = {};
    let allOrdersAllocatedNotId;
    let allOrdersAllocated;
    let idmaterial;
    let idrawmaterial;
    let rawmaterial;
    let allRawLots;
    let allDefaultLots;
    let idMES;
    let idequipment;

    let allEquipment = await App.api.ormDbFind('equipment', { status: true });
    allEquipment.data.sort(function (a, b) {
        if (a.description < b.description) return -1;
        if (a.description > b.description) return 1;
        return 0;
    });

    let allLots = await App.api.ormDbFindLots();
    let allMaterials = await App.api.ormDbFind('material', { status: true });

    let fieldOrdersSequence = async () => {

        idequipment = equipment ? equipment : idequipment = $$('cmbEquipaments').getValue();

        if (orders && equipment)
            allscheduledOrder.data = orders
        else
            allscheduledOrder = await App.api.ormDbLotscheduledOrders({ idequipment: idequipment });

        $$('dtscheduled').clearAll();

        if (allscheduledOrder.data.length > 0) {

            for (let i = 0; i < allscheduledOrder.data.length; i++) {
                let item = allscheduledOrder.data[i];
                let so = parseFloat(item.lengthm) + 3;  // Sequence Order
                let rm = item.lengthrm;                 // Raw Material
                let ct = parseInt(rm / so);             // Cutting Tubes Number
                let leftOver = (rm - (so * ct));
                item.leftOver = leftOver == 0 ? '0%' : (leftOver / rm) * 100 + "%";
            }

            $$('dtscheduled').parse(allscheduledOrder.data, "json");
        } else {
            webix.message(i18n('No results were found for this search.'));
        }

    }

    let alloc = async (item) => {

        let orderSelected = $$("dtscheduled").getSelectedItem();

        let steelOptions = await App.api.ormDbFind('steelsimilarity', { steelfrom: orderSelected.steelrm });
        steelOptions = steelOptions.data;

        let steel = item.steelm;

        let index = steelOptions.findIndex(elem => elem.steelto == steel);

        if (index == -1) {
            webix.message(i18n('The raw material steel is not similar to the order steel'));
            return;
        }

        item.idcallocation = 'A'

        let defaultRawMaterial = $$('dtDefaultRawMaterial').getSelectedItem();
        let rawmaterial = $$('dtRawMaterial').getSelectedItem();
        if (defaultRawMaterial) {

            let running = false

            if (allocation.length === 0)
                running = true

            for (let i = 0; i < allOrdersAllocatedNotId.data.length; i++) {
                if (item.idorder === allOrdersAllocatedNotId.data[i].idorder) {
                    webix.message(i18n('You already allocated this lot'));
                    return
                }
            }
            for (let i = 0; i < allocation.length; i++) {
                if (item.idrun === allocation[i].idrun)
                    running = true
                else
                    running = false
            }

            if (running) {
                $$('dtDefaultRawMaterial').clearAll();

                let orderMes = $$('dtscheduled').getSelectedItem().idordermes;
                defaultRawMaterial.idorder = orderMes;

                $$('dtDefaultRawMaterial').parse(allDefaultLots, "json");
                await App.api.ormDbCreate('allocationshistory', {
                    idorder: item.idorder,
                    idlot: item.idlot,
                    idcallocation: item.idcallocation,
                    iduser: item.iduser
                })
                allocation.push(item);
                $$('dtMaterialAllocated').clearAll();
                $$('dtMaterialAllocated').parse(allocation, "json");
            } else {
                webix.message(i18n('You can not select a lot with diferent running'));
            }

        } else {
            let orderMes = $$('dtscheduled').getSelectedItem();

            if (orderMes) {

                let running = false

                if (allocation.length === 0)
                    running = true

                for (let i = 0; i < allOrdersAllocatedNotId.data.length; i++) {
                    if (item.idorder === allOrdersAllocatedNotId.data[i].idorder) {
                        webix.message(i18n('You already allocated this lot'));
                        return
                    }
                }
                for (let i = 0; i < allocation.length; i++) {
                    if (item.idrun === allocation[i].idrun)
                        running = true
                    else
                        running = false
                }

                if (running) {
                    let orderMes = $$('dtscheduled').getSelectedItem().idordermes;
                    rawmaterial.idorder = orderMes;

                    $$('dtRawMaterial').clearAll();
                    $$('dtRawMaterial').parse(allRawLots, "json");
                    allocation.push(item);
                    await App.api.ormDbCreate('allocationshistory', {
                        idorder: item.idorder,
                        idlot: item.idlot,
                        idcallocation: item.idcallocation,
                        iduser: item.iduser
                    })
                    $$('dtMaterialAllocated').clearAll();
                    $$('dtMaterialAllocated').parse(allocation, "json");
                } else {
                    webix.message(i18n('You can not select a lot with diferent running'));
                }

            } else {
                webix.message(i18n('An scheduled order item must be selected'));
            }

            // rawmaterial.defineProperty(defaultRawMaterial, idorder,
            //     rawmaterial.getOwnPropertyDescriptor(defaultRawMaterial, idordermes));
            // delete defaultRawMaterial[idordermes];
        }
    }

    let deallocate = async (item) => {

        let orderSecondary = await App.api.ormDbFind('order', { idorderplanned: item.idorder })

        if (orderSecondary.data.length > 0) {
            webix.message(i18n('You need to remove the secondary order before deallocate! '));
        }
        else {
            item.idcallocation = 'D'
            let index = allocation.indexOf(item);

            await App.api.ormDbCreate('allocationshistory', {
                idorder: item.idorder,
                idlot: item.idlot,
                idcallocation: item.idcallocation,
                iduser: item.iduser
            })

            if (allocation.length === 1) {
                allocation[1] = { order: allocation[0].idorder } //, iduser: localStorage.getItem('login') }
            }
            if (index != -1) {
                allocation.splice(index, 1);
            }

            let rawmaterial = $$('dtMaterialAllocated').getSelectedItem();
            let orderMes = '';

            for (let i = 0; i < allDefaultLots.data.length; i++) {
                if (allDefaultLots.data[i].idorder === rawmaterial.idorder
                    && allDefaultLots.data[i].idlot === rawmaterial.idlot)
                    allDefaultLots.data[i].idorder = orderMes;
            }

            for (let i = 0; i < allLots.data.length; i++) {
                if (allLots.data[i].idorder === rawmaterial.idorder)
                    allLots.data[i].idorder = orderMes;
            }

            $$('dtDefaultRawMaterial').clearAll();
            $$('dtDefaultRawMaterial').parse(allDefaultLots, "json");

            $$('dtRawMaterial').clearAll();
            $$('dtRawMaterial').parse(allRawLots, "json");

            $$('dtMaterialAllocated').clearAll();
            $$('dtMaterialAllocated').parse(allOrdersAllocated, "json");
        }
    }

    let searchMaterial = async (item) => {
        rawmaterial = item;
        idrawmaterial = $$('dtscheduled').getSelectedItem().idrawmaterial.toString();
        idmaterial = $$('dtscheduled').getSelectedItem().idmaterial.toString();
        allRawLots = await App.api.ormDbRawMaterialAllocation({ rawmaterial: rawmaterial, idrawmaterial: idrawmaterial, idmaterial: idmaterial });
        allOrdersAllocatedNotId = await App.api.ormDbFind('allocation');

        for (let i = 0; i < allOrdersAllocatedNotId.data.length; i++) {
            for (let j = 0; j < allRawLots.data.length; j++) {
                if (allOrdersAllocatedNotId.data[i].idlot === allRawLots.data[j].idlot)
                    allRawLots.data[j].idorder = allOrdersAllocatedNotId.data[i].idorder
            }
        }

        for (let i = 0; i < allRawLots.data.length; i++) {
            allRawLots.data[i].case = 'Raw Material';
            allRawLots.data[i].standardmaterialidentifier = false;
            allRawLots.data[i].iduser = localStorage.getItem('login');
            let parts = await util.calcWeightPartsTwo(
                rawmaterial, idrawmaterial, idmaterial,
                "partsPackages", allRawLots.data[i].weight);
            allRawLots.data[i].pieces = parts;
        }
        if (allRawLots.data.length > 0) {
            $$('dtRawMaterial').parse(allRawLots.data, "json");
        } else {
            webix.message(i18n('No results were found for this search.'));
        }

        $$('dtRawMaterial').clearAll();
        $$('dtRawMaterial').parse(allRawLots, "json");

    }

    let equip = new WebixInputSelect('equipaments', i18n('Equipment'), allEquipment.data, {
        value: equipment ? equipment : "",
        template: function (obj) {
            return obj.description;
        },
        "onChange": fieldOrdersSequence
    });



    dtscheduled.on = {
        "onItemClick": async () => {
            idrawmaterial = $$('dtscheduled').getSelectedItem().idrawmaterial.toString();
            allDefaultLots = await App.api.ormDbDefaultRawMaterialAllocation({ idrawmaterial: idrawmaterial });
            idMES = $$('dtscheduled').getSelectedItem().idordermes;
            allOrdersAllocated = await App.api.ormDbGetAllocation({ idorder: idMES });
            allOrdersAllocatedNotId = await App.api.ormDbFind('allocation');

            for (let i = 0; i < allOrdersAllocatedNotId.data.length; i++) {
                for (let j = 0; j < allDefaultLots.data.length; j++) {
                    if (allOrdersAllocatedNotId.data[i].idlot === allDefaultLots.data[j].idlot)
                        allDefaultLots.data[j].idorder = allOrdersAllocatedNotId.data[i].idorder
                }
            }

            allocation = [];
            allocation = allOrdersAllocated.data;

            $$('dtMaterialAllocated').clearAll();
            $$('dtMaterialAllocated').parse(allOrdersAllocated.data, "json");

            for (let i = 0; i < allDefaultLots.data.length; i++) {
                allDefaultLots.data[i].case = 'Default Raw Material'
                allDefaultLots.data[i].standardmaterialidentifier = true
                allDefaultLots.data[i].iduser = localStorage.getItem('login')
                let parts = await util.calcWeightParts(
                    allDefaultLots.data[i].idlot,
                    "partsPackages",
                    allDefaultLots.data[i].weight);
                allDefaultLots.data[i].pieces = parts;

            }

            if (allDefaultLots.data.length > 0) {
                $$('dtDefaultRawMaterial').clearAll();
                $$('dtDefaultRawMaterial').parse(allDefaultLots.data, "json");
            }
            else {
                $$('dtDefaultRawMaterial').clearAll();
                $$('dtDefaultRawMaterial').parse();
            }

        },
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtscheduled", event);
        }
    };

    dtscheduled.columns = [
        {
            id: "statusallocation",
            header: [i18n("Status"),
            { content: "textFilter" }],
            sort: "string",
            width: 55,
            template: (item) => (item.statusallocation === "0") ? `<div class='red'></div>` : `<div class='green'></div>`
        },
        {
            id: "idordersap",
            header: [i18n("Order SAP"),
            { content: "numberFilter" }],
            sort: "int",
            width: 100
        },
        {
            id: "idordermes",
            header: [i18n("Order MES"),
            { content: "numberFilter" }],
            sort: "int",
            width: 70
        },
        {
            id: "material",
            header: [i18n("Material to Produce"),
            { content: "textFilter" }],
            sort: "string",
            width: 220
        },
        {
            id: "rawmaterial",
            header: [i18n("Default Raw Material"),
            { content: "textFilter" }],
            sort: "string",
            width: 180
        },
        {
            id: "requestdate",
            header: [i18n("Date"),
            { content: "textFilter" }],
            sort: "string",
            format: (item) => {
                return moment(item).format('DD/MM/YYYY');
            },
            width: 100
        },
        {
            id: "widthm",
            header: [i18n("Width"),
            { content: "numberFilter" }],
            sort: "int"
        },
        {
            id: "lengthm",
            header: [i18n("Length"),
            { content: "numberFilter" }],
            sort: "int"
        },
        {
            id: "thicknessm",
            header: [i18n("Thickness"),
            { content: "numberFilter" }],
            sort: "int"
        },
        {
            id: "diameterm",
            header: [i18n("Diameter"),
            { content: "numberFilter" }],
            sort: "int"
        },
        {
            id: "weight",
            header: [i18n("Weight"),
            { content: "numberFilter" }],
            sort: "int"
        },
        {
            id: "expectedquantity",
            header: [i18n("Num Pec"),
            { content: "numberFilter" }],
            sort: "int"
        },
        {
            id: "saleorder",
            header: [i18n("Sale Order"),
            { content: "textFilter" }],
            sort: "int",
            width: 100,
        },
        {
            id: "saleorderitem",
            header: [i18n("Sale Order Item"),
            { content: "textFilter" }],
            sort: "int",
            width: 100,
        },
        {
            id: "leftOver",
            header: [i18n("leftover"),
            { content: "numberFilter" }],
            sort: "int",
            width: 100,
        }
    ];

    dtMaterialAllocated.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtMaterialAllocated", event);
        }
    }

    dtMaterialAllocated.columns = [
        {
            id: "description",
            header: [i18n("Material"), { content: "textFilter" }],
            sort: "string",
            width: 180
        },
        {
            id: "idlot",
            header: [i18n("Lot"), { content: "numberFilter" }],
            sort: "int",
            width: 80
        },
        {
            id: "saleorder",
            header: [i18n("Sale Order"), { content: "textFilter" }],
            sort: "int",
            width: 100
        },
        {
            id: "saleorderitem",
            header: [i18n("Sale Order Item"), { content: "textFilter" }],
            sort: "int",
            width: 100
        },
        {
            id: "idrun",
            header: [i18n("Heat Number"), { content: "textFilter" }],
            sort: "int",
            width: 100
        },
        {
            id: "weight",
            header: [i18n("Weight"), { content: "numberFilter" }],
            sort: "int",
            width: 80
        },
        {
            id: "pieces",
            header: [i18n("Number of parts"), { content: "numberFilter" }],
            sort: "int",
            width: 80
        },
        {
            id: "case",
            header: [i18n("Material Identifier"), { content: "textFilter" }],
            sort: "string",
            width: 100
        }
    ],

        dtRawMaterial.on = {
            "onItemClick": async () => {
                $$('dtDefaultRawMaterial').clearAll();
                $$('dtDefaultRawMaterial').parse(allDefaultLots, "json");
            },
            "onAfterColumnDrop": function () {
                util.datatableColumsSave("dtRawMaterial", event);
            }
        }

    dtRawMaterial.columns = [
        {
            id: "idorder",
            header: i18n("Order"),
            width: 50
        },
        {
            id: "description",
            header: i18n("Material"),
            width: 220
        },
        {
            id: "idlot",
            header: i18n("Lot"),
            width: 80
        },
        {
            id: "weight",
            header: i18n("Weight"),
            width: 60
        },
        {
            id: "idrun",
            header: i18n("Heat Number"),
            width: 100
        },
        {
            id: "pieces",
            header: i18n("Number of parts"),
            width: 60
        }
    ],

        dtDefaultRawMaterial.on = {
            "onItemClick": async () => {
                $$('dtRawMaterial').clearAll();
                $$('dtRawMaterial').parse(allRawLots, "json");
            },
            "onAfterColumnDrop": function () {
                util.datatableColumsSave("dtDefaultRawMaterial", event);
            }
        }

    dtDefaultRawMaterial.columns = [
        {
            id: "idorder",
            header: i18n("Order"),
            width: 50
        },
        {
            id: "description",
            header: i18n("Material"),
            width: 220
        },
        {
            id: "idlot",
            header: i18n("Lot"),
            width: 80
        },
        {
            id: "weight",
            header: i18n("Weight"),
            width: 60
        },
        {
            id: "idrun",
            header: i18n("Heat Number"),
            width: 100
        },
        {
            id: "pieces",
            header: i18n("Number of parts"),
            width: 60
        }
    ]

    let titlescheduled = ({
        view: "label",
        label: i18n("Orders"),
        inputWidth: 100,
        align: "left"
    })

    let titleRawMaterial = ({
        view: "label",
        label: i18n("Raw Material Allocated"),
        inputWidth: 100,
        align: "left"
    })

    let txtNotscheduled = ({
        view: "label",
        label: i18n("Default Raw Material"),
        inputWidth: 100,
        align: "left"
    })

    let txtRawMaterialNotscheduled = ({
        view: "label",
        label: i18n("Raw Material - Manual Selection"),
        inputWidth: 100,
        align: "right"
    })

    let txtSearch = ({
        view: "label",
        label: i18n("Search"),
        inputWidth: 100,
        align: "left"
    })

    const buttonAlloc = {
        view: "button",
        id: "btnAlloc",
        width: 100,
        click: async () => {
            let grid = $$('dtDefaultRawMaterial')
            let grid2 = $$('dtRawMaterial')

            let item = grid.getSelectedItem();
            let item2 = grid2.getSelectedItem();

            if (item == null && item2 == null) {
                webix.message(i18n('An item must be selected'));
            } else if (item && item2 == null) {
                alloc(item);
            } else if (item == null && item2) {
                alloc(item2);
            }
        },
        value: i18n("To Allocate"),
        align: "center",
    }

    const buttonDesalloc = {
        view: "button",
        width: 100,
        id: "btnDesalloc",
        click: async () => {
            let grid = $$('dtMaterialAllocated');
            let item = grid.getSelectedItem();
            if (item == null) {
                webix.message(i18n('An item must be selected'));
                return;
            } else {
                deallocate(item);
            }
        },
        value: i18n("Deallocate"),
        align: "center",
    }

    let itemSearch = allMaterials.data.map((obj) => {
        return {
            id: obj.id,
            value: obj.description
        }
    });

    let search = {
        view: "form",
        scroll: false,
        label: i18n('Search'),
        id: "searchMaterial",
        rows: [
            {
                cols: [
                    {
                        view: "label",
                        label: i18n("Search"),
                        width: 50
                    }, {
                        view: "text",
                        name: "search",
                        id: "search",
                        width: 180,
                    },
                    {
                        view: "button",
                        type: "icon",
                        id: "btnSearch",
                        icon: "fas fa-search",
                        width: 30,
                        on: {
                            onItemClick: () => {
                                let newV = $$('searchMaterial').elements.search.getValue()
                                if (newV != "") {
                                    if (idequipment != undefined && idrawmaterial != undefined) {
                                        searchMaterial(newV.toUpperCase());
                                    } else {
                                        webix.message(i18n('An equipment or scheduled order must be selected'));
                                    }
                                }
                            }
                        },
                    },
                ]
            }
        ]
    };

    let grids = {
        view: 'form',
        id: "grids",
        minWidth: 800,
        rows: [
            orders && equipment ? { hidden: true } : equip,
            {
                cols: [
                    titlescheduled,
                    titleRawMaterial
                ]
            },
            {
                cols: [
                    dtscheduled,
                    dtMaterialAllocated,
                ]
            },
            {
                cols: [
                    {},
                    buttonDesalloc,
                    {},
                ],
            },
            {
                cols: [
                    txtNotscheduled,
                    {},
                    search,
                    txtRawMaterialNotscheduled
                ]
            },

            {
                cols: [
                    dtDefaultRawMaterial,
                    dtRawMaterial
                ]
            },
            {
                cols: [
                    {},
                    buttonAlloc,
                    {},
                ],
            }
        ]
    }

    await createDefaultAllocation(i18n('Allocation'), dtMaterialAllocated.id);
    await App.replaceMainContent(grids);

    await util.datatableColumsGet('dtscheduled', event);
    await util.datatableColumsGet('dtMaterialAllocated', event);
    await util.datatableColumsGet('dtDefaultRawMaterial', event);
    await util.datatableColumsGet('dtRawMaterial', event);

    if (orders && equipment) {
        fieldOrdersSequence();
    }
}

async function createDefaultAllocation(title, datatable) {
    let menu = await createFormAllocation(title, datatable);
    App.replaceMainMenu(menu);
}

async function extractSteelFromDescription(item) {
    return item.description.split(" ")[1];
}

async function createFormAllocation(title, datatable) {

    let menu = WebixBuildReponsiveTopMenu(title, [
        {
            id: "btnSave",
            icon: "fas fa-save",
            label: i18n('Save'),
            click: async () => {
                

                let dtable = $$(datatable).serialize();

                let order = null;
                if (dtable[0].idorder) {
                    order = await App.api.ormDbFind('order', { idordermes: dtable[0].idorder })
                    order = order.data[0];
                }
                else {
                    let dtScheduled = $$('dtscheduled').getSelectedItem();

                    order = await App.api.ormDbFind('order', { idordermes: dtScheduled.idordermes })
                    order = order.data[0];
                }

                dtable = dtable.map((obj) => {
                    return {
                        IDRAWMATERIAL: obj.idmaterial,
                        IDLOT: obj.idlot ? ("0000000000" + obj.idlot).slice(-10) : null,
                        LOTWEIGHT: parseFloat(obj.weight).toFixed(3)
                    }
                });

                let result = await App.api.ormDbSaveAllocation({ allocation: $$(datatable).serialize() });

                if (result.success === true) {
                    let operation = '';

                    if (order.idordersap)
                        operation = 'A'
                    else
                        operation = 'C'

                    let statusinterface = await App.api.ormDbFind('interface', {
                        idordermes: order.idordermes,
                        idstatus: {
                            $notIn: ['OK', 'RSD']
                        }
                    });
                    statusinterface = statusinterface.data;

                    let idstatus = statusinterface.length > 0 ? 'BLK' : 'NEW'

                    let interfaceSave = await App.createInterfaceMs01(order, {
                        idinterface: 'MS01',
                        operation: operation,
                        idstatus: idstatus,
                        lot: dtable[0].IDLOT ? dtable : null,
                    });

                    interfaceSave.idordermes = order.idordermes;
                    interfaceSave.idordersap = order.idordersap ? order.idordersap : null
                    let int = await App.api.ormDbCreate('interface', interfaceSave);

                    webix.message(i18n('Saved successfully'));

                    let refresh = $$(datatable).serialize()
                    if (refresh[0].order !== undefined)
                        $$('dtMaterialAllocated').clearAll();

                } else {
                    webix.alert({ title: "ERROR", text: i18n('An error has occurred') });
                }
            }
        },
        {
            id: "btnBack",
            icon: "fas fa-arrow-left",
            label: " " + i18n('Back to Buffer'),
            click: async () => {
                await screenPcpBuffer.showScreen();
            }
        }
    ]);

    return menu;
}