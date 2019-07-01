import { WebixWindow, WebixInputCombo, WebixInputTextArea, WebixInputText, WebixCrudAddButton } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";

let optionsSelects = [];

export async function showModal(order, idlot) {
    
    //TODO: Falta fazer uma rota para trazer todas as caracteristicas de um meterial
    let diameter = await App.api.ormDbFindOne('materialcharacteristic', { idmaterial: order.idmaterial, idcharacteristic: 'CG_DIAMETRO' })
    let thickness = await App.api.ormDbFindOne('materialcharacteristic', { idmaterial: order.idmaterial, idcharacteristic: 'CG_ESPESSURA' })
    let length = await App.api.ormDbFindOne('materialcharacteristic', { idmaterial: order.idmaterial, idcharacteristic: 'CG_COMPRIMENTO' })
    let width = await App.api.ormDbFindOne('materialcharacteristic', { idmaterial: order.idmaterial, idcharacteristic: 'CG_DIAMETRO' })
    let norm = await App.api.ormDbFindOne('materialcharacteristic', { idmaterial: order.idmaterial, idcharacteristic: 'CG_NORMA' })

    let rules = await App.api.ormDbGetRulesByMaterial({ idmaterial: order.idmaterial });

    return new Promise(async function (resolve, reject) {
        let modal = new WebixWindow({
            id: 'mdControlDimensional',
            height: 600,
            width: 800,
            onClosed: (model) => {
                webix.confirm({
                    title: i18n(""),
                    ok: i18n("Yes! Leave"),
                    cancel: i18n("No! Save"),
                    text: i18n('Are you sure you want to leave without saving?'),
                    callback: async function (result) {
                        if (result) {
                            resolve(true)
                            model.close();
                        } else {
                            save(order, idlot, resolve);
                        }
                    }
                });
            }
        });
        modal.body = {
            id: "formReadRawMaterial",
            padding: 20,
            rows: [
                {

                    view: "fieldset",
                    label: i18n("Order"),
                    borderless: true,
                    body: {
                        rows: [
                            {
                                height: 30,
                                cols: [
                                    {
                                        view: 'template', width: 120, template: `<strong>${i18n('Equipment')}:</strong> ${order.idequipmentscheduled}`
                                    },
                                    {
                                        view: 'template', width: 100, template: `<strong>${i18n('Order')}:</strong> ${order.idordermes}`
                                    },
                                    {
                                        view: 'template', template: `<strong>${i18n('Product')}:</strong> ${parseInt(order.idmaterial)} - ${order.material}`
                                    },
                                ]
                            },
                            {
                                height: 30,
                                cols: [
                                    {
                                        view: 'template', width: 100, template: `<strong>${i18n('Diameter')}:</strong> ${diameter.success ? diameter.data.numbervalue : '0'}`
                                    },
                                    {
                                        view: 'template', width: 100, template: `<strong>${i18n('Thickness')}:</strong> ${thickness.success ? thickness.data.numbervalue : '0'}`
                                    },
                                    {
                                        view: 'template', width: 150, template: `<strong>${i18n('Length')}:</strong> ${length.success ? length.data.numbervalue : '0'}`
                                    },
                                    {
                                        view: 'template', width: 150, template: `<strong>${i18n('Norm')}:</strong> ${norm.success ? norm.data.textvalue : '-'}`
                                    },
                                    {}
                                ]
                            },
                        ]
                    }
                },
                { height: 10 },
                await generateObjectsItens(order, idlot, rules, {
                    diameter: diameter.data.numbervalue,
                    thickness: thickness.data.numbervalue,
                    length: length.data.numbervalue,
                    width: width.data.numbervalue,
                }),
                { height: 10 },
                {
                    cols: [
                        {},
                        new WebixCrudAddButton('btnSave', i18n('Save'), () => {
                            save(order, idlot, resolve);
                        }, {
                                height: 80,
                                width: 100
                            }),
                        {}
                    ]
                }
            ]
        };
        modal.modal = true;
        modal.show();
        modal.setTitle(i18n("Dimensional Control"));
    });
}

