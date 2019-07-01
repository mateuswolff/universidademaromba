import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixBuildReponsiveTopMenu, WebixInputSelect } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

let aEquipment = [];
let aMaterial = []

export async function showScreen(event) {

    let allEquipment = await App.api.ormDbFind('equipment');
    aEquipment = allEquipment.data;
    
    let allMaterial = await App.api.ormDbFind('material');
    aMaterial = allMaterial.data;

    let allControlPlan = await App.api.ormDbFind('controlplan');
    allControlPlan.data.push({ id: "-", description: i18n('Unlinked') });
    allControlPlan.data.sort(function(a,b) {
        if(a.description < b.description) return -1;
        if(a.description > b.description) return 1;
        return 0;
    });

    let dtSelection = new WebixCrudDatatable("dtSelection");
    
    const padding = ({
        view: "label",
        label: i18n(""),
    });

    let controlPlan = new WebixInputSelect('controlPlan', i18n('Control Plans'), allControlPlan.data, {
        template: function (obj) {
            return obj.id;
        },
        disabled: true,
        labelPosition: 'top'
    });

    dtSelection.columns = [
        {
            id: "id",
            header: [i18n("Id"), { content: "textFilter" }],
            width: 50,
            fillspace: true,
            sort: "string"
        },
        {
            id: "description",
            header: [i18n("Description"), { content: "textFilter" }],
            width: 200,
            fillspace: true,
            sort: "string"
        },
        {
            id: "controlplan", 
            fillspace: true,
            template: (obj) => {
                if (!allControlPlan.data.find(x => x.id == obj.idcontrolplan)) {
                    return "";
                }
                else {
                    return (allControlPlan.data.find(x => x.id == obj.idcontrolplan)).id;
                }
            },
            header: [i18n("Control Plan"), { content: "textFilter" }], sort: "string"
        }
    ];

    let validate = (id, req) => {
        if (id == 'controlPlan') {
            for (var i = 0; i < req.values.length; i++) {
                let option = (allControlPlan.data.find((x) => x.id == req.values[i].value));
                if (option) {
                    req.values[i].value = option.id;
                }
            }
        }
    }

    dtSelection.changeFilterOptions(validate);
    dtSelection.on = {
        "onItemClick": linkControlPlan,
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtSelection", event);
        }
    };

    let selection = {
        view: "radio",
        name: "selection",
        options: [
            { value: i18n("Material"), id: 'material' },
            { value: i18n("Equipment"), id: 'equipment' }
        ],
        on: {
            "onChange": reloadDataTable
        }
    };

    const grids = {
        view: 'form',
        id: "controlPlanForm",
        rows: [
            {
                cols: [
                    padding,
                ]
            },
            {
                cols: [
                    selection,
                    controlPlan,
                    padding
                ]
            },
            {
                cols: [
                    padding,
                ]
            },
            {
                cols: [
                    dtSelection
                ]
            }
        ]
    }

    let menu = createSimpleCrudMenu(i18n('Link Control Plans Equipment'));
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);

    await util.datatableColumsGet('dtSelection', event);
}

function createSimpleCrudMenu(title) {

    let menu = WebixBuildReponsiveTopMenu(title, [{
        id: "btnEdit",
        icon: "fas fa-edit",
        label: "Edit",
        click: editData
    }, {
        id: "btnSave",
        icon: "fas fa-save",
        label: "Save",
        click: addData

    }]);

    return menu;
}

async function linkControlPlan() {
    let item = $$('dtSelection').getSelectedItem();
    if (item.idcontrolplan) {
        $$('controlPlanForm').elements.controlPlan.disable();
        $$('controlPlanForm').elements.controlPlan.setValue(item.idcontrolplan);
    }
    else {
        $$('controlPlanForm').elements.controlPlan.setValue('');
        $$('controlPlanForm').elements.controlPlan.enable();
    }
}

async function reloadDataTable() {
    $$('controlPlanForm').elements.controlPlan.setValue('');
    $$('controlPlanForm').elements.controlPlan.disable();
    let controlPlan = $$('controlPlanForm').elements.selection.getValue();

    if (controlPlan == 'material') {
        $$('dtSelection').clearAll();
        $$('dtSelection').parse(aMaterial, 'json');
    }
    else {
        $$('dtSelection').clearAll();
        $$('dtSelection').parse(aEquipment, 'json');
    }
}

async function addData() {
   
    let cp = $$('controlPlanForm').elements.controlPlan.getValue();

    if (cp == '') {
        webix.message(i18n('Please, select some Control Plan'))
    }
    else {
        let item = $$('dtSelection').getSelectedItem();

        let radioSelected = $$('controlPlanForm').elements.selection.getValue();

        cp = cp == "-" ? null : cp;

        if (radioSelected == 'material') {

            await App.api.ormDbUpdate({ id: item.id }, 'material', {idcontrolplan: cp}).then(async (item) => {
                webix.message(i18n('Control Plan successfully linked!'));
                let allMaterial = await App.api.ormDbFind('material');
                aMaterial = allMaterial.data;
                $$('controlPlanForm').elements.controlPlan.setValue('');
                $$('controlPlanForm').elements.controlPlan.disable();
                reloadDataTable();
            });
        }
        else {
            await App.api.ormDbUpdate({ id: item.id }, 'equipment', {idcontrolplan: cp}).then(async (item) => {
                webix.message(i18n('Control Plan successfully linked!'));
                let allEquipment = await App.api.ormDbFind('equipment');
                aEquipment = allEquipment.data;
                $$('controlPlanForm').elements.controlPlan.setValue('');
                $$('controlPlanForm').elements.controlPlan.disable();
                reloadDataTable();
            });
        }
    }
}

async function editData() {
    let item = $$('dtSelection').getSelectedItem();
    if (item) {
        $$('controlPlanForm').elements.controlPlan.setValue(item.idcontrolplan);
        $$('controlPlanForm').elements.controlPlan.enable();
    }
}