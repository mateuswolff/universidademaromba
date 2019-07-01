import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixBuildReponsiveTopMenu } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

import * as  ccListReworkCollect from "./componentsComplement/ccListReworkCollect.js";

export async function showScreen(event) {
    const grids = {
        view: 'form',
        id: "form",
        autoheight: false,
        rows: [
            {
                view: "accordion",
                multi: true,
                rows: await ccListReworkCollect.create(event)
            },
            {
                cols: [
                {
                    view: 'button',
                    id: 'btnCollect',
                    label: i18n('Collect'),
                    height: 80,
                    width: 100,
                    click: () => {
                        ccListReworkCollect.collect();
                    }
                },
                {
                    view: 'button',
                    id: 'btnLinkOder',
                    label: i18n('Associate Order'),
                    height: 80,
                    width: 100,
                    click: () => {
                        ccListReworkCollect.linkOrder();
                    }
                }, {}]
            }
        ]
    }

    App.replaceMainContent(grids);
    App.replaceMainMenu(WebixBuildReponsiveTopMenu(i18n('Rework Collection'), [
        {
            view: 'button',
            id: 'btn123',
            label: i18n('Link RNC'),
            height: 80,
            width: 100,
            click: () => {
                showModalLinkRNC();
            }
        }
    ]));

    //await util.datatableColumsGet('dtReworkNotCollect', event);
}


async function showModalLinkRNC() {
    let selected = $$('dtReworkNotCollect').getSelectedItem();
    if (selected) {
        return new Promise(async function (resolve, reject) {
            let modal = new WebixWindow({
                width: 600,
                height: 400,
                onClosed: (modal) => {
                    modal.closed();
                }
            });

            modal.body = {
                id: "formReadRawMaterial",
                cols: [
                    {
                        rows: [
                            {
                                view: 'template', id: "tmpReader", scroll: true, template: ''
                            }
                        ]
                    }
                ]
            };
            modal.modal = true;
            modal.show();
            modal.setTitle(i18n("Read QR"));
        });
    } else {
        webix.message(i18n('To link an rnc you need to select a lot in the grid'))
    }
}