import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputText, WebixInputNumber } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen() {

    let dtStandardPackage = new WebixCrudDatatable("dtStandardPackage");

    dtStandardPackage.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], sort: "string", width: 100 },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "packagequantity", header: [i18n("Package Quantity"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "thicknessmin", header: [i18n("Thickness Min"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "thicknessmax", header: [i18n("Thickness Max"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "diametermin", header: [i18n("Diameter Min"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "diametermax", header: [i18n("Diameter Max"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "lengthmin", header: [i18n("Length Min"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "lengthmax", header: [i18n("Length Max"), { content: "textFilter" }], sort: "string", fillspace: true },
    ]

    dtStandardPackage.createStatusColumn();
    dtStandardPackage.changeFilterOptions();

    let itens = [
        new WebixInputText("id", i18n("Id"), { disabled: true }),
        new WebixInputText("description", i18n("Description")),
        {
            rows: [
                {
                    cols: [
                        new WebixInputNumber("thicknessmin", i18n("Thickness Min")),
                        new WebixInputNumber("thicknessmax", i18n("Thickness Max")),
                    ],
                },
                {
                    cols: [
                        new WebixInputNumber("diametermin", i18n("Diameter Min")),
                        new WebixInputNumber("diametermax", i18n("Diameter Min"))
                    ]
                },
                {
                    cols: [
                        new WebixInputNumber("lengthmin", i18n("Length Min")),
                        new WebixInputNumber("lengthmax", i18n("Length Max"))
                    ]
                }
            ]
        },
        new WebixInputText("packagequantity", i18n("Package Quantity")),
    ]

    let rules = {
        "description": webix.rules.isNotEmpty,
        "thicknessmin": webix.rules.isNotEmpty,
        "thicknessmax": webix.rules.isNotEmpty,
        "diametermin": webix.rules.isNotEmpty,
        "diametermax": webix.rules.isNotEmpty,
        "packagequantity": webix.rules.isNotEmpty
    }

    App.createDefaultFormCrud('Standard Package', dtStandardPackage, itens, rules, "standardpackage", {});

    App.replaceMainContent(dtStandardPackage, async () => App.loadAllCrudData('standardpackage', dtStandardPackage));
}