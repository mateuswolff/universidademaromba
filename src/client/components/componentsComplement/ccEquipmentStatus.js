import { i18n } from "../../lib/I18n.js";
import { App } from "../../lib/App.js";

export async function create(order) {
    let status = await App.api.ormDbLastStopEquipment('stop', { idequipment: order.idequipmentscheduled, idorder: order.idordermes });
    return {
        view: "form",
        scroll: false,
        width: 130,
        margin: 0,
        elementsConfig: { margin: 5 },
        elements: [
            {
                rows: [
                    {
                        view: "label",
                        label: `<span style="font-size:18px; margin-top: 15px; font-weight: 700; text-align: center!important;">${order.idequipmentscheduled}</span>`,
                        align: "center"
                    },
                    {
                        view: "label",
                        label: `<strong>${i18n('Situation')}:</strong> <div class="${status.data.length ? 'spanStatusStop' : 'spanStatusStart'}"></div>`,
                    },
                    {
                        view: "template",
                        template: `<span style="word-break: break-all;">${status.data.length ? status.data[0].stopreasondescription : ''}</span>`,
                    }
                ]
            }
        ]
    }
}