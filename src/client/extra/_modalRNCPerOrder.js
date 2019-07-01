import { WebixWindow, WebixDatatable } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";

export async function showModal(order, disabledEdit = false) {
    let scraps = await App.api.ormDbFind('pendency', { idorder: order.idordermes });

    scraps = scraps.data.map((item) => {
        if (item.pendencystatus === 'L') {
            item.pendencystatus = i18n('Released');
        } else if (item.pendencystatus === 'S') {
            item.pendencystatus = i18n('Scrap');
        } else if (item.pendencystatus === 'C') {
            item.pendencystatus = i18n('Canceled');
        } else if (item.pendencystatus === 'P') {
            item.pendencystatus = i18n('Pending');
        } else {
            item.pendencystatus = i18n('Active');
        }
        return item;
    })

    let modal = new WebixWindow({
        width: 600,
        height: 400
    });
    modal.body = {
        padding: 20,
        rows: [{
            view: "datatable",
            scroll: true,
            columns: [
                { id: "idlot", header: i18n('Lot'), width: 150 },
                { id: "idpendencytype", header: i18n('Pendecy Type'), width: 150 },
                { id: "pendencydate", header: i18n('Date'), width: 150 },
                { id: "observationtext", header: i18n('Observation'), width: 150 },
                { id: "pendencystatus", header: i18n('Status'), width: 150 },
            ],
            data: scraps
        }]
    };
    modal.modal = true;
    modal.show();
    modal.setTitle(i18n("RNC"));
}