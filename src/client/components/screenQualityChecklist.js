import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputSelect, WebixCrudAddButton, WebixBuildReponsiveTopMenu, WebixInputText } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

import * as permission from '../control/permission.js';

let aLinkedChecklistItem = [];
let aUnlinkedChecklistItem = [];

let aChecklistItemC2 = [];

let edit = false;

export async function showScreen(event) {

    //Cell 1
    let dtUnlinkedChecklistItem = new WebixCrudDatatable("dtUnlinkedChecklistItem");
    
    dtUnlinkedChecklistItem.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 130, sort: "string", fillspace: true },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], width: 300, sort: "string", fillspace: true }
    ];

    let allEquipment = await App.api.ormDbFind('equipment', {status: true});
    allEquipment.data.sort(function(a,b) {
        if(a.description < b.description) return -1;
        if(a.description > b.description) return 1;
        return 0;
    });

    const padding = ({
        view: "label",
        label: i18n(""),
    });

    let equipmentChecklist = new WebixInputSelect('equipmentChecklist', i18n('Equipments'), allEquipment.data, {
        template: function (obj) {
            return obj.description;
        },
        "onChange": setEquipment
    });

    let dtLinkedChecklistItem = new WebixCrudDatatable("dtLinkedChecklistItem");

    dtLinkedChecklistItem.columns = [
        { id: "idequipment", header: [i18n("Id Equipment"), { content: "textFilter" }], width: 100, sort: "string", fillspace: true },
        { id: "equipment", header: [i18n("Equipment"), { content: "textFilter" }], width: 100, sort: "string", fillspace: true },
        { id: "checklistitem", header: [i18n("Checklist Item"), { content: "textFilter" }], width: 250, sort: "string", fillspace: true }
    ];

    dtLinkedChecklistItem.on = {
        "onItemClick": enableBtnUnlink,
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtLinkedChecklistItem", event);
        }
    };

    dtUnlinkedChecklistItem.on = {
        "onItemClick": enableBtnLink,
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtUnlinkedChecklistItem", event);
        }
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

    let txtLinkedChecklistItem = ({
        view: "label",
        label: i18n("Linked Checklist Item"),
        inputWidth: 100,
        align: "center"
    })
    
    let txtUnlinkedChecklistItem = ({
        view: "label",
        label: i18n("Unlinked Checklist Item"),
        inputWidth: 100,
        align: "center"
    })

    let rules1 = {
        "equipmentChecklist": webix.rules.isNotEmpty,
    };

    let cell1 = {
        header: "Checklist Item Link",
        body: {
            view: 'form',
            id: 'checklistItemFormC1',
            rules: rules1,
            rows: [
                {
                    cols: [
                        equipmentChecklist
                    ]
                },
                {
                    cols: [
                        txtLinkedChecklistItem,
                        txtUnlinkedChecklistItem
                    ]
                },
                {
                    cols: [
                        dtLinkedChecklistItem,
                        dtUnlinkedChecklistItem
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

    let dtChecklistItemC2 = new WebixCrudDatatable("dtChecklistItemC2");

    dtChecklistItemC2.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 130, sort: "string", fillspace: true },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], width: 300, sort: "string", fillspace: true },
        { id: "typevalue", header: [i18n("Type Value"), { content: "textFilter" }], width: 300, sort: "string", fillspace: true }
    ];

    dtChecklistItemC2.on = {
        "onItemClick": async () => {
            let buttonStatus = await permission.checkObjectPermission('quality.checklist.btnAddChecklistItem');
            if (buttonStatus) { button(true); }
        },
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtChecklistItemC2", event);
        }
    };

    let btnAddChecklistItem = new WebixCrudAddButton('addChecklistItem', i18n('Save'), addChecklistItem);

    let itens = [
        new WebixInputText("id", i18n("Id")),
        new WebixInputText("description", i18n("Description")),
        new WebixInputSelect("typevalue", i18n("Value Type"), 
        [
            { id: 'NUMBER', value: i18n('NUMBER') },
            { id: 'TEXT', value: i18n('TEXT') }
        ]),
    ];

    let rules = {
        "id": webix.rules.isNotEmpty,
        "description": webix.rules.isNotEmpty,
    };

    let cell2 = {
        header: "Checklist Item",
        body: {
            view: 'form',
            id: 'checklistItemForm',
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
                        btnAddChecklistItem
                    ]
                },
                {
                    cols: [
                        padding
                    ]
                },
                {
                    cols: [
                        dtChecklistItemC2
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

    let menu = createSimpleCrudMenu(i18n('Checklist'));
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);
    await reloadTableChecklistItemC2();

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

    let item = $$('dtChecklistItemC2').getSelectedItem();
    if ($$('tabSequence').getValue() == 'checklistItemForm' && item) {

        $$('checklistItemForm').elements.id.setValue(item.id);
        $$('checklistItemForm').elements.description.setValue(item.description);
        $$('checklistItemForm').elements.typevalue.setValue(item.typevalue);

        $$('checklistItemForm').elements.id.disable();

        edit = true;

    }
    else {
        webix.message(i18n("Please, select a checklist Item to Edit!"))
    }
}

