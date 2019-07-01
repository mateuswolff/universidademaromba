import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { optionsTypeOperation } from "../components/optionsScreens.js"
import { optionsStatus } from "../components/optionsScreens.js"
import { WebixCrudDatatable, WebixInputText, WebixInputSelect } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen() {
 
    let dtOperation = new WebixCrudDatatable("dtOperation");

    dtOperation.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], sort: "string", width: 100 },
        {
            id: "operationtype",
            template: (obj) => {
                let option = (optionsTypeOperation.find(x => x.id == obj.operationtype));
                return option.value;
            },
            header: [i18n("Type"), { content: "selectFilter" }], sort: "string", fillspace: true
        },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], sort: "string", width: 300 }
    ]

    dtOperation.createStatusColumn();

    let validate = (id, req) =>{
        if (id == 'operationtype') {
            for (var i = 0; i < req.values.length; i++) {
                let option = (optionsTypeOperation.find((x) => x.id == req.values[i].value));
                if (option) {
                    req.values[i].value = option.value;
                }
            }
        }
    }

    dtOperation.changeFilterOptions(validate);

    let itens = [
        new WebixInputText("id", i18n("Id")),
        new WebixInputSelect('operationtype', i18n('Operation Type'), optionsTypeOperation),
        new WebixInputText("description", i18n("Description"))
    ]

    let rules = {
        "id": webix.rules.isNotEmpty,
        "operationtype": webix.rules.isNotEmpty,
        "description": webix.rules.isNotEmpty,
    }

    App.createDefaultFormCrud('Operation', dtOperation, itens, rules, 'operation', { });

    App.replaceMainContent(dtOperation, async () => App.loadAllCrudData('operation', dtOperation));
}