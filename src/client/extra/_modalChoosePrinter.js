import { WebixWindow, WebixCrudAddButton, WebixInputCombo } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";

export async function showModal(op) {
    return new Promise(async function (resolve, reject) {
        let print = await App.api.ormDbFind('print');
        let modal = new WebixWindow({
            width: 600,
            height: 1000
        });
        modal.body = {
            id: "formChangeEquipment",
            padding: 20,
            rows: [{
                cols: [
                    new WebixInputCombo('nmPrinter', i18n('Printer'), print.data, {
                        id: 'secPrinterChoose',
                        template: (item) => {
                            return item.name + ' ' + item.description
                        }
                    })
                ]
            },
            new WebixCrudAddButton("btnSaveSpecialInstruction", i18n("Choose"), async function () {
                let idprinter = $$('secPrinterChoose').getValue();
                modal.close();
                resolve(print.data.find(item => item.id == idprinter));
            })]
        };
        modal.modal = true;
        modal.show();
        modal.setTitle(i18n("Choose printer"));
    });
}