async function removeData() {

    let item = $$('dtChecklistItemC2').getSelectedItem();
    if ($$('tabSequence').getValue() == 'checklistItemForm' && item) {

        webix.confirm(i18n('Are you sure you want to remove this Checklist Item? '), '', 
            async (result) => {
            if (result) {

                button(false);

                let cli = {
                    status: false
                }

                await App.api.ormDbUpdate({ id: item.id }, 'checklistitem', cli).then(async (item) => {
                    webix.message(i18n('Removed successfully!'));
                    reloadTableChecklistItemC2();
                    aLinkedChecklistItem = [];
                    aUnlinkedChecklistItem = [];
                    reloadTable();
                    $$('btnUnlink').disable();
                    $$('btnLink').disable();
                    $$('checklistItemFormC1').elements.equipmentChecklist.setValue("");
                    $$('checklistItemForm').elements.id.setValue("");
                    $$('checklistItemForm').elements.id.enable();
                    $$('checklistItemForm').elements.description.setValue("");
                    $$('checklistItemForm').elements.typevalue.setValue("");
                });

            }
        })

    }
    else {
        webix.message(i18n("Please, select a checklist Item to Delete!"))
    }
}

async function unlink() {
    let item = $$('dtLinkedChecklistItem').getSelectedItem();
    if ($$('checklistItemFormC1').validate() && item) {

        let clil = {
            idchecklist: item.idchecklist,
            idchecklistitem: item.checklistitem
        }

        webix.confirm(i18n('Are you sure you want to Unlink this Checklist Item? '), '', async (result) => {
            if (result) {
                await App.api.ormDbDelete(clil, 'checklistitemlink').then(async (res) => {
                    webix.message(i18n('Unlinked successfully!'));

                    let linked = await App.api.ormDbLinkedChecklistItem({ equipment: item.idequipment });
                    let unlinked = await App.api.ormDbUnlinkedChecklistItem({ equipment: item.idequipment });

                    aLinkedChecklistItem = linked.data;
                    aUnlinkedChecklistItem = unlinked.data;

                    $$('btnUnlink').disable();

                    reloadTable();
                });
            }
        })
    }
    else {
        webix.message(i18n("Please, select a Checklist Item!"))
    }
}

async function link() {

    let item = $$('dtUnlinkedChecklistItem').getSelectedItem();

    if ($$('checklistItemFormC1').validate() && item) {

        let idequipment = $$('checklistItemFormC1').elements.equipmentChecklist.getValue();
        let checklist = await App.api.ormDbFind('checklist', { idequipment: idequipment });

        if (checklist.data.length > 0) {

            let clil = {
                idchecklist: checklist.data[0].id,
                idchecklistitem: item.id
            }

            await App.api.ormDbCreate('checklistitemlink', clil).then(async (res) => {
                webix.message(i18n('Linked successfully!'));
            });
        }
        else {

            let cl = {
                idequipment: idequipment
            }

            await App.api.ormDbCreate('checklist', cl).then(async (res) => {

                let clil = {
                    idchecklist: res.data.id,
                    idchecklistitem: item.id
                }
                await App.api.ormDbCreate('checklistitemlink', clil).then(async (res) => {
                    webix.message(i18n('Linked successfully!'));
                });

            });

        }

        let linked = await App.api.ormDbLinkedChecklistItem({ equipment: idequipment });
        let unlinked = await App.api.ormDbUnlinkedChecklistItem({ equipment: idequipment });

        aLinkedChecklistItem = linked.data;
        aUnlinkedChecklistItem = unlinked.data;

        $$('btnLink').disable();

        reloadTable();

    }
    else {
        webix.message(i18n("Please, select Checklist Item!"))
    }
}

async function enableBtnUnlink() {
    let buttonStatus = await permission.checkObjectPermission('quality.checklist.btnUnlink'); 
    if (buttonStatus) {
        $$('btnUnlink').enable();
        button(false);
    }
}

