import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixBuildReponsiveTopMenu } from "../lib/WebixWrapper.js";

import * as _modalCoilCollect from '../extra/_modalCoilCollect.js';
import * as  _modalStops from "../extra/_modalStops.js";
import * as screenDashboardList from './screenDashboardList.js';

let items = [];

export async function showScreen(event) {

    items = []
    
    let equipment = localStorage.getItem("selectedEquipment");
    
    let status = await App.api.ormDbLastStopEquipment('stop', { idequipment: equipment});
    if (status.data.length) {
        localStorage.setItem('statusEquipment', 'stop');
    } else {
        localStorage.setItem('statusEquipment', 'start');
    }
    
    localStorage.removeItem('selectedEquipmentCoil')

    if (!equipment) {
        screenDashboardList.showScreen();
    }

    const grids = {
        view: "form",
        css: "font-18-fieldset",
        //id: "form",
        scroll: true,
        elements: [
            {
                rows: items
            }
        ]
    }

    await loadTableCoilCollection(equipment);

    let menu = createSimpleCrudMenu(`${i18n('Coil Collect')} - ${i18n('equipment')} ${equipment} ${i18n('selected')}`, []);
    App.replaceMainMenu(menu);


    await App.replaceMainContent(grids);
    await replaceMain(equipment);

}

async function replaceMain(equipment) {
    let allCoilCollect = await App.api.ormDbFindAllCoilCutPlanByEquip({ idequipment: equipment });
    allCoilCollect = allCoilCollect.success ? allCoilCollect.data : [];


    for (let i = 0; i < allCoilCollect.length; i++) {

        let arrayN = allCoilCollect.filter(elem => elem.idlot == allCoilCollect[i].idlot);

        if (arrayN.length > 1) {
            $$('dt' + allCoilCollect[i].idlot).clearAll();
            $$('dt' + allCoilCollect[i].idlot).parse(arrayN);
        }
    }
}

function createSimpleCrudMenu(title, btn) {
    let menu = WebixBuildReponsiveTopMenu(title, btn);
    return menu;
}

