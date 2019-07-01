import { WebixWindow, WebixCrudAddButton } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";

import * as _modalRegisterRNC from './_modalRegisterRNC.js';
import * as _modalBigMakerCollectData from './_modalBigMakerCollectData.js';
import * as _modalStops from './_modalStops.js';
import * as _modalScrapsRecord from './_modalScrapsRecord.js';
//import * as _modalChoosePrinter from './_modalChoosePrinter.js';

export async function showModal(obj) {
    return new Promise(async function (resolve, reject) {

        let stepPieces = await App.api.ormDbFindStepPieces({ idordermes: obj.idordermes, idstep: obj.idstep, sequence: obj.sequence });
        stepPieces = stepPieces.data;

        if (stepPieces.length == 0) {
            webix.message(i18n('There is no available piece to process!'))
        }
        else {
            let modal = new WebixWindow({
                width: 900,
                onClosed: (modal) => {
                    modal.close();
                    resolve(true)
                }
            });
            stepPieces = await reorganizeArray(stepPieces);

            let contP = 0;
            let contW = 0;
            let contS = 0;

            stepPieces.forEach(element => {
                if (element.idstatus == 'w' || element.idstatus == 'p') {
                    contP++;
                }
                else if (element.idstatus == 's')
                    contS++;
                else
                    contW++;
            });

            modal.body = {
                view: "form",
                id: "formStepPieces",
                rows: [
                    {
                        view: "fieldset",
                        label: i18n("Step Summary"),
                        height: 60,
                        body: {
                            rows: [
                                {
                                    cols: [
                                        {
                                            view: "template",
                                            template: `<div class='header_align'><span class='header_size'><strong>${i18n('Production Order')}</strong></span><br /><span class='subheader_size'>` + obj.idordermes + `</span></div>`
                                        },
                                        {
                                            view: "template",
                                            template: `<div class='header_align'><span class='header_size'><strong>${i18n('Expected Pieces')}</strong></span><br /><span class='subheader_size'>` + stepPieces.length + `</span></div>`
                                        },
                                        {
                                            view: "template",
                                            template: `<div class='header_align'><span class='header_size'><strong>${i18n('Raw Material')}</strong></span><br /><span class='subheader_size'>` + stepPieces[0].rawmaterial + `</span></div>`
                                        },
                                        {
                                            view: "template",
                                            template: `<div class='header_align'><span class='header_size'><strong>${i18n('Output Material')}</strong></span><br /><span class='subheader_size'>` + stepPieces[0].material + `</span></div>`
                                        },
                                        {
                                            view: "template",
                                            template: `<div class='header_align'><span class='header_size'><strong>${i18n('Step')}</strong></span><br /><span class='subheader_size'>` + obj.sequence + ` - ` + obj.step + `</span></div>`
                                        },
                                    ]
                                },
                            ]
                        }
                    },
                    {
                        view: "datatable",
                        id: 'dtStepPieces',
                        css: "datatable-style-cell",
                        borderless: false,
                        columns: [
                            { id: "piece", header: i18n('Piece Number'), fillspace: true, css: "center-text" },
                            { id: "lot", header: i18n('Lot'), fillspace: true, css: "center-text" },
                            {
                                id: "idstatus",
                                header: i18n('Status'),
                                fillspace: true,
                                css: "center-text",
                                cssFormat: bgColor,
                                template: (obj) => {
                                    switch (obj.idstatus){
                                        case 's':
                                            return i18n('Scrapped');
                                        case 'd':
                                            return i18n('Done');
                                        case 'w':
                                            return i18n('Waiting');
                                        case 'p':
                                            return i18n('Producing');
                                    }
                                }
                            },
                        ],
                        //autoheight: true,
                        select: "row",
                        maxHeight: 400,
                        rowHeight: 60,
                        data: stepPieces,
                        scroll: true
                    },
                    {
                        cols: [
                            new WebixCrudAddButton('collect', i18n('Collect'), async () => {
                                if (!$$('dtStepPieces').getSelectedItem())
                                    webix.message(i18n('Please, select a piece to Collect!'))
                                else if ($$('dtStepPieces').getSelectedItem().chkscrap) {
                                    webix.message(i18n('The selected piece was Scrapped!'))
                                }
                                else if ($$('dtStepPieces').getSelectedItem().status == i18n("Done")){
                                    webix.message(i18n('The selected piece was Collected!'))
                                }
                                else {
                                    let collect = await _modalBigMakerCollectData.showModal($$('dtStepPieces').getSelectedItem());
                                    webix.message('Saved successfully!')
                                    reloadScreen(collect);
                                }

                            }, {
                                    //width: 100,
                                    height: 80,
                                    //disabled: ordersCutting.length
                                }),
                            new WebixCrudAddButton('stop', i18n('Stop'), async () => {

                                let stop = await _modalStops.showModal("PERFORMED", null, 0, obj);

                            }, {
                                    //width: 100,
                                    height: 80,
                                    //disabled: ordersCutting.length
                                }),
                            new WebixCrudAddButton('scrap', i18n('Scrapp'), async () => {
                                let selected = $$('dtStepPieces').getSelectedItem();
                                if (!selected)
                                    webix.message(i18n('Please, select a piece to Scrapp!'))
                                else if (selected.chkscrap) {
                                    webix.message(i18n('The selected piece was Scrapped!'))
                                }
                                else {

                                    let scrap = await _modalScrapsRecord.showModal(null, 0, selected, null, selected.lot, null, 1);

                                    if (scrap.success) {
                                        await App.api.ormDbUpdate({ idlot: selected.lot, idequipment: selected.idequipment, idordermes: selected.idordermes, piece: selected.piece }, 'steppieces', { chkscrap: true });
                                        reloadScreen(selected);
                                    }
                                    else {
                                        webix.message(i18n('An error ocurred, please contact the support!'))
                                    }
                                }
                            }, {
                                    height: 80,
                                }),

                            {
                                view: "fieldset",
                                label: i18n("Production Summary"),
                                height: 80,
                                body: {
                                    rows: [
                                        {
                                            view: "template",
                                            id: "templatePendent",
                                            template: `<div class='header_align'><strong><span class='header_size header_color_red'>${i18n('PENDENT PIECES: ')}</span><span class='subheader_size'>` + contP + `</span></strong></div>`
                                        },
                                        {
                                            view: "template",
                                            id: "templateWorked",
                                            template: `<div class='header_align'><strong><span class='header_size header_color_green'>${i18n('WORKED PIECES: ')}</span><span id='teste' class='subheader_size'>` + contW + `</span></strong></div>`
                                        },
                                        {
                                            view: "template",
                                            id: "templateScrapped",
                                            template: `<div class='header_align'><strong><span class='header_size header_color_gray'>${i18n('SCRAPPED PIECES: ')}</span><span id='teste' class='subheader_size'>` + contS + `</span></strong></div>`
                                        }
                                    ]
                                }
                            }


                        ]
                    }]
            };

            modal.modal = true;
            modal.show();
            modal.setTitle(i18n('Big Maker Step'));
        }

    });

}

