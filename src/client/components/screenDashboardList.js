import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputText, WebixInputSelect, WebixInputNumber, WebixInputDate } from "../lib/WebixWrapper.js";
import { optionsStatus } from "./optionsScreens.js";
import * as util from "../lib/Util.js";

export async function showScreen() {

    let dtClientes = new WebixCrudDatatable("dtClientes");

    dtClientes.columns = [
        { id: "id", header: [i18n("Matrícula"), { content: "textFilter" }], width: 100, sort: "string" },
        { id: "nome", header: [i18n("Nome"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "celular", header: [i18n("Celular"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "email", header: [i18n("Email"), { content: "textFilter" }], sort: "string", fillspace: true },
        { id: "datanascimento", header: [i18n("Aniversário"), { content: "textFilter" }], sort: "string", fillspace: true, template: (obj) => {
            return moment(obj.datanascimento).format("DD/MM"); 
        } },
        
    ];


    let itens = [
        { 
            cols: [
                new WebixInputText("id", "Matrícula", { disabled: true, width: 100 }),
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
                new WebixInputNumber("cep", "CEP"),
                new WebixInputText("logradouro", "Logradouro"),
                new WebixInputNumber("numero", "Número", {width: 130}),
                new WebixInputText("complemento", "Complemento"),
            ]
        },
        { 
            cols: [
                new WebixInputText("bairro", "Bairro"),
                new WebixInputText("cidade", "Cidade")
            ]
        },
         { 
            cols: [
                new WebixInputNumber("telefone", "telefone"),
                new WebixInputNumber("celular", "celular"),
                new WebixInputText("email", "email"),
            ]
        },

    ];

    let rules = {
        
        "nome": webix.rules.isNotEmpty,
        "datanascimento": webix.rules.isNotEmpty,
        "rg": webix.rules.isNotEmpty,
        "cpf": webix.rules.isNotEmpty,
        "cep": webix.rules.isNotEmpty,
        "logradouro": webix.rules.isNotEmpty,
        "numero": webix.rules.isNotEmpty,
        "bairro": webix.rules.isNotEmpty,
        "cidade": webix.rules.isNotEmpty,
        "celular": webix.rules.isNotEmpty,
        "email": webix.rules.isNotEmpty,
    };

    App.createDefaultFormCrud('Clientes', dtClientes, itens, rules, 'clientes');
    App.replaceMainContent(dtClientes, async () => App.loadAllCrudData('clientes', dtClientes));
}