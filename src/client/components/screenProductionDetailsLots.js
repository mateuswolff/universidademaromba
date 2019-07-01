import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixInputSelect, WebixCrudDatatable, WebixInputText, WebixWindow, WebixCrudAddButton, WebixBuildReponsiveTopMenu } from "../lib/WebixWrapper.js";
import * as  _modalQRCode from "../extra/_modalQRCode.js";
import * as modalRegisterRNC from '../extra/_modalRegisterRNC.js';
import * as modalMovementDeposit from '../extra/_modalMovementDeposit.js';
import * as util from '../lib/Util.js';

export async function showScreen(event) {

    let dtDetailLots = new WebixCrudDatatable("dtDetailLots");

    let allEquipment = await App.api.ormDbFind('equipment', { status: true });
    allEquipment.data.sort(function (a, b) {
        if (a.description < b.description) return -1;
        if (a.description > b.description) return 1;
        return 0;
    });
    allEquipment.data.unshift({ id: "All", description: i18n('All') });

    let allMaterials = await App.api.ormDbFind('material', { status: true });

    if (allMaterials.data) {
        allMaterials.data.sort(function (a, b) {
            if (a.description < b.description) return -1;
            if (a.description > b.description) return 1;
            return 0;
        });
        allMaterials.data.unshift({ id: "All", description: i18n('All') });
    }
    
    let flag;

    dtDetailLots.columns = [
        { id: "id", header: [i18n("Lot"), { content: "textFilter" }], sort: "string", width: 80 },
        {
            id: "situation", header: [i18n("Situation"), { content: "textFilter" }], width: 70,
            format: (item) => {
                if (item == 'P') {
                    return i18n('Pending')
                }

                if (item == 'A') {
                    return i18n('Active')
                }

                if (item == 'D') {
                    return i18n('Disabled')
                }

                if (item == 'E') {
                    return i18n('IN FRONT OFF')
                }
                if (item == 'R') {
                    return i18n('Pending Receipt')
                }
                else {
                    return item + ' - '
                }

            }, sort: "string",
            width: 160
        },
        { id: "origincode", header: [i18n('Origin Code'), { content: "textFilter" }], sort: "string", width: 120 },
        { id: "description", header: [i18n('Material'), { content: "textFilter" }], sort: "string", width: 220 },
        { id: "steel", header: [i18n('Steel'), { content: "textFilter" }], sort: "string", width: 80 },
        { id: "thickness", header: [i18n("Thickness"), { content: "textFilter" }], sort: "string", width: 80 },
        { id: "length", header: [i18n("Length"), { content: "textFilter" }], sort: "string", width: 80 },
        { id: "diameter", header: [i18n("Diameter"), { content: "textFilter" }], sort: "string", width: 80 },
        { id: "width", header: [i18n("Width"), { content: "textFilter" }], sort: "string", width: 80 },
        { id: "weight", header: [i18n('Weight'), { content: "textFilter" }], sort: "string", width: 80 },
        { id: "pieces", header: [i18n('Pieces'), { content: "textFilter" }], sort: "string", width: 80 },
        { id: "local", header: [i18n("Local"), { content: "textFilter" }], sort: "string", width: 200 },
        {
            id: "dtupdated",
            header: [i18n("Last change"), { content: "dateFilter" }],
            format: (value) => { return moment(value).format("DD/MM/YYYY HH:mm:ss"); },
            width: 150
        },
        {
            id: "idorder",
            header: [i18n("Actual OP"), { content: "textFilter" }],
            sort: "string",
            width: 80
        },
        {
            id: "saleorder",
            header: [i18n("Sales Order"), { content: "textFilter" }],
            width: 80,
            sort: "string"
        },
        {
            id: "saleorderitem",
            header: [i18n("Sales Order Item"), { content: "textFilter" }],
            width: 80,
            sort: "string"
        }
    ];
    dtDetailLots.on = {
        "onAfterColumnDrop": async function () {
            await util.datatableColumsSave("dtDetailLots", event);
        }
    };

    const btnReset = {
        view: "button",
        id: "btnReset",

        click: async () => {
            $$('frmProductionProgram').clear()
        },
        value: i18n("Reset Filter"),
    }

    const padding = ({
        view: "label",
        label: i18n(""),
    });

    let body = {
        view: "form",
        id: "frmProductionProgram",
        scroll: true,
        elements: [
            {
                rows: [
                    {
                        height: 60,
                        cols: [
                            new WebixInputText("idlot", i18n("Lot"), {
                                //onBlur: async (obj) => { searchDetailsLotByFilter(); flag = 1; }
                            }),
                            new WebixInputText("idorder", i18n("Orders"), {
                                //onBlur: async (obj) => { searchDetailsLotByFilter(); flag = 4; }
                            }),
                            new WebixInputSelect('Equipment', i18n('Equipment'), allEquipment, {
                                template: (obj) => {
                                    return obj.description;
                                },
                                //onChange: async (obj) => { searchDetailsLotByFilter(); flag = 2; }
                            }),
                            new WebixInputSelect('Material', i18n('Material'), allMaterials, {
                                template: (obj) => {
                                    return obj.description;
                                },
                                //onChange: async (obj) => { searchDetailsLotByFilter(); flag = 3; }
                            }),
                            {
                                rows: [
                                    padding,
                                    btnReset
                                ]
                            }
                        ]
                    },
                    { height: 15 },
                    dtDetailLots,
                    {
                        cols: [
                            new WebixCrudAddButton('movement', i18n('Movement'), async () => {
                                let grid = $$(dtDetailLots.id);
                                let item = grid.getSelectedItem();
                                if (item == null) {
                                    webix.message(i18n('An item must be selected'));
                                    return;
                                } else {
                                    await modalMovementDeposit.showModal(item.id, null);
                                }
                            }, { height: 80 }),
                            new WebixCrudAddButton('rnc', i18n('RNC'), async () => {
                                let grid = $$(dtDetailLots.id);
                                let item = grid.getSelectedItem();

                                if (!item) {
                                    webix.message(i18n('An item must be selected'));
                                    return;
                                } else {
                                    item = {
                                        idequipmentscheduled: item.idequipment,
                                        idrawmaterial: null,
                                        idclient: null,
                                        idordermes: item.idorder,
                                        idorder: item.idorder,
                                        idlot: item.id
                                    };

                                    await modalRegisterRNC.showModal(item, 0, item, 'production');
                                }
                            }, { height: 80 }),
                            new WebixCrudAddButton('qrCodeGenerator', i18n('QR Code Generator'), async () => {
                                let grid = $$(dtDetailLots.id);
                                let item = grid.getSelectedItem();
                                if (item == null) {
                                    webix.message(i18n('An item must be selected'));
                                    return;
                                } else {
                                    await _modalQRCode.showModal(item.id, 0, null, item);
                                }
                            }, { height: 80 }),
                            new WebixCrudAddButton('edit', i18n('Edit'), async () => {
                                let grid = $$(dtDetailLots.id);
                                let item = grid.getSelectedItem();
                                if (item == null) {
                                    webix.message(i18n('An item must be selected'));
                                    return;
                                } else {
                                    showModalEdit(item, flag);
                                }
                            }, { height: 80 }),
                            new WebixCrudAddButton('history', i18n('History'), async () => {
                                let item = $$(dtDetailLots.id).getSelectedItem();
                                if (item == null) {
                                    webix.message(i18n('An item must be selected'));
                                    return;
                                } else {
                                    showModalHistory(item);
                                }
                            }, { height: 80 }),
                            new WebixCrudAddButton('genealogy', i18n('Genealogy'), async () => {
                                let item = $$(dtDetailLots.id).getSelectedItem();
                                if (item == null) {
                                    webix.message(i18n('An item must be selected'));
                                    return;
                                } else {
                                    showModalGenealogy(item);
                                }
                            }, { height: 80 })
                        ]
                    },
                ],
            }
        ]
    }

    let menu = createSimpleCrudMenu(i18n('Details Lots'), dtDetailLots);
    App.replaceMainMenu(menu);
    await App.replaceMainContent(body);

    await util.datatableColumsGet('dtDetailLots', event);
}

