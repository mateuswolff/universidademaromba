import { App } from "../../lib/App.js";
import { i18n } from "../../lib/I18n.js";
import { WebixLabel, WebixInputSelect, WebixCrudDatatable, WebixCrudAddButton } from "../../lib/WebixWrapper.js";

export async function create(equipments) {

    let dtLinkedScrap = new WebixCrudDatatable('dtLinkedScrap');
    dtLinkedScrap.columns = [
        { id: "idequipment", header: [i18n("Equipment"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "idscrap", header: [i18n("Id Scrap Type"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "description", header: [i18n("Scrap Type"), { content: "textFilter" }], sort: "string", fillspace: true }
    ];

    let dtUnlinkedScrap = new WebixCrudDatatable('dtUnlinkedScrap');
    dtUnlinkedScrap.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "description", header: [i18n("Scrap Type"), { content: "textFilter" }], sort: "string", fillspace: true },
    ];

    return {
        header: "Link Scrap Reason",
        body: {
            view: 'form',
            rows: [
                new WebixInputSelect('idequipmentinscrap', i18n('Equipment'), equipments, {
                    template: (obj) => obj.description, onChange: async (item) => {
                        reload(item)
                    }
                }),
                {
                    cols: [
                        new WebixLabel('linkedScrap', i18n('Linked Scrap')),
                        new WebixLabel('unlinkedScrap', i18n('Unlinked Scrap'))
                    ]
                },
                {
                    cols: [
                        dtLinkedScrap,
                        dtUnlinkedScrap
                    ]
                },
                {
                    cols: [
                        {},
                        new WebixCrudAddButton('unlinkedscrap', i18n('Unliked') + ' >>', unlinked, { width: 130 }),
                        {},
                        new WebixCrudAddButton('linkedscrap', '<< ' + i18n('Linked'), linked, { width: 130 }),
                        {}
                    ]
                }
            ]
        }
    };
}


export async function unlinked(params) {
    let selected = $$('dtLinkedScrap').getSelectedItem();
    if (!selected) {
        webix.message(i18n('Please select an item in linked items'))
    } else {
        let equipment = $$('cmbIdequipmentinscrap').getValue();
        let result = await App.api.ormDbDelete({ idequipment: equipment, idscrap: selected.idscrap }, 'linkedequipmentscrap');

        if (result.success) {
            webix.message(i18n('Successfully unlinked'));
            reload(equipment);
        } else {
            webix.message(i18n('Error while unlinking'));
        }
    }
}

export async function linked(params) {
    let selected = $$('dtUnlinkedScrap').getSelectedItem();
    if (!selected) {
        webix.message(i18n('Please select an item in unlinked items'))
    } else {
        let equipment = $$('cmbIdequipmentinscrap').getValue();
        let result = await App.api.ormDbCreate('linkedequipmentscrap', { idequipment: equipment, idscrap: selected.id });

        if (result.success) {
            webix.message(i18n('Successfully linked'));
            reload(equipment);
        } else {
            webix.message(i18n('Error while linking'));
        }
    }
}

export async function reload(idequipment) {
    let scrapTypes = await App.api.ormDbUnlinkScrapEquipment({ idequipment: idequipment });
    $$('dtUnlinkedScrap').clearAll();
    $$('dtUnlinkedScrap').parse(scrapTypes.data);


    let linked = await App.api.ormDbLinkScrapEquipment({ idequipment: idequipment });
    $$('dtLinkedScrap').clearAll();
    $$('dtLinkedScrap').parse(linked.data);
}