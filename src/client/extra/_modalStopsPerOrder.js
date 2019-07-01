import { WebixWindow, WebixDatatable } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";

import * as  screenProductionProgram from "../components/screenProductionProgramStart.js";
import * as  _modalStops from "./_modalStops.js";

export async function showModal(order, disabledEdit = false) {
    return new Promise(async function (resolve, reject) {
        let stops = await App.api.ormDbAllStopEquipment({ idorder: order.idordermes });

        let modal = new WebixWindow({
            width: 600,
            height: 400
        });
        modal.body = {
            padding: 20,
            rows: [{
                view: "datatable",
                scroll: true,
                select: "row",
                id: "dtStops",
                resizeColumn: true,
                columns: [
                    { id: "idorder", header: i18n('Order'), width: 60 },
                    { id: "equipment", header: i18n('Equipment'), width: 80 },
                    { id: "stopreasondescription", header: i18n('Stop Reason'), width: 180 },
                    { id: "stoptypedescription", header: i18n('Stop Type'), width: 150 },
                    { id: "startdate", header: i18n('Start Date'), width: 100, format: (item) => { return item ? moment(item).format('DD/MM/YYYY HH:mm') : '-' } },
                    { id: "enddate", header: i18n('End Date'), width: 100, format: (item) => { return item ? moment(item).format('DD/MM/YYYY HH:mm') : '-' } },
                    { id: "quantityofparts", header: i18n('Quantity Of Parts'), width: 110 },
                    { id: "velocity", header: i18n('Velocity'), width: 80 },
                    { id: "letter", header: i18n('Letter'), width: 90 },
                ],
                data: stops.data
            }, {
                hidden: disabledEdit,
                cols: [
                    {},
                    {
                        view: 'button',
                        label: i18n('Edit'),
                        height: 80,
                        id: "btnScrapsTwo",
                        click: async () => {
                            let data = $$('dtStops').getSelectedItem();
                            if (data) {
                                modal.close();
                                let stop = await _modalStops.showModal('PERFORMED', null, data.id, order);
                                if (stop.code === 200) {
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
        modal.setTitle(i18n("Stop"));
    });
}