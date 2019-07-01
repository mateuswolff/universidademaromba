import { WebixWindow, WebixInputCombo, WebixInputTextArea, WebixInputSelect } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";
import * as util from "../lib/Util.js";

export async function showModal(dtScrapsRecord = null, id = null, order = null, screen = null, lot = null, rnc = null, piece = null) {

    return new Promise(async function (resolve, reject) {
        let modal = new WebixWindow({
            width: 600
        });

        if (!screen) { 
            /* Equipment */
            let equipment = ({
                view: "text",
                label: i18n("Equipment"),
                name: "txEquipment"
            });

            /* Raw Material */
            let rawmaterial = ({
                view: "text",
                label: i18n("Raw Material"),
                name: "txRawMaterial"
            });

            /* Client */
            let client = ({
                view: "text",
                label: i18n("Client"),
                name: "txClient"
            });

            /* OP */
            let op = ({
                view: "text",
                label: i18n("OP"),
                name: "txOp"
            });

            /* Reason */
            let allScrapsReason = await App.api.ormDbFind('scrapreason');
            let scraps = await App.api.ormDbScrapReasonByEquipment({ idequipment: order.idequipmentscheduled });
            let optionsScraps = [];
            
            if (scraps.data.length) {
                optionsScraps = scraps.data;
            } else {
                optionsScraps = allScrapsReason.data;
            }

            let scrapreason = new WebixInputSelect('scrapreason', i18n("Scrap Reason"), optionsScraps, {
                template: function (obj) {
                    return obj.id + ' - ' + obj.description;
                }
            });

            let amount = '';

            if (piece) {

                //let value = await util.calcWeightParts(order.idmaterial, "weight", 1);
                //Novo calculo do peso de saída, pois é utilizado materia prima com espessura diferente do material de saída.
                let orderdata = await App.api.ormDbFind('order', { idordermes: order.idordermes});
                let value = await util.calcWeightPartsBigTub(order.idmaterial, 'weight', 1, orderdata.data[0].idrawmaterial);
                amount = ({
                    view: "text",
                    label: i18n("Weight"),
                    name: "txAmount",
                    disabled: true,
                    value: value
                });
            }
            else {
                /* Amount */
                amount = ({
                    view: "text",
                    label: i18n("Weight"),
                    name: "txAmount",
                    on: {
                        onBlur: async () => {
                            let weight = $$("frmScrapsRecord").elements.txAmount.getValue();
                            let value = await util.calcWeightParts(order.idmaterial, "partsPackages", weight);
                            changeValue("txAmount", value);
                        }
                    }
                });
            }

            let partsPackages = '';

            if (piece) {
                partsPackages = ({
                    view: "text",
                    label: i18n("Parts"),
                    name: "txPartsPackages",
                    value: 1,
                    disabled: true,
                });
            }
            else {
                /* Parts Packages  */
                partsPackages = ({
                    view: "text",
                    label: i18n("Parts"),
                    name: "txPartsPackages",
                    on: {
                        onBlur: async () => {
                            let partsPackages = $$("frmScrapsRecord").elements.txPartsPackages.getValue();
                            //let value = await util.calcWeightParts(order.idmaterial, "weight", partsPackages);
                            //Novo calculo do peso de saída, pois é utilizado materia prima com espessura diferente do material de saída.
                            let value = await util.calcWeightPartsBigTub(order.idmaterial, 'weight', partsPackages, order.idrawmaterial);
                            changeValue("txPartsPackages", value);
                        }
                    }
                });
            }

            let DataScrapsRecord = (id == 0) ? '' : await App.api.ormDbFind('scrap', { "idequipment": id.idequipment, "idorder": id.idorder, "idscrapsequence": id.idscrapsequence });

            if (DataScrapsRecord) {

                let Data = DataScrapsRecord.data[0];

                let DataA = await App.api.ormDbGetOrder({ "idordermes": id.idorder });
                let DataB = DataA.data[0];

                if (DataB.length != 1) {
                    equipment.value = DataB.idequipmentscheduled;
                    equipment.disabled = true;

                    rawmaterial.value = DataB.rawmaterial;
                    rawmaterial.disabled = true;

                    client.value = DataB.idclient;
                    client.disabled = true;

                    op.value = DataB.idordermes;
                    op.disabled = true;
                }

                scrapreason.value = Data.idscrapreason;
                amount.value = Data.weight;
                partsPackages.value = Data.quantity;


            } else {

                equipment.value = order.idequipmentscheduled;
                equipment.disabled = true;

                rawmaterial.value = order.rawmaterial;
                rawmaterial.disabled = true;

                client.value = order.idclient;
                client.disabled = true;

                op.value = order.idordermes;
                op.disabled = true;

            }

            let rules = {
                "scrapreason": webix.rules.isNotEmpty,
                "txAmount": webix.rules.isNotEmpty,
                "txPartsPackages": webix.rules.isNotEmpty
                /*"Operation": webix.rules.isNotEmpty*/
            };

            const btnSave = {
                view: "button",
                id: "btnSave",
                height: 50,
                click: async () => {

                    let data = $$("frmScrapsRecord").getValues();

                    let scrapsSequence = await App.api.ormDbScrapSequence({ idordermes: order.idordermes });

                    let nextScrapsSequence = scrapsSequence.data.length == 0 ? 1 : scrapsSequence.data[0].idscrapsequence + 1;

                    let scrapsRecord = {
                        "idequipment": order.idequipmentscheduled,
                        "idorder": order.idordermes,
                        "idscrapsequence": nextScrapsSequence,
                        "idscrapreason": data.scrapreason,
                        "weight": data.txAmount,
                        "quantity": data.txPartsPackages,
                        "idoperation": data.Operation,
                        "idlot": lot
                    };

                    /*validando se esse peso de sucata pode ser gerado*/

                    let remainingweight = await App.api.getWeightOutput(order.idordermes);
                    remainingweight = remainingweight.data[0].remainingweight;

                    let sumValuesOrder = remainingweight - data.txAmount;

                    if(sumValuesOrder > 0){
                        /* Validation Form */
                        if ($$("frmScrapsRecord").validate()) {
                            if (id > 0 || id.id) {
                                let resp;
    
                                if (id.id) {
                                    resp = await App.api.ormDbUpdate({ "id": id.id }, 'scrap', scrapsRecord);
                                } else {
                                    resp = await App.api.ormDbUpdate({ "id": id }, 'scrap', scrapsRecord);
                                }
    
                                if (resp.success) {
                                    webix.message('Updated successfully!');
                                    modal.close();
                                    resolve(resp);
                                    if (dtScrapsRecord)
                                        App.loadAllCrudData('scrapreason', dtScrapsRecord);
                                } else {
                                    webix.message(i18n('Error updating registry'));
                                }
                            } else {
                                let resp = await App.api.ormDbCreate('scrap', scrapsRecord);
                                if (resp.success) {
                                    webix.message('Saved successfully!');
                                    modal.close();
                                    resolve(resp);
                                    if (dtScrapsRecord)
                                        App.loadAllCrudData('scrapreason', dtScrapsRecord);
                                } else {
                                    webix.message(i18n('Error saving registry'));
                                }
                            }
    
                        } else {
                            webix.message(i18n('Required fields are empty.'));
                            return;
                        }
                    }
                    else {
                        webix.alert(i18n('The sum of scraps and generateds lots cannot be higher than allocated weight!'))
                    }



                },
                value: i18n("Save"),
            }

            modal.body = {
                view: "form",
                id: "frmScrapsRecord",
                rules: rules,
                rows: [{
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
                        op
                    ]
                }, {
                    cols: [
                        scrapreason
                    ]
                }, {
                    cols: [
                        amount
                    ]
                }, {
                    cols: [
                        partsPackages
                    ]
                }, {
                    cols: [
                        btnSave
                    ]
                }]
            };

            modal.modal = true;
            modal.show();
            modal.setTitle(i18n("Scraps Record"));

        } else if (screen = 'RNC') {

            /* Scrap Reason */
            let allScrapsReason = await App.api.ormDbFind('scrapreason');

            let scrapreason = new WebixInputCombo('scrapreason', i18n("Scrap Reason"), allScrapsReason.data, {
                labelPosition: "left",
                template: function (obj) {
                    return obj.id + ' - ' + obj.description;
                }
            });

            /* lot */
            let lotValue = {
                view: "text",
                value: lot,
                label: i18n("Lot"),
                disabled: true,
                labelPosition: "left"
            }

            /* Description Report */
            let descriptionReportPro = new WebixInputTextArea('descriptionReportPro', i18n('Report'), null, {
                labelPosition: "left",
                height: 150
            });

            //op.disabled = true;

            let rules = {
                "descriptionReportPro": webix.rules.isNotEmpty,
                "scrapreason": webix.rules.isNotEmpty,
            };

            const btnSave = {
                view: "button",
                id: "btnSaveInRnc",
                height: 50,
                click: async () => {

                    /* Validation Form */
                    if ($$("frmScrapsRecord").validate()) {

                        let lotToScrap = lot;
                        let pendency = rnc;
                        let scrapReasonId = $$('frmScrapsRecord').elements.scrapreason.getValue();
                        let report = $$('frmScrapsRecord').elements.descriptionReportPro.getValue();

                        webix.confirm(i18n('Are you sure you want to Scrap the lot?'), '', async (result) => {
                            if (result) {

                                let obj = {
                                    idlot: lotToScrap,
                                    scrapreasonid: scrapReasonId,
                                    report: report,
                                    pendency: pendency,
                                    iduser: localStorage.getItem('login')
                                }
                                let toScrap = await App.api.ormDbScrapLot(obj);

                                if (toScrap.success) {
                                    webix.message(i18n('Scrapped successfully!'));
                                    modal.close();
                                    resolve(toScrap)
                                }
                            }
                        })

                    } else {

                        webix.message(i18n('Required fields are empty.'));
                        return;
                    }

                },
                value: i18n("Save"),
            }

            modal.body = {
                view: "form",
                id: "frmScrapsRecord",
                rules: rules,
                rows: [
                    {
                        cols: [
                            lotValue
                        ]
                    }, {
                        cols: [
                            scrapreason
                        ]
                    }, {
                        cols: [
                            descriptionReportPro
                        ]
                    },
                    {
                        cols: [
                            btnSave
                        ]
                    }]
            };

            modal.modal = true;
            modal.show();
            modal.setTitle(i18n("Scraps Record"));
        }
    });
}

/* Change Value ImputText */
function changeValue(text, value) {
    if (text == "txAmount")
        $$('frmScrapsRecord').elements.txPartsPackages.setValue(value);
    else
        $$('frmScrapsRecord').elements.txAmount.setValue(value);
}