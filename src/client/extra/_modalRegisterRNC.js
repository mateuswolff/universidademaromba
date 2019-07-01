import { WebixWindow, WebixInputCombo, WebixInputTextArea, WebixInputText } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";

import * as util from "../lib/Util.js";

import * as  _modalReadQR from "./_modalReadQR.js";
import * as modalDefectRegistry from '../extra/_modalDefectRegistry.js';


export async function showModal(dtSearchRNC, id, order, screen, itemSelected = null) {
    return new Promise(async function (resolve, reject) {

        let modal = new WebixWindow({
            width: 600,
            height: 500,
            onClosed: (obj) => {
                resolve(null);
                obj.close();
            }
        });

        if (screen == 'production' || !screen) {

            let titleDisposition = ({
                view: "label",
                label: `<strong>${i18n("DISPOSITION")}</strong>`,
                inputWidth: 100,
                align: "left"
            });

            let titleReleaseReportRNC = ({
                view: "label",
                label: `<strong>${i18n("RELEASE REPORT RNC")}</strong>`,
                inputWidth: 100,
                align: "left"
            });

            /* Rework */
            let allRework = await App.api.ormDbFind('scrapreason');
            
            allRework = allRework.data.map(
                (item) => {
                    return {
                        id: item.id,
                        value: item.id + ' - ' + item.description
                    }
                });

            /* CELL 1 */

            /* In Analysis */
            let inAnalysis = ({
                view: "text",
                label: i18n("In Analysis"),
                name: "txInAnalysis"
            });

            inAnalysis.disabled = true;

            /* Equipment */
            let equipment = ({
                view: "text",
                label: i18n("Equipment"),
                name: "txEquipment"
            });

            equipment.value = order.idequipmentscheduled ? order.idequipmentscheduled : null;
            equipment.disabled = true;

            /* Raw Material */
            let rawmaterial = ({
                view: "text",
                label: i18n("Raw Material"),
                name: "txRawMaterial"
            });

            rawmaterial.value = order.idrawmaterial ? order.idrawmaterial : null;
            rawmaterial.disabled = true;

            /* Client */
            let client = ({
                view: "text",
                label: i18n("Client"),
                name: "txClient"
            });

            client.value = order.idclient ? order.idclient : null;
            client.disabled = true;

            /* Product */
            let product = ({
                view: "text",
                label: i18n("Lot"),
                name: "txProduct"
            });

            product.value = order.idlot;
            product.disabled = true;

            /* Description of No Conformities */
            let allPendencyType = await App.api.ormDbFind('pendencytype');

            //trocar no conformitities pra pendency type (tipo de RNC)
            let pendencyType = new WebixInputCombo('pendencyType', i18n("Description of no Conformities"), allPendencyType.data, {
                template: function (obj) {
                    return obj.id + ' - ' + obj.description;
                },
            });

            /* Detailed observation RNC */
            let observation = new WebixInputTextArea('observation', i18n("Detailed observation RNC"), null, null);

            const btnSave = {
                view: "button",
                id: "btnSave",
                height: 50,
                click: async () => {
                    
                    let data = $$("tabA").getValues();
                    if($$("tabA").validate()){
                        let obj = {
                            lot: order.idlot ? order.idlot : 0,
                            pendencytype: data.pendencyType,
                            order: order.idorder ? order.idorder : order.idordermes ? order.idordermes : null,
                            observationtext: data.observation,
                            idshift: await util.findMyShift(),
                            material: order.material,
                            iduser: localStorage.getItem('login')
                        }
    
                        let result = null;
                        if (id > 0) {
                            result = App.api.ormDbUpdate({ "id": id }, 'pendency', registerRNC).then((item) => {
                                webix.message(i18n('Updated successfully!'));
                            });
    
                        } else {
                            result = await App.api.ormDbCreatePendency(obj);
                            if (result.success) {
                                //let nInterface = newInterface(obj);
                                webix.message(i18n('Saved successfully!'));
                            }
                        }
    
                        modal.close();
                        resolve(result);
                        if (dtSearchRNC) App.loadAllCrudData('pendency', dtSearchRNC);
                    }
                    else {
                        webix.message(i18n("You must to fill all fields!"))
                    }


                },
                value: i18n("Save RNC"),
            }
            
            let rules = {
                "pendencyType": webix.rules.isNotEmpty,
                "observation": webix.rules.isNotEmpty
            };

            let cell1 = {
                body: {
                    view: 'form',
                    id: 'tabA',
                    rules: rules,
                    rows: [{
                        cols: [
                            inAnalysis
                        ]
                    }, {
                        cols: [
                            equipment
                        ]
                    }, {
                        cols: [
                            rawmaterial
                        ]
                    }, {
                        cols: [
                            client
                        ]
                    }, {
                        cols: [
                            product
                        ]
                    }, {
                        cols: [
                            pendencyType
                        ]
                    }, {
                        cols: [
                            observation
                        ]
                    }, {
                        cols: [
                            btnSave
                        ]
                    }]
                }
            };

            modal.body = {
                view: 'form',
                id: "frmRegisterRNC",
                rules: rules,
                rows: [{
                    cols: [
                        cell1
                    ]
                }]
            }

        }
        else if (screen == 'search') {
            let allLot = await App.api.ormDbFind('lot', { status: true, situation: 'A' });
            allLot = allLot.data;

            let readQR = [
                {
                    view: "text",
                    label: i18n("Lot"),
                    name: "txtreadlot",
                    id: "txtreadlot",
                    suggest: allLot,
                    labelPosition: "left",
                    on: {
                        onBlur: searchLot,
                        onEnter: searchLot 
                    },
                    format: "111"
                },
                {
                    view: "button", label: i18n("Read"), with: 30, click: async () => {
                        let digitReadRawMateroal = $$('txtreadlot').getValue();
                        if (digitReadRawMateroal) {
                            //searchInformation(digitReadRawMateroal, order);
                        } else {
                            let idlot = await _modalReadQR.showModal();
                            $$('tab1Form').elements.txtreadlot.setValue(idlot);
                            searchLot();
                            //searchInformation(idlot, order);
                        };
                    }
                }]

            let titleDisposition = ({
                view: "label",
                label: `<strong>${i18n("DISPOSITION")}</strong>`,
                inputWidth: 100,
                align: "left"
            });

            let titleReleaseReportRNC = ({
                view: "label",
                label: `<strong>${i18n("RELEASE REPORT RNC")}</strong>`,
                inputWidth: 100,
                align: "left"
            });

            /* Rework */
            let allRework = await App.api.ormDbFind('scrapreason');

            allRework = allRework.data.map(
                (item) => {
                    return {
                        id: item.id,
                        value: item.id + ' - ' + item.description
                    }
                });

            /* CELL 1 */

            /* In Analysis */
            let inAnalysis = ({
                view: "text",
                label: i18n("In Analysis"),
                name: "txInAnalysis"
            });

            inAnalysis.disabled = true;

            /* Equipment */
            let equipment = ({
                view: "text",
                label: i18n("Equipment"),
                name: "equipment",
                id: "txtEquipment",
                disabled: true
            });

            /*Order */
            let order = ({
                view: "text",
                label: i18n("Order"),
                name: "order",
                id: "txtOrder",
                disabled: true
            });

            /*Material */
            let material = ({
                view: "text",
                label: i18n("Material"),
                name: "material",
                id: "txtMaterial",
                disabled: true
            });

            /* Client */
            let client = ({
                view: "text",
                label: i18n("Client"),
                name: "client",
                id: "txtClient",
                disabled: true
            });

            // PENDENCY TYPE
            let allPendencyType = await App.api.ormDbFind('pendencytype');

            //trocar no conformitities pra pendency type (tipo de RNC)
            let pendencytype = new WebixInputCombo('pendencytype', i18n("Pendency Type"), allPendencyType.data, {
                template: function (obj) {
                    return obj.id + ' - ' + obj.description;
                },
            });

            /* Detailed observation RNC */
            let observation = new WebixInputTextArea('observation', i18n("Detailed observation RNC"), null, null);

            const btnDefect = {
                view: "button",
                id: "btnDefect",
                height: 50,
                click: async () => {
                    if ($$('tab1Form').elements.txtreadlot.getValue() == '') {
                        webix.message(i18n('Please, select a Lot!'))
                    }
                    else {
                        let lot = $$('tab1Form').elements.txtreadlot.getValue()
                        let defect = await modalDefectRegistry.showModal(null, 0, lot);
                    }
                },
                value: i18n("Defect Register"),
            }

            const btnSave = {
                view: "button",
                id: "btnSave",
                height: 50,
                click: async () => {

                    let form = $$('tab1Form').getValues();

                    let obj = {
                        idmaterial: form.idmaterial,
                        lot: form.txtreadlot,
                        pendencytype: form.pendencytype,
                        order: form.order,
                        observationtext: form.observation,
                        idshift: await util.findMyShift(),
                        iduser: localStorage.getItem('login')
                    }

                    if ($$('tab1Form').validate()) {

                        if (form.txtreadlot != 0 && form.idmaterial) {

                            let resp = await App.api.ormDbCreatePendency(obj);

                            if (resp.success) {
                                let nInterface = newInterface(obj);
                                webix.message(i18n('Pendency Saved successfully!'));
                            }
                            else {
                                webix.message(i18n('There is an Error, please contact the support!'));
                            }

                            $$("tab1Form").setValues({ idmaterial: "" });
                            $$('tab1Form').elements.txtreadlot.setValue("");
                            $$('tab1Form').elements.equipment.setValue("");
                            $$('tab1Form').elements.material.setValue("");
                            $$('tab1Form').elements.order.setValue("");
                            $$('tab1Form').elements.client.setValue("");
                            $$('tab1Form').elements.pendencytype.setValue("");
                            $$('tab1Form').elements.client.setValue("");

                            modal.close();
                            resolve(resp)
                        }
                        else {
                            webix.message(i18n('Please, select a valid lot!'));
                        }

                    }
                },

                //saveRnc,
                value: i18n("Create RNC"),
            }

            let rules = {
                "pendencytype": webix.rules.isNotEmpty,
                "txtreadlot": webix.rules.isNotEmpty,
                "observation": webix.rules.isNotEmpty
            };

            let cell1 = {

                body: {
                    view: 'form',
                    id: 'tab1Form',
                    rules: rules,
                    rows: [
                        {
                            cols: readQR
                        },
                        {
                            cols: [
                                equipment
                            ]
                        },
                        {
                            cols: [
                                order
                            ]
                        },
                        {
                            cols: [
                                material
                            ]
                        }, {
                            cols: [
                                client
                            ]
                        }, {
                            cols: [
                                pendencytype
                            ]
                        }, {
                            cols: [
                                observation
                            ]
                        }, {
                            cols: [
                                btnDefect,
                                btnSave
                            ]
                        }]
                }
            };

            modal.body = {
                view: 'form',
                id: "frmRegisterRNC",
                rows: [{
                    cols: [
                        cell1
                    ]
                }]
            }
        }
        else if (screen == 'edit') {

            let pendencySelected = await App.api.ormDbFind('pendency', { id: itemSelected.id });

            let readQR = [
                {
                    view: "text",
                    label: i18n("Lot"),
                    name: "txtreadlot",
                    id: "txtreadlot",
                    labelPosition: "left",
                    value: itemSelected.idlot,
                    disabled: true
                }];

            /* Rework */

            /* In Analysis */
            let inAnalysis = ({
                view: "text",
                label: i18n("In Analysis"),
                name: "txInAnalysis"
            });

            inAnalysis.disabled = true;

            /* Equipment */
            let equipment = ({
                view: "text",
                label: i18n("Equipment"),
                name: "equipment",
                id: "txtEquipment",
                disabled: true
            });

            /*Order */
            let order = ({
                view: "text",
                label: i18n("Order"),
                name: "order",
                id: "txtOrder",
                disabled: true
            });

            /*Material */
            let material = ({
                view: "text",
                label: i18n("Material"),
                name: "material",
                id: "txtMaterial",
                disabled: true
            });

            /* Client */
            let client = ({
                view: "text",
                label: i18n("Client"),
                name: "client",
                id: "txtClient",
                disabled: true
            });

            /* pendency Type*/
            let allPendencyType = await App.api.ormDbFind('pendencytype');

            let pendencytype = new WebixInputCombo('pendencytype', i18n("Pendency Type"), allPendencyType.data, {
                template: function (obj) {
                    return obj.id + ' - ' + obj.description;
                },
                value: pendencySelected.data[0].idpendencytype

            });

            /* Detailed observation RNC */
            let observation = new WebixInputTextArea('observation', i18n("Detailed observation RNC"), pendencySelected.data[0].observationtext, null);

            const btnDefect = {
                view: "button",
                id: "btnDefect",
                height: 50,
                click: async () => {
                    if ($$('tab1Form').elements.txtreadlot.getValue() == '') {
                        webix.message(i18n('Please, select a Lot!'))
                    }
                    else {
                        let lot = $$('tab1Form').elements.txtreadlot.getValue()
                        let defect = await modalDefectRegistry.showModal(null, 0, lot);
                    }
                },
                value: i18n("Defect Register"),
            }

            const btnSave = {
                view: "button",
                id: "btnSave",
                height: 50,
                click: async () => {

                    let form = $$('tab1Form').getValues();

                    let obj = {
                        observationtext: form.observation,
                    }

                    if ($$('tab1Form').validate()) {

                        let resp = await App.api.ormDbUpdate({ "id": pendencySelected.data[0].id }, 'pendency', obj);

                        if (resp.success) {
                            webix.message(i18n('Pendency Saved successfully!'));
                        }
                        else {
                            webix.message(i18n('There is an Error, please contact the support!'));
                        }

                        $$("tab1Form").setValues({ idmaterial: "" });
                        $$('tab1Form').elements.txtreadlot.setValue("");
                        $$('tab1Form').elements.equipment.setValue("");
                        $$('tab1Form').elements.material.setValue("");
                        $$('tab1Form').elements.order.setValue("");
                        $$('tab1Form').elements.client.setValue("");
                        $$('tab1Form').elements.pendencytype.setValue("");
                        $$('tab1Form').elements.client.setValue("");

                        modal.close();
                        resolve(resp)
                    }
                },

                //saveRnc,
                value: i18n("Save"),
            }

            let rules = {
                "pendencytype": webix.rules.isNotEmpty,
                "txtreadlot": webix.rules.isNotEmpty
            };

            let cell1 = {

                body: {
                    view: 'form',
                    id: 'tab1Form',
                    rules: rules,
                    rows: [
                        {
                            cols: readQR
                        },
                        {
                            cols: [
                                equipment
                            ]
                        },
                        {
                            cols: [
                                order
                            ]
                        },
                        {
                            cols: [
                                material
                            ]
                        }, {
                            cols: [
                                client
                            ]
                        }, {
                            cols: [
                                pendencytype
                            ]
                        }, {
                            cols: [
                                observation
                            ]
                        }, {
                            cols: [
                                btnDefect,
                                btnSave
                            ]
                        }]
                }
            };

            modal.body = {
                view: 'form',
                id: "frmRegisterRNC",
                rows: [{
                    cols: [
                        cell1
                    ]
                }]
            }
        }

        modal.modal = true;
        modal.show();
        modal.setTitle(i18n("Register RNC"));

        if (screen == 'edit')
            searchLotEdit(itemSelected.idlot);

    });
}