function createSimpleCrudMenu(title, dtDetailLots) {

    let menu = WebixBuildReponsiveTopMenu(title, [{
        id: "search",
        label: "Search",
        icon: "fas fa-search",
        click: async () => {
            searchDetailsLotByFilter();
        }
    }, {
        id: "pdf",
        icon: "fas fa-file-pdf",
        label: i18n("Export") + " PDF",
        click: async () => {
            let grid = $$(dtDetailLots.id);
            let dateString = Date();
            webix.toPDF(grid, {
                filename: i18n("Details Lots") + " " + dateString,
                orientation: "landscape",
                autowidth: true
            });
        }
    }]);

    return menu;
}

/**
 * Função responsável por pesquisar paradas pelo filtro
 */
async function searchDetailsLotByFilter() {

    let idlot = $$('frmProductionProgram').elements.idlot.getValue();
    let idorder = $$('frmProductionProgram').elements.idorder.getValue();
    let cmbEquipment = $$('cmbEquipment').getValue();
    let cmbMaterial = $$('cmbMaterial').getValue();

    // Pesquisando no banco mediante os filtros.
    let allDetailsLots = await App.api.ormDbAllDetailsLots({
        idlot: idlot != "" ? idlot : null,
        idorder: idorder != "" ? idorder : null,
        cmbEquipment: cmbEquipment != "All" && cmbEquipment != "" ? cmbEquipment : null,
        cmbMaterial: cmbMaterial != "All" && cmbMaterial != "" ? cmbMaterial : null,
    });

    $$('dtDetailLots').clearAll();

    if (allDetailsLots.data.length > 0) {
        $$('dtDetailLots').parse(allDetailsLots.data, "json");
    } else {
        webix.alert({ text: i18n('No results were found for this search.') });
    }

}

