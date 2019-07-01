import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputSelect, WebixInputMultiText, WebixCrudAddButton, WebixBuildReponsiveTopMenu, WebixInputText } from "../lib/WebixWrapper.js";
import { optionsTypeValue } from "./optionsScreens.js"
import * as util from "../lib/Util.js";

let editMode = false;
let ALLITENS = [];
let ALLLINKS = [];

export async function showScreen(event) {

    /* Equipment */
    let allEquipment = await App.api.ormDbFind('equipment', { status: true });
    allEquipment.data.sort(function (a, b) {
        if (a.description < b.description) return -1;
        if (a.description > b.description) return 1;
        return 0;
    });

    let equipmentChecklist = new WebixInputSelect('equipmentChecklist', i18n('Equipments'), allEquipment.data, {
        template: function (obj) {
            return obj.description;
        },
        id: "cmbEquipmentChecklist",
        "onChange": searchItensByEquipments
    });

    /* Linked */
    let dtLinked = new WebixCrudDatatable("dtLinked");
    dtLinked.columns = [
        { id: "idequipment", header: [i18n("Id Equipment"), { content: "textFilter" }], width: 120, sort: "string" },
        { id: "description", header: [i18n("Dimensional Control Item"), { content: "textFilter" }], sort: "string", fillspace: true },
    ];
    dtLinked.on = {
        "onItemClick": enableBtnUnlink,
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtLinked", event);
        }
    };

    dtLinked.data = [];

    let btnUnlink = {
        view: "button",
        id: "btnUnlink",
        width: 100,
        height: 80,
        click: unLinked,
        value: i18n("Unlink") + ' >>',
        align: "center",
        disabled: true
    }

    /* Items */
    let dtItems = new WebixCrudDatatable("dtItems");

    dtItems.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], sort: "string", width: 120 },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], sort: "string", fillspace: true }
    ];
    dtItems.on = {
        "onItemClick": enableBtnLink,
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtItems", event);
        }
    };
    dtItems.data = [];

    let btnLink = {
        view: "button",
        id: "btnLink",
        width: 100,
        height: 80,
        click: linked,
        value: '<< ' + i18n("Link"),
        align: "center",
        disabled: true
    };

    let txtLinkedChecklistItem = ({
        view: "label",
        label: i18n("Linked TDC"),
        inputWidth: 100,
        align: "center"
    });

    let txtUnlinkedChecklistItem = ({
        view: "label",
        label: i18n("Items"),
        inputWidth: 100,
        align: "center"
    })

    let rules1 = {
        "equipmentChecklist": webix.rules.isNotEmpty,
    };

    let cell1 = {
        header: "Dimensional Control Link",
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
                        dtLinked,
                        {
                            rows: [
                                {},
                                btnUnlink,
                                btnLink,
                                {}
                            ]
                        },
                        dtItems
                    ]
                },
            ]
        }
    };

    //cell2    
    let dtTDC2 = new WebixCrudDatatable("dtTDC2");

    let allTDCItems = await App.api.ormDbFind('dimensionalcontrolitem', { status: true });

    dtTDC2.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 130, sort: "string", fillspace: true },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], width: 300, sort: "string", fillspace: true },
        { id: "typevalue", header: [i18n("Type Value"), { content: "textFilter" }], width: 300, sort: "string", fillspace: true },
        { id: "options", header: [i18n("Options"), { content: "textFilter" }], width: 300, sort: "string", fillspace: true },
        { id: "reference", header: [i18n("Reference"), { content: "textFilter" }], width: 300, sort: "string", fillspace: true }
    ];
    dtTDC2.data = allTDCItems.data;
    dtTDC2.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtTDC2", event);
        }
    };

    let rules = {
        "description": webix.rules.isNotEmpty,
        "typevalue": webix.rules.isNotEmpty,
    };

    let optionsCharacteriscts = await App.api.ormDbFind('materialcharacteristic');
    optionsCharacteriscts = optionsCharacteriscts.data.map((item) => {
        return {
            id: item.idcharacteristic,
            value: item.idcharacteristic
        }
    });
    optionsCharacteriscts.sort(function (a, b) {
        if (a.value < b.value) return -1;
        if (a.value > b.value) return 1;
        return 0;
    });

    let cell2 = {
        header: i18n("Dimensional Control Items"),
        body: {
            view: 'form',
            id: 'tDCItemForm',
            rules: rules,
            rows: [
                {
                    view: "fieldset",
                    label: i18n("New Item"),
                    borderless: true,
                    // height: 80,
                    body: {
                        rows: [
                            {
                                cols: [
                                    new WebixInputText("description", i18n("Description")),
                                    new WebixInputSelect("typevalue", i18n("Value Type"), optionsTypeValue, {
                                        onChange: (item) => {
                                            if (item == "select") {
                                                $$('mtOptions').show();
                                            } else {
                                                $$('mtOptions').hide();
                                            }
                                        }
                                    }),
                                    new WebixInputSelect("reference", i18n("Reference"), optionsCharacteriscts)
                                ]
                            },
                            {
                                height: 15
                            },
                            {
                                rows: [
                                    new WebixInputMultiText("options", i18n("Options"), null, {
                                        hidden: true
                                    }),
                                ]
                            },

                            {
                                cols: [
                                    {},
                                    new WebixCrudAddButton('addChecklistItem', i18n('Save'), addItem, { width: 100, height: 80 }),
                                    {}
                                ]
                            },
                        ]
                    },
                },
                {
                    height: 15
                },
                {
                    cols: [
                        dtTDC2
                    ]
                },
                {
                    cols: [
                        {
                            view: 'button',
                            id: 'new',
                            label: i18n('New'),
                            height: 80,
                            width: 150,
                            click: newData
                        },
                        {
                            view: 'button',
                            id: 'edit',
                            label: i18n('Edit'),
                            height: 80,
                            width: 150,
                            click: editData
                        },
                        {
                            view: 'button',
                            id: 'remove',
                            label: i18n('Remove'),
                            height: 80,
                            width: 150,
                            click: removeData
                        },
                        {}
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

    let menu = createSimpleCrudMenu(i18n('Test and Dimensional Control'));
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);
    // await reload();

    await util.datatableColumsGet('dtLinked', event);
    await util.datatableColumsGet('dtItems', event);
    await util.datatableColumsGet('dtTDC2', event);
}

async function enableBtnUnlink() {
    $$('dtItems').clearSelection();
    $$('btnLink').disable();
    let equipment = $$('cmbEquipmentChecklist').getValue();
    if (equipment)
        $$('btnUnlink').enable();
}

async function enableBtnLink() {
    $$('dtLinked').clearSelection();
    $$('btnUnlink').disable();
    let equipment = $$('cmbEquipmentChecklist').getValue();
    if (equipment)
        $$('btnLink').enable();
}

async function linked() {
    let item = $$('dtItems').getSelectedItem();
    let equipment = $$('cmbEquipmentChecklist').getValue();
    if (item && equipment) {
        let result = await App.api.ormDbCreate('dimensionalcontrollink', {
            idequipment: $$('cmbEquipmentChecklist').getValue(),
            iddimensionalcontrolitem: item.id,
            iduser: localStorage.getItem('login')
        });
        if (result.success) {
            webix.message(i18n('Item linked successfully!'));
            reload();
        } else {
            webix.message(i18n(result.message));
        }
    } else {
        webix.message(i18n('Please select a equipment to link to.'));
    }
}

async function unLinked() {
    let item = $$('dtLinked').getSelectedItem();
    let equipment = $$('cmbEquipmentChecklist').getValue();
    if (item && equipment) {
        let result = await App.api.ormDbDelete({
            idequipment: equipment,
            iddimensionalcontrolitem: item.iddimensionalcontrolitem
        }, 'dimensionalcontrollink');
        if (result.success) {
            webix.message(i18n('Item unlinked successfully!'));
            reload();
        } else {
            webix.message(i18n(result.message));
        }
    } else {
        webix.message(i18n('Please select a equipment to unlink to.'));
    }
}

function createSimpleCrudMenu(title) {
    let menu = WebixBuildReponsiveTopMenu(title, []);
    return menu;
}

function newData() {
    $$("mtOptions").setValue("");
    editMode = false;
    $$('tDCItemForm').clear();
}

async function editData() {
    //Used to clear field and hide
    $$("mtOptions").setValue("");

    let item = $$('dtTDC2').getSelectedItem();
    if ($$('tabSequence').getValue() == 'tDCItemForm' && item) {

        $$("txtDescription").setValue(item.description);
        $$("cmbTypevalue").setValue(item.typevalue);
        $$("cmbReference").setValue(item.reference);

        if (item.typevalue == 'select') {
            $$("mtOptions").setValue(item.options)
        }

        editMode = true;
    }
    else {
        webix.message(i18n("Please, select a teste adn dimensional control item to edit!"))
    }
}

async function removeData() {

    let item = $$('dtTDC2').getSelectedItem();
    if ($$('tabSequence').getValue() == 'tDCItemForm' && item) {

        webix.confirm(i18n('Are you sure you want to remove this TDC Item? '), '', async (result) => {
            if (result) {

                await App.api.ormDbUpdate({ id: item.id }, 'dimensionalcontrolitem', { status: false }).then(async (item) => {
                    webix.message(i18n('Removed successfully!'));
                    reload();
                });

            }
        })

    }
    else {
        webix.message(i18n("Please, select a checklist Item to Delete!"))
    }
}

async function addItem() {
    //.split(",").map(String)
    if ($$('tDCItemForm').validate()) {
        if (editMode) {
            let item = $$('dtTDC2').getSelectedItem();
            if ($$("cmbTypevalue").getValue() == 'select') {
                let itens = $$('mtOptions').getValue();
                let saveTDC = await App.api.ormDbUpdate({ id: item.id }, 'dimensionalcontrolitem', {
                    description: $$("txtDescription").getValue(),
                    typevalue: $$("cmbTypevalue").getValue(),
                    reference: $$("cmbReference").getValue(),
                    options: itens
                });
                requisitionResult(saveTDC);
            } else {
                let saveTDC = await App.api.ormDbUpdate({ id: item.id }, 'dimensionalcontrolitem', {
                    description: $$("txtDescription").getValue(),
                    typevalue: $$("cmbTypevalue").getValue(),
                    reference: $$("cmbReference").getValue(),
                });
                requisitionResult(saveTDC);
            };
        } else {
            if ($$("cmbTypevalue").getValue() == 'select') {
                let itens = $$('mtOptions').getValue();
                let saveTDC = await App.api.ormDbCreate('dimensionalcontrolitem', {
                    description: $$("txtDescription").getValue(),
                    typevalue: $$("cmbTypevalue").getValue(),
                    reference: $$("cmbReference").getValue(),
                    options: itens,
                    iduser: localStorage.getItem('login')
                });
                requisitionResult(saveTDC);
            } else {
                let saveTDC = await App.api.ormDbCreate('dimensionalcontrolitem', {
                    description: $$("txtDescription").getValue(),
                    typevalue: $$("cmbTypevalue").getValue(),
                    reference: $$("cmbReference").getValue(),
                    iduser: localStorage.getItem('login')
                });
                requisitionResult(saveTDC);
            };
        }
    }
}

async function requisitionResult(response) {
    if (response.success) {
        $$('tDCItemForm').clear();
        await reload();
    } else {
        webix.message(i18n(response.message));
    }
}

async function reload() {
    let allTDCItems = await App.api.ormDbFind('dimensionalcontrolitem', { status: true });
    $$('dtTDC2').clearAll();
    $$('dtTDC2').parse(allTDCItems.data, 'json');
    let equipment = $$('cmbEquipmentChecklist').getValue();
    if (equipment)
        await searchItensByEquipments(equipment)
    else
        await reloadItens();
}

async function searchItensByEquipments(idequipment) {
    let allLink = await App.api.ormDbDimensionalcontrollink({ idequipment: idequipment });

    ALLLINKS = allLink;

    $$('dtLinked').clearAll();
    $$('dtLinked').parse(allLink, 'json');
    await reloadItens();
}

async function reloadItens() {
    let itens = await App.api.ormDbFind('dimensionalcontrolitem', { status: true });

    ALLITENS = itens.data;
    let onlyInALLLINKS = [];

    if (ALLLINKS.length)
        onlyInALLLINKS = diffArray(ALLITENS, ALLLINKS);

    $$('dtItems').clearAll();
    let equipment = $$('cmbEquipmentChecklist').getValue();
    if (equipment && ALLLINKS.length)
        $$('dtItems').parse(onlyInALLLINKS, 'json');
    else
        $$('dtItems').parse(ALLITENS, 'json');
}

function diffArray(ALLITENS, ALLLINKS) {
    return ALLITENS.filter(firstArrayItem =>
        !ALLLINKS.some(
            secondArrayItem => firstArrayItem.id === secondArrayItem.iddimensionalcontrolitem
        )
    );
};