function bgColor(value, config) {
    switch (config.idstatus) {
        case 'w':
            return { "background": "#FFAAAA" };
        case 'p':
            return { "background": "#FAFAD2" };
        case 'd':
            return { "background": "#CCFFCC" };
        case 's':
            return { "background": "#D3D3D3" };
    }
}

async function reorganizeArray(arr) {

    arr = arr.map(elem => {

        if (elem.chkscrap) {
            elem.status = i18n('Scrapped')
            elem.idstatus = 's'
        }
        else if (!elem.dtinitial && !elem.dtend) {
            elem.status = i18n('Waiting')
            elem.idstatus = 'w'
        }
        else if (elem.dtinitial && !elem.dtend) {
            elem.status = i18n('Producing')
            elem.idstatus = 'p'
        }
        else {
            elem.status = i18n('Done')
            elem.idstatus = 'd'
        }
        return elem

    })

    arr.sort(compareValues);
    return arr

}

function compareValues(a, b) {
    if (a.status == 'w' && b.status == 'p')
        return 1
    if (a.status == 'w' && b.status == 'd')
        return -1
    if (a.status == 'w' && b.status == 's')
        return -1
    if (a.status == 'p' && b.status == 'd')
        return -1
    if (a.status == 'p' && b.status == 'w')
        return -1
    if (a.status == 'p' && b.status == 's')
        return -1
    if (a.status == 'd' && b.status == 'p')
        return 1
    if (a.status == 'd' && b.status == 'w')
        return 1
    if (a.status == 's' && b.status == 'w')
        return 1
    if (a.status == 's' && b.status == 'p')
        return 1

    return 0
}

async function reloadScreen(obj) {

    let stepPieces = await App.api.ormDbFindStepPieces({ idordermes: obj.idordermes, idstep: obj.idstep, sequence: obj.sequence });
    stepPieces = stepPieces.data;

    stepPieces = await reorganizeArray(stepPieces);

    let contP = 0;
    let contW = 0;
    let contS = 0;

    stepPieces.forEach(element => {
        if (element.status == 'w' || element.status == 'p')
            contP++;
        else if (element.status == 's')
            contS++;
        else
            contW++;
    });

    $$('templatePendent').setHTML(`<div class='header_align'><strong><span class='header_size header_color_red'>${i18n('PENDENT PIECES: ')}</span><span class='subheader_size'>` + contP + `</span></strong></div>`)
    $$('templateWorked').setHTML(`<div class='header_align'><strong><span class='header_size header_color_green'>${i18n('WORKED PIECES: ')}</span><span id='teste' class='subheader_size'>` + contW + `</span></strong></div>`)
    $$('templateScrapped').setHTML(`<div class='header_align'><strong><span class='header_size header_color_gray'>${i18n('SCRAPPED PIECES: ')}</span><span id='teste' class='subheader_size'>` + contS + `</span></strong></div>`)

    $$('dtStepPieces').clearAll();
    $$('dtStepPieces').parse(stepPieces);

}