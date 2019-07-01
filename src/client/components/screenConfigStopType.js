import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { optionsStatus } from "../components/optionsScreens.js"
import { WebixCrudDatatable, WebixInputText, WebixInputCombo } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen() {

    let dtStopType = new WebixCrudDatatable("dtStopType");

    let stopsReasons = await App.api.ormDbFind('stopreason', { status: true });

    dtStopType.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 100, sort: "string" },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], sort: "string", fillspace: true },
        {
            id: "idstopreason", header: [i18n("Stop Reason"), { content: "textFilter" }], template: (obj) => {
                let item = stopsReasons.data.find(x => x.id == obj.idstopreason);
                if (item)
                    return item.description;
                else
                    return '-';
            }, sort: "string", fillspace: true
        },
    ]

    dtStopType.createStatusColumn();
    dtStopType.changeFilterOptions();

    dtStopType.on = {
        'onItemClick': function (id, e, trg) {
            let element = this.getItem(id.row)
            if (element.iduser == 'OEE') {
                $$('btnRemove').disable();
                $$('btnEnable').disable();
                $$('btnDisable').disable();
                $$('btnEdit').disable();
            } else {
                $$('btnRemove').enable();
                $$('btnEnable').enable();
                $$('btnDisable').enable();
                $$('btnEdit').enable();
            }
        }
    }

    let itens = [
        new WebixInputText("id", i18n("Id")),
        new WebixInputText("description", i18n("Description")),
        new WebixInputCombo("idstopreason", i18n("Stop Reason"), stopsReasons.data.map(item => {
            return { id: item.id, value: item.description }
        }), {
                template: (item) => {
                    return item.value;
                }
            }),
    ]

    let rules = {
        "id": webix.rules.isNotEmpty,
        "description": webix.rules.isNotEmpty,
    }

 
    App.createDefaultFormCrud('Stop Type', dtStopType, itens, rules, "stoptype", {});

    App.replaceMainContent(dtStopType, async () => App.loadAllCrudData('stoptype', dtStopType));
}

