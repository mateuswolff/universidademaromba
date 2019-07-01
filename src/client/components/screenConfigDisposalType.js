import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { optionsStatus } from "../components/optionsScreens.js"
import { WebixCrudDatatable, WebixInputText, WebixInputSelect } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen() {
 
    let dtDisposalType = new WebixCrudDatatable("dtDisposalType");

    let allReleaseTeam = await App.api.ormDbFind('releaseteam');
    let allDisposalType = await App.api.ormDbFind('disposaltype');

    async function reloadData(){
        let newData = await App.api.ormDbFind('disposaltype');

        newData = await newData.data.map(
            (item) => {
                return {
                    newId: item.id,
                    sequenceview: item.disposaltypesequence,
                    idreleaseteam: item.idreleaseteam,
                    status: item.status
                }
            }
        )

        $$('dtDisposalType').clearAll();
        $$('dtDisposalType').parse(newData, "json");
    }

    dtDisposalType.columns = [
        { id: "newId", header: [i18n("Id"), { content: "textFilter" }], width: 100, sort: "string" },
        { id: "sequenceview", header: [i18n("Disposal Type Sequence"), { content: "textFilter" }], fillspace: true, sort: "string" },
        {
            id: "idreleaseteam", template: (obj) => {
                return (allReleaseTeam.data.find(x => x.id == obj.idreleaseteam)).description;
            },
            header: [i18n("Release Team"), { content: "selectFilter" }], width: 100, sort: "string"
        }
    ]

    dtDisposalType.createStatusColumn();

    let validate = (id, req) => {

        if (id == 'idreleaseteam') {
            for (var i = 0; i < req.values.length; i++) {
                let option = allReleaseTeam.data.find((x) => {
                    return x.id.toString() == req.values[i].id.toString();
                });
                if (option) {
                    req.values[i].value = option.description;
                }
            }
        }
    }

    dtDisposalType.changeFilterOptions(validate);

    let itens = [
        new WebixInputText("id", i18n("Id"), { suggest: allDisposalType.data }),
        new WebixInputText("disposaltypesequence", i18n("Disposal Type Sequence")),

        new WebixInputSelect("idreleaseteam", i18n("Release Team"), allReleaseTeam.data, {
            template: function (obj) {
                return obj.description;
            }
        })
    ]

    let rules = {
        "id": webix.rules.isNotEmpty,
        "disposaltypesequence": webix.rules.isNumber,
        "idreleaseteam": webix.rules.isNotEmpty

    }

    App.createDefaultFormCrud('Disposal Type', dtDisposalType, itens, rules, 'disposaltype', {"reload": reloadData, "dt": true});
    App.replaceMainContent(dtDisposalType, reloadData);
}