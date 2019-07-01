import { WebixWindow, WebixInputCombo, WebixInputTextArea } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";

import * as modalScrapsRecord from '../extra/_modalScrapsRecord.js';

let modal = new WebixWindow({
    width: 800
});

let lotFields = null;

export async function showModal(data) {
    return new Promise(async function (resolve, reject) {

        lotFields = await App.api.ormDbLotFields({ lot: data.idlot });
        lotFields = lotFields.data[0];

        let pendencytype = await App.api.ormDbPendencyFields({ pendency: data.id });

        let disposal = pendencytype.data;
        pendencytype = pendencytype.data[0];

        let disposalControl = null;

        let objP = {
            index: null,
            seq: null,
            situation: null
        }

        let objQ = {
            index: null,
            seq: null,
            situation: null
        }

        if (disposal.length > 1) {

            objP.index = disposal.findIndex(x => x.releaseteam == 'P' || x.releaseteam == 'p');
            objQ.index = disposal.findIndex(x => x.releaseteam == 'Q' || x.releaseteam == 'q');

            objP.seq = disposal[objP.index].sequence;
            objQ.seq = disposal[objQ.index].sequence;

            objP.situation = disposal[objP.index].pendencyreleasesituation;
            objQ.situation = disposal[objQ.index].pendencyreleasesituation;

            disposalControl = 'both';
        }
        else if (disposal.findIndex(x => x.releaseteam == 'Q') != -1) {
            disposalControl = 'quality'
        }
        else {
            disposalControl = 'production';
        }

        let defects = await App.api.ormDbDefectFields({ lot: data.idlot });
        defects = defects.data;

        let defectString = "";

        if (defects.length > 0) {
            defectString = '<ul>';

            defects.forEach(e => {
                defectString = defectString + '<li>' + e.defecttypedescription + '</li>'
            })

            defectString = defectString + "</ul>"
        }
        else {
            defectString = i18n("There is no defect for this lot.")
        }

        let listDefect = {
            height: 70,
            view: "template",
            template: defectString
        };

        const padding = ({
            view: "label",
            label: i18n(""),
        });

        let labelOrder = ({
            view: "label",
            label: "<strong>" + i18n("Order") + ":</strong>"
        });

        let txtOrder = {
            view: "label",
            label: "-"
        };

        let labelMaterial = ({
            view: "label",
            label: "<strong>" + i18n("Material") + ":</strong>"
        });

        let txtMaterial = {
            view: "label",
            label: lotFields.material
        };

        let labelEquipment = ({
            view: "label",
            label: "<strong>" + i18n("Equipment") + ":</strong>"
        });

        let txtEquipment = {
            view: "label",
            label: "-"
        };

        if (data.idorder) {
            txtOrder.label = data.idorder
            let order = await App.api.ormDbOrderRelationships({ idorder: data.idorder });
            txtEquipment.label = order.data[0].idequipmentscheduled
        }

        let txtLot = ({
            view: "label",
            label: data.idlot
        });

        let labelLot = ({
            view: "label",
            label: "<strong>" + i18n("Lot") + ":</strong>"
        });

        let labelClient = ({
            view: "label",
            label: "<strong>" + i18n("Client") + ":</strong>"
        });

        let txtClient = {
            view: "label",
        };
        lotFields.idclient ? txtClient.label = lotFields.idclient : txtClient.label = "-"

        let labelPendencyType = ({
            view: "label",
            label: "<strong>" + i18n("Pendency Type") + ":</strong>"
        });

        let txtPendencyType = {
            view: "label",
            label: pendencytype.pendencytype
        };

        let txtObs = new WebixInputTextArea('txtObs', '<strong>' + i18n('Detailed Observation') + '<strong>', pendencytype.observationtext,
            {
                height: 80
            });

        let rncData = {
            multi: true,
            view: "accordion", 
            type: "wide",
            collapsed: true,
            rows: [
                {
                    header: i18n("Lot Data"),
                    colapsed: false,
                    body: {
                        rows: [
                            {
                                cols: [
                                    labelLot,
                                    txtLot,
                                    labelOrder,
                                    txtOrder,
                                    labelEquipment,
                                    txtEquipment,
                                    labelMaterial,
                                    txtMaterial,
                                ]
                            },
                            {
                                cols: [
                                    labelClient,
                                    txtClient,
                                    labelPendencyType,
                                    txtPendencyType
                                ]
                            },
                            {
                                cols: [
                                    txtObs
                                ]
                            }
                        ]
                    }
                }
            ]
        }

        let lotDefects = {
            multi: true,
            view: "accordion", 
            type: "wide",
            collapsed: true,
            rows: [
                {
                    header: i18n("List Defect"),
                    colapsed: false,
                    body: {
                        rows: [
                            {
                                cols: [
                                    listDefect
                                ]
                            }
                        ]
                    }
                }
            ]
        }

        /* Rework */
        let allRework = await App.api.ormDbReworkTypesItems();
        allRework = allRework.data.map(
            (item) => {
                return {
                    id: item.id,
                    value: item.id + ' - ' + item.description
                }
            });

        /* CELL 1 */

        //BTN SCRAP PRODUCTION
        const btnScrapPro = {
            view: "button",
            id: "btnScrapPro",
            height: 50,
            click: async () => {
                let scrap = await modalScrapsRecord.showModal(null, null, null, 'RNC', data.idlot, data.id);

                if (scrap.success) {

                    let pendencyI = await App.api.ormDbFind('pendency', { "id": data.idpendency });
                    pendencyI = pendencyI.data[0];

                    let lot = await App.api.ormDbFind('lot', { "id": data.idlot });
                    lot = lot.data[0];

                    let order = null;
                    let lotLocal = null;

                    if (pendencyI.idorder) {
                        order = await App.api.ormDbFind('order', { "idordermes": pendencyI.idorder });
                        order = order.data[0]

                        lotLocal = await App.api.ormDbFind('local', { idequipment: order.idequipmentscheduled });
                        lotLocal = lotLocal.data[0].id;
                    }

                    let statusinterface = await App.api.ormDbFind('interface', {
                        idlot: data.idlot,
                        idstatus: {
                            $notIn: ['OK', 'RSD']
                        }
                    });
                    statusinterface = statusinterface.data;

                    let idstatus = statusinterface.length > 0 ? 'BLK' : 'NEW'
                    
                    let interfaceSave = await App.createInterfaceMs04(order, {
                        idinterface: 'MS04',
                        operation: 'A',
                        idstatus: idstatus,
                        material: lot.idmaterial,
                        lot: data.idlot ? ("0000000000" + data.idlot).slice(-10) : null,
                        report: 3
                    });

                    interfaceSave.idlot = data.idlot;

                    let inte = await App.api.ormDbCreate('interface', interfaceSave);

                    modal.close();
                    resolve(scrap)
                }
            },
            value: i18n("To Scrap"),
        }

        //BTN CELL PRODUCTION
        let btnSavePro = {
            view: "button",
            id: "btnSavePro",
            height: 50,
            click: async () => {
                let values = $$('tabP').getValues();
                let reworks = $$('reworkPro').getValue();
                let secondchoice = $$('secondChoicePro').getValue();

                let index = disposal.findIndex(x => x.releaseteam == 'P');
                let sequence = disposal[index];

                if ($$('tabP').validate()) {
                    webix.confirm(i18n('Are you sure you want to Release this Pendency?'), '', async (result) => {
                        if (result) {

                            let pr = {
                                idmaterialreclass: values.reclassifyPro,
                                reporttext: values.descriptionReportPro,
                                reworks: reworks,
                                secondchoice: secondchoice,
                                lot: data.idlot,
                                disposal: disposal,
                                idpendency: data.id,
                                sequence: sequence.sequence,
                                iduser: localStorage.getItem('login')
                            }

                            let pend = await App.api.ormDbPendencyRelease(pr);

                            if (pend.success) {
                                if ((pr.sequence == 2  || disposalControl == 'production') && pr.reworks == "") {

                                    let pendencyI = await App.api.ormDbFind('pendency', { "id": pr.idpendency });
                                    pendencyI = pendencyI.data[0];

                                    let order = null;
                                    let lotLocal = null;

                                    if (pendencyI.idorder) {
                                        order = await App.api.ormDbFind('order', { "idordermes": pendencyI.idorder });
                                        order = order.data[0]

                                        lotLocal = await App.api.ormDbFind('local', { idequipment: order.idequipmentscheduled });
                                        lotLocal = lotLocal.data[0].id;
                                    }

                                    let statusinterface = await App.api.ormDbFind('interface', {
                                        idlot: pr.lot,
                                        idstatus: {
                                            $notIn: ['OK', 'RSD']
                                        }
                                    });
                                    statusinterface = statusinterface.data;
                
                                    let idstatus = statusinterface.length > 0 ? 'BLK' : 'NEW'
                                    
                                    let interfaceSave = await App.createInterfaceMs04(order, {
                                        idinterface: 'MS04',
                                        operation: 'A',
                                        idstatus: idstatus,
                                        material: lotFields.materialid,
                                        lot: pr.lot ? ("0000000000" + pr.lot).slice(-10) : null,
                                        material2: pr.idmaterialreclass != "" ? pr.idmaterialreclass : null,
                                        report: pr.idmaterialreclass != "" ? 4 : 1
                                    });

                                    interfaceSave.idlot = pr.lot;

                                    let inte = await App.api.ormDbCreate('interface', interfaceSave);
                                }

                                webix.message(i18n('Released successfully!'));
                                modal.close();
                                resolve(pend)
                            }
                        }
                    });
                }
                else {

                    webix.message(i18n('Required fields are empty.'));
                    return;
                }
            },
            value: i18n("Save"),
        }

        /* Rework */
        let reworkPro = {
            view: "multicombo",
            label: i18n("Rework"),
            id: "reworkPro",
            suggest: {
                body: {
                    data: allRework
                }
            },
            labelPosition: "top"
        };

        /* Second Choice */
        let secondChoicePro = {
            view: "checkbox",
            id: "secondChoicePro",
            labelRight: i18n("Second Choice")
        };

        /* Reclassify for alternate application */
        let allReclassifyPro = await App.api.ormDbMaterialSameSteel({ material: lotFields.materialid });
        allReclassifyPro = allReclassifyPro.data
        let reclassifyPro = new WebixInputCombo('reclassifyPro', i18n("Reclassify for alternate application"), allReclassifyPro, {
            template: function (obj) {
                return obj.id + ' - ' + obj.description + ' - ' + i18n('Steel ') + obj.textvalue;
            }
        });

        /* Description Report */
        let descriptionReportPro = new WebixInputTextArea('descriptionReportPro', i18n('Report'), null, {
            height: 150
        });

        let rulesP = {
            "descriptionReportPro": webix.rules.isNotEmpty,
        };

        let cell1 = {
            header: i18n("Release RNC (Production)"),
            body: {
                view: 'form',
                id: 'tabP',
                rules: rulesP,
                rows: [
                    {
                        cols: [
                            reworkPro
                        ]
                    }, {
                        cols: [
                            secondChoicePro,
                            reclassifyPro
                        ]
                    },
                    {
                        cols: [
                            descriptionReportPro
                        ]
                    },
                    {
                        cols: [
                            btnScrapPro,
                            btnSavePro
                        ]
                    }
                ]
            }
        };

        /* CELL 2 */

        //BTN SCRAP QUALITY
        const btnScrapQua = {
            view: "button",
            id: "btnScrapQua",
            height: 50,
            click: async () => {
                let scrap = await modalScrapsRecord.showModal(null, null, null, 'RNC', data.idlot, data.id);
                if (scrap.success) {
                    let pendencyI = await App.api.ormDbFind('pendency', { "id": data.idpendency });
                    pendencyI = pendencyI.data[0];

                    let lot = await App.api.ormDbFind('lot', { "id": data.idlot });
                    lot = lot.data[0];

                    let order = null;
                    let lotLocal = null;

                    if (pendencyI.idorder) {
                        order = await App.api.ormDbFind('order', { "idordermes": pendencyI.idorder });
                        order = order.data[0]

                        lotLocal = await App.api.ormDbFind('local', { idequipment: order.idequipmentscheduled });
                        lotLocal = lotLocal.data[0].id;
                    }
                    
                    let statusinterface = await App.api.ormDbFind('interface', {
                        idlot: lot.id,
                        idstatus: {
                            $notIn: ['OK', 'RSD']
                        }
                    });
                    statusinterface = statusinterface.data;

                    let idstatus = statusinterface.length > 0 ? 'BLK' : 'NEW'

                    let interfaceSave = await App.createInterfaceMs04(order, {
                        idinterface: 'MS04',
                        operation: 'A',
                        idstatus: idstatus,
                        material: +lot.idmaterial,
                        lot: lot.id ? ("0000000000" + lot.id).slice(-10) : null,
                        report: 3
                    });
                    
                    interfaceSave.idlot = lot.id;

                    let inte = await App.api.ormDbCreate('interface', interfaceSave);

                    modal.close();
                    resolve(scrap)
                }
            },
            value: i18n("To Scrap"),
        }

        //BTN CELL QUALITY
        let btnSaveQua = {
            view: "button",
            id: "btnSaveQua",
            height: 50,
            click: async () => {
                let values = $$('tabQ').getValues();
                let reworks = $$('reworkQua').getValue();
                let secondchoice = $$('secondChoiceQua').getValue();

                let index = disposal.findIndex(x => x.releaseteam == 'Q');
                let sequence = disposal[index];

                if ($$('tabQ').validate()) {
                    webix.confirm(i18n('Are you sure you want to Release this Pendency?'), '', async (result) => {
                        if (result) {

                            let pr = {
                                idmaterialreclass: values.reclassifyQua,
                                reporttext: values.descriptionReportQua,
                                reworks: reworks,
                                secondchoice: secondchoice,
                                lot: data.idlot,
                                disposal: disposal,
                                idpendency: data.id,
                                sequence: sequence.sequence,
                                iduser: localStorage.getItem('login')
                            }

                            let pend = await App.api.ormDbPendencyRelease(pr);
                            // let pend = {};
                            // pend.success = true

                            if (pend.success) {
                                if ((pr.sequence == 2 || disposalControl == 'quality') && pr.reworks == "") {
                                    
                                    let pendencyI = await App.api.ormDbFind('pendency', { "id": pr.idpendency });
                                    pendencyI = pendencyI.data[0];

                                    let order = null;
                                    let lotLocal = null;

                                    if (pendencyI.idorder) {
                                        order = await App.api.ormDbFind('order', { "idordermes": pendencyI.idorder });
                                        order = order.data[0]

                                        lotLocal = await App.api.ormDbFind('local', { idequipment: order.idequipmentscheduled });
                                        lotLocal = lotLocal.data[0].id;
                                    }
                                    
                                    let statusinterface = await App.api.ormDbFind('interface', {
                                        idlot: pr.lot,
                                        idstatus: {
                                            $notIn: ['OK', 'RSD']
                                        }
                                    });
                                    statusinterface = statusinterface.data;
                
                                    let idstatus = statusinterface.length > 0 ? 'BLK' : 'NEW'
                                    let interfaceSave = await App.createInterfaceMs04(order, {
                                        idinterface: 'MS04',
                                        operation: 'A',
                                        idstatus: 'NEW',
                                        material: lotFields.materialid,
                                        lot: pr.lot ? ("0000000000" + pr.lot).slice(-10) : null,
                                        material2: pr.idmaterialreclass != "" ? pr.idmaterialreclass : null,
                                        report: pr.idmaterialreclass != "" ? 4 : 1
                                    });

                                    interfaceSave.idlot = pr.lot;

                                    let inte = await App.api.ormDbCreate('interface', interfaceSave);
                                }

                                webix.message(i18n('Released successfully!'));
                                modal.close();
                                resolve(pend)
                            }
                        }
                    });
                }
                else {

                    webix.message(i18n('Required fields are empty.'));
                    return;
                }


            },
            value: i18n("Save"),
        }

        /* Rework */
        let reworkQua = {
            view: "multicombo",
            label: i18n("Rework"),
            id: "reworkQua",
            suggest: {
                body: {
                    data: allRework
                }
            },
            labelPosition: "top"
        };

        /* Second Choice */
        let secondChoiceQua = {
            view: "checkbox",
            id: "secondChoiceQua",
            labelRight: i18n("Second Choice")
        };

        /* Reclassify for alternate application */
        let allReclassifyQua = await App.api.ormDbMaterialSameSteel({ material: lotFields.materialid });
        allReclassifyQua = allReclassifyQua.data
        let reclassifyQua = new WebixInputCombo('reclassifyQua', i18n("Reclassify for alternate application"), allReclassifyQua, {
            template: function (obj) {
                return obj.id + ' - ' + obj.description + ' - ' + i18n('Steel ') + obj.textvalue;
            }
        });

        /* Description Report */
        let descriptionReportQua = new WebixInputTextArea('descriptionReportQua', i18n('Report'), null, {
            height: 150
        });

        let rulesQ = {
            "descriptionReportQua": webix.rules.isNotEmpty,
        };

        let cell2 = {
            header: i18n("Release RNC (Quality)"),
            body: {
                view: 'form',
                id: 'tabQ',
                rules: rulesQ,
                rows: [
                    {
                        cols: [
                            reworkQua
                        ]
                    }, {
                        cols: [
                            secondChoiceQua,
                            reclassifyQua
                        ]
                    },
                    {
                        cols: [
                            descriptionReportQua
                        ]
                    },
                    {
                        cols: [
                            btnScrapQua,
                            btnSaveQua
                        ]
                    }
                ]
            }
        };

        /* ABAS */

        const tabview = {
            view: 'tabview',
            id: "sequence",
            cells: [
                cell1,
                cell2
            ]
        }

        modal.body = {
            view: 'form',
            id: "frmRegisterRNC",
            rows: [{
                cols: [{
                    rows: [
                        rncData,
                        padding,
                        lotDefects,
                        padding,
                        tabview
                    ]
                }]
            }]
        }

        modal.modal = true;
        modal.show();
        modal.setTitle(i18n("RNC"));

        if (disposalControl == "quality") {
            $$('tabP').disable();
            $$('sequence').setValue('tabQ');
        }
        else if (disposalControl == "production") {
            $$('tabQ').disable();
            $$('sequence').setValue('tabP');
        }

        if (disposalControl == 'both') {
            if (objP.seq < objQ.seq) {
                //seq 1
                if (objP.situation == 'A') {
                    $$('tabQ').disable();
                    $$('sequence').setValue('tabP');
                    $$('btnSavePro').setValue(i18n("Send to Quality"));
                    $$('btnScrapPro').disable();
                }
                else if (objP.situation == 'L') {

                    $$('tabP').disable();
                    $$('sequence').setValue('tabQ');

                    let reworkTypes = await App.api.ormDbReworkTypes({ idpendency: data.id });
                    let vlrReworks = ""

                    if (reworkTypes.data.length > 0) {
                        reworkTypes.data.forEach(e => {
                            vlrReworks = e.idreworktype + "," + vlrReworks
                        })
                        $$('reworkPro').setValue(vlrReworks.substr(0, (vlrReworks.length - 1)))
                        $$('reworkQua').setValue(vlrReworks.substr(0, (vlrReworks.length - 1)))
                    }

                    let pendencyReleased = await App.api.ormDbFind('pendencyrelease', { "idpendency": data.id, "disposaltypesequence": objP.seq })

                    if (pendencyReleased.data[0].chkmd) {
                        $$('secondChoicePro').setValue("1");
                    }
                    if (pendencyReleased.data[0].idmaterialreclass) {
                        $$('tabP').elements.reclassifyPro.setValue(pendencyReleased.data[0].idmaterialreclass)
                    }
                    if (pendencyReleased.data[0].reporttext) {
                        $$('tabP').elements.descriptionReportPro.setValue(pendencyReleased.data[0].reporttext)
                    }
                }

            }
            else {
                //seq 2

                if (objQ.situation == 'A') {
                    $$('tabP').disable();
                    $$('sequence').setValue('tabQ');
                    $$('btnSaveQua').setValue(i18n("Send to Production"))
                    $$('btnScrapPro').disable();
                }
                else if (objQ.situation == 'L') {

                    $$('tabQ').disable();
                    $$('sequence').setValue('tabP');

                    let reworkTypes = await App.api.ormDbReworkTypes({ idpendency: data.id });
                    let vlrReworks = ""

                    if (reworkTypes.data.length > 0) {
                        reworkTypes.data.forEach(e => {
                            vlrReworks = e.idreworktype + "," + vlrReworks
                        })
                        $$('reworkQua').setValue(vlrReworks.substr(0, (vlrReworks.length - 1)))
                        $$('reworkPro').setValue(vlrReworks.substr(0, (vlrReworks.length - 1)))
                    }

                    let pendencyReleased = await App.api.ormDbFind('pendencyrelease', { "idpendency": data.id, "disposaltypesequence": objQ.seq })

                    if (pendencyReleased.data[0].chkmd) {
                        $$('secondChoiceQua').setValue("1");
                    }

                    if (pendencyReleased.data[0].idmaterialreclass) {
                        $$('tabQ').elements.reclassifyQua.setValue(pendencyReleased.data[0].idmaterialreclass)

                    }
                    if (pendencyReleased.data[0].reporttext) {
                        $$('tabQ').elements.descriptionReportQua.setValue(pendencyReleased.data[0].reporttext)
                    }
                }
            }
        }

    });
}

