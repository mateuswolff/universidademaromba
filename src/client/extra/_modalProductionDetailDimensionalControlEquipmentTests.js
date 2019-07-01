import {
    WebixInputCombo,
    WebixBuildReponsiveTopMenu,
    WebixCrudDatatable,
    WebixInputDate,
    WebixWindow
} from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js"; 
import { App } from "../lib/App.js";

export async function showModal(item, dtMetallography) {
    return new Promise(async function (resolve, reject) {

        let dtDetailDimensionalControlEquipmentTests = new WebixCrudDatatable("dtDetailDimensionalControlEquipmentTests");
     
        let options = [i18n('OK'), i18n('N OK'), i18n('-')];
        let allLots = await App.api.ormDbFindLotsPending();

        let comboMI = new WebixInputCombo('mi', null, options, {
            onChange: (obj) => {
                testdetet = obj;    
            }
        });
        let comboPA = new WebixInputCombo('pa', null, options, {
            onChange: (obj) => {
                testdetet = obj;
            }
        });
        let comboTN = new WebixInputCombo('tn', null, options, {
            onChange: (obj) => {
                testdetet = obj;
            }
        });

        let dateGrid1 = new WebixInputDate("dateGrid1", null);

        dtDetailDimensionalControlEquipmentTests.on = {
            "onItemClick": async () => {
    
               
            }
        }
    
        dtDetailDimensionalControlEquipmentTests.columns = [
            { id: "lot", header: [i18n("Time"), { content: "textFilter" }], sort: "string", width: 80 },
            { id: "namematerial", header: [i18n('Tubes'), { content: "textFilter" }], sort: "string", width: 80 },
            { id: "valuematerial", header: [i18n('External Diameter'), { content: "textFilter" }], sort: "string", width: 180 },
            { id: "piece", header: [i18n("Thickness"), { content: "textFilter" }], sort: "string", width: 180 },
            { id: "weight", header: [i18n("Rope Height"), { content: "textFilter" }], sort: "string", width: 80 },
            { id: "detet", header: [i18n("Length"), { content: "textFilter" }], sort: "string", width: 80 },
            { id: "lot", header: [i18n("Visual Characteristics"), { content: "textFilter" }], sort: "string", width: 130 },
            { id: "namematerial", header: [i18n('Hardness'), { content: "textFilter" }], sort: "string", width: 80 },
            { id: "valuematerial", header: [i18n('LP'), { content: "textFilter" }], sort: "string", width: 80 },
            { id: "piece", header: [i18n("Flange"), { content: "textFilter" }], sort: "string", width: 80 },
            { id: "weight", header: [i18n("Flattening"), { content: "textFilter" }], sort: "string", width: 80 },
            { id: "detet", header: [i18n("Folding"), { content: "textFilter" }], sort: "string", width: 80 },
        ]
        dtDetailDimensionalControlEquipmentTests.data = allLots;
    
        let table = {
            view: 'form',
            id: "table",
            rows: [
                dtDetailDimensionalControlEquipmentTests
            ]
        }
    
        let grid1 = {
            view: 'fieldset',
            id: "grid1",
            height: 40,
            label: i18n('Used Tools'),
            css: "detailDimension",
            body:{
                rows:[
                    {
                        cols:[
                            {
                                view: 'template', width: 120, template: `<strong>${i18n('Package default')}</strong>: 91`
                            },
                            {
                                view: 'template', width: 120, template: `<strong>${i18n('Package default')}</strong>: 91`
                            },
                            {
                                view: 'template', width: 120, template: `<strong>${i18n('Package default')}</strong>: 91`
                            },
                            {
                                view: 'template', width: 120, template: `<strong>${i18n('Package default')}</strong>: 91`
                            },
                            {
                                view: 'template', width: 35, template: `<strong>${i18n('Date')}</strong>: 91/91/9191`
                            },
                            dateGrid1
                            // {
                            //     label: [i18n("Date"), { content: "dateFilter" }],
                            //     format: (value) => { return  value ? moment(value).format("DD/MM/YYYY HH:mm") : '' },
                            //     width: 150
                            // },
                        ] 
                    },
                ]
            } 
        }
    
        let grid2 = {
            view: 'fieldset',
            id: "grid3",
            label: i18n('Used Tools'),
            css: "detailDimension",
            body:{
                rows:[
                    comboMI,
                    comboPA,
                    comboTN
                ]
            } 
        }


        let modal = new WebixWindow({
            width: 800,
            height: 600
        });

        modal.body = {
            view: "form",
            id: "grids",
            elements: [
                {
                    rows:[
                        grid1,
                        table,
                        {
                            cols:[
                                {},
                                grid2
                            ]
                        } 
                    ]
                }
            ]
        };

        modal.modal = true;
        modal.show();
        modal.setTitle(i18n('Detail Dimensional Control Equipment Tests'));

    });

}
