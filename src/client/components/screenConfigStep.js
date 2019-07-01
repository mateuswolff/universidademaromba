import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputSelect, WebixCrudAddButton, WebixBuildReponsiveTopMenu, WebixInputText } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

let aLinkedStep = [];
let aUnlinkedStep = [];

let aStepC2 = [];

let edit = false;

export async function showScreen() {

    //Cell 1

    let dtUnlinkedStep = new WebixCrudDatatable("dtUnlinkedStep");

    dtUnlinkedStep.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 130, sort: "string", fillspace: true },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], width: 300, sort: "string", fillspace: true }
    ];

    let allEquipment = await App.api.ormDbFind('equipment', { status: true });
    allEquipment.data.sort(function (a, b) {
        if (a.description < b.description) return -1;
        if (a.description > b.description) return 1;
        return 0;
    });

    const padding = ({
        view: "label",
        label: i18n(""),
    });

    let equipment = new WebixInputSelect('equipment', i18n('Equipments'), allEquipment.data, {
        template: function (obj) {
            return obj.description;
        },
        "onChange": setEquipment
    });

    let dtLinkedStep = new WebixCrudDatatable("dtLinkedStep");

    dtLinkedStep.columns = [
        { id: "idequipment", header: [i18n("Id Equipment"), { content: "textFilter" }], width: 100, sort: "string", fillspace: true },
        { id: "equipment", header: [i18n("Equipment"), { content: "textFilter" }], width: 100, sort: "string", fillspace: true },
        { id: "step", header: [i18n("Step"), { content: "textFilter" }], width: 250, sort: "string", fillspace: true },
        { id: "sequence", header: [i18n("Sequence"), { content: "textFilter" }], width: 250, sort: "string", fillspace: true }
    ];

    dtLinkedStep.on = {
        "onItemClick": enableBtnUnlink
    };

    dtUnlinkedStep.on = {
        "onItemClick": enableBtnLink
    };

    let btnUnlink = {
        view: "button",
        id: "btnUnlink",
        width: 100,
        height: 30,
        click: unlink,
        value: i18n("Unlink") + ' >',
        align: "center",
        disabled: true
    }

    let btnLink = {
        view: "button",
        id: "btnLink",
        width: 100,
        height: 30,
        click: link,
        value: '< ' + i18n("Link"),
        align: "center",
        disabled: true
    };

    let txtLinkedStep = ({
        view: "label",
        label: i18n("Linked Step"),
        inputWidth: 100,
        align: "center"
    })

    let txtUnlinkedStep = ({
        view: "label",
        label: i18n("Unlinked Step"),
        inputWidth: 100,
        align: "center"
    })

    let rules1 = {
        "equipment": webix.rules.isNotEmpty,
    };

    let cell1 = {
        header: "Step Link",
        body: {
            view: 'form',
            id: 'stepFormC1',
            rules: rules1,
            rows: [
                {
                    cols: [
                        equipment
                    ]
                },
                {
                    cols: [
                        txtLinkedStep,
                        txtUnlinkedStep
                    ]
                },
                {
                    cols: [
                        dtLinkedStep,
                        dtUnlinkedStep
                    ]
                },
                {
                    cols: [
                        {},
                        btnUnlink,
                        {},
                        btnLink,
                        {}
                    ]
                }
            ]
        }
    };

    //cell2

    let dtStepC2 = new WebixCrudDatatable("dtStepC2");

    dtStepC2.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 130, sort: "string", fillspace: true },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], width: 300, sort: "string", fillspace: true },
    ];

    dtStepC2.on = {
        "onItemClick": async () => {
            button(true);
        }
    };

    let btnAddStep = new WebixCrudAddButton('addStep', i18n('Save'), addStep);

    let itens = [
        new WebixInputText("id", i18n("Id"), { disabled: true }),
        new WebixInputText("description", i18n("Description")),
    ];

    let rules = {
        "id": webix.rules.isNotEmpty,
        "description": webix.rules.isNotEmpty,
    };

    let cell2 = {
        header: "Step",
        body: {
            view: 'form',
            id: 'stepForm',
            rules: rules,
            rows: [
                {
                    cols: itens
                },
                {
                    cols: [
                        padding
                    ]
                },
                {
                    cols: [
                        btnAddStep
                    ]
                },
                {
                    cols: [
                        padding
                    ]
                },
                {
                    cols: [
                        dtStepC2
                    ]
                }

            ]
        }
    };

    const tabview = {
        view: 'tabview',
        id: "tabSequence",
        cells: [
            cell1,
            cell2
        ]
    }

    const grids = {
        view: 'form',
        id: "sequence",
        elements: [
            tabview
        ]
    }

    let menu = createSimpleCrudMenu(i18n('Big Maker Steps'));
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);
    await reloadTableStepC2();

    $$("edit").disable();
    $$("remove").disable();
}

