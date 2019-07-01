import { WebixWindow, WebixInputCombo, WebixInputSelect } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";
import * as util from "../../lib/Util.js";

export async function showModal(item, dtStops = null, id, order = null) {
    return new Promise(async function (resolve, reject) {

        let modal = new WebixWindow({
            width: 600,
            height: 1000
        });

        /* Type Stops */
        let rdTypeStop = ({
            view: "radio",
            name: "rdTypeStop",
            label: i18n("Type"),
            options: [
                { "id": 1, "value": i18n("PLANNED") },
                { "id": 2, "value": i18n("PERFORMED") }
            ],
            disabled: true,
        });

        rdTypeStop.value = (item == 'PLANNED') ? 1 : 2;

        /* Date Start */
        let dtStartDate = ({
            view: "datepicker",
            name: "dtStartDate",
            label: i18n("Start Date"),
            value: new Date(),
            timepicker: true
        });

        /* Date End */
        let dtEndDate = ({
            view: "datepicker",
            name: "dtEndDate",
            label: i18n("End Date"),
            timepicker: true,
            value: null
        });

        /* Equipments */
        let allEquipment = await App.api.ormDbFind('equipment', { status: true });
        let equipment = new WebixInputCombo('equipment', i18n("Equipments"), allEquipment.data, {
            template: function (obj) {
                return obj.id + ' - ' + obj.description;
            },
            onChange: async (item) => {
                let stops = await App.api.ormDbStopReasonByEquipment({ idequipment: item });
                if (stops.data.length) {
                    $$('cmbStopreason').define("options", stops.data.map(item => { return { id: item.id, value: item.id + ' - ' + item.description } }));
                    $$('cmbStopreason').refresh();
                } else {
                    $$('cmbStopreason').define("options", allStopReasons.data.map(item => { return { id: item.id, value: item.id + ' - ' + item.description } }));
                    $$('cmbStopreason').refresh();
                }
            }
        });

        /* Stop Reason */
        let allStopReasons = await App.api.ormDbFind('stopreason', { status: true });

        if(allStopReasons.data.length){
            allStopReasons = allStopReasons.data.sort((a, b) => (a.description > b.description) ? 1 : -1);
        }
        else{
            allStopReasons = null;
        }

        let stopReasons = new WebixInputSelect('stopreason', i18n("Stop Reason"), allStopReasons, {
            template: function (obj) {
                //return obj.id + ' - ' + i18n(obj.description);
                return i18n(obj.description);
            },
            onChange: async (item) => {
                let stopTypes = await App.api.ormDbFind('stoptype', { status: true, idstopreason: item });
                if (stopTypes.data.length) {

                    stopTypes = stopTypes.data.sort((a, b) => (a.description > b.description) ? 1 : -1);

                    $$('cmbStoptype').enable();
                    $$('cmbStoptype').setValue("");
                    // $$('cmbStoptype').define("options", stopTypes.map(item => { return { id: item.id, value: item.id + ' - ' + item.description } }));
                    $$('cmbStoptype').define("options", stopTypes.map(item => { return { id: item.id, value: item.description } }));
                    $$('cmbStoptype').refresh();

                } else {
                    $$('cmbStoptype').setValue("");
                    $$('cmbStoptype').disable();
                    $$('cmbStoptype').refresh();
                }
            }
        });

        /* Stop Type */
        // let allStopTypes = await App.api.ormDbFind('stoptype', { status: true });

        // if(allStopTypes.data.length){
        //     allStopTypes = allStopTypes.data.sort((a, b) => (a.description > b.description) ? 1 : -1);
        // }
        // else{
        //     allStopTypes = null;
        // }

        let stoptype = new WebixInputSelect('stoptype', i18n("Stop Type"), null, {
            template: function (obj) {
                // return obj.id + ' - ' + i18n(obj.description);
                return i18n(obj.description);
            },
            disabled: true
        });

        /* Worktable Peaces */
        let worktablePeaces = ({
            view: "text",
            label: i18n("Worktable Peaces"),
            name: "txworktablePeaces"
        });

        /* Velocity */
        let velocity = ({
            view: "text",
            label: i18n("Velocity"),
            name: "txvelocity"
        });

        /* Shift */
        let allShift = await App.api.ormDbFind('shift', { status: true });
        let shift = new WebixInputCombo('shift', i18n("Shift"), allShift.data, {
            template: function (obj) {
                return obj.description;
            }
        });

        let DataStops = id > 0 ? await App.api.ormDbFindOne('stop', { id: id }) : '';

        /** SE ESTIVER ALTERANDO */
        if (DataStops) {

            let Data = DataStops.data;

            rdTypeStop.value = (Data.stoptype == 'PLANNED') ? 1 : 2;

            dtStartDate.value = moment(Data.startdate).format('YYYY/MM/DD HH:mm');
            dtEndDate.value = moment(Data.enddate).format('YYYY/MM/DD HH:mm');

            equipment.value = Data.idequipment;
            stopReasons.value = Data.idstopreason;
            stoptype.value = Data.idstoptype;

            worktablePeaces.value = Data.quantityofparts;
            velocity.value = Data.velocity;
            shift.value = Data.letter;
        }

        if (order) {
            equipment.value = order.idequipmentscheduled;
            equipment.disabled = true;
        }

        /* Validation Form */
        let rulesE = {
            "dtStartDate": webix.rules.isNotEmpty,
            "equipment": webix.rules.isNotEmpty,
            "stopreason": webix.rules.isNotEmpty,
            "stoptype": webix.rules.isNotEmpty
        };

        let rulesP = {
            "dtStartDate": webix.rules.isNotEmpty,
            "equipment": webix.rules.isNotEmpty,
            "stopreason": webix.rules.isNotEmpty,
            "stoptype": webix.rules.isNotEmpty
        };

        const btnSave = {
            view: "button",
            id: "btnSave",
            height: 50,
            click: async () => {

                let data = $$("frmStops").getValues();

                let shift = await util.findMyShift();
                let stops = {
                    "idequipment": data.equipment,
                    "idorder": order && order.idordermes ? order.idordermes : null,
                    "stoptype": data.rdTypeStop == '1' ? "PLANNED" : "PERFORMED",
                    "startdate": data.dtStartDate,
                    "enddate": data.dtEndDate,
                    "idstopreason": data.stopreason,
                    "idstoptype": data.stoptype,
                    "quantityofparts": data.txworktablePeaces ? Number(data.txworktablePeaces) : 0,
                    "velocity": data.txvelocity ? parseFloat(data.txvelocity.replace(',', '.')) : 0,
                    "letter": shift
                };

                if (!stops.enddate)
                    delete stops.enddate

                /* Validation Register */
                let registerCreate = false;

                if ($$("frmStops").validate()) {

                    if (stops.idstoptype == "")
                        stops.idstoptype = null

                    let result = null;
                    if (id > 0) {

                        result = await App.api.ormDbUpdate({ "id": id }, 'stop', stops);
                        if (result.success)
                            webix.message(i18n('Updated successfully!'));
                        else
                            webix.message(i18n('Updated unsuccessfully!'));

                    } else {
                        result = await App.api.ormDbCreate('stop', stops);
                        if (result.success)
                            webix.message(i18n('Saved successfully!'));
                        else
                            webix.message(i18n('Saved unsuccessfully!'));
                    }

                    modal.close();
                    resolve(result);
                    if (dtStops) App.loadAllCrudData('stop', dtStops);

                } else {

                    webix.message(i18n('Required fields are empty.'));
                    return;
                }
            },
            value: i18n("Save"),
        }

        /* Disabled Input */
        worktablePeaces.disabled = (item == 'PLANNED') ? true : false;
        velocity.disabled = (item == 'PLANNED') ? true : false;
        shift.disabled = (item == 'PLANNED') ? true : false;

        if (item == 'PERFORMED' && id > 0 && DataStops.data.enddate == null) {
            dtEndDate.value = moment(new Date()).format('YYYY/MM/DD HH:mm');
        }

        modal.body = {
            view: "form",
            id: "frmStops",
            rules: (item == 'PLANNED') ? rulesP : rulesE,
            rows: [{
                cols: [
                    rdTypeStop
                ]
            }, {
                cols: [
                    dtStartDate
                ]
            }, {
                cols: [
                    dtEndDate
                ]
            }, {
                cols: [
                    equipment
                ]
            }, {
                cols: [
                    stopReasons
                ]
            }, {
                cols: [
                    stoptype
                ]
            }, {
                cols: [
                    worktablePeaces,
                    velocity
                ]
            }, {
                cols: [
                    btnSave
                ]
            }]
        };

        modal.modal = true;
        modal.show();
        modal.setTitle(i18n("Stops"));
    });
}