async function showModalEdit(item, flag) {
    return new Promise(async function (resolve, reject) {
        let allLocals = await App.api.ormDbFind('local', { status: true });
        let beforeweight;
        let beforepieces;
        let beforeidLocal;

        let modal = new WebixWindow({
            width: 450,
            height: 400,
        });

        modal.body = {
            view: "form",
            id: "grids",
            rows: [
                {
                    height: 60,
                    cols: [
                        new WebixInputText("editP", i18n("Pieces"), {
                            // onBlur: async (blurItem) => {
                            //     $$('txtEditW').setValue(await util.calcWeightParts(item.id, 'weight', blurItem.getValue()))
                            // }
                        }),
                        new WebixInputText("editW", i18n("Weight"), {
                            // onBlur: async (blurItem) => {
                            //     $$('txtEditP').setValue(await util.calcWeightParts(item.id, 'parts', blurItem.getValue()))
                            // }
                        })
                    ]
                },
                new WebixInputSelect('editLocal', i18n('Locals'), allLocals.data, {
                    template: (obj) => {
                        return obj.description;
                    },
                    height: 60,
                }),
                new WebixCrudAddButton('update', i18n('Update'), async () => {

                    let form = $$("grids").getValues();

                    item.idlocal = form.editLocal;
                    item.pieces = form.editP;
                    item.weight = form.editW.toString().replace(",",".");
                    item.beforeweight = beforeweight;
                    item.beforepieces = beforepieces;
                    item.beforeidLocal = beforeidLocal;
                    item.iduser = localStorage.getItem('login')

                    let result = await App.api.ormDbUpdateLocalsWeightPieces(item);

                    if (result.success === true) {
                        let data = await refreshGrid(flag, item);
                        $$('dtDetailLots').clearAll();
                        $$('dtDetailLots').parse(data, "json");
                        webix.message(i18n('Save successfully!'));
                        modal.close();
                    } else {
                        webix.message(i18n('An error has occurred'));
                    }

                }, {
                        css: "received",
                        width: 300,
                        height: 50
                    })

            ]
        };

        modal.modal = true;
        modal.show();
        modal.setTitle(i18n('Edit'));

        $$('txtEditW').setValue(item.weight ? item.weight : 0);
        $$('txtEditP').setValue(item.pieces ? item.pieces : 0);
        $$('cmbEditLocal').setValue(item.idlocal);

        beforeweight = $$('txtEditW').getValue(item.weight);
        beforepieces = $$('txtEditP').getValue(item.pieces);
        beforeidLocal = $$('cmbEditLocal').getValue(item.idlocal);

    });
}

async function showModalHistory(item) {
    let allLotsHistoryByLot = await App.api.ormDbFind('lothistory', { lot: item.id });
    let allLocals = await App.api.ormDbFind('local');

    let dtLotsHistory = new WebixCrudDatatable("dtLotsHistory");

    dtLotsHistory.columns = [
        { id: "lot", header: [i18n("Lot"), { content: "textFilter" }], sort: "string" },
        { id: "field", header: [i18n('Field'), { content: "textFilter" }], sort: "string" },
        { id: "valuebefore", header: [i18n('Value Before'), { content: "textFilter" }], sort: "string" },
        { id: "valueafter", header: [i18n("Value After"), { content: "textFilter" }], sort: "string" },
        { id: "iduser", header: [i18n("User"), { content: "textFilter" }], sort: "string" },
        {
            id: "dtcreated",
            header: [i18n("Date of change"), { content: "dateFilter" }],
            format: (item) => {
                return moment(item).format('DD/MM/YYYY');
            },
            fillspace: true
        }
    ];

    dtLotsHistory.data = allLotsHistoryByLot.data.map((item) => {
        if (item.field == 'CG_LOCAL') {
            let before = allLocals.data.filter((elem) => elem.id == item.valuebefore);
            let after = allLocals.data.filter((elem) => elem.id == item.valueafter);
            item.valuebefore = before.length ? before[0].description : '-';
            item.valueafter = after.length ? after[0].description : '-';
            return item;
        } else {
            return item;
        }
    });

    let modal = new WebixWindow({
        width: 850,
        height: 600,
    });

    modal.body = {
        view: "form",
        id: "grids",
        rows: [
            dtLotsHistory
        ]
    };

    modal.modal = true;
    modal.show();
    modal.setTitle(i18n('Lot history') + ' ' + item.id);
}