export async function loadTableCoilCollection(equipment) {

    let allCoilCollect = await App.api.ormDbFindAllCoilCutPlanByEquip({ idequipment: equipment });
    allCoilCollect = allCoilCollect.success ? allCoilCollect.data : [];

    if (allCoilCollect.length == 0) {
        await webix.alert(i18n('There is no Coil Cutting Plan to produce!'))
        screenDashboardList.showScreen(); s
        return
    }

    for (let i = 0; i < allCoilCollect.length; i++) {

        const padding = ({
            view: "label",
            label: i18n(""),
            id: "padding" + allCoilCollect[i].idlot,
        });

        let btnCollect = {
            view: 'button',
            value: i18n('Collect'),
            disabled: localStorage.getItem('statusEquipment') == 'stop' ? true : false,
            click: async () => {
                collectCoil(allCoilCollect[i].idcoilcuttingplan, allCoilCollect[i].idlot)
            }
        }

        let btnStop = {
            view: 'button',
            value: localStorage.getItem('statusEquipment') == 'stop' ? i18n('Register Start') : i18n('Register Stop'),
            css: localStorage.getItem('statusEquipment') == 'stop' ? 'startButton' : 'stopButton',
            //disabled: localStorage.getItem('oldLotReader') ? false : true,
            click: async () => {

                let order = {
                    idequipmentscheduled: equipment,
                    equipmentscheduledtype: 'SLT'
                }

                if (localStorage.getItem('statusEquipment') == 'start') {

                    // Abre o modal de stop
                    await _modalStops.showModal('PERFORMED', null, 0, order);

                    // Recarrega a tela para atualizar os campos

                    localStorage.setItem('selectedEquipmentCoil', equipment);
                    localStorage.setItem('selectedEquipment', equipment);
                    localStorage.removeItem('statusEquipment');
                    window.location.reload()
                } else {
                    let status = await App.api.ormDbLastStopEquipment('stop', { idequipment: order.idequipmentscheduled, idorder: order.idordermes });
                    let stop = await _modalStops.showModal('PERFORMED', null, status.data[0].id);

                    if (stop.success) {

                        localStorage.setItem('selectedEquipmentCoil', equipment);
                        localStorage.setItem('selectedEquipment', equipment);
                        localStorage.removeItem('statusEquipment');
                        window.location.reload()
                    }
                }
            }
        }

        let labelCoil = ({
            view: "label",
            id: "labelcoil" + allCoilCollect[i].idlot,
            label: `<strong>${i18n('Coil Cutting Plan')}</strong>`,
            align: "center"
        });

        let valueCoil = ({
            view: "label",
            id: "valuecoil" + allCoilCollect[i].idlot,
            label: allCoilCollect[i].idcoilcuttingplan,
            align: "center"
        });

        let labelYield = ({
            view: "label",
            id: "labelyeld" + allCoilCollect[i].idlot,
            label: `<strong>${i18n('Yield')}</strong>`,
            align: "center"
        });

        let valueYield = ({
            view: "label",
            id: "valueyeld" + allCoilCollect[i].idlot,
            label: allCoilCollect[i].yield,
            align: "center"
        });

        let labelRefile = ({
            view: "label",
            id: "labelrefile" + allCoilCollect[i].idlot,
            label: `<strong>${i18n('Refile')}</strong>`,
            align: "center"
        });

        let valueRefile = ({
            view: "label",
            id: "valuerefile" + allCoilCollect[i].idlot,
            label: allCoilCollect[i].refile,
            align: "center"
        });

        let dt = {}
        let dataDt = [];

        if (i > 0 && allCoilCollect[i].idcoilcuttingplan === allCoilCollect[i - 1].idcoilcuttingplan) {
        }
        else {
            dataDt.push({
                description: allCoilCollect[i].description,
                width: allCoilCollect[i].width,
                quantity: allCoilCollect[i].quantity,
                situation: allCoilCollect[i].situation
            });

            dt = {
                view: "datatable",
                id: "dt" + allCoilCollect[i].idlot,
                scroll: true,
                height: 90,
                columns: [
                    { id: "description", header: i18n("Material"), fillspace: true },
                    { id: "width", header: i18n("Width"), fillspace: true },
                    { id: "quantity", header: i18n("Quantity"), fillspace: true },
                    { id: "situation", header: i18n("Move Situation"), fillspace: true }
                ],
                data: dataDt
            };

            let index = items.findIndex(x => x.label == i18n('Lot ') + allCoilCollect[i].idlot)
            if (index == -1) {
                items.push(
                    {
                        view: "fieldset",
                        css: "font-18-fieldset",
                        id: "fieldset" + allCoilCollect[i].idlot,
                        label: i18n('Lot ') + allCoilCollect[i].idlot + ' - ' + allCoilCollect[i].rmdescription + ' | ' + i18n('Weight') + ': ' + allCoilCollect[i].weight.toFixed(3) + ' KG',
                        body: {
                            rows: [
                                {
                                    cols: [
                                        {
                                            rows: [{
                                                cols: [
                                                    {
                                                        rows: [
                                                            btnCollect,
                                                            btnStop
                                                        ]
                                                    },
                                                    {
                                                        rows: [
                                                            labelCoil,
                                                            valueCoil
                                                        ]
                                                    },
                                                    {
                                                        rows: [
                                                            labelYield,
                                                            valueYield
                                                        ]
                                                    },
                                                    {
                                                        rows: [
                                                            labelRefile,
                                                            valueRefile
                                                        ]
                                                    }]
                                            }]
                                        },
                                        dt
                                    ]
                                }
                            ]
                        }
                    }
                )
            }

            items.push(padding);

        }
    }
}

async function collectCoil(idcoilcuttingplan, idlot, html) {

    let allocations = await App.api.ormDbFindOne('allocation', {
        idlot: idlot
    })

    if (allocations.success) {

        let equipment = localStorage.getItem("selectedEquipment");

        let orderprodhistory = await App.api.ormDbFind('orderprodhistory', {
            idequipment: equipment,
            stopdate: null,
        })

        if(orderprodhistory.data == 0){
            webix.confirm({
                title: i18n(""),
                ok: i18n("Yes!"),
                cancel: i18n("No!"),
                text: i18n('Do you want to start the equipment?'),
                callback: async function (result) {
                    if (result) {
                        await App.api.ormDbCreate('orderprodhistory', {
                            idordermes: allocations.data.idorder,
                            idequipment: equipment,
                            startdate: new Date(),
                            iduser: localStorage.getItem('login')
                        })
                    }
                }
            });
        }

        await App.api.ormDbUpdate({ id: idcoilcuttingplan }, 'coilcuttingplan', { orderstatus: 'I' });
        await _modalCoilCollect.showModal(idcoilcuttingplan, equipment);
        loadTableCoilCollection();
    }
}




