import { checkClientPermission } from "../control/permission.js";

var dates = [];
let _idLoopSyncData;
async function finishLoopSyncData(event) {
    clearInterval(_idLoopSyncData);
};

// SETTINGS
export async function redirectSettings(event) { }

import * as screenCadastroClientes from "../components/screenCadastroClientes.js";
import * as screenCadastroInstrutores from "../components/screenCadastroInstrutores.js";
import * as screenRelatoriosInadimplentes from "../components/screenRelatoriosInadimplentes.js";


export async function redirectCadastroClientes(event) {
    finishLoopSyncData();
    await screenCadastroClientes.showScreen(event);
}

export async function redirectCadastroInstrutores(event) {
    finishLoopSyncData();
    await screenCadastroInstrutores.showScreen(event);
}

export async function redirectRelatoriosInadimplentes(event) {
    finishLoopSyncData();
    await screenRelatoriosInadimplentes.showScreen(event);
}


//#region DASHBOARDS
import * as screenDashboardList from "../components/screenDashboardList.js";

export async function redirectDashboardList(event) {
    finishLoopSyncData();
    await screenDashboardList.showScreen(event);
    checkClientPermission(event);
}
//#endregion

export async function redirectCreatePassword(event) {
    finishLoopSyncData();
    createPassword.showScreen(event);
}