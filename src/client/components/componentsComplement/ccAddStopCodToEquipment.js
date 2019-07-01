import { App } from "../../lib/App.js";
import { i18n } from "../../lib/I18n.js";
import { WebixLabel, WebixInputSelect, WebixCrudDatatable, WebixCrudAddButton } from "../../lib/WebixWrapper.js";

export async function create(equipments) {

    let dtLinkedStop = new WebixCrudDatatable('dtLinkedStop');
    dtLinkedStop.columns = [
        { id: "idequipment", header: [i18n("Equipment"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "idstop", header: [i18n("Id Defect Type"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "description", header: [i18n("Defect Type"), { content: "textFilter" }], sort: "string", fillspace: true }
    ];

    let dtUnlinkedStop = new WebixCrudDatatable('dtUnlinkedStop');
    dtUnlinkedStop.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "description", header: [i18n("Defect Type"), { content: "textFilter" }], sort: "string", fillspace: true },
    ];

    return {
        header: "Link Stop Cod",
        body: {
            view: 'form',
            rows: [
                new WebixInputSelect('idequipmentinstop', i18n('Equipment'), equipments, {
                    template: (obj) => obj.description, onChange: async (item) => {
                        reload(item)
                    }
                }),
                {
                    cols: [
                        new WebixLabel('linkedDefect', i18n('Linked Stop')),
                        new WebixLabel('unlinkedDefect', i18n('Unlinked Stop'))
                    ]
                },
                {
                    cols: [
                        dtLinkedStop,
                        dtUnlinkedStop
                    ]
                },
                {
                    cols: [
                        {},
                        new WebixCrudAddButton('unlinkedstop', i18n('Unliked') + ' >>', unlinked, { width: 130 }),
                        {},
                        new WebixCrudAddButton('linkedstop', '<< ' + i18n('Linked'), linked, { width: 130 }),
                        {}
                    ]
                }
            ]
        }
    };
}


export async function unlinked(params) {
    let selected = $$('dtLinkedStop').getSelectedItem();
    if (!selected) {
        webix.message(i18n('Please select an item in linked items'))
    } else {
        let equipment = $$('cmbIdequipmentinstop').getValue();
        let result = await App.api.ormDbDelete({ idequipment: equipment, idstop: selected.idstop }, 'linkedequipmentstop');

        if (result.success) {
            webix.message(i18n('Successfully unlinked'));
            reload(equipment);
        } else {
            webix.message(i18n('Error while unlinking'));
        }
    }
}

export async function linked(params) {
    let selected = $$('dtUnlinkedStop').getSelectedItem();
    if (!selected) {
        webix.message(i18n('Please select an item in unlinked items'))
    } else {
        let equipment = $$('cmbIdequipmentinstop').getValue();
        let result = await App.api.ormDbCreate('linkedequipmentstop', { idequipment: equipment, idstop: selected.id });

        if (result.success) {
            webix.message(i18n('Successfully linked'));
            reload(equipment);
        } else {
            webix.message(i18n('Error while linking'));
        }
    }
}

export async function reload(idequipment) {
    let stopTypes = await App.api.ormDbUnlinkStopEquipment({ idequipment: idequipment });
    $$('dtUnlinkedStop').clearAll();
    $$('dtUnlinkedStop').parse(stopTypes.data);


    let linked = await App.api.ormDbLinkStopEquipment({ idequipment: idequipment });
    $$('dtLinkedStop').clearAll();
    $$('dtLinkedStop').parse(linked.data);
}