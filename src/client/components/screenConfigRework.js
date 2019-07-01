import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixCrudAddButton, WebixBuildReponsiveTopMenu, WebixInputText, WebixInputSelect } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

import * as permission from '../control/permission.js';

let aLinkedReworkItem = [];
let aUnlinkedReworkItem = [];

let edit = false;
let idItem;

let aReworkType = [];
let aReworkItem = [];

let aChecklistItemC2 = [];

export async function showScreen() {

    //Cell 1
    let dtUnlinkedReworkItem = new WebixCrudDatatable("dtUnlinkedReworkItem");
    
    dtUnlinkedReworkItem.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 130, sort: "string" },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "typevalue", header: [i18n("Type Value"), { content: "textFilter" }], sort: "string", fillspace: true }
    ];

    let allReworkType = await App.api.ormDbFind('reworktype', { status: true });
    allReworkType.data.sort(function(a,b) {
        if(a.description < b.description) return -1;
        if(a.description > b.description) return 1;
        return 0;
    });

    const padding = ({
        view: "label",
        label: i18n(""),
    });

    let reworktype = new WebixInputSelect('reworktype', i18n('Rework Type'), allReworkType.data, {
        template: function (obj) {
            return obj.description;
        },
        "onChange": setReworkType
    });

    let dtLinkedReworkItem = new WebixCrudDatatable("dtLinkedReworkItem");
    
    dtLinkedReworkItem.columns = [
        { id: "reworktype", header: [i18n("Rework Type"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "reworkitem", header: [i18n("Rework Item"), { content: "textFilter" }], sort: "string", fillspace: true }
    ];

    dtLinkedReworkItem.on = {
        "onItemClick": enableBtnUnlink
    };

    dtUnlinkedReworkItem.on = {
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

    let txtLinkedReworkItem = ({
        view: "label",
        label: i18n("Linked Rework Item"),
        inputWidth: 100,
        align: "center"
    })
    let txtUnlinkedReworkItem = ({
        view: "label",
        label: i18n("Unlinked Rework Item"),
        inputWidth: 100,
        align: "center"
    })

    let rules1 = {
        "reworktype": webix.rules.isNotEmpty,
    };

    let cell1 = {
        header: "Item/Type Rework Link",
        body: {
            view: 'form',
            id: 'reworkItemLinkForm',
            rules: rules1,
            rows: [
                {
                    cols: [
                        reworktype
                    ]
                },
                {
                    cols: [
                        txtLinkedReworkItem,
                        txtUnlinkedReworkItem
                    ]
                },
                {
                    cols: [
                        dtLinkedReworkItem,
                        dtUnlinkedReworkItem
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

    // cell2

    let dtReworkItem = new WebixCrudDatatable("dtReworkItem");
    
    dtReworkItem.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 300, sort: "string", fillspace: true },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], width: 300, sort: "string", fillspace: true },
        { id: "typevalue", header: [i18n("Type Value"), { content: "textFilter" }], width: 300, sort: "string", fillspace: true }
    ];

    let btnAddReworkItem = new WebixCrudAddButton('addReworkItem', i18n('Save'), addReworkItem);

    let itens = [
        new WebixInputText("description", i18n("Description")),
        new WebixInputSelect("typevalue", i18n("Value Type"), [
            { id: 'TEXT', value: i18n('TEXT') },
            { id: 'NUMBER', value: i18n('NUMBER') },
            { id: 'HOUR', value: i18n('HOUR') },
        ]),
    ];

    let rules = {
        "description": webix.rules.isNotEmpty,
        "typevalue": webix.rules.isNotEmpty
    };

    let cell2 = {
        header: i18n("Rework Item"),
        body: {
            view: 'form',
            id: 'reworkItemForm',
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
                        btnAddReworkItem
                    ]
                },
                {
                    cols: [
                        padding
                    ]
                },
                {
                    cols: [
                        dtReworkItem
                    ]
                }

            ]
        }
    };

    //CELL3


    let dtReworkType = new WebixCrudDatatable("dtReworkType");
    
    dtReworkType.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 50, sort: "string", fillspace: true },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], width: 300, sort: "string", fillspace: true },
    ];

    let btnAddReworkType = new WebixCrudAddButton('addReworkType', i18n('Save'), addReworkType);

    let itensReworkType = [
        new WebixInputText("description", i18n("Description")),
    ];

    let rulesReworkType = {
        "description": webix.rules.isNotEmpty,
    };

    let cell3 = {
        header: i18n("Rework Type"),
        body: {
            view: 'form',
            id: 'reworkTypeForm',
            rules: rulesReworkType,
            rows: [
                {
                    cols: itensReworkType
                },
                {
                    cols: [
                        padding
                    ]
                },
                {
                    cols: [
                        btnAddReworkType
                    ]
                },
                {
                    cols: [
                        padding
                    ]
                },
                {
                    cols: [
                        dtReworkType
                    ]
                }

            ]
        }
    };

    const tabview = {
        view: 'tabview',
        id: "tabRework",
        cells: [
            cell1,
            cell2,
            cell3
        ]
    }

    const grids = {
        view: 'form',
        id: "sequence",
        elements: [
            tabview
        ]
    }

    let menu = createSimpleCrudMenu(i18n('Rework'));
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);
    await reloadTableReworkType();
    await reloadTableReworkItem();

}

