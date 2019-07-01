import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { optionsStatus } from "../components/optionsScreens.js"
import { WebixCrudDatatable, WebixInputNumber, WebixInputDate, WebixInputCombo } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen() {

    let dtParameter = new WebixCrudDatatable("dtParameter");

    let allEquipment = await App.api.ormDbFind('equipment');

    dtParameter.columns = [
        {
            id: "idequipment", template: (obj) => {
                return (allEquipment.data.find(x => x.id == obj.idequipment)).description;
            },
            header: [i18n("Equipment"), { content: "selectFilter" }],
            sort: "string",
            fillspace: true
        },
        {
            id: "targett0",
            header: [i18n("Target T0"), { content: "numberFilter" }],
            sort: "int",
            fillspace: true
        },
        {
            id: "targett1",
            header: [i18n("Target T1"), { content: "numberFilter" }],
            sort: "int",
            fillspace: true
        },
        {
            id: "targett2",
            header: [i18n("Target T2"), { content: "numberFilter" }],
            sort: "int",
            fillspace: true
        },
        {
            id: "targett3",
            header: [i18n("Target T3"), { content: "numberFilter" }],
            sort: "int",
            fillspace: true
        },
        {
            id: "targetoee",
            header: [i18n("Target OEE"), { content: "numberFilter" }],
            sort: "int",
            fillspace: true
        }

    ]

    dtParameter.createStatusColumn();
    let validate = (id, req) => {
        if (id == 'idequipment') {
            for (var i = 0; i < req.values.length; i++) {
                let option = (allEquipment.data.find(x => x.id == req.values[i].value));
                if (option) {
                    req.values[i].value = option.description;
                }
            }
        }
    }

    dtParameter.changeFilterOptions(validate);

    let itens = [
        new WebixInputCombo("idequipment", i18n("Equipment"), allEquipment.data, {
            template: function (obj) {
                return obj.description;
            }
        }),
        {
            cols: [
            new WebixInputNumber("targett0", i18n("Target T0")),
            new WebixInputNumber("targett1", i18n("Target T1")),
            ]
        },
        {
            cols: [
            new WebixInputNumber("targett2", i18n("Target T2")),
            new WebixInputNumber("targett3", i18n("Target T3")),
            ]
        },
        new WebixInputNumber("targetoee", i18n("Target OEE")),
    ]

    let rules = {
        "idequipment": webix.rules.isNotEmpty,
        "targett0": webix.rules.isNotEmpty,
        "targett1": webix.rules.isNotEmpty,
        "targett2": webix.rules.isNotEmpty,
        "targett3": webix.rules.isNotEmpty,
        "targetoee": webix.rules.isNotEmpty,
    }

    async function reloadData() {
        let data = await App.api.ormDbFind('oeeparameter');
        data = data.data;

        $$('dtParameter').clearAll();
        $$('dtParameter').parse(data, "json");
    }

    App.createDefaultFormCrud('Oee Parameter', dtParameter, itens, rules, 'oeeparameter');
    App.replaceMainContent(dtParameter, async () => App.loadAllCrudData('oeeparameter', dtParameter));

}