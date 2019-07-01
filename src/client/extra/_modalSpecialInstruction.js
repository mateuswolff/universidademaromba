import {
    WebixWindow,
    WebixLabel,
    WebixInputTextArea,
    WebixCrudAddButton
} from "../lib/WebixWrapper.js";
import {
    i18n
} from "../lib/I18n.js";
import {
    App
} from "../lib/App.js";

export async function showModal(op) {
    let equipment = await App.api.ormDbFindOne('equipment', {
        id: op.idequipment
    });
    let material = await App.api.ormDbFindOne('material', {
        id: op.idmaterial
    });

    let specialInstructionItem = await App.api.ormDbFindOne('specialinstruction', {
        idorder: op.idordermes
    });

    let modal = new WebixWindow({
        width: 600,
        height: 500
    });
    modal.body = {
        id: "formSpecialInstruction",
        padding: 20,
        rows: [{
            cols: [
                new WebixLabel('nmEquipment', i18n("Equipment"), {
                    extraLabel: ' : ' + equipment.data.description
                }),
                new WebixLabel('nmOrderMES', i18n("OrderMES"), {
                    extraLabel: ' : ' + op.idordermes
                }),
                new WebixLabel('nmOrderSAP', i18n("OrderSAP"), {
                    extraLabel: ' : ' + op.idordersap
                }),
                new WebixLabel('nmMaterial', i18n("Material"), {
                    extraLabel: ' : ' + material.data.description
                })
            ]
        },
        new WebixInputTextArea("description", i18n("Description"), specialInstructionItem.data ? specialInstructionItem.data.description : null, {
            id: "txaDescriptSpecialInstruction"
        }),
        new WebixCrudAddButton("btnSaveSpecialInstruction", i18n("Save"), function () {
            let descr = $$('txaDescriptSpecialInstruction').getValue();
            if (descr === "" || descr == null || descr == undefined) {
                webix.message(i18n('Please insert some instruction!'));
            } else {
                let specialinstruction = {
                    idorder: op.idordermes,
                    description: descr
                };

                if (specialInstructionItem.data) {
                    App.api.ormDbUpdate({
                        id: specialInstructionItem.data.id
                    },
                        'specialinstruction',
                        specialinstruction)
                        .then((item) => {
                            webix.message(i18n('Updated successfully!'));
                            modal.close();
                        })
                } else {
                    App.api.ormDbCreate('specialinstruction', specialinstruction)
                        .then((item) => {
                            webix.message(i18n('Saved successfully!'));
                            modal.close();
                        })
                }
            }
        })
        ]
    };
    modal.modal = true;
    modal.show();
    modal.setTitle(i18n("Special Instructions"));
}