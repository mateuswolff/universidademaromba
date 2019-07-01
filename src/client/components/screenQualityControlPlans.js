import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputText, WebixInputSelect, WebixInputTextArea } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen(event) {

    let dtControlPlan = new WebixCrudDatatable("dtControlPlan");
    
    let allNorm = await App.api.ormDbFind('norm');

    
    dtControlPlan.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 200, fillspace: true, sort: "string" },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], width: 200, fillspace: true, sort: "string" },
        {
            id: "idnorm", template: (obj) => {
                let findNorm = allNorm.data.find(x => x.id == obj.idnorm)

                if(findNorm){
                    return findNorm.id;
                }
                else {
                    return "-"
                }
            },
            header: [i18n("Norm"), { content: "selectFilter" }], fillspace: true, sort: "string"
        }
    ];
    
    dtControlPlan.createStatusColumn();
    dtControlPlan.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtControlPlan", event);
        }
    };

    let validate = (id, req) => {
        if (id == 'idnorm') {
            for (var i = 0; i < req.values.length; i++) {
                let option = (allNorm.data.find((x) => x.id == req.values[i].value));
                if (option) {
                    req.values[i].value = option.description;
                }
            }
        }
    }

    //dtControlPlan.changeFilterOptions(validate);

    let itens = [
        new WebixInputText("id", i18n("Id")),
        new WebixInputTextArea("description", i18n("Description"), null, {
            height: 80
        }),
        new WebixInputSelect("idnorm", i18n("Norm"), allNorm.data, {
            template: function (obj) {
                return obj.id;
            }
        }),
    ];

    let rules = {
        "id": webix.rules.isNotEmpty,
        "description": webix.rules.isNotEmpty,
        "idnorm": webix.rules.isNotEmpty
    };

    App.createDefaultFormCrud('Control Plan', dtControlPlan, itens, rules, 'controlplan');
    App.replaceMainContent(dtControlPlan, async () => App.loadAllCrudData('controlplan', dtControlPlan));

    await util.datatableColumsGet('dtControlPlan', event);
}