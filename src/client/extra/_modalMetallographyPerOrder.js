import { WebixWindow, WebixDatatable } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";

import * as  screenProductionProgram from "../components/screenProductionProgramStart.js";
import * as  _modalMetallographyViewSample from "../extra/_modalMetallographyViewSample.js";

//import * as  _modalScrapsRecord from "./_modalScrapsRecord.js";

export async function showModal(order, disabledEdit = false) {
    let metallography = await App.api.ormDbFind('metallography', { idorder: order.idordermes });

    let modal = new WebixWindow({
        width: 600,
        height: 400
    });
    modal.body = {
        padding: 20,
        rows: [{
            view: "datatable",
            scroll: true,
            id: "dtMetallography",
            select: false,
            columns: [
                { id: "idorder", header: i18n('Order Mes'), width: 150 },
                { id: "idlot", header: i18n('Lot'), fillspace: true },
                //{ id: "link", header: i18n('Image'), width: 150 },
                { id: "validation", header: i18n('Status'), width: 150, template: (obj) => {
                    if(obj.validation){
                        return i18n('Approved')
                    }
                    else{
                        return i18n('Reproved')
                    }
                } },
                {
                    id: "link",
                    header: i18n("Image"),
                    sort: "string",
                    height: 60,
                    template: (obj) => {
                        if (obj.link)
                            return "<div class='webix_el_button'><a href='" + obj.link + "' target='_blank'><button class='webixtype_base'>" + i18n('View Sample') + "</button></a></div>"
                        else
                            return "-"
                    }
                }
            ],
            onClick: {
                webixtype_base: function (ev, id) {
                }
            },
            data: metallography.data
        },
        {
            cols: [
                {},
                {
                    view: 'button',
                    label: i18n('Sample Request'),
                    height: 80,
                    id: "btnScrapsTree",
                    click: async () => {
                            webix.confirm({
                                title: i18n(""),
                                ok: i18n("Yes! Create"),
                                cancel: i18n("No! Thank you"),
                                text: i18n('Do you want to make a sample request for metallography?'),
                                callback: async function (result) {
                                    if (result) {
                                        let lot = await App.api.ormDbFindOne('lot', { idmaterial: order.idmaterial, new: true });
                                        let result = await App.api.ormDbCreate('metallography', {
                                            idorder: order.idordermes,
                                            idlot: lot.data.id
                                        });
                        
                                        if (result.success) {
                                            webix.message('Metallography created successfully');
                                        } else {
                                            webix.message('Failed to create metallography try again later');
                                        }
                                    }
                                }
                            });
                    }
                },
                {}
            ]
        }]
    };
    modal.modal = true;
    modal.show();
    modal.setTitle(i18n("Metallography"));
}