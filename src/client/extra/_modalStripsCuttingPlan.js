import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";
import { WebixWindow, WebixDatatable, WebixInputText, WebixCrudAddButton, WebixInputCombo } from "../lib/WebixWrapper.js";

export async function showModal(equipmentList, item, after) {

    let avaliableLots = null;
    if (item)
        avaliableLots = await App.api.getLotsCuttingPlan();
    else
        avaliableLots = await App.api.getAvaliableLotsToCutPlan();


    let dtAvaliableOP = {
        view: "datatable",
        height: 150,
        id: "dtAvaliableOP",
        columns: [
            { id: "status", header: "", width: 35, css: "center", template: "{common.checkbox()}", cssFormat: status },
            { id: "id", header: [i18n("Material"), { content: "textFilter" }], width: 125, cssFormat: status },
            { id: "idordermes", header: [i18n("Order"), { content: "numberFilter" }], width: 50, cssFormat: status },
            { id: "description", header: [i18n("Description"), { content: "textFilter" }], width: 200, cssFormat: status },
            { id: "steel", header: [i18n("Steel"), { content: "textFilter" }], width: 60, cssFormat: status },
            { id: "thickness", header: [i18n("thickness"), { content: "numberFilter" }], width: 80, cssFormat: status },
            { id: "width", header: [i18n("Width"), { content: "numberFilter" }], width: 80, cssFormat: status }
        ],
        checkboxRefresh: true
    }

    let dtAvaliableMaterial = {
        view: "datatable",
        height: 150,
        id: "dtAvaliableMaterial",
        columns: [
            { id: "status", header: "", width: 35, css: "center", template: "{common.checkbox()}", cssFormat: status },
            { id: "id", header: [i18n("Material"), { content: "textFilter" }], width: 125, cssFormat: status },
            { id: "idordermes", header: [i18n("Order"), { content: "numberFilter" }], width: 50, cssFormat: status },
            { id: "description", header: [i18n("Description"), { content: "textFilter" }], width: 200, cssFormat: status },
            { id: "steel", header: [i18n("Steel"), { content: "textFilter" }], width: 60, cssFormat: status },
            { id: "thickness", header: [i18n("thickness"), { content: "numberFilter" }], width: 80, cssFormat: status },
            { id: "width", header: [i18n("Width"), { content: "numberFilter" }], width: 80, cssFormat: status }
        ],
        checkboxRefresh: true
    }

    let dtSelectedMaterial = new WebixDatatable('dtSelectedMaterial');

    dtSelectedMaterial.columns = [
        { id: "id", header: [i18n("Material")], width: 125 },
        { id: "idordermes", header: [i18n("Order")], width: 50 },
        { id: "description", header: [i18n("Description")], width: 200 },
        { id: "steel", header: [i18n("Steel")], width: 80 },
        { id: "thickness", header: [i18n("thickness")], width: 100 },
        { id: "width", header: [i18n("Width")], width: 100 },
        { id: "cuts", header: [i18n("Number of cuts")], width: 125, editor: "text", cssFormat: markChange }
    ]

    dtSelectedMaterial.on = {
        onAfterEditStop: function (state, editor) {
            if (state.value != state.old) {
                if (editor.column == 'cuts') {

                    let result = calcYield('M');

                    if (!result)
                        this.getItem(editor.row).cuts = 0;

                    this.getItem(editor.row).changed = false;
                }
            }
        }
    }

    let dtResult = new WebixDatatable('dtResult');

    dtResult.columns = [
        { id: "id", header: [i18n("Material"), { content: "textFilter" }], width: 125 },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], fillspace: true },
        { id: "idordermes", header: [i18n("Order"), { content: "textFilter" }], width: 50 },
        { id: "steel", header: [i18n("Steel"), { content: "textFilter" }] },
        { id: "thickness", header: [i18n("thickness"), { content: "numberFilter" }] },
        { id: "width", header: [i18n("Width"), { content: "numberFilter" }] },
        { id: "cuts", header: [i18n("Number of cuts"), { content: "numberFilter" }] }
    ]

    let txtAvaliableMaterials = ({
        view: "label",
        label: i18n("Orders / Available Materials"),
        inputWidth: 100,
        align: "center"
    })

    let txtSelectedMaterials = ({
        view: "label",
        label: i18n("Selected Materials"),
        inputWidth: 100,
        align: "center"
    })

    const selectMaterial = {
        view: "button",
        click: async () => {
            let itens = [];
            let selected = $$('dtSelectedMaterial').serialize();
            let orders = $$('dtAvaliableOP').serialize();
            let materials = $$('dtAvaliableMaterial').serialize();

            if (orders)
                orders = orders.filter(x => x.status == 1);

            if (materials)
                materials = materials.filter(x => x.status == 1);

            for (let item of orders) {
                if (selected.some(x => x.id == item.id)) {
                    item.status = 0;
                    webix.message(i18n('Material has alread selected'));
                }
            }

            for (let item of materials) {
                if (selected.some(x => x.id == item.id)) {
                    item.status = 0;
                    webix.message(i18n('Material has alread selected'));
                }
            }

            itens = itens.concat(orders.filter(x => x.status == 1));
            itens = itens.concat(materials.filter(x => x.status == 1));

            itens = itens.filter((obj, pos, arr) => {
                return arr.map(mapObj => mapObj['id']).indexOf(obj['id']) === pos;
            });

            if (itens.length == 0)
                return;
            else
                changeMaterial('A', itens);
        },
        css: "toolbarMiddler",
        width: 40,
        type: "icon",
        icon: "fas fa-angle-left"
    }

    const unselectMaterial = {
        view: "button",
        click: async () => {
            let itens = $$('dtSelectedMaterial').getSelectedItem();

            if (itens == null || itens.length == 0) {
                webix.message(i18n('An item must be selected'));
                return;
            }
            else {
                if (!Array.isArray(itens)) {
                    itens = [];
                    itens.push($$('dtSelectedMaterial').getSelectedItem())
                }
                changeMaterial('R', itens);
            }
        },
        css: "toolbarMiddler",
        width: 40,
        type: "icon",
        icon: "fas fa-angle-right"
    }

    let body = {
        rows: [
            {
                cols: [
                    new WebixInputCombo('equipment', i18n('Equipment'), equipmentList,
                        {
                            template: function (obj) {
                                return obj.description;
                            }
                        }),
                    {
                        view: "richselect",
                        label: i18n("Lot"),
                        id: "cmbLots",
                        labelPosition: "top",
                        scrollX: true,
                        options: {
                            view: "gridsuggest",
                            body: {
                                autoConfig: false,
                                header: true,
                                borderless: true,
                                scroll: true,
                                autoheight: false,
                                autofocus: true,
                                yCount: 10,
                                columns: [
                                    { id: "idlot", header: [i18n('Lot'), { content: "textFilter" }], width: 75, sort: "string" },
                                    { id: "material", header: [i18n('Material'), { content: "textFilter" }], width: 200, sort: "string" },
                                    { id: "thickness", header: [i18n('thickness'), { content: "textFilter" }], width: 50, sort: "string" },
                                    { id: "steel", header: [i18n('Steel'), { content: "textFilter" }], width: 50, sort: "string" },
                                    { id: "width", header: [i18n('Width'), { content: "textFilter" }], width: 50, sort: "string" },
                                    { id: "weight", header: [i18n('Weight'), { content: "textFilter" }], width: 60, sort: "string"}
                                ],
                            },

                            template: function (item) {
                                return item.id + " (" + item.material + ' - ' + item.steel + ' - ' + item.thickness + ' - ' + item.width +  ' - ' + item.weight + ")";
                            },
                            data: avaliableLots
                        },
                        on: {
                            onChange: async (id) => {
                                if (avaliableLots.length > 0) {
                                    let item = avaliableLots.find(x => x.id == id);
                                    await fillMaterialList(item.steel, item.thickness, item.width);
                                }
                            }
                        }
                    },
                    new WebixInputText("refile", i18n("Refile (mm)"), { width: 150, onChange: () => { calcYield('A') }, attributes: { type: "number" } }),
                    new WebixInputText("yield", i18n("Yield"), { width: 160, disabled: true, css: "largeText", attributes: { maxlength: 3 } })
                ]
            },
            {
                cols: [
                    txtSelectedMaterials,
                    txtAvaliableMaterials
                ]
            },
            {
                cols: [
                    dtSelectedMaterial,
                    {
                        view: "toolbar",
                        rows: [
                            selectMaterial,
                            unselectMaterial
                        ]
                    },
                    {
                        rows: [
                            dtAvaliableOP,
                            dtAvaliableMaterial
                        ]
                    }
                ]
            },
            new WebixCrudAddButton('generate', i18n('Generate'), () => { generate() }),
            dtResult,
            new WebixCrudAddButton('save', 'Save', () => { save() }),
        ]
    }

    let modal = new WebixWindow({
        onClosed: (modal) => {
            modal.close();
        }
    });

    function status(value, obj) {
        if (obj.status) return "row-marked";
        return "";
    }

    async function fillMaterialList(steel, thickness, width) {
        let result = await App.api.getMaterialsByCharacteristics(steel, thickness, width);
        $$('dtAvaliableMaterial').clearAll();
        $$('dtAvaliableMaterial').parse(result);

        result = await App.api.getOrdersByCharacteristics(steel, thickness, width);
        $$('dtAvaliableOP').clearAll();
        $$('dtAvaliableOP').parse(result);

        if (item)
            refreshGridList();
    }

    async function changeMaterial(type, itens) {
        let refile = $$('txtRefile').getValue();

        if (refile == null || refile == '' || refile == 0) {
            webix.message(i18n('The refile must be informed'));
            return;
        }
        else {
            for (let item of itens) {
                if (type == 'A') {
                    if (item.idordermes)
                        $$('dtAvaliableOP').remove(item.id);
                    else
                        $$('dtAvaliableMaterial').remove(item.id);

                    $$('dtSelectedMaterial').add(item);
                }
                else if (type == 'R') {
                    $$('dtSelectedMaterial').remove(item.id);

                    item.status = 0;

                    if (item.idordermes)
                        $$('dtAvaliableOP').add(item);
                    else
                        $$('dtAvaliableMaterial').add(item);
                }
            }
        }

        calcYield('A');
    }

    async function calcYield(type) {
        let yieldResult = 0;
        let refile = $$('txtRefile').getValue();
        let itens = $$('dtSelectedMaterial').serialize();
        let target = avaliableLots.find(x => x.id == $$('cmbLots').getValue());

        if (type == 'A') { //Automatic
            // let ret = await App.api.calcBestYield(itens, (target.width - refile));
            let ret = await App.api.calcBestYield(itens, (target.width));

            for (let item of itens) {
                if (item.id in ret) {
                    item.cuts = ret[item.id];
                    item.changed = true;
                }
            }

            $$('dtSelectedMaterial').refresh();
            yieldResult = Math.round(ret.result * 100) / 100;
        }
        else if (type == 'M') { //Manual
            let totalWidth = 0;

            for (let item of itens) {
                totalWidth += (item.cuts * item.width);
            }
            // if (totalWidth > (target.width - refile)) {
            if (totalWidth > (target.width)) {
                webix.message(i18n('Maximum width exceeded'));
                return false;
            }
            else {
                // yieldResult = Math.round((totalWidth * 100) / (target.width - refile) * 100) / 100;
                yieldResult = Math.round((totalWidth * 100) / (target.width) * 100) / 100;
            }
        }

        $$('txtYield').setValue(yieldResult);
    }

    async function generate() {

        let equipment = $$('cmbEquipment').getValue();

        if (equipment == null || equipment == '') {
            webix.message(i18n('The equipment must be informed'));
        }
        else {
            let itens = $$('dtSelectedMaterial').serialize();

            let refile = $$('txtRefile').getValue();
            let target = avaliableLots.find(x => x.id == $$('cmbLots').getValue());

            let sumCuts = 0;

            for(let i = 0; i < itens.length; i++){
                for(let j = 0; j < itens[i].cuts; j++){
                    sumCuts += itens[i].width
                }
            }

            sumCuts += parseInt(refile);

            if(sumCuts <= target.width){
                $$('dtResult').parse(itens);
                return;
            }
            else {
                webix.alert(i18n('The Sum (Total Cutting Width + Refile = ') + sumCuts + i18n(') is bigger than total coil width '))
            }
            
        }

    }

    async function save() {
        
        let cutPlan = {};
        let materials = [];

        let itens = $$('dtResult').serialize();

        cutPlan.idequipment = $$('cmbEquipment').getValue();
        cutPlan.idlot = $$('cmbLots').getValue();
        cutPlan.yield = $$('txtYield').getValue();
        cutPlan.refile = $$('txtRefile').getValue();

        for (let item of itens) {

            materials.push({
                idmaterial: item.id,
                quantity: item.cuts,
                idordermes: item.idordermes,
                steel: item.steel,
                thickness: item.thickness,
                width: item.width,
                length: length,
                cuts: item.cuts,
                iduser: localStorage.getItem('login')
            })
        }

        if (item) {
            cutPlan.id = item.id;

            let result = await App.api.updateCoilCutPlan(cutPlan, materials);

            if (result.success) {
                webix.message(i18n('Cutting plan updated succesfully'));
                modal.close();

                if (after)
                    after();
            }
        }
        else {

            let result = await App.api.createCoilCutPlan(cutPlan, materials);
            if (result.success) {
                webix.message(i18n('New cutting plan created (@n)').replace('@n', result.data.id));
                modal.close();
            }
            else {
                webix.message(i18n(result.data) + ', ' + i18n('Please, contact the support!'))
                modal.close();
            }
        }
    }

    function markChange(value, config) {
        if (config.changed)
            return "highlight";
        else
            return "default";
    }

    function refreshGridList() {
        let data = [];

        $$('txtYield').setValue(item.yield);

        for (let detail of item.data) {
            data.push({
                id: detail.materialId,
                idordermes: detail.idordermes,
                description: detail.material,
                steel: detail.steel,
                thickness: detail.thickness,
                width: detail.width,
                cuts: detail.quantity,
                weight: detail.weight
            })

            $$('dtAvaliableOP').remove(detail.materialId);
            $$('dtAvaliableMaterial').remove(detail.materialId);
        }

        $$('dtSelectedMaterial').parse(data);
    }

    // Edit a item    
    modal.body = {
        view: "scrollview",
        body: body
    };

    modal.modal = true;
    modal.fullscreen = true;
    modal.show();
    modal.setTitle(i18n("Strip Cutting Plan Detail"));

    if (item) {
        $$('cmbEquipment').setValue(item.equipmentId);
        $$('cmbLots').setValue(item.lot);
        $$('txtRefile').setValue(item.refile);

        $$('cmbEquipment').disable();
        $$('cmbLots').disable();
    }
}