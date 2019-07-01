import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixDatatable, WebixBuildReponsiveTopMenu, WebixInputSelect, WebixCrudDatatable } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

import * as modalProductionOrderCreate from '../extra/_modalProductionOrderCreate.js';

let allAllocatedRawMaterials = [];
let allOrderSecondary = [];

export async function showScreen(event) {

    let dtscheduledOrder = new WebixDatatable("dtscheduledOrder");
    dtscheduledOrder.select = true;
    dtscheduledOrder.scrollX = false;

    let dtAllocatedRawMaterial = new WebixDatatable("dtAllocatedRawMaterial");
    dtscheduledOrder.select = true;
    dtAllocatedRawMaterial.scrollX = false;

    let dtOrderSecondary = new WebixDatatable("dtOrderSecondary");
    dtscheduledOrder.select = true;
    dtOrderSecondary.scrollX = false;

    let fieldOrdersSequence = async () => {

        let idequipment = $$('cmbEquipmentsSequence').getValue();

        $$('dtscheduledOrder').clearAll();
        $$('dtAllocatedRawMaterial').clearAll();
        $$('dtOrderSecondary').clearAll();

        allscheduledOrder = await App.api.ormDbTubesCuttingPlan({ type: 'sequenceOrder', idequipment: idequipment });

        for (var i = 0; i < allscheduledOrder.data.length; i++) {
            let data = allscheduledOrder.data[i];
            let allPlannedHours = await App.api.ormDbCalcPlannedHours({ "idordermes": data.idordermes});  
            if (allPlannedHours.data[0]) {
                //let value = data.lengthrm / allPlannedHours.data[0].productivityvalue;
                allscheduledOrder.data[i].numberPlannedHours = allPlannedHours.data[0].hours;
                
                allscheduledOrder.data[i].expectedquantity = await util.calcWeightParts( allscheduledOrder.data[i].idmaterial, 'piecies',  allscheduledOrder.data[i].weight);
                
            }
        }

        if (allscheduledOrder.data.length > 0) {
            $$('dtscheduledOrder').parse(allscheduledOrder.data, "json");
        } else {
            webix.message({ text: i18n('No results were found for this search.') });
        }

        await util.loading("none");
    }

    /* Equipments */
    let allEquipment = await App.api.ormDbFind('equipment', { status: true, idtype: 'CUT' });
    allEquipment.data.sort(function (a, b) {
        if (a.description < b.description) return -1;
        if (a.description > b.description) return 1;
        return 0;
    });

    let equipments = new WebixInputSelect('equipmentsSequence', i18n('Equipments'), allEquipment.data, {
        template: function (obj) {
            return obj.description;
        },
        "onChange": fieldOrdersSequence
    });

    /* Sequence Order */
    let titlescheduledOrder = ({
        view: "label",
        label: i18n("Sequence Order"),
        inputWidth: 100,
        align: "left"
    });

    let allscheduledOrder = "";

    dtscheduledOrder.on = {
        "onItemClick": async function () {

            $$('dtAllocatedRawMaterial').clearAll();
            $$('dtOrderSecondary').clearAll();

            allOrderSecondary.data = [];

            let id = $$('dtscheduledOrder').getSelectedItem().idordermes;
            
            allAllocatedRawMaterials = await App.api.ormDbAllocatedRawMaterial({
                idorder: id
            });

            if (allAllocatedRawMaterials.data.length != 0) {

                for (let item of allAllocatedRawMaterials.data) {
                    // Number Cutting Calculate and LeftOver
                    let so = parseFloat($$('dtscheduledOrder').getSelectedItem().lengthm) + 3;  // Sequence Order
                    let rm = item.length;                                                       // Raw Material
                    let ct = parseInt(rm / so);                                                 // Cutting Tubes Number
                    let leftOver = rm - (so * ct);                                              // LeftOver

                    item.material = item.description;
                    item.number = ct;
                    item.leftover = leftOver;

                }

                $$('dtAllocatedRawMaterial').parse(allAllocatedRawMaterials, "json");

                allOrderSecondary = await App.api.ormDbTubesCuttingPlan({ type: 'OrderPlanned', idorderplanned: id });

                if (allOrderSecondary.data.length > 0) {
                    $$('dtOrderSecondary').parse(allOrderSecondary, "json");
                }
            }
        }
    };

    dtscheduledOrder.columns = [
        {
            id: "sequence",
            header: i18n("Sequence"),
            width: 60
        },
        {
            id: "idordermes",
            header: i18n("Order MES"),
            width: 80
        },
        {
            id: "idordersap",
            header: i18n("Order SAP"),
            width: 80
        },
        {
            id: "material",
            header: i18n("Material to Produce"),
            width: 220
        },
        {
            id: "rawmaterial",
            header: i18n("Raw Material"),
            width: 220
        },
        {
            id: "numberPlannedHours",
            header: i18n("Number Planned Hours"),
            fillspace: true
        },
        {
            id: "lengthrm",
            header: i18n("Length"),
            width: 90
        },
        {
            id: "thicknessrm",
            header: i18n("Thickness"),
            width: 70
        },
        {
            id: "diameterrm",
            header: i18n("Diameter"),
            width: 70
        },
        {
            id: "weight",
            header: i18n("Weight"),
            width: 70
        },
        {
            id: "expectedquantity",
            header: i18n("Parts Numbers"),
            fillspace: true
        }
    ];
    dtscheduledOrder.on = {
        "onItemClick": async function () {

            $$('dtAllocatedRawMaterial').clearAll();
            $$('dtOrderSecondary').clearAll();

            allOrderSecondary.data = [];

            let id = $$('dtscheduledOrder').getSelectedItem().idordermes;

            allAllocatedRawMaterials = await App.api.ormDbAllocatedRawMaterial({
                idorder: id
            });

            if (allAllocatedRawMaterials.data.length != 0) {

                for (let item of allAllocatedRawMaterials.data) {
                    // Number Cutting Calculate and LeftOver
                    let so = parseFloat($$('dtscheduledOrder').getSelectedItem().lengthm) + 3;  // Sequence Order
                    let rm = item.length;                                                       // Raw Material
                    let ct = parseInt(rm / so);                                                 // Cutting Tubes Number
                    let leftOver = rm - (so * ct);                                              // LeftOver

                    item.material = item.description;
                    item.number = ct;
                    item.leftover = leftOver;

                }

                $$('dtAllocatedRawMaterial').parse(allAllocatedRawMaterials, "json");

                allOrderSecondary = await App.api.ormDbTubesCuttingPlan({ type: 'OrderPlanned', idorderplanned: id });

                if (allOrderSecondary.data.length > 0) {
                    $$('dtOrderSecondary').parse(allOrderSecondary, "json");
                }
            }
        },
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtscheduledOrder", event);
        }
    };

    let titleAllocatedRawMaterial = ({
        view: "label",
        label: i18n("Allocated Raw Material"),
        inputWidth: 100,
        align: "left"
    });

    dtAllocatedRawMaterial.columns = [
        {
            id: "material",
            header: i18n("Material"),
            width: 220
        },
        {
            id: "id",
            header: i18n("Lot"),
            fillspace: true
        },
        {
            id: "weight",
            header: i18n("Weight"),
            fillspace: true
        },
        {
            id: "length",
            header: i18n("length"),
            fillspace: true
        },
        {
            id: "number",
            header: i18n("Number of Pieces"),
            fillspace: true
        },
        {
            id: "leftover",
            header: i18n("Leftover"),
            fillspace: true
        },
    ];
    dtAllocatedRawMaterial.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtAllocatedRawMaterial", event);
        }
    };

    let titleOrderSecondary = ({
        view: "label",
        label: i18n("Order Secondary"),
        inputWidth: 100,
        align: "left"
    });

    dtOrderSecondary.columns = [
        {
            id: "idordermes",
            header: i18n("Order MES"),
            fillspace: true
        },
        {
            id: "idordersap",
            header: i18n("Order SAP"),
            fillspace: true
        },
        {
            id: "material",
            header: i18n("Material to Produce"),
            width: 220
        },
        {
            id: "requestdate",
            header: i18n("Request Date"),
            fillspace: true
        },
        {
            id: "lengthm",
            header: i18n("Length"),
            fillspace: true
        },
        {
            id: "weight",
            header: i18n("Weight"),
            fillspace: true
        },
        {
            id: "expectedquantity",
            header: i18n("Number Parts"),
            fillspace: true
        }
    ];
    dtOrderSecondary.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtOrderSecondary", event);
        }
    };

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
            titleAllocatedRawMaterial,
            {
                cols: [
                    dtAllocatedRawMaterial,
                ]
            },
            titleOrderSecondary,
            {
                height: 200,
                cols: [
                    dtOrderSecondary,
                ]
            }],
    }

    let menu = createSimpleCrudMenu(i18n('Tubes Cutting Plan'));
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);

    await util.datatableColumsGet('dtscheduledOrder', event);
    await util.datatableColumsGet('dtAllocatedRawMaterial', event);
    await util.datatableColumsGet('dtOrderSecondary', event);
}

