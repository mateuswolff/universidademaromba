import { i18n } from "../../lib/I18n.js";
import { App } from "../../lib/App.js";

export async function create(order) {

    let resourceUserItem = await App.api.ormDbFind('resourceused', { idequipment: order.idequipmentscheduled, idorder: order.idordermes });

    let description = resourceUserItem.data.map((item) => item.idresource);

    description = description.filter((item) => item !== "");

    let texto = description.toString().replace(/,/g, "<br>");

    return {
        view: "form",
        width: 150,
        elements: [
            {
                view: "fieldset",
                label: i18n("Instrument"),
                borderless: true,
                height: 120,
                body: {
                    rows: [
                        {
                            view: "label",
                            template: `<strong>${texto}</strong>`,
                            height: 120,
                            align: "center"
                        }
                    ]
                }
            }
        ]
    }
}