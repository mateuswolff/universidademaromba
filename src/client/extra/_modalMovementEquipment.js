import { WebixWindow, WebixInputCombo } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js"; 
import { App } from "../lib/App.js";

export async function showModal(item, dtForEquipament) {
    return new Promise(async function (resolve, reject) {

    let modal = new WebixWindow({
        width: 600,
        height: 1000
    });

    /* Local */
    let allLocal = await App.api.ormDbFind('local', {status: true});  

    let local = new WebixInputCombo('local', i18n("Local Destiny"), allLocal.data, {
        template: function (obj) {
          if (obj.idequipment)
            return '<strong> EQU: </strong>'+obj.idequipment+' - <strong>  LOC:  </strong>'+obj.description+' - <strong>  GALP:  </strong>'+obj.idhangar+' - <strong>  LIN:  </strong>'+obj.posx+' - <strong>  COL:  </strong>'+obj.posy+' - <strong>  ALT:  </strong>'+obj.posz;
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
                 "situationmovement": 'E'
            };  

            /* Validation Form */
            if ($$("frmMovement").validate()) {

                App.api.ormDbUpdate({"id": item.id}, 'moverequest', moverequest).then((item) => {
                    webix.message(i18n('Updated successfully!'));
                });

                let allForEquipment = await App.api.ormDbMovementEquipment({"idequipment": item.idequipment});

                $$('dtForEquipment').clearAll();
                $$('dtRawMaterialLots').clearAll();
                $$('dtForEquipment').parse(allForEquipment.data, "json");
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
    modal.setTitle(i18n("Movement for Equipment"));
    });
}