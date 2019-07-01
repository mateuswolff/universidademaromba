import { i18n } from "../../lib/I18n.js";
import { App } from "../../lib/App.js";
import * as _modalDefectRegistry from "../../extra/_modalDefectRegistry.js";
import * as  screenProductionProgram from "../screenProductionProgramStart.js";

export async function create(order) {
    let defect = await App.api.ormDbFind('defect', { idorder: order.idordermes, idlot: order.idlot });
    let defectData = defect.data[defect.data.length - 1] ? defect.data[defect.data.length - 1] : [];
    return {
        view: "form",
        scroll: false,
        // width: 300,
        elementsConfig: { margin: 5 },
        elements: [
            {
                view: "fieldset",
                label: i18n("Defects"),
                borderless: true,
                height: 100,
                body: {
                    rows: [
                        {
                            view: 'button',
                            value: i18n('Add new defect'),
                            click: async () => {
                                order.idlot = 0;
                                let result = await _modalDefectRegistry.showModal(null, 0, order);
                                $$('dtDefectModal').clearAll();
                                $$('dtDefectModal').parse(result.data, "json");
                                screenProductionProgram.showScreen(order.equipmentscheduledtype, order)

                            }
                        },
                        {
                            view: "datatable",
                            id: "dtDefectModal",
                            scroll: false,
                            columns: [
                                { id: "iddefecttype", header: i18n("Defect"), width: 80 },
                                { id: "weight", header: i18n("Weight"), width: 50 },
                                { id: "quantity", header: i18n("Quantity"), width: 50 },
                                { id: "idoperation", header: i18n("Operation"), width: 50 },
                            ],
                            data: defectData
                        }
                    ]
                }
            }
        ]
    }
}