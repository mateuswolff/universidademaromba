import { WebixWindow, WebixDatatable } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";

import * as  screenProductionProgram from "../components/screenProductionProgramStart.js";
import * as  _modalDefectRegistry from "./_modalDefectRegistry.js";

export async function showModal(order, disabledEdit = false) {
    return new Promise(async function (resolve, reject) {
        let defect = await App.api.ormDbFindDefectTypeByOrder({ idordermes: order.idordermes });
        let modal = new WebixWindow({
            width: 600,
            height: 400
        });
        modal.body = {
            padding: 20,
            rows: [{
                view: "datatable",
                scroll: true,
                id: "dtDefects",
                select: "row",
                columns: [
                    { id: "idlot", header: i18n('Lot'), width: 150 },
                    { id: "defect", header: i18n('Defect'), width: 150 },
                    { id: "weight", header: i18n('Weight'), width: 150 },
                    { id: "quantity", header: i18n('Quantity'), width: 150 },
                    { id: "idoperation", header: i18n('Operation'), width: 150 },
                    { id: "date", header: i18n('Date'), width: 150, format: (item) => { return item ? moment(item).format('DD/MM/YYYY HH:mm') : '-' } },
                ],
                data: defect.data
            }, {
                hidden: disabledEdit,
                cols: [
                    {},
                    {
                        view: 'button',
                        label: i18n('Edit'),
                        height: 80,
                        id: "btnDefects",
                        click: async () => {
                            let data = $$('dtDefects').getSelectedItem();
                            if (data) {
                                modal.close();
                                let defect = await _modalDefectRegistry.showModal(null, data.id, data.idlot, order);
                                if (defect.code == 200) {
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
        modal.setTitle(i18n("Defect"));
    });
}