import { App } from "../../lib/App.js";
import { i18n } from "../../lib/I18n.js";
import { WebixLabel, WebixInputSelect, WebixCrudDatatable, WebixCrudAddButton } from "../../lib/WebixWrapper.js";

export async function create(equipments) {

    let dtLinkedDefect = new WebixCrudDatatable('dtLinkedDefect');
    dtLinkedDefect.columns = [
        { id: "idequipment", header: [i18n("Equipment"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "iddefect", header: [i18n("Id Defect Type"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "description", header: [i18n("Defect Type"), { content: "textFilter" }], sort: "string", fillspace: true }
    ];

    let dtUnlinkedDefect = new WebixCrudDatatable('dtUnlinkedDefect');
    dtUnlinkedDefect.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "description", header: [i18n("Defect Type"), { content: "textFilter" }], sort: "string", fillspace: true },
    ];

    return {
        header: "Link Defect Type",
        body: {
            view: 'form',
            rows: [
                new WebixInputSelect('idequipmentindefect', i18n('Equipment'), equipments, {
                    template: (obj) => obj.description, onChange: async (item) => {
                        reload(item)
                    }
                }),
                {
                    cols: [
                        new WebixLabel('linkedDefect', i18n('Linked Defect')),
                        new WebixLabel('unlinkedDefect', i18n('Unlinked Defect'))
                    ]
                },
                {
                    cols: [
                        dtLinkedDefect,
                        dtUnlinkedDefect
                    ]
                },
                {
                    cols: [
                        {},
                        new WebixCrudAddButton('unlinkeddefect', i18n('Unliked') + ' >>', unlinked, { width: 130 }),
                        {},
                        new WebixCrudAddButton('linkeddefect', '<< ' + i18n('Linked'), linked, { width: 130 }),
                        {}
                    ]
                }
            ]
        }
    };
}

export async function unlinked(params) {
    let selected = $$('dtLinkedDefect').getSelectedItem();
    if (!selected) {
        webix.message(i18n('Please select an item in linked items'))
    } else {
        let equipment = $$('cmbIdequipmentindefect').getValue();
        let result = await App.api.ormDbDelete({idequipment: equipment, iddefect: selected.iddefect}, 'linkedequipmentdefect');

        if (result.success) {
            webix.message(i18n('Successfully unlinked'));
            reload(equipment);
        }else{
            webix.message(i18n('Error while unlinking'));
        }
    }
}

export async function linked(params) {
    let selected = $$('dtUnlinkedDefect').getSelectedItem();
    if (!selected) {
        webix.message(i18n('Please select an item in unlinked items'))
    } else {
        let equipment = $$('cmbIdequipmentindefect').getValue();
        let result = await App.api.ormDbCreate('linkedequipmentdefect', { idequipment: equipment, iddefect: selected.id });

        if (result.success) {
            webix.message(i18n('Successfully linked'));
            reload(equipment);
        }else{
            webix.message(i18n('Error while linking'));
        }
    }
}

export async function reload(idequipment) {
    let defectTypes = await App.api.ormDbUnlinkDefectEquipment({ idequipment: idequipment });
    $$('dtUnlinkedDefect').clearAll();
    $$('dtUnlinkedDefect').parse(defectTypes.data);

    let linked = await App.api.ormDbLinkDefectEquipment({ idequipment: idequipment });
    $$('dtLinkedDefect').clearAll();
    $$('dtLinkedDefect').parse(linked.data);
}