async function searchLot() {

    let lot = $$('tab1Form').elements.txtreadlot.getValue();

    if (lot) {
        let lotFields = await App.api.ormDbLotFields({ lot: lot });
        lotFields = lotFields.data[0]

        if (lotFields) {
            if (lotFields.situation != 'A') {
                webix.message(i18n("This Lot is unavailable!"));
                $$('tab1Form').elements.txtreadlot.setValue("");
                $$('tab1Form').elements.material.setValue("");
                $$('tab1Form').elements.order.setValue("");
                $$('tab1Form').elements.client.setValue("");
            }
            else {
                $$("tab1Form").setValues({ idmaterial: lotFields.materialid });
                $$('tab1Form').elements.txtreadlot.setValue(lot);
                $$('tab1Form').elements.equipment.setValue(lotFields.equipment);
                $$('tab1Form').elements.material.setValue(lotFields.material);
                $$('tab1Form').elements.order.setValue(lotFields.order);
                $$('tab1Form').elements.client.setValue(lotFields.client);
            }
        }
        else {
            webix.message(i18n("This Lot is unavailable!"));
            $$('tab1Form').elements.txtreadlot.setValue("");
            $$('tab1Form').elements.material.setValue("");
            $$('tab1Form').elements.order.setValue("");
            $$('tab1Form').elements.client.setValue("");

        }
    }
}