async function generateObjectsItens(order, idlot, rules, characteristic) {
    let itensLink = await App.api.ormDbFindAllDimensionalItem({ idequipment: order.idequipmentscheduled });

    if (itensLink.data.length) {
        let data = itensLink.data;

        let dt = {
            id: "dtDimensionalControlItem",
            view: "datatable",
            editable: true,
            rowHeight: 80,
            checkboxRefresh: true,
            columns: [
                { id: "description", header: i18n('Description'), fillspace: true, },
                { id: "textvalue", header: i18n('Text value'), fillspace: true, editor: "text", },
                { id: "booleanvalue", header: i18n('Boolean value'), fillspace: true, editor: "inline-checkbox", template: custom_checkbox },
                { id: "numbervalue", header: i18n('Number value'), fillspace: true, editor: "text" },
                { id: "selectvalue", header: i18n('Select value'), fillspace: true, editor: "richselect", options: [], },
                { id: "minvalue", header: i18n('Min value'), fillspace: true, editor: "text" },
                { id: "maxvalue", header: i18n('Max value'), fillspace: true, editor: "text" }
            ],
            data: [],
            on: {
                onBeforeEditStart: function (id) {
                    var item = this.getItem(id.row);
                    if (item.typevalue == 'select') {
                        var options = this.getColumnConfig("selectvalue").collection;

                        options.filter(function (obj) {
                            return (obj.type == item.id);
                        });

                        if (id.column != "selectvalue") {
                            return false;
                        } else {
                            return true;
                        }
                    }

                    if (item.typevalue == 'text') {
                        if (id.column != "textvalue") {
                            return false;
                        } else {
                            return true;
                        }
                    }

                    if (item.typevalue == 'BOOLEAN') {
                        if (id.column != "booleanvalue") {
                            return false;
                        } else {
                            return true;
                        }
                    }

                    if (item.typevalue == 'number') {
                        if (id.column != "numbervalue") {
                            return false;
                        } else {
                            return true;
                        }
                    }

                    if (item.typevalue == 'minmax') {
                        if (id.column != "minvalue" && id.column != "maxvalue") {
                            return false;
                        } else {
                            $$('dtDimensionalControlItem').addCellCss(id.row, id.column, 'available');
                            return true;
                        }
                    }
                },
                onAfterEditStop: async function (alter, editor, ignoreUpdate) {
                    let item = this.getItem(editor.row);
                    if (item.typevalue == 'minmax' || item.typevalue == 'number') {
                        let response = await validate(rules.data, item, alter.value, characteristic);
                        if (response) {
                            $$('dtDimensionalControlItem').removeCellCss(editor.row, editor.config.id, 'rejected');
                            $$('dtDimensionalControlItem').addCellCss(editor.row, editor.config.id, 'accepted');
                        } else {
                            $$('dtDimensionalControlItem').removeCellCss(editor.row, editor.config.id, 'accepted');
                            $$('dtDimensionalControlItem').addCellCss(editor.row, editor.config.id, 'rejected');
                        }
                    }
                }
            }
        };

        for (let i = 0; i < data.length; i++) {
            let now = data[i];

            if (now.typevalue == 'select') {
                let arr = now.options.split(",").map((item) => {
                    return {
                        id: item,
                        value: item,
                        type: now.id
                    }
                })
                dt.columns[4].options = dt.columns[4].options.concat(arr);
            }

            dt.data.push({
                id: now.id,
                description: now.description,
                textvalue: null,
                booleanvalue: now.typevalue === "BOOLEAN" ? 1 : null,
                numbervalue: now.typevalue === "number" ? 0 : null,
                selectvalue: null,
                minvalue: now.typevalue === "minmax" ? 0 : null,
                maxvalue: now.typevalue === "minmax" ? 0 : null,
                typevalue: now.typevalue,
                reference: now.reference,
                options: now.options ? now.options.split(",").map(String) : null,
                $cellCss: {
                    description: 'blocked',
                    selectvalue: now.typevalue == 'select' ? '' : 'blocked',
                    textvalue: now.typevalue == 'text' ? '' : 'blocked',
                    booleanvalue: now.typevalue == 'BOOLEAN' ? '' : 'blocked',
                    numbervalue: now.typevalue == 'number' ? '' : 'blocked',
                    minvalue: now.typevalue == 'minmax' ? '' : 'blocked',
                    maxvalue: now.typevalue == 'minmax' ? '' : 'blocked'
                }
            });

        }

        return {
            view: "fieldset",
            label: i18n("Control"),
            borderless: true,
            body: {
                rows: [
                    dt
                ]
            }
        }
    } else {
        webix.message(i18n('No have items dimensional control for is equipment.'));
        return {};
    }
}

