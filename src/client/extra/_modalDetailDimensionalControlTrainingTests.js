import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixWindow, WebixInputSelect } from "../lib/WebixWrapper.js";

import * as  _modalDimensionalControl from "./_modalDimensionalControl.js";
import * as  _modalChecklist from "./_modalChecklist.js";
import * as  _modalRegisterPrint from "./_modalRegisterPrint.js";

let ALLColuns = [];

export async function showModal(order, idlot, hiddenItem = false) {
    return new Promise(async function (resolve, reject) {

        let idorder = order.idordermes;
        let idequipment = order.idequipmentscheduled ? order.idequipmentscheduled : order.idequipment;

        let dtDetailDimensionalControlTrainingTests = new WebixCrudDatatable("dtDetailDimensionalControlTrainingTests");

        /* Montar a Header da Datatable Dinamicamente */
        let allReturnColuns = await App.api.ormDbReturnColunsHeader({ idorder: idorder });
        allReturnColuns = allReturnColuns.data;

        // allReturnColuns.push(
        //     {
        //         iddimensionalcontrolitem: null,
        //         description: i18n('Number of Pieces'),
        //         typevalue: "number"
        //     }
        // )

        let coluns = returnColuns(allReturnColuns);
        dtDetailDimensionalControlTrainingTests.columns = coluns;

        /* Preenche a Datatable Dinamicamente */
        let allReturnData = await App.api.ormDbReturnColunsData({ idorder: idorder });
        allReturnData = allReturnData.data;
        ALLColuns = allReturnData;
        let data = returnData(allReturnData);
        dtDetailDimensionalControlTrainingTests.data = data;

        /* Verifico os tipos de equipamentos vinculados */
        let resourceTypeByEquipment = await App.api.ormDbFind('resourcetypeequipmentlink', { idequipment: idequipment, status: true });
        resourceTypeByEquipment = resourceTypeByEquipment.data;

        let resourceUserItem = await App.api.ormDbFind('resourceused', { idequipment: idequipment, idorder: order.idordermes });
        resourceUserItem = resourceUserItem.data;

        /* Buscar Combobox */
        let combobox = await getCombobox(resourceTypeByEquipment, resourceUserItem);

        let searchOP = ({
            view: "text",
            label: i18n("OP"),
            name: "txSearchOP",
            id: "txSearchOP",
            value: idorder
        });

        /* GRID OP */
        let equipment = ({
            view: "text",
            label: i18n("Equipment"),
            name: "txEquipment",
            id: "txEquipment",
            disabled: true,
            value: idequipment
        });

        let material = ({
            view: "text",
            label: i18n("Material"),
            name: "txMaterial",
            id: "txMaterial",
            disabled: true,
            value: order.idmaterial ? order.idmaterial : order.material
        });

        let date = ({
            view: "text",
            label: i18n("Date"),
            name: "txDate",
            id: "txDate",
            disabled: true,
            value: moment(order.dtcreated).format('DD/MM/YYYY HH:mm')
        });

        let grids = {
            view: 'form',
            id: "frmDetail",
            autoheight: false,
            elements: [{
                rows: [
                    {
                        cols: [
                            searchOP,
                            {},
                            {}
                        ]
                    }, {
                        cols: [
                            equipment,
                            material,
                            date
                        ]
                    },
                    dtDetailDimensionalControlTrainingTests,
                    {
                        hidden: hiddenItem,
                        cols: combobox
                    },
                    {
                        cols: [
                            {
                                hidden: !hiddenItem,
                            },
                            {
                                hidden: hiddenItem,
                                view: "button",
                                id: "btnSearch",
                                height: 80,
                                click: searchItens,
                                value: i18n("Search"),
                            },
                            {
                                view: "button",
                                id: "btnDimensional",
                                height: 80,
                                click: async () => {
                                    let item = $$('dtDetailDimensionalControlTrainingTests').getSelectedItem();
                                    let dimensionalControl = null;
                                    if (item) {
                                        dimensionalControl = ALLColuns.filter(data => data.sequence === item.sequence);
                                    }

                                    let result = await _modalDimensionalControl.showModal(order, idlot, dimensionalControl, hiddenItem);
                                    if (result)
                                        searchItens()
                                },
                                value: i18n('Launch dimensional control')
                            },
                            {
                                view: "button",
                                id: "btnCheckList",
                                height: 80,
                                click: async () => {
                                    await _modalChecklist.showModal({ equipment: idequipment, order: order.idordermes }, hiddenItem);
                                },
                                value: i18n('Checklist')
                            },
                            {
                                view: "button",
                                id: "btnPrintRegister",
                                height: 80,
                                click: async () => {
                                    await _modalRegisterPrint.showModal(order);
                                },
                                value: i18n('Print Tubes Register'),
                                hidden: order.equipmentscheduledtype == "MKT" ? false : true,
                                disabled: order.equipmentscheduledtype == "MKT" ? false : true
                            },
                            {
                                hidden: hiddenItem,
                                view: "button",
                                id: "btnSave",
                                height: 80,
                                click: async () => {

                                    let data = $$("frmDetail").getValues();
                                    let idSearchOrder = $$("txSearchOP").getValue();

                                    resourceTypeByEquipment.map(async (item) => {

                                        let count = resourceUserItem.findIndex(x => x.idresourcetype == item.idresourcetype);

                                        if (count !== -1) {

                                            /* Atualizar */
                                            resourceTypeByEquipment.map(async (item) => {
                                                await App.api.ormDbUpdate({
                                                    idequipment: idequipment,
                                                    idorder: order.idordermes,
                                                    idresourcetype: item.idresourcetype,
                                                }, 'resourceused', { idresource: data[item.idresourcetype] })
                                            });

                                        } else {

                                            /* Buscar dados da Ordem */
                                            let dataOrderSearch = await App.api.ormDbFind('order', { idordermes: idSearchOrder });
                                            dataOrderSearch = dataOrderSearch.data[0];

                                            /* Cadastrar */
                                            resourceTypeByEquipment.map(async (item) => {
                                                await App.api.ormDbCreate('resourceused', {
                                                    "idequipment": dataOrderSearch.idequipmentscheduled,
                                                    "idorder": idSearchOrder,
                                                    "idresourcetype": item.idresourcetype,
                                                    "idresource": data[item.idresourcetype]
                                                });
                                            });

                                        }

                                    });

                                    let resourceUserItemx = await App.api.ormDbFind('resourceused', { idequipment: idequipment, idorder: order.idordermes });

                                    let descriptionx = resourceUserItemx.data.map((item) => item.idresource);
                                    descriptionx = descriptionx.filter((item) => item !== "");
                                    let textox = descriptionx.toString().replace(/,/g, "<br>");

                                    webix.message(i18n('Saved successfully!'));
                                },
                                value: resourceUserItem.length ? i18n("Updated") : i18n("Save"),
                            },
                            {
                                hidden: !hiddenItem,
                            },
                        ]
                    }
                ]
            }
            ]
        };

        let modal = new WebixWindow({
            width: 550,
            height: 600,
            onClosed: (modal) => {
                resolve(true);
                modal.close();
            }
        });

        modal.body = {
            view: "scrollview",
            body: grids
        };

        modal.modal = true;
        modal.fullscreen = true;
        modal.show();
        modal.setTitle(i18n('Detail Dimensional Control Training Tests'));

    });
}

