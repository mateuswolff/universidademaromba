import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixBuildReponsiveTopMenu, WebixInputSelect } from "../lib/WebixWrapper.js";
import { optionsSituationCutPlan } from "../components/optionsScreens.js"

import * as util from "../lib/Util.js";

import * as  _modalStripsCuttingPlan from "../extra/_modalStripsCuttingPlan.js";

export async function showScreen(event) {

    let allEquipment = await App.api.ormDbFind('equipment', { status: true, idtype: 'SLT' });
    allEquipment.data.sort(function (a, b) {
        if (a.description < b.description) return -1;
        if (a.description > b.description) return 1;
        return 0;
    });

    optionsSituationCutPlan.sort(function (a, b) {
        if (a.value < b.value) return -1;
        if (a.value > b.value) return 1;
        return 0;
    });

    let dtResult = {
        view: "treetable",
        select: "row",
        id: 'ttbStripsCuttingPlan',
        dragColumn: true,
        leftSplit: 1,
        activeTitle: true,
        columns: [
            { id: "id", header: i18n("id"), width: 60, template: "{common.treetable()} #id#" },
            {
                id: "dtcreated", header: i18n("Date"), width: 80,
                format: (item) => {
                    return (item == '') ? '' : moment(item).format('DD/MM/YYYY');
                },
            },
            { id: "equipment", header: i18n("Equipment"), width: 140 },
            { id: "lot", header: i18n("Lot"), width: 70 },
            { id: "yield", header: i18n("Yield"), width: 60 },
            { id: "refile", header: i18n("Refile") + '(mm)', width: 70 },
            { id: "situation", header: i18n("Situation"), width: 85 },
            { id: "lotweight", header: i18n("Lot Weight"), width: 85 },
            { id: "material", header: i18n("Material"), width: 220, fillspace: true },
            { id: "quantity", header: i18n("Quantity"), width: 70 }
        ],
        on: {
            "onBeforeSelect": function (selection, preserve) {
                if (this.getItem(selection.id).$level > 1)
                    return false;
            },
            "onAfterColumnDrop": function () {
                util.datatableColumsSave("ttbStripsCuttingPlan", event);
            }
        }
    }


    let dtXLS = new WebixCrudDatatable("dtXLS");
    dtXLS.footer = true;
    dtXLS.hidden = false;

    dtXLS.columns = [
        { id: "lot", header: i18n("Lot"), width: 80 },
        { id: "steel", header: i18n("Steel"), width: 50 },
        { id: "thickness", header: i18n("Thickness"), width: 70 },
        { id: "rmwidth", header: i18n("Width"), width: 70 },
        { id: "lotweight", header: i18n("Weight"), width: 70 },
        { id: "running", header: i18n("running"), width: 70 },
        {
            id: "materialid", header: i18n("Material ID"), width: 120, fillspace: true,
            format: webix.Number.numToStr({
                groupDelimiter: ".",
                groupSize: 3,
                decimalDelimiter: "3",
                decimalSize: 0
            }),
            width: 80
        },
        { id: "stripQuantity", header: i18n("Strip Quantity"), width: 70 },
        { id: "width", header: i18n("Width"), width: 70 },
        { id: "totalWidth", header: i18n("Total Width"), width: 100, footer: { content: "summColumn" } },
        { id: "stripWeight", header: i18n("Strip Weight"), width: 100 },
        { id: "totalWeight", header: i18n("Total Weight"), width: 100, footer: { content: "summColumn" } },
        { id: "percentage", header: i18n("%"), width: 50 }
    ];

    /* Table */

    let searchForm = {
        view: 'form',
        autoheight: false,
        id: 'frmStripsCuttingPlan',
        rows: [
            {
                cols: [
                    new WebixInputSelect('equipmentSearch', i18n('Equipment'), allEquipment.data,
                        {
                            template: function (obj) {
                                return obj.description;
                            }
                        }),
                    new WebixInputSelect('situation', i18n('Situation'), optionsSituationCutPlan),
                    {
                        view: "daterangepicker",
                        editable: true,
                        labelPosition: "top",
                        id: "drpInterval",
                        label: i18n('Interval'),
                        value: { start: new Date(), end: webix.Date.add(new Date(), -7, "day") }
                    }
                ]
            },
            dtResult,
            //dtXLS,
            {
                view: "template",
                template: `<div id="container" class="table"></div>`
            }
        ]
    }

    let menu = WebixBuildReponsiveTopMenu('Coil Cutting Plan', [
        {
            id: "btnSearch",
            label: "Search",
            icon: "fas fa-search",
            click: async () => {
                search();
            }
        }, {
            id: "btnAdd",
            label: "Add",
            icon: "fas fa-plus",
            click: async () => {
                await _modalStripsCuttingPlan.showModal(allEquipment, null);
            }
        }, {
            id: "btnRemove",
            icon: "fas fa-trash-alt",
            label: "Remove",
            click: async () => {

                let grid = $$('ttbStripsCuttingPlan');
                let item = grid.getSelectedItem();

                if (item == null) {
                    webix.message(i18n('An item must be selected'));
                    return;
                } else {
                    if (item.situationId == 'P') {
                        webix.confirm({
                            title: i18n("Do you want to delete this record?"),
                            ok: i18n("Yes! Remove"),
                            cancel: i18n("No! Cancel"),
                            text: `<strong> ${i18n("Strip cut plan")} nº </strong> ${item.id}`,
                            callback: async function (result) {
                                if (result) {

                                    let result = await App.api.deleteCoilCutPlan(item);

                                    //await App.api.ormDbDelete({"id": item.id}, 'coilcuttingplan');

                                    if (result.success) {
                                        webix.message(i18n('Cutting Plan ') + result.data + i18n(' removed successfully'));
                                        $$('ttbStripsCuttingPlan').clearAll();
                                        search();
                                    }
                                    else {
                                        webix.message(i18n(result.data));
                                        modal.close();
                                    }

                                }
                            }
                        });
                    }
                    else {
                        webix.message(i18n('Only pendent itens can be removed'));
                        return;
                    }
                }
            }
        }, {
            id: "btnEdit",
            icon: "fas fa-edit",
            label: "Edit",
            click: async () => {
                let grid = $$('ttbStripsCuttingPlan');
                let item = grid.getSelectedItem();

                if (item == null) {
                    webix.message(i18n('An item must be selected'));
                    return;
                } else {
                    if (item.situationId == 'P') {
                        item.data = grid.serialize().find(x => x.id == item.id).data
                        await _modalStripsCuttingPlan.showModal(allEquipment, item, search);
                    }
                    else {
                        webix.message(i18n('Only pendent itens can be removed'));
                        return;
                    }
                }
            }
        },
        {
            id: "btnExport",
            icon: "fas fa-file-excel",
            label: "Export",
            click: async () => {

                let grid = $$('ttbStripsCuttingPlan');
                let item = grid.getSelectedItem();

                if (item == null) {

                    webix.message(i18n('An item must be selected'));
                    return;

                } else {

                    let data = await getDataXLS(item.id);
                    table(data);
                    doit("xlsx")

                    return;

                }
            }

        }]);

    async function search() {

        let equipment = $$('cmbEquipmentSearch').getValue();
        let situation = $$('cmbSituation').getValue();
        let interval = $$('drpInterval').getValue();
        let dateInterval = {};

        if (interval) {
            let format = webix.Date.dateToStr("%Y%m%d");

            dateInterval.begin = format(interval.start);
            dateInterval.end = format(interval.end);
        }

        let result = await App.api.listCoilCutPlan(equipment, situation, dateInterval);

        if (result.success) {

            if (result.data.length > 0) {

                let data = [];
                let count = 1;

                // Group the result by ID
                let group = result.data.groupBy(x => x.id);

                for (let item of group) {
                    let newItem = {};

                    newItem.id = item.key;
                    newItem.dtcreated = item.data[0].dtcreated;
                    newItem.equipmentId = item.data[0].idequipment;
                    newItem.equipment = item.data[0].equipmentdesc;
                    newItem.lot = item.data[0].idlot;
                    newItem.yield = item.data[0].yield;
                    newItem.refile = item.data[0].refile;
                    newItem.situationId = item.data[0].situation;
                    newItem.situation = (optionsSituationCutPlan.find(x => x.id == item.data[0].situation)).value;
                    newItem.lotweight = item.data[0].lotweight;
                    newItem.data = [];

                    for (let material of item.data) {
                        newItem.data.push({
                            id: item.key + '.' + count,
                            materialId: material.idmaterial,
                            material: material.materialdesc,
                            quantity: material.quantity,
                            idordermes: material.idordermes,
                            steel: material.steel,
                            thickness: material.thickness,
                            width: material.width,
                            date: null
                        })

                        count++;
                    }

                    data.push(newItem);

                    count = 1;
                }
                $$('ttbStripsCuttingPlan').clearAll();
                $$('ttbStripsCuttingPlan').parse(data);
            }
            else {
                $$('ttbStripsCuttingPlan').clearAll();
            }
        }
    }

    async function getDataXLS(id) {

        let equipment = $$('cmbEquipmentSearch').getValue();
        let situation = $$('cmbSituation').getValue();
        let interval = $$('drpInterval').getValue();
        let dateInterval = {};

        if (interval) {
            let format = webix.Date.dateToStr("%Y%m%d");
            dateInterval.begin = format(interval.start);
            dateInterval.end = format(interval.end);
        }

        let result = await App.api.listCoilCutPlan(equipment, situation, dateInterval);
        let data = [];

        if (result.success) {

            if (result.data.length > 0) {

                /* Verifico o ID */
                result = await result.data.filter((item) => item.id == id);

                data = [
                    [i18n("Id"), "", "", i18n("Lot"), result[0].idlot],
                    [i18n("Steel"), result[0].steel, "", i18n("Thickness"), result[0].thickness, "", i18n("Width"), result[0].rmwidth],
                    [i18n("Weight"), result[0].lotweight, "", i18n("Run"), result[0].runid],
                    ["-"],
                    [i18n("Material Id"), i18n("Strip Quantity"), i18n("Width"), i18n("Total Width"), i18n("Strip Weight"), i18n("Total Weight"), "%"]
                ];

                /* Verifico o peso Total por Corte */
                let total = result.map((item) => { return item.quantity * item.width });

                /* Verifico a soma do peso Total */
                let sumWidth = total ? total.reduce((accumulator, currentValue) => accumulator + currentValue) : 0;

                /* Verifico o peso da Sucata */
                let widthScrap = result[0].rmwidth - sumWidth;

                sumWidth = sumWidth + widthScrap;

                let totalWidthScrap = 1 * widthScrap;

                let stripWeightScrap = (result[0].lotweight * widthScrap) / result[0].rmwidth;
                let totalWeightScrap = 1 * stripWeightScrap;

                let percentageScrap = (totalWidthScrap * 100) / sumWidth;

                let scrap = [
                    result[0].materialscrap,
                    1,
                    widthScrap.toFixed(2),
                    totalWidthScrap.toFixed(2),
                    stripWeightScrap.toFixed(2),
                    totalWeightScrap.toFixed(2),
                    percentageScrap.toFixed(2)
                ];

                result = await result.map((item) => {

                    let totalWidth = item.quantity * item.width;
                    let stripWeight = (item.lotweight * item.width) / item.rmwidth;
                    let totalWeight = item.quantity * stripWeight;
                    let percentage = (totalWidth * 100) / sumWidth;

                    data.push([
                        item.idmaterial,
                        item.quantity,
                        item.width.toFixed(2),
                        totalWidth.toFixed(2),
                        stripWeight.toFixed(2),
                        totalWeight.toFixed(2),
                        percentage.toFixed(2)
                    ]);

                });

                data.push(scrap);

            }

        }

        return data;

    }

    await App.replaceMainMenu(menu);
    await App.replaceMainContent(searchForm);
}

async function table(data) {
    /* initial table */
    var aoa = data;
    var ws = XLSX.utils.aoa_to_sheet(aoa);
    var html_string = XLSX.utils.sheet_to_html(ws, { id: "data-table", editable: true });
    document.getElementById("container").innerHTML = html_string;
}

async function doit(type, fn, dl) {
    var elt = document.getElementById('data-table');
    var wb = XLSX.utils.table_to_book(elt, { sheet: "Sheet JS" });
    return dl ?
        XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }) :
        XLSX.writeFile(wb, fn || (i18n('stripscuttingplan') + "." + (type || 'xlsx')));
}