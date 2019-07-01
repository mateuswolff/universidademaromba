import { App } from "../../lib/App.js";
import { i18n } from "../../lib/I18n.js";
import { WebixWindow, WebixInputCombo, WebixCrudDatatable } from "../../lib/WebixWrapper.js";

export async function showModal(dtEddyCurrent, id, order = null) {

    return new Promise(async function (resolve, reject) {

        let modal = new WebixWindow({
            width: 600,
            height: 500
        });

        /* Equipments */
        let allEquipment = await App.api.ormDbFind('equipment', { status: true });
        let equipments = ({
            view: "combo",
            label: i18n("Equipments"),
            name: "cmbEquipment",
            disabled: order ? true : false,
            value: order ? order.idequipmentscheduled : null,
            options: allEquipment.data
        });

        /* OP */
        let op = ({
            view: "text",
            label: i18n("OP"),
            value: order ? order.idordermes : null,
            disabled: order ? true : false,
            name: "txOp"
        });

        /* Date Initial */
        let dateInitial = ({
            view: "datepicker",
            name: "dtDateInitial",
            label: i18n("Date Initial"),
            value: new Date(),
            timepicker: true
        });

        /* Speed */
        let speed = ({
            view: "text",
            label: i18n("Speed"),
            name: "txSpeed"
        });

        /* Phase */
        let phase = ({
            view: "text",
            label: i18n("Phase (deg)"),
            name: "txPhase"
        });

        /* Fequency */
        let frequency = ({
            view: "text",
            label: i18n("Frequency (Hz)"),
            name: "txFrequency"
        });

        /* Sensitivity */
        let sensitivity = ({
            view: "text",
            label: i18n("Sensitivity"),
            name: "txSensitivity"
        });
        let dtEddyCurrentRow = new WebixCrudDatatable("dtEddyCurrentRow");
        dtEddyCurrentRow.columns = [
            {
                id: "date",
                header: i18n("Date"),
                format: (value) => { return value ? moment(value).format('DD/MM/YYYY HH:mm:SS') : '-' },
                width: 130
            },
            {
                id: "speed",
                header: i18n("Speed"),
                width: 70
            },
            {
                id: "phase",
                header: i18n("Phase"),
                width: 70
            },
            {
                id: "frequency",
                header: i18n("Frequency"),
                width: 70
            },
            {
                id: "sensitivity",
                header: i18n("Sensitivity"),
                width: 80
            },
            {
                id: "iduser",
                header: i18n("User"),
                width: 70
            }
        ]

        let filter = { idsequence: id };
        let DataEddyCurrent = id > 0 ? await App.api.ormDbEddyCurrent(filter) : '';

        if (DataEddyCurrent) {

            let Data = DataEddyCurrent.data[0];

            equipments.value = Data.idequipment;
            op.value = Data.idorder;
            dateInitial.value = moment(Data.date).format('YYYY/MM/DD HH:mm');

            speed.value = Data.velocity;
            phase.value = Data.phase;
            frequency.value = Data.frequency;
            sensitivity.value = Data.sensitivity;
        }

        let rules = {
            "cmbEquipment": webix.rules.isNotEmpty,
            "txOp": webix.rules.isNotEmpty,
            "dtDateInitial": webix.rules.isNotEmpty,
            "txSpeed": webix.rules.isNotEmpty,
            "txPhase": webix.rules.isNotEmpty,
            "txFrequency": webix.rules.isNotEmpty,
            "txSensitivity": webix.rules.isNotEmpty
        };

        const btnSave = {
            view: "button",
            id: "btnSave",
            height: 50,
            click: async () => {

                let data = $$("frmEddyCurrent").getValues();

                let eddyCurrents = {
                    "idequipment": data.cmbEquipment,
                    "idorder": data.txOp,
                    "date": data.dtDateInitial,
                    "velocity": data.txSpeed.replace(/,/g, "."),
                    "phase": data.txPhase.replace(/,/g, "."),
                    "frequency": data.txFrequency.replace(/,/g, "."),
                    "sensitivity": data.txSensitivity.replace(/,/g, ".")
                };

                if ($$("frmEddyCurrent").validate()) {

                    if (id > 0) {

                        App.api.ormDbUpdate({ "idsequence": id }, 'eddycurrent', eddyCurrents).then((item) => {
                            webix.message(i18n('Updated successfully!'));
                            modal.close();
                            resolve(item);
                            if (dtEddyCurrent) {
                                App.loadAllCrudDataEddyCurrent();
                            }
                        });

                    } else {

                        App.api.ormDbCreate('eddycurrent', eddyCurrents).then((item) => {
                            webix.message(i18n('Saved successfully!'));
                            modal.close();
                            resolve(item);
                            if (dtEddyCurrent) {
                                App.loadAllCrudDataEddyCurrent();
                            }
                        });

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
            id: "frmEddyCurrent",
            rules: rules,
            rows: [{
                cols: [
                    equipments,
                    op
                ]
            }, {
                cols: [
                    dateInitial
                ]
            }, {
                cols: [
                    phase,
                    frequency
                ]
            }, {
                cols: [
                    speed,
                    sensitivity
                ]
            }, 
            {cols: [
                dtEddyCurrentRow
            ]},
            {
                cols: [
                    btnSave
                ]
            }
            ]
        };

        modal.modal = true;
        await modal.show();
        let allEddyCurrent = await App.api.ormDbEddyCurrent({
            idequipment: order.idequipmentscheduled,
            idordermes: order.idordermes,
            idsequence: null
        });
        if (allEddyCurrent.data.length > 0) {
            $$('dtEddyCurrentRow').clearAll();
            $$('dtEddyCurrentRow').parse(allEddyCurrent.data);
        }
        modal.setTitle(i18n("EDDY Current Standard Validation Record"));
    });
}