function createSimpleCrudMenu(title) {
    let menu = WebixBuildReponsiveTopMenu(title, [
        {
            id: "btnEdit",
            icon: "fas fa-edit",
            label: "Edit",
            click: editData
        },
        {
            id: "btnRemove",
            icon: "fas fa-trash-alt",
            label: "Remove",
            click: removeData

        }
    ]);
    return menu;
}

async function reloadTableReworkType() {

    let allReworkType = await App.api.ormDbFind('reworktype', { status: true });
    aReworkType = allReworkType.data;

    $$('reworkTypeForm').elements.description.setValue("");

    $$('dtReworkType').clearAll();
    $$('dtReworkType').parse(aReworkType, 'json');

    aReworkType = [];
}

async function reloadTableReworkItem() {

    let allReworkItem = await App.api.ormDbFind('reworkitem', { status: true });
    aReworkItem = allReworkItem.data;

    $$('reworkItemForm').elements.description.setValue("");
    $$('reworkItemForm').elements.typevalue.setValue("");

    $$('dtReworkItem').clearAll();
    $$('dtReworkItem').parse(aReworkItem, 'json');

    aReworkItem = [];
}

async function addReworkType() {

    if ($$('reworkTypeForm').validate()) {
        let description = $$('reworkTypeForm').elements.description.getValue();

        let rt = {};

        rt = {
            description: description
        }

        let reworktype = await App.api.ormDbFind('reworktype', { id: idItem });
        reworktype = reworktype.data;

        if (edit && idItem) {
            if (reworktype.length > 0) {

                App.api.ormDbUpdate({ id: idItem }, 'reworktype', rt).then(async (res) => {
                    webix.message(i18n('Saved successfully!'));
                    reloadTableReworkType();
                    aReworkType = [];
                    $$('reworkTypeForm').elements.description.setValue("");
                    $$('reworkItemLinkForm').elements.reworktype.refresh();

                });

                edit = false;
                idItem = null;

            }
        }
        else {
            await App.api.ormDbCreate('reworktype', rt).then((item) => {
                webix.message(i18n('Created successfully!'));
                aReworkType = [];
                reloadTableReworkType();

            });
        }

    }

}

async function addReworkItem() {

    if ($$('reworkItemForm').validate()) {
        let description = $$('reworkItemForm').elements.description.getValue();
        let typevalue = $$('reworkItemForm').elements.typevalue.getValue();

        let ri = {};

        ri = {
            description: description,
            typevalue: typevalue
        }

        let reworkItem = await App.api.ormDbFind('reworkitem', { id: idItem });
        reworkItem = reworkItem.data;
        if (edit && idItem) {
            if (reworkItem.length > 0) {

                await App.api.ormDbUpdate({ id: idItem }, 'reworkitem', ri).then(async (res) => {
                    webix.message(i18n('Saved successfully!'));
                    reloadTableReworkItem();
                    aReworkItem = [];
                    aLinkedReworkItem = [];
                    aUnlinkedReworkItem = [];
                    reloadTableItemTypeLink();
                    $$('reworkItemLinkForm').elements.reworktype.setValue("")
                    $$('reworkItemForm').elements.description.setValue("");
                    $$('reworkItemForm').elements.typevalue.setValue("");
                });

                edit = false;
                idItem = null;
            }
        }
        else {
            await App.api.ormDbCreate('reworkitem', ri).then((item) => {
                webix.message(i18n('Created successfully!'));
                aLinkedReworkItem = [];
                aUnlinkedReworkItem = [];
                reloadTableItemTypeLink();
                $$('reworkItemLinkForm').elements.reworktype.setValue("")
                aReworkItem = [];
                reloadTableReworkItem();

            });
        }

    }

}

async function editData() {

    let cellSelected = $$('tabRework').getValue();

    if (cellSelected == 'reworkTypeForm') {

        let item = $$('dtReworkType').getSelectedItem();

        if (item) {
            $$('reworkTypeForm').elements.description.setValue(item.description);
            edit = true;
            idItem = item.id;
        }
        else {
            webix.message(i18n("Please, select a Rework Type to Edit!"))
        }
    }
    else if (cellSelected == 'reworkItemForm') {
        let item = $$('dtReworkItem').getSelectedItem();

        if (item) {
            $$('reworkItemForm').elements.description.setValue(item.description);
            $$('reworkItemForm').elements.typevalue.setValue(item.typevalue);
            edit = true;
            idItem = item.id;
        }
        else {
            webix.message(i18n("Please, select a Rework Item to Edit!"))
        }
    }
    else {
        webix.message(i18n("Please, select a Item to Edit!"))
    }
}

