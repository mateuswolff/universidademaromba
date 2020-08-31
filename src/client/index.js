import { App } from "./lib/App.js";
//import "./lib/packages/devutils.js";
import "./lib/packages/dashboard.js";
//import "./lib/packages/security.js";
//import "./lib/packages/i18n.js";
import * as redirect from "./control/redirectScreens.js";


App.addSimpleItem("", "Clientes", "cadastro.clientes");
App.on("cadastro.clientes", redirect.redirectCadastroClientes);

App.addSimpleItem("", "Instrutores", "cadastro.instrutores");
App.on("cadastro.instrutores", redirect.redirectCadastroInstrutores);

App.addSimpleItem("", "Avaliações", "cadastro.avaliações");
// App.on("cadastro.clientes", redirect.redirectCadastroClientes);

App.addSimpleItem("", "Aulas", "cadastro.aulas");
// App.on("cadastro.clientes", redirect.redirectCadastroClientes);

App.addSimpleItem("", "Financeiro", "cadastro.financeiro");
// App.on("cadastro.clientes", redirect.redirectCadastroClientes);

App.addSimpleItem("", "Relatórios", "relatorios");
App.addSimpleItem("relatorios", "Matriculados", "relatorios.matriculados");
App.addSimpleItem("relatorios", "Inadimplentes", "relatorios.inadimplentes");
App.on("relatorios.inadimplentes", redirect.redirectRelatoriosInadimplentes);

App.addSimpleItem("", "Usuários", "cadastro.usuarios");
// App.on("cadastro.clientes", redirect.redirectCadastroClientes);

//#endregion