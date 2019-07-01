import { WebixWindow, WebixDatatable } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";

export async function showModal(item) {
    return new Promise(async function (resolve, reject) {
        let alllots = await App.api.ormDbGetDetailsLotGenerated({ idorder: item.idordermes });

        let dtLotGenerated = new WebixDatatable("dtLotGenerated");

        dtLotGenerated.columns = [
            {
                id: "situation",
                header: i18n("Situation"),
                width: 60,
                template: (item) => `<div class='${item.situation}'></div>`, sort: "string"
            },
            { id: "idlot", header: [i18n("Id lot"), { content: "textFilter" }], sort: "int" },
            { id: "material", header: [i18n("Material"), { content: "textFilter" }], width: 200, sort: "int" },
            {
                id: "weight", header: [i18n("Weight"), { content: "textFilter" }],
                template: (item) => `${item.situation === 'red' ? '0' : item.weight}`, sort: "string"
            },
            { id: "equipment", header: [i18n("Equipment"), { content: "selectFilter" }], sort: "string" },
            { id: "local", header: [i18n("Local"), { content: "selectFilter" }], sort: "string" },
            { id: "lotconsumed1", header: [i18n("First lot consumed"), { content: "selectFilter" }], sort: "string" },
            { id: "lotweight1", header: [i18n("First weight"), { content: "selectFilter" }], sort: "string" },
            { id: "lotconsumed2", header: [i18n("Second lot consumed"), { content: "selectFilter" }], sort: "string" },
            { id: "lotweight2", header: [i18n("Second weight"), { content: "selectFilter" }], sort: "string" },
            {
                id: "idshift",
                header: [i18n("Letter"), { content: "selectFilter" }],
                template: (item) => `${i18n(item.idshift)}`,
                sort: "string"
            },
            { id: "iduser", header: [i18n("User"), { content: "selectFilter" }], sort: "string" },
        ];

        dtLotGenerated.data = alllots.data;

        let modal = new WebixWindow({
            width: 800,
            height: 600
        });

        modal.body = {
            view: "form",
            id: "frmDetailOP",
            rows: [
                dtLotGenerated
            ]
        };

        modal.modal = true;
        modal.show();
        modal.setTitle(i18n("Lot generated"));
    });

}