async function removeData() {

    let cellSelected = $$('tabRework').getValue();

    if (cellSelected == 'reworkTypeForm') {

        let item = $$('dtReworkType').getSelectedItem();

        if (item) {
            idItem = item.id;
            webix.confirm(i18n('Are you sure you want to remove this Rework Type? '), '', async (result) => {
                if (result) {

                    let rt = {
                        id: item.id,
                        status: false
                    }

                    await App.api.ormDbUpdate({ id: rt.id }, 'reworktype', rt).then(async (item) => {
                        webix.message(i18n('Removed successfully!'));
                        reloadTableReworkType();
                        aLinkedReworkItem = [];
                        aUnlinkedReworkItem = [];
                        reloadTableItemTypeLink();
                        $$('reworkItemLinkForm').elements.reworktype.setValue("")
                        aReworkType = [];

                        $$('reworkTypeForm').elements.description.setValue("");

                        edit = false;

                    });

                }
            })
        }
        else {
            webix.message(i18n("Please, select a Rework Type to Remove!"))
        }
    }
    else if (cellSelected == 'reworkItemForm') {

        let item = $$('dtReworkItem').getSelectedItem();

        if (item) {
            idItem = item.id;

            webix.confirm(i18n('Are you sure you want to remove this Rework Item? '), '', async (result) => {
                if (result) {

                    let ri = {
                        id: item.id,
                        status: false
                    }

                    await App.api.ormDbUpdate({ id: ri.id }, 'reworkitem', ri).then(async (item) => {
                        webix.message(i18n('Removed successfully!'));
                        reloadTableReworkItem();
                        aReworkItem = [];
                        aLinkedReworkItem = [];
                        aUnlinkedReworkItem = [];
                        reloadTableItemTypeLink();
                        $$('reworkItemLinkForm').elements.reworktype.setValue("")
                        $$('reworkItemForm').elements.description.setValue("");
                        $$('reworkItemForm').elements.typevalue.setValue("");

                        edit = false;
                    });

                }
            })
        }
        else {
            webix.message(i18n("Please, select a Rework Item to Remove!"))
        }
    }
    else {
        webix.message(i18n("Please, select a Item to Edit!"))
    }
}

async function unlink() {

    let item = $$('dtLinkedReworkItem').getSelectedItem();
    let idreworktype = $$('reworkItemLinkForm').elements.reworktype.getValue();

    if (item && $$('reworkItemLinkForm').validate()) {

        let r = {
            idreworktype: idreworktype,
            idreworkitem: item.reworkItemId
        }
        webix.confirm(i18n('Are you sure you want to Unlink this Checklist Item? '), '', async (result) => {
            if (result) {
                await App.api.ormDbDelete(r, 'rework').then(async (res) => {
                    webix.message(i18n('Unlinked successfully!'));

                    let linked = await App.api.ormDbLinkedReworkItem({ reworktype: idreworktype });
                    let unlinked = await App.api.ormDbUnlinkedReworkItem({ reworktype: idreworktype });

                    aLinkedReworkItem = linked.data;
                    aUnlinkedReworkItem = unlinked.data;

                    reloadTableItemTypeLink();

                    $$('btnUnlink').disable();

                });
            }
        })
    }
    else {
        webix.message(i18n("Please, select a Rework Item!"))
    }

}

async function link() {

    let item = $$('dtUnlinkedReworkItem').getSelectedItem();
    let idreworktype = $$('reworkItemLinkForm').elements.reworktype.getValue();

    if (item && $$('reworkItemLinkForm').validate()) {

        let r = {
            idreworktype: idreworktype,
            idreworkitem: item.id
        }

        await App.api.ormDbCreate('rework', r).then(async (res) => {
            webix.message(i18n('Linked successfully!'));
        });
    }

    let linked = await App.api.ormDbLinkedReworkItem({ reworktype: idreworktype });
    let unlinked = await App.api.ormDbUnlinkedReworkItem({ reworktype: idreworktype });

    aLinkedReworkItem = linked.data;
    aUnlinkedReworkItem = unlinked.data;

    reloadTableItemTypeLink();

    $$('btnLink').disable();


}

async function enableBtnUnlink() {
    let button = await permission.checkObjectPermission('config.rework.btnUnlink');
    if (button) $$('btnUnlink').enable();
}

async function enableBtnLink() {
    let button = await permission.checkObjectPermission('config.rework.btnLink');
    if (button) $$('btnLink').enable();
}

async function setReworkType() {

    let idreworktype = $$('reworkItemLinkForm').elements.reworktype.getValue();

    let linked = await App.api.ormDbLinkedReworkItem({ reworktype: idreworktype });
    let unlinked = await App.api.ormDbUnlinkedReworkItem({ reworktype: idreworktype });

    aLinkedReworkItem = linked.data;
    aUnlinkedReworkItem = unlinked.data;

    reloadTableItemTypeLink();

}

async function reloadTableItemTypeLink() {

    $$('dtLinkedReworkItem').clearAll();
    $$('dtLinkedReworkItem').parse(aLinkedReworkItem, 'json');

    $$('dtUnlinkedReworkItem').clearAll();
    $$('dtUnlinkedReworkItem').parse(aUnlinkedReworkItem, 'json');

}




