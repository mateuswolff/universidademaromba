import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputSelect, WebixBuildReponsiveTopMenu } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen() {

    let dtUnlinkedChecklistItem = new WebixCrudDatatable();
    dtUnlinkedChecklistItem.id = "dtUnlinkedChecklistItem";

    dtUnlinkedChecklistItem.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], width: 100, sort: "string" },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], sort: "string", fillspace: true }
    ];

    let allEquipment = await App.api.ormDbFind('equipment');
    allEquipment.data.sort(function(a,b) {
        if(a.description < b.description) return -1;
        if(a.description > b.description) return 1;
        return 0;
    });
    
    let equipmentChecklist = new WebixInputSelect('equipmentChecklist', i18n('Equipments'), allEquipment.data, {
        template: function (obj) {
            return obj.description;
        },
        "onChange": setEquipment
    });

    let dtLinkedChecklistItem = new WebixCrudDatatable("dtLinkedChecklistItem");

    dtLinkedChecklistItem.columns = [
        { id: "idequipment", header: [i18n("Id Equipment"), { content: "textFilter" }], width: 100, sort: "string" },
        { id: "equipment", header: [i18n("Equipment"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "resourcetype", header: [i18n("Resource type"), { content: "textFilter" }], width: 250, sort: "string" }
    ];

    dtLinkedChecklistItem.on = {
        "onItemClick": enableBtnUnlink
    };

    dtUnlinkedChecklistItem.on = {
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
        "equipmentChecklist": webix.rules.isNotEmpty,
    };

    let grids = {
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

    let menu = createSimpleCrudMenu(i18n('Resource type equipment link'));
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);
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

async function setEquipment(item) {
    let resourcetypeequipmentlinks = await App.api.ormDbFindAllResourcetypeEquipmentLink({ idequipment: item });
    resourcetypeequipmentlinks = resourcetypeequipmentlinks.success ? resourcetypeequipmentlinks.data : [];

    $$('dtLinkedChecklistItem').clearAll();
    $$('dtLinkedChecklistItem').parse(resourcetypeequipmentlinks);

    let itensResource = await App.api.ormDbFindResourceTypeByEquipmemt({ idequipment: item });
    itensResource = itensResource.success ? itensResource.data : [];

    $$('dtUnlinkedChecklistItem').clearAll();
    $$('dtUnlinkedChecklistItem').parse(itensResource);
}

async function unlink() {
  
    let item = $$('dtLinkedChecklistItem').getSelectedItem();
    let result = await App.api.ormDbDelete({ id: item.id }, 'resourcetypeequipmentlink');
    if (result.success) {
        setEquipment($$('cmbEquipmentChecklist').getValue());
        webix.message(i18n('Successful unlinking'));
    } else {
        webix.message(i18n('Unlinkage failed, please try again.'));
    }

}

async function link() {

    let quantListItem = $$('dtLinkedChecklistItem').serialize();

    if (quantListItem.length === 5) {

        webix.message(i18n('Only 5 allowed links are registered.'));

    } else {
        
        let item = $$('dtUnlinkedChecklistItem').getSelectedItem();
        let result = await App.api.ormDbCreate('resourcetypeequipmentlink', { idresourcetype: item.id, idequipment: $$('cmbEquipmentChecklist').getValue() });
        if (result.success) {
            setEquipment($$('cmbEquipmentChecklist').getValue());
            webix.message(i18n('Successful linking'));
        } else {
            webix.message(i18n('Linkage failed, please try again.'));
        }

    }

}