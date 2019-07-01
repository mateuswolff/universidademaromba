import {
    WebixWindow,
    WebixLabel,
    WebixInputTextArea,
    WebixCrudAddButton,
    WebixInputSelect
} from "../lib/WebixWrapper.js";
import {
    i18n
} from "../lib/I18n.js";
import {
    App
} from "../lib/App.js";

export async function showModal(op) {
    return new Promise(async function (resolve, reject) {
        
        let equipment = await App.api.ormDbFind('equipment', {status: true});
        equipment.data.sort(function(a,b) {
            if(a.description < b.description) return -1;
            if(a.description > b.description) return 1;
            return 0;
        });

        let modal = new WebixWindow({
            width: 600,
            height: 1000
        });
        modal.body = {
            id: "formChangeEquipment",
            padding: 20,
            rows: [{
                cols: [
                    new WebixLabel('nmEquipment', i18n("Old Equipment"), {
                        extraLabel: ' : ' + equipment.data.find(eq => { return eq.id == op.idequipmentexpected }).description
                    }),
                    new WebixLabel('nmOrderMES', i18n("OrderMES"), {
                        extraLabel: ' : ' + op.idordermes
                    }),
                    new WebixLabel('nmOrderSAP', i18n("OrderSAP"), {
                        extraLabel: ' : ' + op.idordersap
                    })
                ]
            }, {
                cols: [
                    new WebixInputSelect('nmEquipment', i18n('idequipment'), equipment.data, {
                        id: 'secEquipmentChanged',
                        template: (item) => {
                            return item.description
                        }
                    })
                ]
            },
            new WebixCrudAddButton("btnSaveSpecialInstruction", i18n("Save"), async function () {
                let idequipment = $$('secEquipmentChanged').getValue();
                op.idequipmentscheduled = idequipment;
                let resp = await App.api.ormDbUpdateEquipment({ order: op });

                if (resp.success) {
                    modal.close();
                    resolve(resp);
                } else {
                    reject(resp);
                }
            })]
        };
        modal.modal = true;
        modal.show();
        modal.setTitle(i18n("Change equipment"));
    });
}