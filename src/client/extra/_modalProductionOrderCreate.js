import { WebixWindow, WebixInputText, WebixCrudAddButton, WebixInputDate, WebixInputCombo, WebixInputSelect } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";

import * as optionsScreens from "../components/optionsScreens.js"
import * as util from "../lib/Util.js";

export async function showModal(item = null, screen, materialList = null, calc = null) {
    return new Promise(async function (resolve, reject) {

        const padding = ({
            view: "label",
            label: i18n(""),
        });

        if (screen == 'tubesCuttingPlan') {

            // let so = parseFloat(orderItem.lengthm) + 3;  // Sequence Order
            // let rm = allAllocatedRawMaterials.data[0].length;                          // Raw Material
            // let ct = parseInt(rm / so);                                               // Cutting Tubes Number
            // let leftOver = rm - (so * ct);   

            let order = await App.api.ormDbFindOne('order', {
                idordermes: item.idordermes
            });

            let equipment = await App.api.ormDbFindOne('equipment', JSON.stringify({
                id: item.idequipmentscheduled
            }));

            let material = new WebixInputCombo('material', i18n('Material'), materialList, {
                "onChange": async (obj) => {
                    
                    let i = materialList.findIndex(x => x.id == obj);
                    let so = parseFloat(materialList[i].length) + 3;
                    let rm = calc.leftOver;
                    let ct = parseInt(rm / so);

                    let leftOver = rm - (so * ct);

                    let pieces = ct * calc.sum

                    let result = await App.api.getCharacteriscsByMaterial(obj);

                    let characteriscs = result[0];

                    let finalWeight = await util.getWeight(characteriscs, pieces);

                    $$('formProductionOrderCreate').elements.weight.setValue(finalWeight);
                    $$('formProductionOrderCreate').elements.numParts.setValue(pieces);

                }
            });
            let weight = new WebixInputText("weight", i18n("Weight"), {disabled: true}, {
                "onBlur": async (obj) => {
                    
                    let i = materialList.findIndex(x => x.id == obj);
                    let so = parseFloat(materialList[i].length) + 3;
                    let rm = calc.leftOver;
                    let ct = parseInt(rm / so);

                    let leftOver = rm - (so * ct);

                    let pieces = ct * calc.sum

                    let result = await App.api.getCharacteriscsByMaterial(obj);

                    let characteriscs = result[0];

                    let finalWeight = await util.getWeight(characteriscs, pieces);


                        let weight = $$('Weight').getValue();
                        let value = await util.calcWeightParts(reworkresult.idlot, "pieces", weight);
                        $$('numParts').setValue(Number(value).toFixed(3))
                    

                    $$('formProductionOrderCreate').elements.weight.setValue(finalWeight);
                    $$('formProductionOrderCreate').elements.numParts.setValue(value);

                }
            });

            let modal = new WebixWindow({
                width: 800,
                height: 600
            });

            modal.body = {
                view: "form",
                id: "formProductionOrderCreate",
                elements: [
                    {
                        rows: [{
                            cols: [
                                new WebixInputText("nmEquipment", i18n("Equipment"), { disabled: true }, item.equipmentscheduled),
                                material,
                                new WebixInputText("nmOrderMes", i18n("Main Production Order"), { disabled: true }, item.idordermes)
                            ]
                        },
                        {
                            cols: [
                                weight, //new WebixInputText("weight", i18n("Weight"), {disabled: true}),
                                new WebixInputText("numParts", i18n("Number of parts"), {disabled: true}),
                            ]
                        },
                        {
                            cols: [
                                padding
                            ]
                        },
                        new WebixCrudAddButton("btnSaveProductionOrder", i18n("Generate production order"), async function () {
                            let form = $$('formProductionOrderCreate').getValues();
                            let numParts = form.numParts;
                            let weight = form.weight;
                            let material = form.material;
                            let saleorder = form.salesOrder;
                            let productionOrder = {};

                            if ($$('formProductionOrderCreate').validate()) {
                                productionOrder = {
                                    //idordersap: 0,
                                    idordergroup: order.data.idordergroup,
                                    sequence: order.data.sequence,
                                    orderstatus: "PRODUCTION",
                                    ordertype: "SECONDCUT",
                                    urgency: "NORMAL",
                                    idmaterial: material,
                                    idrawmaterial: order.data.idrawmaterial,
                                    idorderplanned: order.data.idordermes,
                                    plannedorderquantity: weight,
                                    expectedquantity: numParts,
                                    saleorder: saleorder,
                                    requestdate: order.data.requestdate,
                                    idequipmentexpected: order.data.idequipmentexpected,
                                    idequipmentscheduled: order.data.idequipmentscheduled,
                                    status: true
                                };

                                let resp = await App.api.ormDbCreate('order', productionOrder);

                                if (resp.success) {
                                    modal.close();
                                    webix.message(i18n('Saved successfully!'));
                                    resolve(resp);
                                } else {
                                    reject(resp);
                                }

                            }
                        }, { height: 50 })

                        ]
                    }],
                rules: {
                    "numParts": webix.rules.isNotEmpty,
                    "weight": webix.rules.isNotEmpty,
                    "material": webix.rules.isNotEmpty
                }
            };

            modal.modal = true;
            modal.show();
            modal.setTitle(i18n("Production Order Create"));
        
        } else if (screen == "buffer") {

            let allEquipment = await App.api.ormDbFind('equipment');
            allEquipment.data.sort(function(a,b) {
                if(a.description < b.description) return -1;
                if(a.description > b.description) return 1;
                return 0;
            });
            let equipment = new WebixInputCombo('equipment', i18n('Equipments'), allEquipment.data, {
                template: function (obj) {
                    return obj.description;
                },
            });

            let allMaterial = optionsScreens.associationFields((await App.api.ormDbFind('material')).data,'id','description');
            allMaterial.sort(function(a,b) {
                if(a.value < b.value) return -1;
                if(a.value > b.value) return 1;
                return 0;
            });
            let material = new WebixInputCombo('material', i18n('Material'), allMaterial, {
                template: (obj) => {
                    return +obj.id + " - " + obj.value
                }
            });

            let allRawMaterial = optionsScreens.associationFields((await App.api.ormDbFind('material')).data,'id','description');
            allRawMaterial.sort(function(a,b) {
                if(a.value < b.value) return -1;
                if(a.value > b.value) return 1;
                return 0;
            });
            let rawmaterial = new WebixInputCombo('rawmaterial', i18n('Raw Material'), allRawMaterial, {
                template: (obj) => {
                    return +obj.id + " - " + obj.value
                }
            });

            let modal = new WebixWindow({
                width: 800,
                height: 1000
            });


            modal.body = {
                view: "form",
                id: "formProductionOrderCreate",
                elements: [
                    {
                        rows: [{
                            cols: [
                                equipment,
                                material,
                                rawmaterial
                            ]
                        },
                        {
                            cols: [
                                new WebixInputText("salesOrder", i18n("Sales Order")),
                                new WebixInputText("weight", i18n("Weight")),
                                new WebixInputText("numParts", i18n("Number of parts")),
                                new WebixInputDate(
                                    'requestdate',
                                    i18n('Request Date'),
                                    {
                                        start: moment().format("YYYY/MM/DD"),
                                        end: moment().add(15, 'D').format("YYYY/MM/DD")
                                    }
                                )
                            ]
                        },
                        {
                            cols: [
                                padding
                            ]
                        },
                        new WebixCrudAddButton("btnSaveProductionOrder", i18n("Generate production order"), async function () {
                            let form = $$('formProductionOrderCreate').getValues();
                            let numParts = form.numParts;
                            let weight = form.weight;
                            let equipment = form.equipment;
                            let material = form.material;
                            let requestdate = form.requestdate;
                            let rawmaterial = form.rawmaterial;
                            let productionOrder = {};

                            //calcWeightPartsTwo(rawmaterial, idrawmaterial, idmaterial, type, value)
                            //let piecesExpected = await util.calcWeightParts(idlot, 'piecies', remainingWeight);

                            let maxSequenceOrder = await App.api.ormDbMaxSequenceOrder();
                            maxSequenceOrder = maxSequenceOrder.data[0].max

                            if ($$('formProductionOrderCreate').validate()) {
                                productionOrder = {
                                    //idordersap: 0,
                                    idordergroup: 0,
                                    orderstatus: "PRODUCTION",
                                    ordertype: "PRODUCTION",
                                    sequence: maxSequenceOrder + 1,
                                    urgency: "NORMAL",
                                    idmaterial: material,
                                    idrawmaterial: rawmaterial,
                                    plannedorderquantity: weight,
                                    expectedquantity: numParts,
                                    requestdate: requestdate,
                                    idequipmentexpected: equipment,
                                    idequipmentscheduled: equipment,
                                    status: true
                                };

                                let resp = await App.api.ormDbCreate('order', productionOrder);

                                if (resp.success) {
                                    modal.close();
                                    webix.message(i18n('Saved successfully!'));
                                    resolve(resp);
                                } else {
                                    reject(resp);
                                }
                            }
                        })

                        ]
                    }],
                rules: {
                    "requestdate": webix.rules.isNotEmpty,
                    "numParts": webix.rules.isNotEmpty,
                    "material": webix.rules.isNotEmpty,
                    "equipment": webix.rules.isNotEmpty,
                    "weight": webix.rules.isNotEmpty,
                    "rawmaterial": webix.rules.isNotEmpty
                }
            };

            modal.modal = true;
            modal.show();
            modal.setTitle(i18n("Production Order Create"));

        }
    });
}