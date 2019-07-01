import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputText } from "../lib/WebixWrapper.js";
import { optionsStatus } from "./optionsScreens.js";
import * as util from "../lib/Util.js";

export async function showScreen() {

    let dtEquipmentType = new WebixCrudDatatable("dtEquipmentType");

    dtEquipmentType.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 100, sort: "string" },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], ssort: "string", fillspace: true },
    ];

    dtEquipmentType.createStatusColumn();

    let validate = (id, req) =>{
        if (id == 'idtype') {
            for (var i = 0; i < req.values.length; i++) {
                let option = (allType.data.find((x) => x.id == req.values[i].value));
                if (option) {
                    req.values[i].value = option.description;
                }
            }
        }
    }

    dtEquipmentType.changeFilterOptions(validate);

    let itens = [
        new WebixInputText("id", i18n("Id"), {disabled: true}),
        new WebixInputText("description", i18n("Description"))
    ];

    let rules = {
        "description": webix.rules.isNotEmpty,
    };

    let ORDER = {
        "colum" : 'id',
        "sort"  : 'ASC'
    }

    App.createDefaultFormCrud('Equipment Type', dtEquipmentType, itens, rules, 'equipmenttype');
    App.replaceMainContent(dtEquipmentType, async () => App.loadAllCrudData('equipmenttype', dtEquipmentType,ORDER));
}