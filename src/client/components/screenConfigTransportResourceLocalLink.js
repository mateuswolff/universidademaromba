import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputSelect, WebixBuildReponsiveTopMenu } from "../lib/WebixWrapper.js";

import * as util from "../lib/Util.js";

export async function showScreen(event) {
    
    let dtUnlinkedChecklistItem = new WebixCrudDatatable("dtUnlinkedChecklistItem");

    dtUnlinkedChecklistItem.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 100, sort: "string" },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], sort: "string", fillspace: true }
    ];

    let transportresource = await App.api.ormDbFind('transportresource', {status: true})
    transportresource.data.sort(function(a,b) {
        if(a.description < b.description) return -1;
        if(a.description > b.description) return 1;
        return 0;
    });

    let transportresourceItem = new WebixInputSelect('resourceTransportChecklist', i18n('Resource Transports'), transportresource.data, {
        template: function (obj) {
            return obj.description;
        },
        "onChange": setLocal
    });

    let dtLinkedChecklistItem = new WebixCrudDatatable("dtLinkedChecklistItem");

    dtLinkedChecklistItem.columns = [
        { id: "idlocal", header: [i18n("Id Local"), { content: "textFilter" }], width: 40, sort: "string" },
        { id: "local", header: [i18n("Local"), { content: "textFilter" }], width: 100, sort: "string", fillspace: true },
        { id: "transportresource", header: [i18n("Transporte Resource"), { content: "textFilter" }], width: 250, sort: "string", fillspace: true }
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
        label: i18n("Linked Resource type Item"),
        inputWidth: 100,
        align: "center"
    })
    let txtUnlinkedChecklistItem = ({
        view: "label",
        label: i18n("Unlinked Resource type Item"),
        inputWidth: 100,
        align: "center"
    })

    let rules1 = {
        "localChecklist": webix.rules.isNotEmpty,
    };

    let grids = {
        view: 'form',
        id: 'checklistItemFormC1',
        rules: rules1,
        rows: [
            {
                cols: [
                    transportresourceItem
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

    let menu = createSimpleCrudMenu(i18n('Transport resource local link'));
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);

    await util.datatableColumsGet('dtLinkedChecklistItem', event);
    await util.datatableColumsGet('dtUnlinkedChecklistItem', event);
}

function createSimpleCrudMenu(title) {
    let menu = WebixBuildReponsiveTopMenu(title, []);
    return menu;
}

async function enableBtnUnlink() {
    $$('btnUnlink').enable();
}

async function enableBtnLink() {
    $$('btnLink').enable();
}

async function setLocal(item) {
    let transportresourcelinks = await App.api.ormDbFindAllTransportResourceLocalLink({ idresource: item });
    transportresourcelinks = transportresourcelinks.success ? transportresourcelinks.data : [];

    
    $$('dtLinkedChecklistItem').clearAll();
    $$('dtLinkedChecklistItem').parse(transportresourcelinks);
    
    let itensLocal = await App.api.ormDbFindTransportResourceByLocal({ idresource: item });
    itensLocal = itensLocal.success ? itensLocal.data : [];
    
    $$('dtUnlinkedChecklistItem').clearAll();
    $$('dtUnlinkedChecklistItem').parse(itensLocal);
}

async function unlink() {
    let item = $$('dtLinkedChecklistItem').getSelectedItem();
    let result = await App.api.ormDbDelete({ id: item.id }, 'transportresourcelocallink');
    if (result.success) {
        setLocal($$('cmbResourceTransportChecklist').getValue());
        webix.message(i18n('Successful unlinking'));
    } else {
        webix.message(i18n('Unlinkage failed, please try again.'));
    }
}

async function link() {
    let item = $$('dtUnlinkedChecklistItem').getSelectedItem();
    let result = await App.api.ormDbCreate('transportresourcelocallink', { idlocal: item.id, idtransportresource: $$('cmbResourceTransportChecklist').getValue() });
    if (result.success) {
        setLocal($$('cmbResourceTransportChecklist').getValue());
        webix.message(i18n('Successful linking'));
    } else {
        webix.message(i18n('Linkage failed, please try again.'));
    }
}