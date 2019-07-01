import { WebixWindow, WebixInputCombo } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js"; 
import { App } from "../lib/App.js";

export async function showModal(item, dtMetallography) {
    
    return new Promise(async function (resolve, reject) {

    let modal = new WebixWindow({
        width: 600,
        height: 1000
    });

    /* OP */
    let op = ({
        view:"text", 
        label: i18n("Op"),
        name:"txOp",
        value: item.idorder,
        disabled: true
    });

    /* Lot */
    let lot = ({
        view:"text", 
        label: i18n("Lot"),
        name:"txLot",
        value: item.idlot,
        disabled: true
    });

    /* Link */
    let link = ({
        view:"text", 
        label: i18n("Link"),
        name:"txLink"
    });

    const btnApproved  = {
        view: "button",
        id: "btnApproved",
        height: 50,
        click: async () => {  save('true'); },
       value: i18n("Approved"),
    }

    const btnReproved = {
        view: "button",
        id: "btnReproved",
        height: 50,
        click: async () => {  save('false'); },
        value: i18n("Reproved"),
    }

    let rules = {
        "txLink": webix.rules.isNotEmpty
    };

    function save(acao) {

        if ($$("frmMetallography").validate()) {

            let data = $$("frmMetallography").getValues();

            let metallography = {
            "link": data.txLink,
            "validation": acao 
            };

            App.api.ormDbUpdate({ "id": item.id }, 'metallography', metallography).then((item) => {
                webix.message(i18n('Saved successfully!'));
            });

            modal.close();

            if (dtMetallography) App.loadAllCrudDataMetallography();

        } else {

            webix.message(i18n('Required fields are empty.'));
            return;
  
        }

    }

    modal.body = {
        view: "form",
        id: "frmMetallography",
        rules: rules,
        rows: [{
            cols: [
                op,
                lot
            ]
        }, {
            cols: [
                link
            ]
        }, {
            cols: [
                btnApproved,
                btnReproved
            ]
        }]
    };

    modal.modal = true;
    modal.show();
    modal.setTitle(i18n("Metallography Register"));
    });
}