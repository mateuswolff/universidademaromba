import { App } from "../App.js";
import * as redirect from "../../control/redirectScreens.js";
import { checkClientPermission } from "../../control/permission.js";

//#region Dashboard
App.addSimpleItem("", "Dashboards", "dashboard.list");
App.on("dashboard.list", redirect.redirectDashboardList);
checkClientPermission("dashboard.list");
//#endregion