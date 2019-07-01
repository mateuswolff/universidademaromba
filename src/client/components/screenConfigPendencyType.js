import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { optionsStatus } from "../components/optionsScreens.js"
import { WebixCrudDatatable, WebixInputText, WebixInputSelect } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen() {

    let dtPendencyType = new WebixCrudDatatable("dtPendencyType");

    let allDisposalType = await App.api.ormDbFind('disposaltype');

    dtPendencyType.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], sort: "string", width: 100 },
        { id: "description", header: ["Description", { content: "textFilter" }], fillspace: true, sort: "string" },
        { 
            id: "iddisposaltype", template: (obj) => {
                return (allDisposalType.data.find(x => x.id == obj.iddisposaltype)).id;
            }, 
            header: [i18n("Disposal Type"), { content: "selectFilter" }], width: 100, sort: "string" 
        }
    ]

    dtPendencyType.createStatusColumn();

    let validate = (id, req) =>{
        if (id == 'iddisposaltype') {
            for (var i = 0; i < req.values.length; i++) {
                let option = (allDisposalType.data.find((x) => x.id == req.values[i].value));
                if (option) {
                    req.values[i].value = option.description;
                }
            }
        }
    }

    dtPendencyType.changeFilterOptions();

    let itens = [
        new WebixInputText("id", i18n("Id")),
        new WebixInputText("description", i18n("Description")),
        new WebixInputSelect("iddisposaltype", i18n("Disposal Type"), allDisposalType.data, {
            template: function (obj) {
                return obj.id;
            }
        })

    ]

    let rules = {
        "id": webix.rules.isNotEmpty,
        "description": webix.rules.isNotEmpty,
        "iddisposaltype": webix.rules.isNotEmpty,
    }

    App.createDefaultFormCrud('Pendency Type', dtPendencyType, itens, rules, 'pendencytype');
    App.replaceMainContent(dtPendencyType, async () => App.loadAllCrudData('pendencytype', dtPendencyType));
}