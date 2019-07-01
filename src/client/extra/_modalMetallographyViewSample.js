import { WebixWindow, WebixDatatable } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";

import * as  screenProductionProgram from "../components/screenProductionProgramStart.js";

//import * as  _modalScrapsRecord from "./_modalScrapsRecord.js";

export async function showModal(order, disabledEdit = false) {
    let metallography = await App.api.ormDbFind('metallography', { idorder: order.idordermes });
    let sampleHtml = `https://drive.google.com/file/d/1WtA4PaVAI2bl9WsCCiIh_Trn8gn_wvB1/view?usp=sharing`

    let modal = new WebixWindow({
        width: 600,
        height: 400
    });
    modal.body = {
        padding: 20,
        rows: [
            {
                view: 'template', id: "tmpReader", scroll: true, template: sampleHtml
            }
        ]
    };


    modal.modal = true;
    modal.show();
    modal.setTitle(i18n("Sample"));
}