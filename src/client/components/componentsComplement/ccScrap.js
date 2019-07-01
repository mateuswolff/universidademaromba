import { i18n } from "../../lib/I18n.js";
import { App } from "../../lib/App.js";
import * as _modalScrapsRecord from "../../extra/_modalScrapsRecord.js";
import * as ccRawMaterial from "./ccRawMaterial.js";
import * as  screenProductionProgram from "../screenProductionProgramStart.js";

export async function create(order) {
    let scraps = await App.api.ormDbFind('scrap', {idorder: order.idordermes, idequipment: order.idequipmentscheduled});
    let scrapsData = scraps.data[scraps.data.length - 1] ? scraps.data[scraps.data.length - 1] : [];
    return {
        view: "form",
        scroll: false,
        // height: 130,
        width: 250,
        elements: [
            {
                view: "fieldset",
                label: i18n("Scrap"),
                borderless: true,
                body: {
                    rows: [
                        {
                            view: 'button',
                            value: i18n('Add new scrap'),
                            disabled: localStorage.getItem('oldLotReader' + order.idordermes) ? false : true,
                            id: "btnScrapRegister",
                            click: async () => {
                                let result = await _modalScrapsRecord.showModal(null, 0, order);

                                //alterando o peso restante
                                await ccRawMaterial.searchInformation(localStorage.getItem('oldLotReader' + order.idordermes), order);

                                //recarrega a tela
                                screenProductionProgram.showScreen(order.equipmentscheduledtype, order)

                                // $$('dtScrapReasonModal').clearAll();
                                // $$('dtScrapReasonModal').parse(result, "json");
                            }
                        },
                        {
                            view: "datatable",
                            id: "dtScrapReasonModal",
                            scroll:false,
                            columns: [
                                { id: "idscrapreason", header: i18n("Scrap Reason"), width: 80 },
                                { id: "weight", header: i18n("Weight"), width: 50 },
                                { id: "quantity", header: i18n("Quantity"), width: 50 }
                            ],
                            data: scrapsData
                        }
                    ]
                }
            }
        ]
    }
}