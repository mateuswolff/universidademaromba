import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputText, WebixWindow, WebixInputNumber, WebixInputDate, WebixInputMultiSelect } from "../lib/WebixWrapper.js";
import { optionsStatus } from "./optionsScreens.js";
import * as util from "../lib/Util.js";

export async function showScreen() {

    let dtInstrutores = new WebixCrudDatatable("dtInstrutores");

    dtInstrutores.columns = [
        { id: "id", header: [i18n("ID"), { content: "textFilter" }], width: 100, sort: "string" },
        { id: "nome", header: [i18n("Nome"), { content: "textFilter" }], sort: "string", fillspace: true },
        {
            id: "datanascimento", header: [i18n("Aniversário"), { content: "textFilter" }], sort: "date", fillspace: true, template: (obj) => {
                return moment(obj.datanascimento).format("DD/MM"); 
            }
        },
        { id: "email", header: [i18n("Email"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "aulas", header: [i18n("Atividades Lecionadas"), { content: "textFilter" }], sort: "string", fillspace: true },

    ];


    let itens = [
        {
            cols: [
                new WebixInputText("id", "ID", { disabled: true, width: 100 }),
                new WebixInputText("nome", "Nome")
            ]
        },
        {
            cols: [
                new WebixInputDate("datanascimento", "Data de Nascimento"),
                new WebixInputNumber("rg", "RG"),
                new WebixInputNumber("cpf", "CPF"),
            ]
        },
        {
            cols: [
                new WebixInputNumber("telefone", "telefone"),
                new WebixInputNumber("celular", "celular"),
                new WebixInputText("email", "email"),
            ]
        },
        new WebixInputMultiSelect("aulas", i18n("Tipo de Aulas lecionadas"), [{ "id": "Individual", "value": "Individual" }, { "id": "Grupo", "value": "Grupo" }], {
            template: function (obj) {
                return obj.value;
            }
        }),

    ];

    let rules = {

        "nome": webix.rules.isNotEmpty,
        "datanascimento": webix.rules.isNotEmpty,
        "rg": webix.rules.isNotEmpty,
        "cpf": webix.rules.isNotEmpty,
        "celular": webix.rules.isNotEmpty,
        "email": webix.rules.isNotEmpty,
    };

    createDefaultFormCrud('Instrutores', dtInstrutores, itens, rules, 'usuario');
    App.replaceMainContent(dtInstrutores, async () => loadAllCrudData('usuario', dtInstrutores));
}

function createDefaultFormCrud(title, datatable, elements, rules, route, opts) {
    elements.push({
        cols: [
            {
                view: 'button',
                id: 'btnCancel',
                value: i18n('CANCELAR'),
                click: () => {
                    modal.close();
                }
            },
            {
                view: 'button',
                id: 'btnConfirm',
                value: i18n('SALVAR'),
                click: async () => {

                    let enabled = true;

                    let form = $$('frmCrud');
                    let itemId = form.elements['id'];
                    let values = App.prepareObjectToSaveOrUpdate(form.getValues());

                    await editData(title, datatable, elements, rules, route, opts, modal);

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
        width: opts && opts.width ? opts.width : 600
    });

    modal.body = frmCrud;
    modal.modal = true;

    let menu = App.createSimpleCrudMenu(title, datatable, modal, route, opts);
    App.replaceMainMenu(menu);
}

async function editData(title, datatable, elements, rules, route, opts, modal) {

    let ret = null;
    let form = $$('frmCrud');

    if (form.validate()) {

        let itemId = form.elements['id'];

        let values = App.prepareObjectToSaveOrUpdate(form.getValues());

        values.status = true;


        if (itemId && itemId.isEnabled() || !values.id) {

            ret = await App.api.ormDbCreate(route, values);

            if (ret.success) {

                if (values.aulas != "") {
                    let tipos = values.aulas.split(",");

                    for (let tipo of tipos) {
                        let aula = {
                            idusuario: ret.data.id,
                            tipo: tipo
                        }

                        await App.api.ormDbCreate('aula', aula);
                    }
                }

                webix.message(i18n('Item added successfully.'));
                modal.close();
            } else {
                webix.message(i18n('Item is already registered.'));
            }

        } else {

            ret = await App.api.ormDbUpdate({
                "id": itemId.getValue()
            }, route, values);
            if (ret.success) {
                webix.message(i18n('Item edited successfully.'));
                modal.close();
            }

        }

        if (ret.code == 200) {
            if (opts && opts.reload)
                opts.reload();
            else if (opts && opts.reloadDate)
                opts.reloadDate()
            else
                loadAllCrudData(route, datatable);
        }

    } else {
        webix.message(i18n('Required fields are empty or invalid.'));
        return;
    }

}

async function loadAllCrudData(route, datatable, ORDER = { "colum": 'id', "sort": 'ASC' }) {
    let data = await App.api.ormDbFind(route);

    function isLetter(c) {
        return c.toLowerCase() != c.toUpperCase();
    }

    function NumeroFloat(d) {
        if (d) {
            if (isLetter(d.toString())) {
                return parseFloat(d.toUpperCase().charCodeAt());
            } else {
                return parseFloat(d);
            }
        }
    }

    if (ORDER && ORDER.sort == 'ASC') {
        if (data) {
            data.data.sort(function (a, b) { return NumeroFloat(a[ORDER.colum]) - NumeroFloat(b[ORDER.colum]) });
        }
        //data.data.sort(function (a, b) { return NumeroFloat(a[ORDER.colum]) - NumeroFloat(b[ORDER.colum]) });
    } else if (ORDER && ORDER.sort == 'DESC') {
        if (data) {
            data.data.sort(function (a, b) { return NumeroFloat(b[ORDER.colum]) - NumeroFloat(a[ORDER.colum]) });
        }
    }


    if (data.code == 200) {
        let dtTable = $$(datatable.id);
        if (dtTable) {

            let instrutores = data.data

            for (let item of instrutores) {
                let aulas = await App.api.ormDbFind('aula', { idusuario: item.id })
                item.aulas = [];

                if (aulas && aulas.data.length) {
                    for (let aula of aulas.data) {
                        item.aulas.push(aula.tipo);
                    }
                }
            }

            console.log(instrutores)


            dtTable.clearAll();
            dtTable.parse(instrutores, "json");
        }
    }
}