async function searchLotEdit(lot = null) {

    if (!lot)
        lot = $$('tab1Form').elements.txtreadlot.getValue();

    let lotFields = await App.api.ormDbLotFields({ lot: lot });

    lotFields = lotFields.data[0]
    if (lotFields) {
        $$('tab1Form').elements.txtreadlot.setValue(lot);
        $$('tab1Form').elements.equipment.setValue(lotFields.equipment);
        $$('tab1Form').elements.material.setValue(lotFields.material);
        $$('tab1Form').elements.order.setValue(lotFields.order);
        $$('tab1Form').elements.client.setValue(lotFields.client);
        $$('tab1Form').elements.pendencytype.disable();
    }
    else {
        webix.message(i18n("This Lot is unavailable!"));
        $$('tab1Form').elements.txtreadlot.setValue("");
        $$('tab1Form').elements.material.setValue("");
        $$('tab1Form').elements.order.setValue("");
        $$('tab1Form').elements.client.setValue("");
    }
}


async function newInterface(obj) {

    let lotchar = await App.api.ormDbGetDetailsLotsLot({ idlot: obj.lot });
    lotchar = lotchar.data[0];
    
    let produced = [
        {
            MATERIAL: +lotchar.idmaterial,
            LOTGENERATED: ("00000000000000" + obj.lot).slice(-10),
            PIECES: Math.round(lotchar.pieces),
            WEIGHT: lotchar.weight.toFixed(3),
            RNC: "X",

        }
    ]

    let statusinterface = await App.api.ormDbFind('interface', {
        idlot: obj.lot,
        idstatus: {
            $notIn: ['OK', 'RSD']
        }
    });
    statusinterface = statusinterface.data;

    let idstatus = statusinterface.length > 0 ? 'BLK' : 'NEW'

    let interfaceSave = await App.createInterfaceMs02(null, {
        idinterface: 'MS02',
        operation: 'A',
        idstatus: idstatus,
        produced: produced,
    });

    interfaceSave.idlot = obj.lot;
    let inte = await App.api.ormDbCreate('interface', interfaceSave);

}
