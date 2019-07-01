import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputText, WebixInputSelect } from "../lib/WebixWrapper.js";
import { optionsStatus } from "./optionsScreens.js";
import * as util from "../lib/Util.js";

export async function showScreen() {

    let dtEquipment = new WebixCrudDatatable("dtEquipment");

    let allType = await App.api.ormDbFind('equipmenttype', { status: true });
    let allPrinter = await App.api.ormDbFind('print', { status: true });

    dtEquipment.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 100, sort: "string" },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], sort: "string", fillspace: true },
        {
            id: "idtype", template: (obj) => {
                return (allType.data.find(x => x.id == obj.idtype)).description;
            },
            header: [i18n("Type"), { content: "selectFilter" }], width: 100, sort: "string"
        },
        {
            id: "idprinter", template: (obj) => {
                if (obj.idprinter && allPrinter.data.length){
                    let item = allPrinter.data.find(x => x.id == obj.idprinter);
                    if (item) 
                        return item.name;
                    else
                        return "-";
                }
                else
                    return '-'
            },
            header: [i18n("Printer"), { content: "selectFilter" }], width: 100, sort: "string"
        },
        { id: "productivity", header: [i18n("Efficiency"), { content: "textFilter" }], width: 80, sort: "string" }
    ];

    dtEquipment.createStatusColumn();

    let validate = (id, req) => {
        if (id == 'idtype') {
            for (var i = 0; i < req.values.length; i++) {
                let option = (allType.data.find((x) => x.id == req.values[i].value));
                if (option) {
                    req.values[i].value = option.description;
                }
            }
        }
    }

    dtEquipment.changeFilterOptions(validate);

    let itens = [
        new WebixInputText("id", i18n("Id")),
        new WebixInputText("description", i18n("Description")),
        new WebixInputSelect("idtype", i18n("Type"), allType.data, {
            template: function (obj) {
                return obj.description;
            }
        }),
        new WebixInputSelect("idprinter", i18n("Printer"), allPrinter.data, {
            template: function (obj) {
                return obj.name;
            }
        }),
        new WebixInputText("productivity", i18n("Efficiency")),
    ];

    let rules = {
        "id": webix.rules.isNotEmpty,
        "description": webix.rules.isNotEmpty,
        "idtype": webix.rules.isNotEmpty
    };

    App.createDefaultFormCrud('Equipment', dtEquipment, itens, rules, 'equipment');
    App.replaceMainContent(dtEquipment, async () => App.loadAllCrudData('equipment', dtEquipment));
}