async function button(status) {
    if (status) {
        $$("edit").enable();
        $$("remove").enable();
    } else {
        $$("edit").disable();
        $$("remove").disable();
    }
}

function createSimpleCrudMenu(title) {
    let menu = WebixBuildReponsiveTopMenu(title, [
        {
            id: "edit",
            icon: "fas fa-edit",
            label: "Edit",
            click: editData
        },
        {
            id: "remove",
            icon: "fas fa-trash-alt",
            label: "Remove",
            click: removeData

        }
    ]);
    return menu;
}

async function editData() {

    let item = $$('dtStepC2').getSelectedItem();
    if ($$('tabSequence').getValue() == 'stepForm' && item) {

        $$('stepForm').elements.id.setValue(item.id);
        $$('stepForm').elements.description.setValue(item.description);
        edit = true;

    }
    else {
        webix.message(i18n("Please, select a Step to Edit!"))
    }
}

async function removeData() {

    let item = $$('dtStepC2').getSelectedItem();
    if ($$('tabSequence').getValue() == 'stepForm' && item) {

        webix.confirm(i18n('Are you sure you want to remove this Step? '), '',
            async (result) => {
                if (result) {

                    button(false);

                    let stepItem = {
                        status: false
                    }

                    await App.api.ormDbUpdate({ id: item.id }, 'step', stepItem).then(async (item) => {
                        webix.message(i18n('Removed successfully!'));
                        reloadTableStepC2();
                        aLinkedStep = [];
                        aUnlinkedStep = [];
                        reloadTable();
                        $$('btnUnlink').disable();
                        $$('btnLink').disable();
                        $$('stepFormC1').elements.equipment.setValue("");
                        $$('stepForm').elements.id.setValue("");
                        $$('stepForm').elements.description.setValue("");
                    });

                }
            })

    }
    else {
        webix.message(i18n("Please, select a Step to Delete!"))
    }
}

async function unlink() {
    let item = $$('dtLinkedStep').getSelectedItem();
    if ($$('stepFormC1').validate() && item) {

        let selected = {
            idequipment: item.idequipment,
            idstep: item.idstep
        }

        webix.confirm(i18n('Are you sure you want to Unlink this Step? '), '', async (result) => {
            if (result) {
                await App.api.ormDbDelete(selected, 'stepequipment').then(async (res) => {

                    let stepequipment = await App.api.ormDbFind('stepequipment', { idequipment: item.idequipment });
                    stepequipment = stepequipment.data;

                    if (stepequipment.length > 0 && selected.sequence != stepequipment.length) {

                        stepequipment.sort(function (a, b) {
                            if (a.sequence < b.sequence) return -1;
                            if (a.sequence > b.sequence) return 1;
                            return 0;
                        });

                        let reorganized = await App.api.ormDbReorganizeStepEquipment(stepequipment);

                    }

                    webix.message(i18n('Unlinked successfully!'));

                    let linked = await App.api.ormDbLinkedStep({ idequipment: item.idequipment });
                    let unlinked = await App.api.ormDbUnlinkedStep({ idequipment: item.idequipment });

                    aLinkedStep = linked.data;
                    aUnlinkedStep = unlinked.data;

                    $$('btnUnlink').disable();

                    reloadTable();
                });
            }
        })
    }
    else {
        webix.message(i18n("Please, select a Step!"))
    }
}

