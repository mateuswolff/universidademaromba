import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import * as  _modalDetailEquipmentDashboard from "../extra/_modalDetailEquipmentDashboard.js";
import * as screenProductionProgram from "./screenProductionProgram.js";
import * as screenProductionCoilCollect from "./screenProductionCoilCollect.js";
import * as util from "../lib/Util.js";

import * as permission from '../control/permission.js';

export async function showScreen(event) {

    if(localStorage.getItem('selectedEquipmentCoil')){
        await screenProductionCoilCollect.showScreen();
        return
    }


    let rows = [];
    let numberColumns = 6;

    var color = function (val) {
        if (val < 2) return "red";
        if (val < 4) return "orange";
        return "green";
    };

    // Get all equipments avaliables
    let equipments = await App.api.getEquipmentSituation();

    // Group equipments by type
    let types = equipments.data.groupBy(x => x.typedes);
    types = types.sort(function (a, b) { return a.id - b.id });

    function onMainMenuHide() {
        if (!this.$submenuIds) return;
        while (this.$submenuIds.length) {
            var submenuId = this.$submenuIds.shift();
            $$(submenuId).destructor();
        }
        this.destructor();
    }

    function onSubMenuShow() {
        var topMenu = this.getTopMenu();
        if (!topMenu.$submenuIds) topMenu.$submenuIds = [];
        if (topMenu.$submenuIds.indexOf(this.config.id) === -1) {
            topMenu.$submenuIds.push(this.config.id);
        }
    }

    async function showMenu(ev, equipment) {

        let menuDetails = await permission.checkObjectPermission(equipment.typeid + '.' + equipment.id + '.btnEquipmentDetails');
        let menuProduction = await permission.checkObjectPermission(equipment.typeid + '.' + equipment.id + '.btnProgramProduction');

        if (menuDetails || menuProduction) {

            let menus = {
                view: "contextmenu",
                top: ev.clientY - 10,
                left: ev.clientX - 10,
                mouseEventDelay: 10,
                data: [],
                submenuConfig: {
                    width: 270,
                },
                on: {
                    onHide: onMainMenuHide,
                    onMenuItemClick: function (id) {
                        if (id == 'btnEquipmentDetails') {
                            _modalDetailEquipmentDashboard.showModal(equipment.id);
                        } else if (id == 'btnProgramProduction') {
                            if (equipment.typeid == 'SLT') {
                                localStorage.setItem('selectedEquipment', equipment.id);
                                screenProductionCoilCollect.showScreen();
                            } else {
                                localStorage.setItem('selectedEquipment', equipment.id);
                                screenProductionProgram.showScreen();
                            }
                        };
                    }
                },
                submenuConfig: {
                    css: "submenu",
                    on: {
                        onShow: onSubMenuShow
                    }
                }
            };

            if (menuDetails) {
                let menuD = {
                    id: "btnEquipmentDetails",
                    value: i18n('Equipment details')
                };
                menus.data.push(menuD);
            }

            if (menuProduction) {
                let menuP = {
                    id: "btnProgramProduction",
                    value: i18n('Production program')
                };
                menus.data.push(menuP);
            }

            webix.ui(menus).show();
        }

    }

    for (let type of types) {

        let newRow = {}, x = 0, y = 0;
        let numberRows = Math.floor(type.data.length / numberColumns) + 1;

        newRow.view = "dashboard";
        newRow.padding = 0;
        newRow.margin = 0;
        //newRow.cellHeight = 200;
        newRow.cells = [];
        newRow.gridColumns = numberColumns;
        newRow.gridRows = numberRows;

        for (let equipment of type.data) {

            let menuDetails = await permission.checkObjectPermission(equipment.typeid + '.' + equipment.id + '.btnEquipmentDetails');
            let menuProduction = await permission.checkObjectPermission(equipment.typeid + '.' + equipment.id + '.btnProgramProduction');

            if (menuDetails || menuProduction) {

                let packagesProduced = 0;
                let produced = 0;
                let aproducing = 0;

                // VERIFICO SE O TIPO DO EQUIPAMENTO É BMKT MKT SLT
                if (equipment.typeid === "BMKT" || equipment.typeid === "MKT") {

                    // PEGO A QUANTIDADE DE PACOTES A PRODUZIR
                    let packagesToBeGenerated = await App.api.ormDbPackagesToBeGenerated({ equipment: equipment.id });
                    packagesToBeGenerated = packagesToBeGenerated.data.length ? packagesToBeGenerated.data[0] : 0;

                    // Verico se foi identificado quantos tudos deve ser produzido, caso nao ele assume o valor de zero para a produzir e produzido
                    // isso acontesce para não da erro na execução
                    if (packagesToBeGenerated && packagesToBeGenerated.package) {
                        //PEGO TODOS OS PACOTES DE JA FORAM FECHADOS PARA AQUELA ORDEM
                        packagesProduced = await App.api.ormDbFind('lotgenerated', { idorder: packagesToBeGenerated.idorder });
                        produced = packagesProduced.data.length;

                        //ARREDONDO PARA 1 CASA DESCIMAL ASCIMA DE QUANTOS PACOTES DEVEM SER PRODUZIDOS
                        aproducing = Math.ceil(packagesToBeGenerated.package);
                    };
                }


                if (equipment.typeid === "SLT") {
                    // PEGA A ORDEM QUE ESTA PRODUZINDO PARA AQUELE EQUIPAMENTO
                    let cuttingPlan = await App.api.ormDbPackagesToBeGeneratedCoilCutting({ idequipment: equipment.id });

                    if (cuttingPlan.data.length) {
                        aproducing = cuttingPlan.data[0].total;

                        let packagesProduced = await App.api.ormDbFind('lotgenerated', { idorder: cuttingPlan.data[0].id });
                        produced = packagesProduced.data.length;
                    }
                }


                if (equipment.typeid === "POL") {
                    // lot gerados / quantidade de pacotes alocados pela op pelo idorder * 100
                    let allocationOrder = await App.api.ormDbFind('allocation', { idorder: equipment.idordermes });

                    if (allocationOrder.data.length) {
                        //aproducing = allocationOrder.data[0].pieces;
                        aproducing = allocationOrder.data.length;
                    
                        packagesProduced = await App.api.ormDbFind('lotgenerated', { idorder: equipment.idordermes });
                        produced = packagesProduced.data.length;
                    }
                }


                if (equipment.typeid === "CUT") {
                    if (equipment.idordermes) {
                        let cutting = await App.api.ormDbPackagesProduceCutting({ idorder: equipment.idordermes });

                        if (cutting.data && cutting.data.length) {
                            aproducing = Math.ceil(cutting.data[0].quantity);

                            packagesProduced = await App.api.ormDbFind('lotgenerated', { idorder: equipment.idordermes });
                            produced = packagesProduced.data.length;
                        }
                    }

                }
                if(aproducing==0)
                    aproducing = 1;

                let percent = (produced * 100) / aproducing;
                if (percent > 100)
                    percent = 110;

                let allProductionProgram = [];
                let existsOrderSequenced = 0;
                allProductionProgram = await App.api.ormDbTubesProductionSystem({ idequipment: equipment.id });
                if (allProductionProgram.data.length > 0) {
                    existsOrderSequenced = 1;
                } else {
                    existsOrderSequenced = 2;
                }
                
                let bullet = {
                    view: "bullet",
                    minRange: 0,
                    maxRange: 110,
                    //value: (equipment.velocity_real == null) ? 0 : Math.round(equipment.velocity_real * 100) / 100,
                    value: isNaN(percent) ? 0 : percent,
                    bands: [
                        {
                            value: 110,
                            color: (equipment.stoptype == null) ? "red" : "black"
                        },
                        {
                            value: 100,
                            color: (equipment.stoptype == null) ? "orange" : "black"
                        }


                    ],
                    color: "white",
                    scale: {
                        step: 25,
                        template: "#value#%"
                    },
                    barWidth: 18,
                    height: 45
                }

                newRow.cells.push({
                    view: "panel", x: x, y: y, dx: 1, dy: 1,
                    //css:{'background-color':'red'},
                    body: {
                        rows: [
                            {
                                view: "button",
                                label: equipment.description,
                                click: function (btId, ev) {
                                    showMenu(ev, equipment)
                                },

                            },
                            existsOrderSequenced == 1 ? bullet : {},
                            {
                                hidden: equipment.stopreason ? false : true,
                                view: "template",
                                template: `<strong>${i18n('Reason')}: </strong> ${equipment.stopreason}`,

                            },
                            // {
                            //     view: "gage",
                            //     value: (equipment.velocity_real == null) ? 0 : Math.round(equipment.velocity_real * 100) / 100,
                            //     minRange: 0,
                            //     id: equipment.id,
                            //     color: color,
                            //     maxRange: (equipment.velocity_default == null) ? 1 : parseInt(equipment.velocity_default),
                            //     placeholder: (equipment.stoptype == null) ? i18n("Running") : i18n("stopped")
                            // }

                        ]
                    }
                })

                if (x == numberColumns - 1) {
                    x = 0;
                    y++;
                }
                else
                    x++;

            }

        }

        if (newRow.cells.length) {
            rows.push(
                {
                    view: "toolbar", elements: [
                        { view: "label", template: type.key }
                    ]
                }
            )
            rows.push(newRow);
        }

    }

    let rowsAlter = [];

    let filterCharts = rows.filter(x => x.view == 'dashboard');
    let filterHeader = rows.filter(x => x.view == 'toolbar');

    for (let i = 0; i < filterCharts.length; i++) {

        const element = filterCharts[i];
        
        if (element.cells.length < (numberColumns / 2)) {

            if ((i + 1) < filterCharts.length && filterCharts[i + 1].cells.length < (numberColumns / 2)) {

                let newItemColumnA = filterCharts[i];
                let newItemColumnB = filterCharts[i + 1];

                newItemColumnA.gridColumns = numberColumns / 2;
                newItemColumnB.gridColumns = numberColumns / 2;

                rowsAlter.push({
                    cols: [
                        {
                            rows: [
                                filterHeader[i],
                                newItemColumnA
                            ]
                        },
                        {
                            rows: [
                                filterHeader[i + 1],
                                newItemColumnB
                            ]
                        }
                    ]
                })
                i++;
            }
            else {
                rowsAlter.push(filterHeader[i]);
                rowsAlter.push(filterCharts[i]);
            }
        }
        else {
            rowsAlter.push(filterHeader[i]);
            rowsAlter.push(filterCharts[i]);
        }
    }

    let form = {
        view: "scrollview", body: {
            rows: rowsAlter
        }
    }

    let intervs = setInterval(async function () {
        let equipments = await App.api.getEquipmentSituation();
        if (equipments.length) {
            for (let equipment of equipments) {
                if ($$(equipment.id)) {
                    $$(equipment.id).setValue((equipment.velocity_real == null) ? 0 : Math.round(equipment.velocity_real * 100) / 100);
                } else {
                    clearInterval(intervs);
                    break;
                }
            }
        } else {
            clearInterval(intervs);
        }
    }, 25000)

    App.replaceMainContent(form);
    App.replaceMainMenu({ hidden: true });

}