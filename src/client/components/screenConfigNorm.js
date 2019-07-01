import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { optionsTypeNorm } from "../components/optionsScreens.js"
import { WebixCrudDatatable, WebixInputText, WebixInputSelect, WebixInputTextArea, WebixWindow, WebixBuildReponsiveTopMenu } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen() {

    let dtNorm = new WebixCrudDatatable("dtNorm");

    dtNorm.columns = [{
        id: "id",
        header: [i18n("Id"), {
            content: "textFilter"
        }],
        sort: "string",
        width: 100
    },
    {
        id: "type",
        template: (obj) => {
            let option = (optionsTypeNorm.find(x => x.id == obj.type));
            return option.value;
        },
        header: [i18n("Type"), {
            content: "selectFilter"
        }],
        sort: "string",
        width: 200
    },
    {
        id: "normtext",
        header: [i18n("NormText"), {
            content: "textFilter"
        }],
        sort: "string",
        fillspace: true
    }
    ];

    dtNorm.createStatusColumn();

    let validate = (id, req) => {
        if (id == 'type') {
            for (var i = 0; i < req.values.length; i++) {
                let option = (optionsTypeNorm.find((x) => x.id == req.values[i].value));
                if (option) {
                    req.values[i].value = option.value;
                }
            }
        }
    }

    dtNorm.changeFilterOptions(validate);

    let toolbar = {
        id: "formSpecialInstruction",
        padding: 5,
        rows: [{
            cols: [{
                view: "template",
                template: i18n("Norm Rules"),
                type: "section"
            },
            {
                view: "button",
                type: "icon",
                icon: "fas fa-edit",
                width: 30,
                css: 'color_dafult_icon',
                click: () => {
                    let selectedItem = $$('idNormsRules').getSelectedItem();
                    let normsRules = $$('idNormsRules').serialize();
                    if (selectedItem) {
                        let index = normsRules.indexOf(selectedItem);

                        if (index === -1) {
                            webix.message("Please select a valid item");
                        } else {
                            $$('formCrudNormRules').setValues(selectedItem);
                        }
                    } else {
                        webix.message("Please select an item");
                    }
                }
            },
            {
                view: "button",
                type: "icon",
                icon: "fas fa-times",
                width: 30,
                css: 'color_dafult_icon',
                click: () => {
                    let selectedItem = $$('idNormsRules').getSelectedItem();
                    if (selectedItem) {
                        let normsRules = $$('idNormsRules').serialize();
                        let index = normsRules.indexOf(selectedItem);

                        if (index === -1) {
                            webix.message("Please select a valid item");
                        } else {
                            normsRules.splice(index, 1);
                            for (var i = 0; i < normsRules.length; i++) {
                                if (normsRules[i].rulesequence > selectedItem.rulesequence) {
                                    normsRules[i].rulesequence = normsRules[i].rulesequence - 1;
                                }
                            }
                            $$('idNormsRules').clearAll();
                            $$('idNormsRules').parse(normsRules, "json");
                        }
                    } else {
                        webix.message("Please select an item");
                    }
                }
            },
            ]
        }]
    };

    let optionsCharacterisct = await App.api.ormDbFind('materialcharacteristic');
    optionsCharacterisct = optionsCharacterisct.data.map((item) => {
        return {
            id: item.idcharacteristic,
            value: item.idcharacteristic
        }
    });

    let crudNormRules = {
        view: "form",
        id: "formCrudNormRules",
        elements: [
            {
                view: "fieldset", label: i18n("Add new norm rule"), body: {
                    rows: [
                        {
                            cols: [
                                {
                                    options: optionsCharacterisct,
                                    view: "combo",
                                    label: i18n("idvariable"),
                                    name: "idvariable",
                                    labelPosition: "top",
                                },
                                {
                                    options: optionsCharacterisct,
                                    view: "combo",
                                    label: i18n("idfield"),
                                    name: "idfield",
                                    labelPosition: "top"
                                }
                            ]
                        },
                        {
                            cols: [
                                {
                                    view: "text",
                                    label: i18n("startrange"),
                                    name: "startrange",
                                    labelAlign: "left",
                                    labelPosition: "top",
                                    attributes:{ type:"number" }
                                },
                                {
                                    view: "text",
                                    label: i18n("endrange"),
                                    name: "endrange",
                                    labelPosition: "top",
                                    attributes:{ type:"number" }
                                },
                                {
                                    view: "text",
                                    label: i18n("mintolerance"),
                                    name: "mintolerance",
                                    labelPosition: "top",
                                    attributes:{ type:"number" }
                                },
                                {
                                    view: "text",
                                    label: i18n("maxtolerance"),
                                    name: "maxtolerance",
                                    labelPosition: "top",
                                    attributes:{ type:"number" }
                                },
                                {
                                    options: [
                                        "%",
                                        "mm",
                                        "kg"
                                    ],
                                    view: "combo",
                                    label: i18n("unit"),
                                    name: "idunit",
                                    labelPosition: "top"
                                }
                            ]
                        },
                        {
                            cols: [
                                {
                                    view: "button", type: "form", value: i18n("Add"), click: function () {
                                        let item = $$('formCrudNormRules').getValues();
                                        if (item.idvariable == "" || item.idfield == "" ||
                                            item.startrange == "" || item.endrange == "" ||
                                            item.mintolerance == "" || item.maxtolerance == "" ||
                                            item.idunit == "") {
                                            webix.message(i18n("All fields must be filled in"));
                                        } else {
                                            let normsRules = $$('idNormsRules').serialize();
                                            item.rulesequence = item.rulesequence ? item.rulesequence : (normsRules.length ? Math.max.apply(Math, normsRules.map(function (o) {
                                                return o.rulesequence;
                                            })) + 1 : 1);
                                            normsRules.push(item);

                                            $$('idNormsRules').clearAll();
                                            $$('idNormsRules').parse(normsRules, "json");
                                            $$('formCrudNormRules').clear();
                                        }

                                    }
                                }
                            ]
                        }
                    ]
                }
            }
        ]
    }

    let tableNormRules = {
        view: "datatable",
        id: "idNormsRules",
        height: 140,
        autoheight: false,
        columns: [
            {
                id: "rulesequence",
                header: i18n("rulesequence"),
                width: 70
            },
            {
                id: "idvariable",
                header: i18n("idvariable"),
                width: 180,
                format: (item) => {
                   let data = optionsCharacterisct.find((characteristc) => { return characteristc.id == item});
                   return data.value;
                }
            },
            {
                id: "idfield",
                header: i18n("idfield"),
                width: 180,
                format: (item) => {
                   let data = optionsCharacterisct.find((characteristc) => { return characteristc.id == item});
                   return data.value;
                }
            },
            {
                id: "startrange",
                header: i18n("startrange"),
                width: 80
            },
            {
                id: "endrange",
                header: i18n("endrange"),
                width: 80
            },
            {
                id: "mintolerance",
                header: i18n("mintolerance"),
                width: 80
            },
            {
                id: "maxtolerance",
                header: i18n("maxtolerance"),
                width: 80
            },
            {
                id: "idunit",
                header: i18n("idunit"),
                width: 80
            }
        ],
        autoheight: false,
        autowidth: false,
        select: "row"
    };

    let itens = [
        {
            cols: [
                new WebixInputText("id", i18n("Id")),
                new WebixInputSelect('type', i18n('Type'), optionsTypeNorm),
            ]
        },
        new WebixInputTextArea("normtext", i18n("NormText"), null, {
            height: 80
        }),
        crudNormRules,
        toolbar,
        tableNormRules
    ]

    let rules = {
        "id": webix.rules.isNotEmpty,
        "type": webix.rules.isNotEmpty,
        "normtext": webix.rules.isNotEmpty,
    }

    createFormCrud('Norm', dtNorm, itens, rules, 'norm', {
        "width": 880
    });
}