function createSimpleCrudMenu(title) {

    let menu = WebixBuildReponsiveTopMenu(title, [
        {
            id: "btnSave",
            icon: "fas fa-plus-square",
            label: i18n("Create Second Cut Order"),
            click: async () => {

                let orderItem = $$('dtscheduledOrder').getSelectedItem()
                if (allOrderSecondary.data.length > 0) {
                    webix.message(i18n("You can create just one secondary order by primary order!"))
                }
                else {
                    if (orderItem && allAllocatedRawMaterials.data.length > 0) {
                        let so = parseFloat(orderItem.lengthm) + 3;  // Sequence Order
                        let rm = allAllocatedRawMaterials.data[0].length;                          // Raw Material
                        let ct = parseInt(rm / so);                                                // Cutting Tubes Number
                        let leftOver = rm - (so * ct);                                             // LeftOver

                        let charM = {
                            thickness: orderItem.thicknessm,
                            diameter: orderItem.diameterm,
                            steel: orderItem.steelm,
                            length: leftOver
                        }

                        let smallerMaterials = await App.api.ormDbFindSmallerMaterial(charM)
                        smallerMaterials = smallerMaterials.data

                        if (smallerMaterials.length < 1) {
                            webix.message(i18n("There is no existing material to generate a new order!"))
                        }
                        else {
                            let calc = {
                                leftOver: leftOver,
                                sum: allAllocatedRawMaterials.data[0].sum
                            }

                            let orderCreated = await modalProductionOrderCreate.showModal($$('dtscheduledOrder').getSelectedItem(), 'tubesCuttingPlan', smallerMaterials, calc);
                            if (orderCreated.success) {
                                allOrderSecondary = await App.api.ormDbTubesCuttingPlan({ type: 'OrderPlanned', idorderplanned: orderItem.idordermes });

                                let dtable = $$('dtAllocatedRawMaterial').serialize();

                                let order = orderCreated.data;

                                let weightLeftOver = 0;

                                if (allOrderSecondary.data.length > 0) {
                                    $$('dtOrderSecondary').parse(allOrderSecondary.data, "json");

                                    for (let i = 0; i < dtable.length; i++) {

                                        weightLeftOver = (dtable[i].weight * dtable[i].leftover) / dtable[i].length

                                        //create secondary order allocation
                                        await App.api.ormDbCreate('allocation', {
                                            idorder: order.idordermes,
                                            idlot: dtable[i].id,
                                            standardmaterialidentifier: false,
                                            pieces: dtable[i].pieces,
                                            weight: parseFloat(weightLeftOver).toFixed(3)
                                        });

                                        //update primary order allocation
                                        await App.api.ormDbUpdate({
                                            idorder: dtable[i].idorder,
                                            idlot: dtable[i].id
                                        }, 'allocation', {
                                                weight: parseFloat(dtable[i].weight - weightLeftOver).toFixed(3)
                                            });
                                    }
                                }

                                //Secondary order interface
                                dtable = allAllocatedRawMaterials.data;

                                dtable = dtable.map((obj) => {

                                    weightLeftOver = (obj.weight * obj.leftover) / obj.length

                                    return {
                                        IDRAWMATERIAL: obj.idmaterial,
                                        IDLOT: obj.id ? ("0000000000" + obj.id).slice(-10) : null,
                                        LOTWEIGHT: parseFloat(weightLeftOver).toFixed(3)
                                    }
                                });

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
                                    operation: 'C',
                                    idstatus: idstatus,
                                    lot: dtable
                                });

                                interfaceSave.idordermes = order.idordermes;
                                interfaceSave.idordersap = order.idordersap ? order.idordersap : null

                                //Resending primary order interface
                                let orderprimary = await App.api.ormDbFind('order', { idordermes: allAllocatedRawMaterials.data[0].idorder });
                                orderprimary = orderprimary.data[0];

                                let dtable1 = allAllocatedRawMaterials.data;

                                dtable1 = dtable1.map((obj) => {

                                    weightLeftOver = (obj.weight * obj.leftover) / obj.length

                                    return {
                                        IDRAWMATERIAL: obj.idmaterial,
                                        IDLOT: obj.id ? ("0000000000" + obj.id).slice(-10) : null,
                                        LOTWEIGHT: parseFloat(obj.weight - weightLeftOver).toFixed(3)
                                    }
                                });

                                statusinterface = await App.api.ormDbFind('interface', {
                                    idordermes: orderprimary.idordermes,
                                    idstatus: {
                                        $notIn: ['OK', 'RSD']
                                    }
                                });
                                statusinterface = statusinterface.data;
            
                                idstatus = statusinterface.length > 0 ? 'BLK' : 'NEW'

                                let interfaceSave1 = await App.createInterfaceMs01(orderprimary, {
                                    idinterface: 'MS01',
                                    operation: 'A',
                                    idstatus: idstatus,
                                    lot: dtable1
                                });

                                interfaceSave1.idordermes = orderprimary.idordermes;
                                interfaceSave1.idordersap = orderprimary.idordersap ? orderprimary.idordersap : null

                                await App.api.ormDbCreate('interface', interfaceSave1);
                                await App.api.ormDbCreate('interface', interfaceSave);

                            }
                            else {
                                webix.message(i18n("The order can not be created, please contact the support!"))
                            }
                        }
                    }
                    else {
                        webix.message(i18n("A scheduled Order must be selected or the selected Order not contais an Allocated Material!"))
                    }
                }

            }

        },
        {
            id: "btnRemove",
            icon: "fas fa-minus-square",
            label: i18n("Remove Second Cut Order"),
            click: async () => {
                let secondaryOrder = $$('dtOrderSecondary').getSelectedItem();

                if (!secondaryOrder) {
                    webix.message(i18n("Please, select a secondary Order to remove!"))
                }
                else {

                    webix.confirm({
                        title: i18n("Are you sure you want to remove the selected order?"),
                        ok: i18n("Yes! Confirm"),
                        cancel: i18n("No! Cancel"),
                        text: `<strong> ${i18n("OP")} nº </strong> ${secondaryOrder.idordermes}`,
                        callback: async function (result) {
                            if (result) {

                                let result = await App.api.ormDbDelete({ idordermes: secondaryOrder.idordermes }, 'order');

                                if (result.success) {
                                    $$('dtOrderSecondary').clearAll();

                                    let delAl = await App.api.ormDbDelete({ idorder: secondaryOrder.idordermes }, 'allocation');

                                    let statusinterface = await App.api.ormDbFind('interface', {
                                        idordermes: secondaryOrder.idordermes,
                                        idstatus: {
                                            $notIn: ['OK', 'RSD']
                                        }
                                    });
                                    statusinterface = statusinterface.data;
                
                                    let idstatus = statusinterface.length > 0 ? 'BLK' : 'NEW'

                                    let interfaceSave = await App.createInterfaceMs01(secondaryOrder, {
                                        idinterface: 'MS01',
                                        operation: 'D',
                                        idstatus: idstatus,
                                    });

                                    interfaceSave.idordermes = secondaryOrder.idordermes;
                                    interfaceSave.idordersap = secondaryOrder.idordersap ? secondaryOrder.idordersap : null

                                    let inte = await App.api.ormDbCreate('interface', interfaceSave);

                                    //updating the Allocation Weight and resending interface of primary order
                                    let dtable = $$('dtAllocatedRawMaterial').serialize();

                                    for (let i = 0; i < dtable.length; i++) {

                                        let newWeight = await App.api.ormDbFind('lotcharacteristic', {
                                            idlot: dtable[i].id,
                                            name: 'CG_PESO_LIQUIDO'
                                        })
                                        newWeight = newWeight.data[0];

                                        dtable[i].newWeight = newWeight.numbervalue;

                                        //update primary order allocation
                                        await App.api.ormDbUpdate({
                                            idorder: dtable[i].idorder,
                                            idlot: dtable[i].id
                                        }, 'allocation', {
                                                weight: parseFloat(newWeight.numbervalue).toFixed(3)
                                            });
                                    }

                                    let order = await App.api.ormDbFind('order', { idordermes: dtable[0].idorder });
                                    order = order.data[0];

                                    dtable = dtable.map((obj) => {

                                        return {
                                            IDRAWMATERIAL: obj.idmaterial,
                                            IDLOT: obj.id ? ("0000000000" + obj.id).slice(-10) : null,
                                            LOTWEIGHT: parseFloat(obj.newWeight).toFixed(3)
                                        }
                                    });

                                    statusinterface = await App.api.ormDbFind('interface', {
                                        idordermes: order.idordermes,
                                        idstatus: {
                                            $notIn: ['OK', 'RSD']
                                        }
                                    });
                                    statusinterface = statusinterface.data;
                
                                    idstatus = statusinterface.length > 0 ? 'BLK' : 'NEW'

                                    interfaceSave = await App.createInterfaceMs01(order, {
                                        idinterface: 'MS01',
                                        operation: 'A',
                                        idstatus: idstatus,
                                        lot: dtable
                                    });

                                    interfaceSave.idordermes = order.idordermes;
                                    interfaceSave.idordersap = order.idordersap ? order.idordersap : null

                                    await App.api.ormDbCreate('interface', interfaceSave);

                                    webix.message(i18n("Order ") + secondaryOrder.idordermes + i18n(" removed successfully!"))

                                }
                            }
                        }
                    });
                }
            }
        }
    ]);

    return menu;
}