async function link() {

    let item = $$('dtUnlinkedStep').getSelectedItem();

    if ($$('stepFormC1').validate() && item) {

        let idequipment = $$('stepFormC1').elements.equipment.getValue();
        let stepequipment = await App.api.ormDbFind('stepequipment', { idequipment: idequipment });
        stepequipment = stepequipment.data;

        if (stepequipment.length > 0) {

            let next = {
                idequipment: idequipment,
                idstep: item.id,
                sequence: stepequipment.length + 1
            }

            await App.api.ormDbCreate('stepequipment', next).then(async (res) => {
                webix.message(i18n('Linked successfully!'));
            });

        }
        else {

            let first = {
                idequipment: idequipment,
                idstep: item.id,
                sequence: 1
            }

            await App.api.ormDbCreate('stepequipment', first).then(async (res) => {
                webix.message(i18n('Linked successfully!'));
            });
        }

        let linked = await App.api.ormDbLinkedStep({ idequipment: idequipment });
        let unlinked = await App.api.ormDbUnlinkedStep({ idequipment: idequipment });

        aLinkedStep = linked.data;
        aUnlinkedStep = unlinked.data;

        $$('btnLink').disable();

        reloadTable();

    }
    else {
        webix.message(i18n("Please, select Step!"))
    }
}

async function enableBtnUnlink() {
    $$('btnUnlink').enable();
    button(false);
}

async function enableBtnLink() {
    $$('btnLink').enable();
    button(false);
}

async function setEquipment() {

    button(false);

    let idequipment = $$('stepFormC1').elements.equipment.getValue();

    let linked = await App.api.ormDbLinkedStep({ idequipment: idequipment });
    let unlinked = await App.api.ormDbUnlinkedStep({ idequipment: idequipment });

    aLinkedStep = linked.data;
    aUnlinkedStep = unlinked.data;

    $$('btnUnlink').disable();
    $$('btnLink').disable();

    reloadTable();

}

async function addStep() {

    if ($$('stepForm').validate()) {

        button(false);

        let id = $$('stepForm').elements.id.getValue();
        let description = $$('stepForm').elements.description.getValue();

        let stepItem = {
            id: id,
            description: description
        }

        let step = await App.api.ormDbFind('step', { id: stepItem.id });
        step = step.data;

        if (step.length > 0) {
            if (edit) {

                await App.api.ormDbUpdate({ id: stepItem.id }, 'step', stepItem).then(async (item) => {
                    webix.message(i18n('Saved successfully!'));
                    reloadTableStepC2();
                    aLinkedStep = [];
                    aUnlinkedStep = [];
                    reloadTable();
                    $$('btnUnlink').disable();
                    $$('btnLink').disable();
                    $$('stepFormC1').elements.equipment.setValue("");
                    $$('stepForm').elements.id.setValue("");
                    $$('stepForm').elements.description.setValue("");
                });

                edit = false;
            }
            else {
                $$('stepForm').elements.id.setValue("");
                $$('stepForm').elements.description.setValue("");

                webix.confirm({
                    title: i18n('There is a register with this identifier!, do you want to enable?'),
                    ok: i18n("Yes! Enable"),
                    cancel: i18n("No! Cancel"),
                    text: `<strong> nº </strong> ${stepItem.id}`,
                    callback: async function (result) {
                        if (result) {
                            await App.api.ormDbUpdate({ "id": stepItem.id }, 'step', { status: true });
                            reloadTableStepC2();
                            webix.message(i18n('Step enabled successfully'));
                        }
                    }
                });
                return;

            }
        }
        else {

            await App.api.ormDbCreate('step', stepItem).then((item) => {
                webix.message(i18n('Saved successfully!'));
                reloadTableStepC2();
                aLinkedStep = [];
                aUnlinkedStep = [];
                reloadTable();
                $$('btnUnlink').disable();
                $$('btnLink').disable();
                $$('stepFormC1').elements.equipment.setValue("");
                $$('stepForm').elements.id.setValue("");
                $$('stepForm').elements.description.setValue("");
            });
        }

    }
}

async function reloadTableStepC2() {

    let allStep = await App.api.ormDbFind('step', { status: true });
    aStepC2 = allStep.data;

    $$('dtStepC2').clearAll();
    $$('dtStepC2').parse(aStepC2, 'json');

    $$('dtUnlinkedStep').clearAll();
    $$('dtUnlinkedStep').parse(aUnlinkedStep, 'json');
    aUnlinkedStep = [];
    aLinkedStep = [];

}

async function reloadTable() {

    $$('dtUnlinkedStep').clearAll();
    $$('dtUnlinkedStep').parse(aUnlinkedStep, 'json');

    aLinkedStep.sort(function (a, b) {
        if (a.sequence < b.sequence) return -1;
        if (a.sequence > b.sequence) return 1;
        return 0;
    });

    $$('dtLinkedStep').clearAll();
    $$('dtLinkedStep').parse(aLinkedStep, 'json');
    aUnlinkedStep = [];
    aLinkedStep = [];

}

