import { WebixWindow, WebixCrudAddButton } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";
import * as util from "../lib/Util.js";

import * as screenProductionCoilCollect from '../components/screenProductionCoilCollect.js'
import * as _modalRegisterRNC from './_modalRegisterRNC.js'

export async function showModal(cuttingPlan, equipment) {
    return new Promise(async function (resolve, reject) {
        let modal = new WebixWindow({
            width: 400,
        });

        modal.body = {
            view: "form",
            id: "mdCollectByItem",
            rows: [
                {
                    height: 60,
                    cols: [
                        {
                            view: "text", value: "", id: 'txtTextPa', label: i18n('Tape weight'), align: "top", inputHeight: 50, attributes: { type: 'number' }
                        },
                    ]
                },
                {
                    cols: [
                        {},
                        new WebixCrudAddButton('package', i18n('Close package'), async () => { }, {
                            width: 100,
                            height: 80
                        }),
                        {}
                    ]
                }
            ]
        };

        modal.modal = true;
        modal.show();
        modal.setTitle(i18n('Close package'));
    });
}

/* Change Value ImputText */
function changeValue(text, value) {

    if (text == "txAmount")
        $$('frmDefectRegistry').elements.txPartsPackages.setValue(value);
    else
        $$('frmDefectRegistry').elements.txAmount.setValue(value);
}