async function enableBtnLink() {
    let buttonStatus = await permission.checkObjectPermission('quality.checklist.btnLink');
    if (buttonStatus) {
        $$('btnLink').enable();
        button(false);
    }
}

async function setEquipment() {

    button(false);

    let idequipment = $$('checklistItemFormC1').elements.equipmentChecklist.getValue();

    let linked = await App.api.ormDbLinkedChecklistItem({ equipment: idequipment });
    let unlinked = await App.api.ormDbUnlinkedChecklistItem({ equipment: idequipment });

    aLinkedChecklistItem = linked.data;
    aUnlinkedChecklistItem = unlinked.data;

    $$('btnUnlink').disable();
    $$('btnLink').disable();

    reloadTable();

}

async function addChecklistItem() {

    if ($$('checklistItemForm').validate()) {

        button(false);

        let id = $$('checklistItemForm').elements.id.getValue();
        let description = $$('checklistItemForm').elements.description.getValue();
        let typevalue = $$('checklistItemForm').elements.typevalue.getValue();

        let cli = {};
        if (typevalue == "") {
            cli = {
                id: id,
                description: description
            }
        }
        else {
            cli = {
                id: id,
                description: description,
                typevalue: typevalue
            }
        }

        let checklistitem = await App.api.ormDbFind('checklistitem', { id: cli.id });
        checklistitem = checklistitem.data;

        if (checklistitem.length > 0) {
            if (edit) {

                await App.api.ormDbUpdate({ id: cli.id }, 'checklistitem', cli).then(async (item) => {
                    webix.message(i18n('Saved successfully!'));
                    reloadTableChecklistItemC2();
                    aLinkedChecklistItem = [];
                    aUnlinkedChecklistItem = [];
                    reloadTable();
                    $$('btnUnlink').disable();
                    $$('btnLink').disable();
                    $$('checklistItemFormC1').elements.equipmentChecklist.setValue("");
                    $$('checklistItemForm').elements.id.setValue("");
                    $$('checklistItemForm').elements.id.enable();
                    $$('checklistItemForm').elements.description.setValue("");
                    $$('checklistItemForm').elements.typevalue.setValue("");
                });

                edit = false;
            }
            else {
                $$('checklistItemForm').elements.id.setValue("");
                $$('checklistItemForm').elements.description.setValue("");
                $$('checklistItemForm').elements.typevalue.setValue("");

                webix.confirm({
                    title: i18n('There is a register with this identifier!, do you want to enable?'),
                    ok: i18n("Yes! Enable"),
                    cancel: i18n("No! Cancel"),
                    text: `<strong> nº </strong> ${cli.id}`,
                    callback: async function (result) {
                        if (result) {
                            await App.api.ormDbUpdate({ "id": cli.id }, 'checklistitem', {status: true});
                            reloadTableChecklistItemC2();
                            webix.message(i18n('Checklist Item enabled successfully'));
                        }
                    }
                });
                return;

            }
        }
        else {

            await App.api.ormDbCreate('checklistitem', cli).then((item) => {
                webix.message(i18n('Saved successfully!'));
                reloadTableChecklistItemC2();
                aLinkedChecklistItem = [];
                aUnlinkedChecklistItem = [];
                reloadTable();
                $$('btnUnlink').disable();
                $$('btnLink').disable();
                $$('checklistItemFormC1').elements.equipmentChecklist.setValue("");
                $$('checklistItemForm').elements.id.setValue("");
                $$('checklistItemForm').elements.description.setValue("");
                $$('checklistItemForm').elements.typevalue.setValue("");
            });
        }

    }
}

async function reloadTableChecklistItemC2() {

    let allChecklistItem = await App.api.ormDbFind('checklistitem', {status: true});
    aChecklistItemC2 = allChecklistItem.data;

    $$('dtChecklistItemC2').clearAll();
    $$('dtChecklistItemC2').parse(aChecklistItemC2, 'json');

    $$('dtUnlinkedChecklistItem').clearAll();
    $$('dtUnlinkedChecklistItem').parse(aUnlinkedChecklistItem, 'json');
    aUnlinkedChecklistItem = [];
    aLinkedChecklistItem = [];

}

async function reloadTable() {

    $$('dtUnlinkedChecklistItem').clearAll();
    $$('dtUnlinkedChecklistItem').parse(aUnlinkedChecklistItem, 'json');

    $$('dtLinkedChecklistItem').clearAll();
    $$('dtLinkedChecklistItem').parse(aLinkedChecklistItem, 'json');
    aUnlinkedChecklistItem = [];
    aLinkedChecklistItem = [];

}

