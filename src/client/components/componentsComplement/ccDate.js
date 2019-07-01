import { i18n } from "../../lib/I18n.js";
import { App } from "../../lib/App.js";

export function create(order) {
    return {
        view: "form",
        scroll: false,
        elementsConfig: { margin: 5 },
        width: 200,
        elements: [
            {
                view: "fieldset",
                label: i18n("Date/Time"),
                borderless: true,
                height: 80,
                body: {
                    rows: [
                        {
                            cols: [
                                {
                                    view: "template",
                                    template: `<strong>${i18n('Start date')}: </strong>`
                                },
                                {
                                    view: "template",
                                    template: moment(order.dtcreated).format('DD/MM/YYYY HH:mm')
                                },
                            ]
                        },
                        {
                            cols: [
                                {
                                    view: "template",
                                    template: `<strong>${i18n("End date")}: </strong>`
                                },
                                {
                                    view: "template",
                                    template: '-'
                                },
                            ]
                        },
                    ]
                }
            }
        ]
    }
}