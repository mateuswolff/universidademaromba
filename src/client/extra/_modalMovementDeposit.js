import { WebixWindow, WebixInputCombo } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";

export async function showModal(item, dtForDeposit) {
    return new Promise(async function (resolve, reject) {

        let modal = new WebixWindow({
            width: 600,
            height: 1000
        });

        /* Local */
        let allLocal = await App.api.ormDbFind('local', { status: true });

        let local = new WebixInputCombo('local', i18n("Local Destiny"), allLocal.data, {
            template: function (obj) {
                return '<strong> EQU: </strong>' + obj.idequipment + ' - <strong>  LOC:  </strong>' + obj.description + ' - <strong>  GALP:  </strong>' + obj.idhangar + ' - <strong>  LIN:  </strong>' + obj.posx + ' - <strong>  COL:  </strong>' + obj.posy + ' - <strong>  ALT:  </strong>' + obj.posz;
            },
        });

        /* Validation Form */
        let rules = {
            "local": webix.rules.isNotEmpty,
        };

        const btnSave = {
            view: "button",
            id: "btnSave",
            height: 50,
            click: async () => {

                let data = $$("frmMovement").getValues();

                let moverequest = {
                    "idlocal": data.local,
                    "situationmovement": 'R'
                };

                /* Validation Form */
                if ($$("frmMovement").validate()) {

                    let update = await App.api.ormDbUpdate({ "id": item.id }, 'moverequest', moverequest);

                    let allForDeposit = await App.api.ormDbMovementDeposit();
                    if ($$('dtForDeposit')) {
                        $$('dtForDeposit').clearAll();
                        $$('dtForDeposit').parse(allForDeposit.data, "json");
                    }
                    resolve(allForDeposit);
                    modal.close();

                } else {

                    webix.message(i18n('Required fields are empty.'));
                    return;
                }

            },
            value: i18n("Save"),
        }

        modal.body = {
            view: "form",
            id: "frmMovement",
            rules: rules,
            rows: [{
                cols: [
                    local
                ]
            }, {
                cols: [
                    btnSave
                ]
            }]
        };

        modal.modal = true;
        modal.show();
        modal.setTitle(i18n("Movement for Deposit"));
    });
}