async function getCombobox(resourceTypeByEquipment, resourceUserItem) {
    let combo = resourceTypeByEquipment.map(async (item) => {
        let value = await App.api.ormDbFind('resource', { idresourcetype: item.idresourcetype, status: true });
        let resource = await App.api.ormDbFindOne('resourcetype', { id: item.idresourcetype });
        resource = resource.data;

        let descr = resource && resource.description ? resource.description : 'Without description';

        let data = resourceUserItem.filter((x) => {
            if (x.idresourcetype === item.idresourcetype)
                return x;
        });

        return new WebixInputSelect(item.idresourcetype, descr, value.data, {
            template: function (obj) {
                return obj.id;
            },
            disabled: value.data.length ? false : true,
            value: data[0] ? data[0].idresource : null
        });
    });
    combo = await Promise.all(combo);

    return combo;
}

async function searchItens() {
    let idSearchOrder = $$("txSearchOP").getValue();

    /* Buscar dados da Ordem */
    let dataOrderSearch = await App.api.ormDbFind('order', { idordermes: idSearchOrder });
    dataOrderSearch = dataOrderSearch.data[0];

    let allReturnColuns = await App.api.ormDbReturnColunsHeader({ idorder: idSearchOrder });
    allReturnColuns = allReturnColuns.data;
    let columns = returnColuns(allReturnColuns);

    let allReturnData = await App.api.ormDbReturnColunsData({ idorder: idSearchOrder });
    allReturnData = allReturnData.data;
    ALLColuns = allReturnData;
    let data = returnData(allReturnData);

    $$('dtDetailDimensionalControlTrainingTests').config.columns = [];
    $$('dtDetailDimensionalControlTrainingTests').clearAll();

    if (allReturnData.length > 0) {

        $$('dtDetailDimensionalControlTrainingTests').config.columns = columns;
        $$('dtDetailDimensionalControlTrainingTests').parse(data, "json");
        $$('txEquipment').setValue(dataOrderSearch.idequipmentscheduled);
        $$('txMaterial').setValue(dataOrderSearch.idmaterial);
        $$('txDate').setValue(moment(dataOrderSearch.dtcreated).format('DD/MM/YYYY HH:mm'));

    } else {

        webix.message({ text: i18n('No results were found for this search.') });
        $$('txEquipment').setValue('');
        $$('txMaterial').setValue('');
        $$('txDate').setValue('');

    }

    $$('dtDetailDimensionalControlTrainingTests').refreshColumns();
}