function custom_checkbox(obj, common, value) {
    if (obj.typevalue == "BOOLEAN") {
        if (value)
            return `<div class='webix_table_checkbox checked'> ${i18n('YES')} </div>`;
        else
            return `<div class='webix_table_checkbox notchecked'> ${i18n('NO')} </div>`;
    } else {
        return '';
    }
}

async function validate(rules, item, value, characteristic) {
    value = Number(value.replace(/,/g, '.'));
    let rule = rules.filter((elem) => {
        if (elem.idvariable === item.reference) {
            if (elem.idfield == "CG_DIAMETRO") {
                if (elem.startrange <= characteristic.diameter && elem.endrange >= characteristic.diameter) {
                    return true
                }
            } else if (elem.idfield == "CG_ESPESSURA") {
                if (elem.startrange <= characteristic.thickness && elem.endrange >= characteristic.thickness) {
                    return true
                }
            } else if (elem.idfield == "CG_COMPRIMENTO") {
                if (elem.startrange <= characteristic.length && elem.endrange >= characteristic.length) {
                    return true
                }
            } else if (elem.idfield == "CG_LARGURA") {
                if (elem.startrange <= characteristic.width && elem.endrange >= characteristic.width) {
                    return true
                }
            }
        }
    });

    if (rule.length) {
        rule = rule[0];
        let min;
        let max;
        let base = returnValue(item.reference, characteristic);

        if (rule.idunit == "%") {
            min = base - (base * rule.mintolerance / 100);
            max = base + (base * rule.maxtolerance / 100);
        } else {
            min = base - rule.mintolerance;
            max = base + rule.maxtolerance;
        }

        if (min <= value && max >= value) {
            return true
        } else {
            return false
        }
    }
}

async function save(order, idlot, resolve) {
    if (validateObject()) {
        let allData = $$('dtDimensionalControlItem').serialize();
        let lastCreated = await App.api.ormDbLastAdd('dimensionalcontrolresult', 'sequence');
        let itens = document.getElementsByClassName('rejected');
        if (itens.length)
            await App.api.ormDbCreate('defect', { idlot: idlot, idorder: order.idordermes, iddefecttype: '999' });

        let save = allData.map(item => {
            return {
                idorder: order.idordermes,
                sequence: lastCreated.data ? Number(lastCreated.data) + 1 : 1,
                iddimensionalcontrolitem: item.id,
                idequipment: order.idequipmentscheduled,
                idlot: idlot,
                textvalue: item.textvalue,
                booleanvalue: item.booleanvalue ? true : false,
                numbervalue: item.numbervalue ? Number(item.numbervalue) : item.typevalue == "number" ? 0 : null,
                selectvalue: item.selectvalue,
                minvalue: item.minvalue ? Number(item.minvalue) : item.typevalue == "minmax" ? 0 : null,
                maxvalue: item.maxvalue ? Number(item.maxvalue) : item.typevalue == "minmax" ? 0 : null,
                iduser: localStorage.getItem('login'),
            }
        });

        let result = await App.api.ormDbSaveDimensionalControl(save);

        if (result.success) {
            resolve(true);
            $$('mdControlDimensional').close();
            webix.message(i18n('Dimensional control saved successfully.'))
        } else {
            webix.message(i18n('Error saving dimensional control.'))
        }
    } else {
        webix.message(i18n('You can not save a dimensional control without data.'));
    };
}

function returnValue(field, characteristic) {
    if (field == "CG_DIAMETRO") {
        return characteristic.diameter;
    } else if (field == "CG_ESPESSURA") {
        return characteristic.thickness;
    } else if (field == "CG_COMPRIMENTO") {
        return characteristic.length;
    } else if (field == "CG_LARGURA") {
        return characteristic.width;
    }
}

function validateObject() {
    let allData = $$('dtDimensionalControlItem').serialize();
    let error = false;

    for (let i = 0; i < allData.length; i++) {
        let element = allData[i];
        if (element.typevalue == 'select') {
            if (element.selectvalue == null)
                error = true
        } else if (element.typevalue == 'text') {
            if (element.textvalue == null)
                error = true
        } else if (element.typevalue == 'BOOLEAN') {
            if (element.booleanvalue == null)
                error = true
        } else if (element.typevalue == 'number') {
            if (element.numbervalue == null)
                error = true
        } else if (element.typevalue == 'minmax') {
            if (element.minvalue == null || element.maxvalue == null)
                error = true
        }
    }

    return !error;
}