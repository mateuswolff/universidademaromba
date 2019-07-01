import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputText, WebixInputSelect, WebixInputDate } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen() {

    let dtMaterial = new WebixCrudDatatable("dtMaterial");
    
    let allMaterialType = await App.api.ormDbFind('materialtype');

    dtMaterial.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 100, sort: "string" },
        { id: "name", header: [i18n("Name"), { content: "textFilter" }], fillspace: true, sort: "string" },
        { id: "situation", header: [i18n("Situation"), { content: "textFilter" }], width: 80, sort: "string" },
        { 
            id: "idmaterialtype", template: (obj) => {
                return (allMaterialType.data.find(x => x.id == obj.idmaterialtype)).description;
            }, 
            header: [i18n("Material Type"), { content: "textFilter" }], width: 100, sort: "string" 
        },
        { id: "class", header: [i18n("Class"), { content: "textFilter" }], width: 100, sort: "string" },
        { id: "unitBasic", header: [i18n("Basic Unit"), { content: "textFilter" }], width: 80, sort: "string" },
        { id: "idUnitAverage", header: [i18n("Average Unit"), { content: "textFilter" }], width: 80, sort: "string" },
        { id: "idcharacteristic", header: [i18n("Characteristic"), { content: "textFilter" }], width: 150, sort: "string" },
        { id: "idPlanControl", header: [i18n("Plan Control"), { content: "textFilter" }], width: 200, sort: "string" },
        {
            id: "datePlanControl",
            format: (value) => { return moment(value).format("DD/MM/YYYY") },
            header: [i18n("Date Plan Control"), {
                content: "datepickerFilter",
                compare: (cellValue, filterValue) => {
                    return moment(cellValue).format("YYYY/MM/DD") == moment(filterValue).format("YYYY/MM/DD")
                }
            }], sort: "string", width: 150
        },
        { id: "idUserPlanControl", header: [i18n("User Plan Control"), { content: "textFilter" }], width: 100, sort: "string" }
    ];

    dtMaterial.createStatusColumn();
    dtMaterial.changeFilterOptions();
    
    let itens = [
        new WebixInputText("id", i18n("Id")),
        new WebixInputText("name", i18n("Name")),
        new WebixInputText("situation", i18n("Situation")),
        new WebixInputSelect("idmaterialtype", i18n("Material Type"), allMaterialType.data, {
            template: function (obj) {
                return obj.description;
            }
        }),
        new WebixInputText("class", i18n("Class")),
        new WebixInputText("unitBasic", i18n("Basic Unit")),
        new WebixInputText("idUnitAverage", i18n("Average Unit")),
        new WebixInputText("idcharacteristic", i18n("Characteristic")),
        new WebixInputText("idPlanControl", i18n("Plan Control")),
        new WebixInputDate("datePlanControl", i18n("Date Plan Control")),
        new WebixInputText("idUserPlanControl", i18n("User Plan Control"))
    ];

    let rules = {
        "id": webix.rules.isNotEmpty,
        "name": webix.rules.isNotEmpty,
        "idmaterialtype": webix.rules.isNotEmpty
    };

    App.createDefaultFormCrud(i18n("Material"), dtMaterial, itens, rules, 'material');
    App.replaceMainContent(dtMaterial, async () => App.loadAllCrudData('material', dtMaterial));
}