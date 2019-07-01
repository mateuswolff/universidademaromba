import { WebixWindow, WebixDatatable } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";

import * as  screenProductionProgram from "../components/screenProductionProgramStart.js";
import * as  _modalScrapsRecord from "./_modalScrapsRecord.js";

export async function showModal(order, disabledEdit = false) {
    let scraps = await App.api.ormDbFind('scrap', { idorder: order.idordermes });

    let modal = new WebixWindow({
        width: 600,
        height: 400
    });
    modal.body = {
        padding: 20,
        rows: [{
            view: "datatable",
            scroll: true,
            id: "dtScraps",
            select: "row",
            columns: [
                { id: "idscrapsequence", header: i18n('Sequence'), width: 150 },
                { id: "idscrapreason", header: i18n('Scrap Reason'), width: 150 },
                { id: "weight", header: i18n('Weight'), width: 150 },
                { id: "quantity", header: i18n('Quantity'), width: 150 },
                { id: "idoperation", header: i18n('Operation'), width: 150 },
            ],
            data: scraps.data
        },
        {
            hidden: disabledEdit,
            cols: [
                {},
                {
                    view: 'button',
                    label: i18n('Edit'),
                    height: 80,
                    id: "btnScrapsTree",
                    click: async () => {
                        let data = $$('dtScraps').getSelectedItem();
                        if (data) {
                            modal.close();
                            let scrap = await _modalScrapsRecord.showModal(null, data, order);
                            if (scrap.code === 200) {
                                screenProductionProgram.showScreen(order.equipmentscheduledtype, order)

                            }
                        } else {
                            webix.message(i18n('Please select an item.'));
                        }
                    }
                },
                {}
            ]
        }]
    };
    modal.modal = true;
    modal.show();
    modal.setTitle(i18n("Scrap"));
}