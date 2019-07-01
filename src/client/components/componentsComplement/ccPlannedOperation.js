import { i18n } from "../../lib/I18n.js";
import { App } from "../../lib/App.js";

export async function create(order) {
    let operations = await App.api.ormDbFind('materialcharacteristic', {idcharacteristic: 'CG_TERMINACAO', idmaterial: order.idmaterial});
    let description = operations.data.length ? operations.data[0].description : '';
    var texto = description.replace(/ ou /g, "<br>");
    return {
        view: "form",
        width: 150,
        elements: [
            {
                view: "fieldset",
                label: i18n("Operation"),
                borderless: true,
                height: 80,
                body: {
                    rows: [
                        {
                            view: "label",
                            template: `<strong>${texto}</strong>`,
                            height: 80,
                            align: "center"
                        }
                    ]
                }
            }
        ]
    }
}