async function showModalGenealogy(item) {

    let modal = new WebixWindow({
        width: 850,
        height: 500,
    });

    modal.body = {
        view: "form",
        id: "grids",
        rows: [
            {
                view: 'template', template: `<div id="big-commpany"></div>`
            }
        ]
    };

    modal.modal = true;
    modal.show();
    modal.setTitle(i18n('Lot history'));
    await treeFunction(item.id);
}

async function treeFunction(lotSelect) {
    let idlot = lotSelect;

    let allGenerated = await App.api.ormDbGetGenealogyGenerated({ idlot: idlot });

    let allConsumed = await App.api.ormDbGetGenealogyConsumed({ idlot: idlot });

    let arrayg = [];
    let arrayc = [];
    for (let i = 0; i < allGenerated.length; i++) {
        let index = arrayg.findIndex((item) => item.text.name.split('Lot: ')[1] === allGenerated[i].id);
        if (index == -1 && allGenerated[i].id !== undefined) {
            arrayg.push({
                text: {
                    name: `Lot: ${allGenerated[i].id} - Data: ${moment(allGenerated[i].dtcreated).format("DD/MM/YYYY hh:mm:ss")}`
                }
            })
        }
    }

    for (let i = 0; i < allConsumed.length; i++) {
        let index = arrayc.findIndex((item) => { return item.text.name.split('Lot: ')[1] == allConsumed[i].id });
        if (index == -1 && allConsumed[i].id !== undefined) {
            arrayc.push({
                text: {
                    name: `Lot: ${allConsumed[i].id} - Data: ${moment(allConsumed[i].dtcreated).format("DD/MM/YYYY hh:mm:ss")}`
                }
            })
        }
    }

    let lotSearch = { name: 'Lot: ' + (lotSelect).toString() }

    let simple_chart_config = {
        chart: {
            container: `#big-commpany`,
            levelSeparation: 20,
            siblingSeparation: 150,
            subTeeSeparation: 10,
            rootOrientation: "WEST",
            // nodeAlign: "CENTER",
            connectors: {
                type: "straight",
            },
            node: {
                HTMLclass: "big-commpany"
            }
        },
        nodeStructure: {
            text: { name: 'OP: ' + allConsumed[0].idorder },
            connectors: {
                style: {
                    'stroke': '#6b1f7c',
                }
            },
            children: [
                {
                    text: lotSearch,
                    HTMLclass: "yellow",
                    connectors: {
                        nodeAlign: "step",
                        style: {
                            'stroke': '#6b1f7c',
                        }
                    },
                    // stackChildren: true,
                    children: [
                        {
                            connectors: {
                                style: {
                                    'stroke': '#6b1f7c'
                                }
                            },
                            stackChildren: true,
                            text: { name: i18n('Consumeds') },
                            children: arrayc
                        },
                        {
                            connectors: {
                                style: {
                                    'stroke': '#6b1f7c'
                                }
                            },
                            stackChildren: true,
                            text: { name: i18n('Generated') + ' ' + 'OP: ' + allGenerated[0].idorder },
                            children: arrayg
                        },
                    ]
                },
            ]
        },
    };

    if (!arrayg.length) {
        delete simple_chart_config.nodeStructure.children[0].children[1].children;
        simple_chart_config.nodeStructure.children[0].children[1] = {
            connectors: {
                style: {
                    'stroke': '#6b1f7c'
                }
            },
            stackChildren: true,
            text: { name: i18n('None lot generated') },
        }
    }

    if (!arrayc.length) {
        delete simple_chart_config.nodeStructure.children[0].children[0].children;
        simple_chart_config.nodeStructure.children[0].children[0] = {
            connectors: {
                style: {
                    'stroke': '#6b1f7c'
                }
            },
            stackChildren: true,
            text: { name: i18n('None lot consumed') },
        }

    }
    await new Treant(simple_chart_config, null, $);
}

async function refreshGrid(flag, item) {
    if (flag === 1) {
        return await App.api.ormDbGetDetailsLotsLot({ idlot: item.id });
    } else if (flag === 2) {
        return await App.api.ormDbGetDetailsLotsEquip({ idEquip: item.idequipment });
    } else if (flag === 3) {
        return await App.api.ormDbGetDetailsLotsMaterial({ idmaterial: item.idmaterial });
    } else {
        return await App.api.ormDbGetDetailsLotsOrder({ idorder: parseInt(item.order) });
    }
}

$('body').on('click', '.Treant .node', async function () {
    let a = $(this).find(".node-name").text();
    let num = a.slice(5);
    if (parseInt(num)) {
        await treeFunction(parseInt(num))
    }
});