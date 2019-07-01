import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixBuildReponsiveTopMenu } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

// COMPONENTS
import * as  ccOrder from "./componentsComplement/ccOrder.js";
import * as  ccEquipmentStatus from "./componentsComplement/ccEquipmentStatus.js";
import * as  ccPackage from "./componentsComplement/ccPackage.js";
import * as  ccDate from "./componentsComplement/ccDate.js";
import * as  ccProductionStatus from "./componentsComplement/ccProductionStatus.js";
import * as  ccScrap from "./componentsComplement/ccScrap.js";
import * as  ccRawMaterial from "./componentsComplement/ccRawMaterial.js";
import * as  ccPlannedOperation from "./componentsComplement/ccPlannedOperation.js";
import * as  ccInstrument from "./componentsComplement/ccInstrument.js";
import * as  ccButtonsProduction from "./componentsComplement/ccButtonsProduction.js";
import * as  ccSecondaryPackage from "./componentsComplement/ccSecondaryPackage.js";
import * as  ccLotsConsumed from "./componentsComplement/ccLotsConsumed.js";

export async function showScreen(screen, order) {

    App.toggleSidebar();

    try {
        if (screen === 'MKT') {
            screenMaker(order);
        } else if (screen === 'POL') {
            screenPolitrix(order);
        } else if (screen === 'CUT') {
            screenTubes(order);
        } else {
            webix.message(i18n('No screen with this name'));
        }
    } catch (error) {
        console.error(error)
    }

}

export async function screenMaker(order) {
    let body = {
        view: "form",
        id: "frmProductionProgram",
        scroll: "auto",
        responsive:true,
        elements: [
            {
                rows: [
                    {
                        //css: "line-fieldset-production",
                        height: 110,
                        css: "margin-fieldset",
                        view: "flexlayout",
                        cols: [
                            await ccOrder.create(order),
                            await ccEquipmentStatus.create(order)
                        ],
                    },
                    {
                        css: "margin-fieldset",
                        view: "flexlayout",
                        cols: [
                            await ccPackage.create(order, false),
                            await ccProductionStatus.create(order),
                            //await ccDate.create(order),
                            await ccScrap.create(order)  
                        ]
                    },
                    {
                        css: "margin-fieldset",
                        view: "flexlayout",
                        cols: [
                            await ccRawMaterial.create(order),
                            //await ccPlannedOperation.create(order),
                            //await ccInstrument.create(order),
                            await ccLotsConsumed.create(order)
                        ],
                    },
                    /*{
                        cols: [
                            //await ccPlannedOperation.create(order),
                            //await ccLotsConsumed.create(order),
                        ],
                    },*/
                    {

                    },
                    {
                        css: "buttons-production",
                        view: "flexlayout",
                        cols: await ccButtonsProduction.create(order)
                    }
                ],
            }
        ]
    }
    App.replaceMainContent(body, () => {
        if (localStorage.getItem('oldLotReader' + order.idordermes)) {
            ccRawMaterial.searchInformation(localStorage.getItem('oldLotReader' + order.idordermes), order);
        }
    });
    App.replaceMainMenu({ hidden: true });
}

export async function screenPolitrix(order) {
    let body = {
        view: "form",
        id: "frmProductionProgram",
        scroll: "auto",
        responsive:true,
        elements: [
            {
                rows: [
                    {
                        height: 110,
                        view: "flexlayout",
                        cols: [
                            await ccOrder.create(order),
                            await ccEquipmentStatus.create(order)
                        ],
                    },
                    {
                        view: "flexlayout",
                        cols: [
                            await ccPackage.create(order, false),
                            await ccProductionStatus.create(order),
                            //await ccDate.create(order)
                            await ccScrap.create(order)
                            //await ccPlannedOperation.create(order),
                        ]
                    },
                    {
                        css: "margin-fieldset",
                        view: "flexlayout",
                        cols: [
                            await ccRawMaterial.create(order),
                            //await ccScrap.create(order)
                            await ccLotsConsumed.create(order)
                        ],
                    },
                    {
                    },
                    {
                        css: "buttons-production",
                        view: "flexlayout",
                        cols: await ccButtonsProduction.create(order, true)
                    }
                ],
            }
        ]
    }
    App.replaceMainContent(body, () => {
        if (localStorage.getItem('oldLotReader' + order.idordermes)) {
            ccRawMaterial.searchInformation(localStorage.getItem('oldLotReader' + order.idordermes), order);
        }
    });
    App.replaceMainMenu({ hidden: true });
}

export async function screenTubes(order) {
    let secOrder = await App.api.ormDbFindOne('order', { idorderplanned: order.idordermes });
    
    let body = {
        view: "form",
        id: "frmProductionProgram",
        responsive:true,
        scroll: "auto",
        elements: [
            {
                rows: [
                    {
                        height: 150,
                        view: "flexlayout",
                        cols: [
                            await ccOrder.create(order, false),
                            await ccEquipmentStatus.create(order),
                            
                        ],
                    },
                    {
                        css: "margin-fieldset",
                        view: "flexlayout",
                        cols: [
                            await ccPackage.create(order),
                            await ccSecondaryPackage.create(order, secOrder),
                            await ccProductionStatus.create(order),
                            await ccScrap.create(order),
                            

                        ]
                    },
                    {
                        css: "margin-fieldset",
                        view: "flexlayout",
                        cols: [
                            await ccRawMaterial.create(order),
                            //await ccScrap.create(order)
                            await ccLotsConsumed.create(order)
                        ],
                    },
                    //{},
                    {
                        css: "buttons-production",
                        view: "flexlayout",
                        cols: await ccButtonsProduction.create(order, false, secOrder)
                    }
                ],
            }
        ]
    }
    App.replaceMainContent(body, () => {
        if (localStorage.getItem('oldLotReader' + order.idordermes)) {
            ccRawMaterial.searchInformation(localStorage.getItem('oldLotReader' + order.idordermes), order);
        }
    });
    App.replaceMainMenu({ hidden: true });
}