function createFormCrud(title, datatable, elements, rules, route, opts) {
    elements.push({
        cols: [
            {
                view: 'button',
                id: 'btnConfirm',
                value: i18n('Confirm'),
                click: async () => {
                    let ret = null;
                    let form = $$('frmCrud');

                    if (form.validate()) {
                        let itemId = form.elements['id'];
                        let values = form.getValues();

                        /**
                         * Verificando se id está habilitado se sim é porque está criando se não editando
                         */
                        if (itemId.isEnabled()) {
                            // Altera todos objetos adicionado o padrao de idnorm em cada um item
                            var rules = $$('idNormsRules').serialize().map(function (el) {
                                // Remove id padrao acrescentado pelo webix
                                delete el.id;
                                var o = Object.assign({}, el);
                                o.idnorm = values.id;
                                o.iduser = localStorage.getItem('login');
                                o.startrange = Number(o.startrange.replace(/,/g, "."));
                                o.endrange = Number(o.endrange.replace(/,/g, "."));
                                o.mintolerance = Number(o.mintolerance.replace(/,/g, "."));
                                o.maxtolerance = Number(o.maxtolerance.replace(/,/g, "."));
                                o.idvariable = (o.idvariable).toString();
                                o.idfield = (o.idfield).toString();
                                o.idunit = (o.idunit).toString();
                                return o;
                            });
                            values.normrules = rules;
                            values.iduser = localStorage.getItem('login');
                            ret = await App.api.createNorm(values);
                            if (ret.sucess)
                                webix.message(i18n('Item added successfully.'));
                            else
                                webix.message(i18n(ret.message));

                        } else {
                            var rules = $$('idNormsRules').serialize().map(function (el) {
                                // Remove id padrao acrescentado pelo webix
                                delete el.id;
                                var o = Object.assign({}, el);
                                o.idnorm = o.idnorm ? o.idnorm : values.id;
                                o.iduser = localStorage.getItem('login');
                                o.startrange = Number(o.startrange);
                                o.endrange = Number(o.endrange);
                                o.mintolerance = Number(o.mintolerance);
                                o.maxtolerance = Number(o.maxtolerance);
                                o.idvariable = (o.idvariable).toString();
                                o.idfield = (o.idfield).toString();
                                o.idunit = (o.idunit).toString();
                                return o;
                            });
                            values.normrules = rules;
                            values.iduser = localStorage.getItem('login')

                            // Fazer logica para update
                            ret = await App.api.updateNorm(values);
                            if (ret)
                                webix.message(i18n('Item updated successfully.'));
                        }
                    } else {
                        webix.message(i18n('Required fields are empty.'));
                        return;
                    }

                    if (ret) {
                        App.loadAllCrudData(route, datatable);
                        modal.close();
                    }
                }
            },
            {
                view: 'button',
                id: 'btnCancel',
                value: i18n('Cancel'),
                click: () => {
                    modal.close();
                }
            }
        ]
    });

    const frmCrud = {
        view: "form",
        id: "frmCrud",
        elements: elements,
        rules: rules
    };

    let modal = new WebixWindow({
        width: opts && opts.width ? opts.width : 600,
        height: 800
    });

    modal.body = frmCrud;
    modal.modal = true;
    modal.id = 'idModalNorm';

    createMenu(title, datatable, modal, route, opts)
    App.replaceMainContent(datatable, async () => App.loadAllCrudData(route, datatable));
}

