import { i18n } from "../../lib/I18n.js";
import { App } from "../../lib/App.js";
import * as  _modalStops from "../../extra/_modalStops.js";
import * as  screenProductionProgram from "../screenProductionProgramStart.js";

export async function create(order) {
    
    let status = await App.api.ormDbLastStopEquipment('stop', { idequipment: order.idequipmentscheduled, idorder: order.idordermes });
    if (status.data.length) {
        localStorage.setItem('statusEquipment', 'stop');
        localStorage.setItem('idStop', status.data[0].id);
    } else {
        localStorage.setItem('statusEquipment', 'start');
        localStorage.removeItem('idStop');
    }

    return {
        view: "form",
        scroll: false,
        elementsConfig: { margin: 5 },
        // width: 200,
        elements: [
            {
                view: "fieldset",
                label: i18n("Start/Stop"),
                borderless: true,
                width: 300,
                height: 95,
                body: {
                    cols: [
                        {
                            view: 'button',
                            value: localStorage.getItem('statusEquipment') == 'stop' ? i18n('Register Start') : i18n('Register Stop'),
                            id: 'btnStatusProduction',
                            css: localStorage.getItem('statusEquipment') == 'stop' ? 'startButton' : 'stopButton',
                            //Possibilitar registrar parada sem precisar ler o primeiro lote.
                            //disabled: localStorage.getItem('oldLotReader' + order.idordermes) ? false : true,
                            click: async () => {
                                if (localStorage.getItem('statusEquipment') == 'start') {
                                    // Abre o modal de stop
                                    await _modalStops.showModal('PERFORMED', null, 0, order);

                                    // Recarrega a tela para atualizar os campos
                                    screenProductionProgram.showScreen(order.equipmentscheduledtype, order)

                                    localStorage.setItem('statusEquipment', 'stop');
                                } else {
                                    let status = await App.api.ormDbLastStopEquipment('stop', { idequipment: order.idequipmentscheduled, idorder: order.idordermes });
                                    let stop = await _modalStops.showModal('PERFORMED', null, status.data[0].id, order);

                                    if (stop.success) {
                                        screenProductionProgram.showScreen(order.equipmentscheduledtype, order)

                                        localStorage.setItem('statusEquipment', 'start');
                                    }
                                }
                            }
                        }
                    ]
                }
            }]
    }
}