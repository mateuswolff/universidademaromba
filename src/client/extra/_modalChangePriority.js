import { WebixWindow, WebixCrudAddButton, WebixInputSelect } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";

let modal = new WebixWindow({
    width: 400,
});
export async function showModal(order) {
    return new Promise(async function (resolve, reject) {


        const padding = ({
            view: "label",
            label: i18n(""),
        });

        let aPriority = [
            {
                id: "URGENT",
                value: i18n("Urgent"),
            },
            {
                id: "NORMAL",
                value: i18n("Normal"),
            }
        ]

        let priority = new WebixInputSelect('priority', i18n('Priority'), aPriority, {
            //"onChange": searchOrdersByFilter
        });

        modal.body = {
            view: "form",
            id: "formPriority",
            elements: [
                priority,
                new WebixCrudAddButton("btnSavePriority", i18n("Save"), async () => {
                    if ($$('formPriority').elements.priority.getValue() != "") {
                        let urgency = $$('formPriority').elements.priority.getValue();
                        let resp = await App.api.ormDbUpdate({ idordermes: order.idordermes }, 'order', { urgency: urgency });
                        if (resp.success) {
                            modal.close();
                            webix.message(i18n('Saved successfully!'));
                            resolve(resp);
                        } else {
                            reject(resp);
                        }
                    }
                    else
                        webix.alert(i18n('Please, select a value of Urgency to save!'))
                })
            ],
            rules: {
            }
        };

        modal.modal = true;
        modal.show();
        modal.setTitle(i18n("Production Order Create"));

    });
}