/**
 * Cria o menu principal, juntamente com as funções respectivas.
 * @param {string} title 
 * @param {string} datatable 
 * @param {string} window 
 * @param {string} route 
 * @param {string} opts 
 */
function createMenu(title, datatable, window, route, opts) {
  
    let menu = WebixBuildReponsiveTopMenu(title, [{
        id: "btnAdd",
        icon: "fas fa-plus",
        label: i18n("Add"),
        click: async () => {
            window.show();
            window.setTitle(i18n('New Item'));
            let form = $$(window.body.id);
            let elements = Object.values(form.elements);
            //When the element has a primary key composed by two fields (id + sequence)
            for (let element of elements) {
                if (opts && opts.reload) {
                    if (element.config.name == 'sequenceView') {
                        $$(element.config.id).hide();
                    }
                }
            }
        }
    }, {
        id: "btnRemove",
        icon: "fas fa-trash-alt",
        label: i18n("Remove"),
        click: async () => {
            let grid = $$(datatable.id);
            let item = grid.getSelectedItem();
            if (item == null) {
                webix.message(i18n('An item must be selected'));
                return;
            } else {

                webix.confirm({
                    title: i18n("Do you want to delete this record?"),
                    ok: i18n("Yes! Remove"),
                    cancel: i18n("No! Cancel"),
                    text: `<strong> ${i18n("Norm")} nº </strong> ${item.id}`,
                    callback: async function (result) {
                        if (result) {
                            await App.api.ormDbDelete({"id": item.id}, 'norm');
                            $$('dtNorm').clearAll();
                            let allNorm = await App.api.ormDbFind('norm');
                            $$('dtNorm').parse(allNorm.data, "json");
                            webix.message(i18n('Item removed successfully'));
                        }
                    }
                });
                return;
            }
        }
    }, {
        id: "btnEnable",
        icon: "fas fa-check",
        label: i18n("Enable"),
        click: async () => {
            let grid = $$(datatable.id);
            let item = grid.getSelectedItem();

            if (item == null) {
                webix.message(i18n('An item must be selected'));
                return;
            } else {
                if (opts && opts.reload) {
                    await App.api.ormDbUpdate({
                        id: item.newId,
                        rulesequence: item.rulesequence
                    }, route, {
                            status: true
                        });
                } else {
                    await App.api.ormDbUpdate({
                        id: item.id
                    }, route, {
                            status: true
                        });
                }
                webix.message(i18n('Item enabled successfully'));
                if (opts && opts.reload) {
                    opts.reload();
                } else if (opts && opts.reloadDate) {
                    opts.reloadDate()
                } else {
                   // this.loadAllCrudData(route, datatable);
                   $$('dtNorm').clearAll();
                   let allNorm = await App.api.ormDbFind('norm');
                   $$('dtNorm').parse(allNorm.data, "json");
                }
            }
        }
    }, {
        id: "btnDisable",
        icon: "fas fa-minus",
        label: i18n("Disable"),
        click: async () => {
            let grid = $$(datatable.id);
            let item = grid.getSelectedItem();

            if (item == null) {
                webix.message(i18n('An item must be selected'));
                return;
            } else {
                if (opts && opts.reload) {
                    await App.api.ormDbUpdate({
                        id: item.newId,
                        rulesequence: item.rulesequence
                    }, route, {
                            status: false
                        });
                } else {
                    await App.api.ormDbUpdate({
                        id: item.id
                    }, route, {
                            status: false
                        });
                }
                webix.message(i18n('Item disabled successfully'));
                if (opts && opts.reload) {
                    opts.reload();
                } else if (opts && opts.reloadDate) {
                    opts.reloadDate()
                } else {
                   // this.loadAllCrudData(route, datatable);
                   $$('dtNorm').clearAll();
                   let allNorm = await App.api.ormDbFind('norm');
                   $$('dtNorm').parse(allNorm.data, "json");
                }
            }
        }
    }, {
        id: "btnEdit",
        icon: "fas fa-edit",
        label: i18n("Edit"),
        click: async () => {
            let grid = $$(datatable.id);
            let item = grid.getSelectedItem();
            if (item == null) {
                webix.message(i18n('An item must be selected'));
                return;
            } else {
                let allnormRules = await App.api.ormDbFind('normrule', { idnorm: item.id });

                window.show();
                window.setTitle(i18n('Edit Item'));

                $$('idNormsRules').clearAll();
                $$('idNormsRules').parse(allnormRules.data, "json");
                let form = $$(window.body.id);
                let elements = Object.values(form.elements);
                for (let element of elements) {
                    if (element != null) {
                        if (opts && opts.reload) {
                            if (element.config.name == 'id') {
                                $$(element.config.id).setValue(item.newId);
                                $$(element.config.id).disable();
                            }
                        } else {
                            if (element.config.name in item) {
                                $$(element.config.id).setValue(item[element.config.name]);
                                if (element.config.name == 'id') {
                                    $$(element.config.id).disable();
                                }
                            }
                        }

                    }
                }
            }
        }
    }, {
        id: "btnExport",
        icon: "fas fa-file-pdf",
        label: i18n("Export"),
        click: async () => {
            let grid = $$(datatable.id);
            let dateString = Date();
            webix.toPDF(grid, {
                filename: i18n("Norm") +" "+ dateString,
                orientation:"portrait",
                autowidth:true
            });
        }
    }]);

    App.replaceMainMenu(menu);
}