import { WebixWindow, WebixCrudAddButton, WebixInputTextArea } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";

import * as _modalRegisterRNC from './_modalRegisterRNC.js';
//import * as _modalChoosePrinter from './_modalChoosePrinter.js';

export async function showModal(stepPiece) {
    return new Promise(async function (resolve, reject) {

        /* Date Start */
        let dtStartDate = ({
            view: "datepicker",
            name: "dtStartDate",
            label: i18n("Start Date"),
            value: stepPiece.dtinitial ? new Date(stepPiece.dtinitial) : new Date(),
            timepicker: true
        });

        /* Date End */
        let dtEndDate = ({
            view: "datepicker",
            name: "dtEndDate",
            minuteStep: 1,
            label: i18n("End Date"),
            timepicker: true,
            value: stepPiece.dtend ? new Date(stepPiece.dtend) : null,
        });

        let obs = new WebixInputTextArea("obs", i18n("Observation"), stepPiece.text ? stepPiece.text : "", {
            height: 80
        })

        let btnSave = new WebixCrudAddButton('save', i18n('Save'), async () => {

            let result = await App.api.ormDbUpdate(
                { 
                    idlot: stepPiece.lot,
                    piece: stepPiece.piece,
                    idstep: stepPiece.idstep
                }, 'steppieces', 
                { 
                    dtinitial: $$('formStepPieces').elements.dtStartDate.getValue(),
                    dtend: $$('formStepPieces').elements.dtEndDate.getValue(), 
                    text: $$('formStepPieces').elements.obs.getValue() 
                });
            
                if (result.success){
                    modal.close();
                    resolve(stepPiece);
                }

        }, {
                width: 200,
                height: 40,
            });

        let modal = new WebixWindow({
        });

        modal.body = {
            view: "form",
            id: "formStepPieces",
            rows:
                [
                    dtStartDate,
                    dtEndDate,
                    obs,
                    {
                        cols: [
                            {},
                            btnSave,
                            {}
                        ]
                    }
                ]
        };

        modal.modal = true;
        modal.show();
        modal.setTitle(i18n('Big Maker Step'));
    });
}