/* Return Value Colun */
function returnValue(item) {

    switch (item.typevalue) {
        case "BOOLEAN":
            return item.booleanvalue;
        case "number":
            return item.numbervalue;
        case "select":
            return item.selectvalue;
        case "text":
            return item.textvalue;
    }

}

/* Return Coluns Datatable */
function returnColuns(item) {

    let results = [];

    let cont = 1;
    item.forEach(function (value, key) {

        if(value.description == 'Number of Pieces') {
            results.push({
                id: "col0",
                fillspace: true,
                header: [{
                    css: { "text-align": "center" },
                    text: i18n('Number of Pieces'),
                    colspan: 1
                }, ""]
            });

            if(cont == 1)
                cont = 0
        }
        else if (value.typevalue == 'minmax') {

            results.push({
                id: "col" + cont,
                fillspace: true,
                header: [{
                    //Criando tradução apenas para a coluna "Number Of Pieces" 
                    text: value.description,
                    css: { "text-align": "center" },
                    batch: value.iddimensionalcontrolitem,
                    colspan: 2
                }, "Minimo"]
            });

            cont++;

            results.push({
                id: "col" + cont,
                fillspace: true,
                batch: value.iddimensionalcontrolitem,
                header: [null, "Máximo"]
            });

        } else {

            results.push({
                id: "col" + cont,
                fillspace: true,
                header: [{
                    css: { "text-align": "center" },
                    text: value.description,
                    batch: value.iddimensionalcontrolitem,
                    colspan: 1
                }, ""]
            });

        }

        cont++;

    });

    return results;

}

/* Return Data Datatable */
async function returnData(item) {

    let results = [];


    item.forEach(function (value, key) {

        let conta = 1;

        if (results.length) {

            let index = results.findIndex((item) => {
                return item.sequence == value.sequence;
            });

            if (index == -1) {

                let obj = {};
                if (value.typevalue == 'minmax') {
                    obj["col" + conta] = value.minvalue; conta++;
                    obj["col" + conta] = value.maxvalue;
                } else {
                    obj["col" + conta] = returnValue(value);
                }
                obj.sequence = value.sequence
                results.push(obj);

                conta++;

            } else {

                if (value.typevalue == 'minmax') {
                    let item = results[index];
                    let obj = Object.keys(item);

                    let position = parseInt(obj.length) + 1;

                    results[index]["col" + obj.length] = value.minvalue;
                    results[index]["col" + position] = value.maxvalue;

                } else {
                    let item = results[index];
                    let obj = Object.keys(item);

                    results[index]["col" + obj.length] = returnValue(value);
                }


            };

        } else {
            let obj = {};
            if (value.typevalue == 'minmax') {
                obj["col" + conta] = value.minvalue; conta++;
                obj["col" + conta] = value.maxvalue;
            } else {
                obj["col" + conta] = returnValue(value);
            }
            obj.sequence = value.sequence
            results.push(obj);
            conta++;
        }
        

    });

    for (let i = 0; i < results.length; i++) {
        let pieces = await App.api.ormDbFind('dimensionalcontrolresult', {sequence: results[i].sequence});

        let size = Object.keys(results[i]).length;

        if(pieces.success){
            pieces = pieces.data[0].qtypieces

            results[i].col0 = pieces 
        }
    }

    return results;

}