import { WebixWindow, WebixInputCombo, WebixInputSelect } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";
import * as util from "../lib/Util.js";

export async function showModal(dtDefectRegistry = null, item = null, lotParam = null, order = null) {
    return new Promise(async function (resolve, reject) {

        let modal = new WebixWindow({
            width: 600,
            height: 800
        });

        /* Equipment */
        let equipment = ({
            view: "text",
            label: i18n("Equipment"),
            name: "txEquipment"
        });

        /* Material */
        let material = ({
            view: "text",
            label: i18n("Material"),
            name: "Material"
        });

        /* Client */
        let client = ({
            view: "text",
            label: i18n("Client"),
            name: "txClient"
        });

        /* lot */
        let lot = ({
            view: "text",
            label: i18n("Lot"),
            name: "txLot",
        });

        /* Defect Types */
        let allDefectTypes = await App.api.ormDbFind('defecttype');
        let defectTypesByEquipment = {}
        if(order)
            defectTypesByEquipment = await App.api.ormDbDefectTypeByEquipment({ idequipment: order.idequipmentscheduled });
        let optionsDefectTypes = [];

        if (defectTypesByEquipment.data && defectTypesByEquipment.data.length) {
            optionsDefectTypes = defectTypesByEquipment.data;
        } else {
            optionsDefectTypes = allDefectTypes.data;
        }

        optionsDefectTypes.sort(function (a, b) {
            if (a.id < b.id) return -1;
            if (a.id > b.id) return 1;
            return 0;
        });

        let defecttype = new WebixInputSelect('Reason', i18n("Reason"), optionsDefectTypes, {
            labelPosition: "left",
            template: function (obj) {
                return obj.id + ' - ' + obj.description;
            }
        });

        /* Search Lot */
        let lotFields = (lotParam == 0) ? "" : await App.api.ormDbLotFields({ lot: lotParam });


        /* Parts Packages  */
        let partsPackages = ({
            view: "text",
            label: i18n("Parts Packages"),
            name: "txPartsPackages"
        });

        /* Operation */
        /*
        let allOperations = await App.api.ormDbFind('operation');

        let operations = new WebixInputCombo('Operation', i18n("Operation"), allOperations.data, {
            labelPosition: "left",
            template: function (obj) {
                return obj.id + ' - ' + obj.description;
            }
        });
        */
        lotFields = lotFields.data[0];

        if (item > 0) {

            let DataDefectRegistry = await App.api.ormDbFind('defect', { id: item });

            let Data = DataDefectRegistry.data[0];

            defecttype.value = Data.iddefecttype;

            //partsPackages.value = Data.quantity;
            //operations.value = Data.idoperation;

            equipment.value = order.equipmentscheduled;
            equipment.disabled = true;

            material.value = lotFields.material;
            material.disabled = true;

            client.value = order.idclient;
            client.disabled = true;

            lot.value = lotFields.lot;
            lot.disabled = true;

        } else {

            if(order)
                equipment.value = order.equipmentscheduled;
            equipment.disabled = true;

            material.value = lotFields.material;
            material.disabled = true;

            if(order)
                client.value = order.idclient;
            client.disabled = true;

            lot.value = lotParam;
            lot.disabled = true;

        }

        let rules = {
            "Reason": webix.rules.isNotEmpty,
        };

        const btnSave = {
            view: "button",
            id: "btnSave",
            height: 50,
            click: async () => {

                let data = $$("frmDefectRegistry").getValues();

                if ($$("frmDefectRegistry").validate()) {

                    if (item == 0) {

                        let defectRegistry = {
                            "idlot": data.txLot,
                            "iddefecttype": data.Reason,
                            //"weight": data.txtWeight,
                            "quantity": Number(data.txPartsPackages),
                            //"idoperation": data.Operation,
                            "idorder": order ? order.idordermes : null,
                            "date": new Date()
                        };

                        let resp = await App.api.ormDbCreate('defect', defectRegistry);
                        webix.message(i18n('Saved successfully!'));
                        modal.close();
                        resolve(resp);
                        if (dtDefectRegistry) App.loadAllCrudData('defect', dtDefectRegistry);

                    } else {

                        let defectRegistry = {
                            "iddefecttype": data.Reason,
                            //"weight": data.txtWeight,
                            "quantity": Number(data.txPartsPackages),
                            //"idoperation": data.Operation
                        };

                        let resp = await App.api.ormDbUpdate({ "id": item }, 'defect', defectRegistry);
                        webix.message(i18n('Updated successfully!'));
                        modal.close();
                        resolve(resp);
                        if (dtDefectRegistry) App.loadAllCrudData('defect', dtDefectRegistry);
                    }

                } else {

                    webix.message(i18n('Required fields are empty.'));
                    return;
                }

            },
            value: i18n("Save"),
        }

        modal.body = {
            view: "form",
            id: "frmDefectRegistry",
            rules: rules,
            rows: [{
                cols: [
                    equipment
                ]
            }, {
                cols: [
                    material
                ]
            }, {
                cols: [
                    client
                ]
            }, {
                cols: [
                    lot
                ]
            }, {
                cols: [
                    defecttype
                ]
            },  
            // {
            //     cols: [
            //         partsPackages
            //     ]
            // }, 
            {
                cols: [
                    btnSave
                ]
            }]
        };

        modal.modal = true;
        modal.show();
        modal.setTitle(i18n("Defect Registry"));
    });
}

/* Change Value ImputText */
function changeValue(text, value) {

    if (text == "txtWeight")
        $$('frmDefectRegistry').elements.txPartsPackages.setValue(value);
    else
        $$('frmDefectRegistry').elements.txtWeight.setValue(value);
}