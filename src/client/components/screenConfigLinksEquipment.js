import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixBuildReponsiveTopMenu } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

import * as ccAddDefectTypeToEquipment from "./componentsComplement/ccAddDefectTypeToEquipment.js";
import * as ccAddStopCodToEquipment from "./componentsComplement/ccAddStopCodToEquipment.js";
import * as ccAddScrapReasonToEquipment from "./componentsComplement/ccAddScrapReasonToEquipment.js";

export async function showScreen() {

    let equipments = await App.api.ormDbFind('equipment', { status: true });
    equipments = equipments.data;

    let body = {
        view: 'form',
        id: "sequence",
        elements: [
            {
                view: 'tabview',
                id: "tabSequence",
                cells: [
                    await ccAddDefectTypeToEquipment.create(equipments),
                    await ccAddStopCodToEquipment.create(equipments),
                    await ccAddScrapReasonToEquipment.create(equipments)
                ]
            }
        ]
    };

    App.replaceMainMenu(WebixBuildReponsiveTopMenu('Links Equipment', []))
    App.replaceMainContent(body);
}