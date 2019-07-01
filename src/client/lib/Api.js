import { createCookie, loading } from './Util.js';
import { i18n } from "./I18n.js";
import { App } from "./App.js";
import { ls } from "./LocalStorage.js";
export class API {
    constructor() {
        this.server = window.location.href;
    }

    async $invokeRouteGet(method, route) {

        await loading("block");

        let txt = "NOT INITIALIZED YET";

        try {
            let ret = await fetch('/api/' + route, {
                method: method,
                mode: "cors",
                cache: "no-cache",
                credentials: "same-origin",
                redirect: "follow",
                referrer: "no-referrer"
            });

            txt = await ret.text();

            await loading("none");
            return JSON.parse(txt);

        } catch (e) {
            App.emit("error", e);

            console.error("METHOD:" + method);
            console.error("JSON IS:" + txt);
            console.error(e);

            await loading("none");
            return {
                status: "error",
                type: "client",
                text: txt
            };
        }

    }

    async $invokeRoute(method, route, args) {

        await loading("block");
        let txt = "NOT INITIALIZED YET";

        try {
            let ret = await fetch('/api/' + route, {
                method: method,
                mode: "cors",
                cache: "no-cache",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
                redirect: "follow",
                referrer: "no-referrer",
                body: JSON.stringify(args),
            });
            txt = await ret.text();

            await loading("none");
            return JSON.parse(txt);

        } catch (e) {
            App.emit("error", e);

            console.error("METHOD:" + method);
            console.error("ARGS:" + JSON.stringify(args));
            console.error("JSON IS:" + txt);
            console.error(e);

            await loading("none");
            return {
                status: "error",
                type: "client",
                text: txt
            };
        }
    }

    async $invoke(method, args, transform = true) {

        await loading("block");
        let argsarr = [];
        let txt = "NOT INITIALIZED YET";
        if (transform) {
            for (let k in args) {
                argsarr.push(args[k]);
            }
        }
        try {
            let ret = await fetch('/api/' + method, {
                method: "POST",
                mode: "cors",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
                redirect: "follow",
                referrer: "no-referrer",
                body: transform ? JSON.stringify(argsarr) : JSON.stringify(args),
            });
            txt = await ret.text();
            await loading("none");
            return JSON.parse(txt);
        } catch (e) {
            App.emit("error", e);
            console.error("METHOD:" + method);
            console.error("ARGS:" + JSON.stringify(args));
            console.error("JSON IS:" + txt);
            console.error(e);
            await loading("none");
            return {
                status: "error",
                type: "client",
                text: txt
            };
        }
    }

    async config() {
        let l = ls;
        try {
            let ret = await this.$invoke('config', arguments);
            l.setObj("config", ret);
            return ret;
        } catch (e) {
            console.error(e);
            return l.getObj("config", {});
        }
    }

    async login(login, password) {
        let ret = (await this.$invoke('login', arguments));
        if (ret.success === true) {
            createCookie('X-SESSION', ret.data.key, 9999);
            ls.set("isloggedin", "true");
        }
        return ret;
    }

    async logout(sessionkey) {
        createCookie('X-SESSION', 'N/A', -1);
        return this.$invoke('logout', arguments);
    }

    async isloggedin() {
        try {
            let ret = await this.$invoke('isloggedin', arguments);
            if (ret && ret.status == 'ok')
                return true;
            return false;
        } catch (e) {
            return false;
        }
    }

    async getPermission() {
        return await this.$invoke("getPermission", arguments);
    }

    async getAvailablePermissions() {
        return await this.$invoke("getAvailablePermissions", arguments);
    }

    async changeUserPassword(user, pass) {
        return await this.$invoke("changeUserPassword", arguments);
    }

    async killSessions(user) {
        return await this.$invoke("killSessions", arguments);
    }

    async i18n(msg, locale = navigator.languages[0]) {
        let ret = await this.$invoke('i18n', arguments);
    }

    async notifyI18n(k, lang) {
        return this.$invoke("notifyI18n", arguments);
    }

    async loadI18nBundle(since, lang) {
        return this.$invoke("loadI18nBundle", arguments);
    }

    async registerFCMEndpoint(ep) {
        return this.$invoke('registerFCMEndpoint', arguments);
    }

    async unRegisterFCMEndpoint(ep) {
        return this.$invoke('unRegisterFCMEndpoint', arguments);
    }

    async getCacheConfig() {
        return this.$invoke('getCacheConfig', arguments);
    }

    async sendNotification(to, msg) {
        return this.$invoke('sendNotification', arguments);
    }

    async createNorm(params) {
        return this.$invoke('createNorm', params, false);
    }

    async updateNorm(params) {
        return this.$invoke('updateNorm', params, false);
    }

    async ormDbMaterialLot(filter = null) {
        let route = 'materialLot';
        return this.$invokeRoute('POST', route, filter);
    }

    async ormDbWeightOP(filter = null) {
        let route = 'weightOP' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbWeightScrap(filter = null) {
        let route = 'weightScrap' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbLotsGeneratedPerOrder(params = null) {
        let route = 'lotsGeneratedPerOrder';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbKpiYield(filter = null) {
        let route = 'kpiYield' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbFind(model, filter = null, select = null) {
        let route = 'find/' + model + (filter ? '?where=' + JSON.stringify(filter) : '') + (select ? '&select=' + select : '');
        return this.$invokeRoute('GET', route);
    }

    async ormDbHardness(filter = null) {
        let route = 'hardness' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }
    
    async ormDbFindAssociate(model, filter = null) {
        let route = 'findAssociate/' + model + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('GET', route);
    }

    async ormDbLoginShifts() {
        return await this.$invoke("loginShifts", arguments);
    }

    async ormDbDimensionalcontrollink(filter = null) {
        let route = 'dimensionalcontrollink' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbReturnColunsHeader(filter = null) {
        let route = 'returnColunsHeader' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbReturnColunsData(filter = null) {
        let route = 'returnColunsData' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    /* REPORT RNC */
    async ormDbGraphsRNC(filter = null) {
        let route = 'graphsRNC' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbPackagesProduceCutting(params) {
        let route = 'packagesProduceCutting';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbUnlinkDefectEquipment(params) {
        let route = 'unlinkDefectEquipment';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbLinkDefectEquipment(params) {
        let route = 'linkDefectEquipment';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbLinkStopEquipment(params) {
        let route = 'linkStopEquipment';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbUnlinkStopEquipment(params) {
        let route = 'unlinkStopEquipment';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbLinkScrapEquipment(params) {
        let route = 'linkScrapEquipment';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbUnlinkScrapEquipment(params) {
        let route = 'unlinkScrapEquipment';
        return this.$invokeRoute('POST', route, params);
    }
    //----------------
    async ormDbScrapReasonByEquipment(params) {
        let route = 'scrapReasonByEquipment';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbDefectTypeByEquipment(params) {
        let route = 'defectTypeByEquipment';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbStopReasonByEquipment(params) {
        let route = 'stopReasonByEquipment';
        return this.$invokeRoute('POST', route, params);
    }
    //---------
    async ormDbPackagesToBeGenerated(params) {
        let route = 'packagesToBeGenerated';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbPackagesToBeGeneratedCoilCutting(params) {
        let route = 'packagesToBeGeneratedCoilCutting';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbGetAllTypesOfSteels() {
        let route = 'typesOfSteels';
        return this.$invokeRoute('POST', route);
    }

    async ormDbGraphsRNCShifts(filter = null) {
        let route = 'graphsRNCShifts' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbReportRNC(filter = null) {
        let route = 'reportRNC' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    /* REPORT SHIFTS */
    async ormDbGraphsShifts(filter = null) {
        let route = 'graphsShifts' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbReportShifts(filter = null) {
        let route = 'reportShifts' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    /* REPORT STOPS */
    async ormDbGraphsStops(filter = null) {
        let route = 'graphsStops' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbReportStops(filter = null) {
        let route = 'reportStops' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }


    async ormDbFindLots(filter = null) {
        let route = 'findLots';
        return this.$invokeRoute('POST', route);
    }

    async ormDbLotSequence(filter = null) {
        let route = 'lotSequence';
        return this.$invokeRoute('POST', route);
    }

    async ormDbInterfaceSequence(filter = null) {
        let route = 'interfaceSequence';
        return this.$invokeRoute('POST', route);
    }

    async ormDbSumTubesWithOrderAndEquipment(filter = null) {
        let route = 'sumTubesWithOrderAndEquipment';
        return this.$invokeRoute('POST', route, filter);
    }

    async ormDbOrderAllocation(params) {
        let route = 'OrderAllocation';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbLotChangeLot(obj = null) {
        let route = 'lotChangeLocal';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbLotConsumedPerLotGenerate(obj = null) {
        let route = 'lotConsumedPerLotGenerate';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbLastStopEquipment(model, filter = null) {
        let route = 'lastStopEquipment' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbTubesProductionSystem(filter = null) {
        let route = 'tubesProductionSystem' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbTubesLotSystem(filter = null) {
        let route = 'tubesLotSystem' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDborderNorm(filter = null) {
        let route = 'orderNorm' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbAllStopEquipment(filter = null) {
        let route = 'allStopEquipment' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbAllSearchRNC(filter = null) {
        let route = 'allSearchRNC' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('GET', route);
    }

    async ormDbCountEmergency(filter = null) {
        let route = 'countEmergency' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbSum(model, select, filter = null) {
        let route = 'sum/' + model + '?' + (select ? 'select=' + select : '') + (filter ? '&where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('GET', route);
    }

    async ormDbSumPiciesLotGenereted(params) {
        let route = 'sumPiciesLotGenereted';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbFindOne(model, filter = null) {
        let route = 'findOne/' + model + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('GET', route);
    }

    async ormDbAllocatedRawMaterial(filter = null) {
        let route = 'allocatedRawMaterial' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return await this.$invokeRoute('POST', route);
    }

    async  ormDbTubesCuttingPlan(filter = null) {
        let route = 'tubesCuttingPlan' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbCalcPlannedHours(filter = null) {
        let route = 'calcPlannedHours' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbCreateScondaryLot(obj = null) {
        let route = 'createScondaryLot';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbCreateLotCoil(obj = null) {
        let route = 'createLotCoil';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbUpdateCollect(obj = null) {
        let route = 'updateCollect';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbFindMyShift(obj = null) {
        let route = 'findMyShift';
        return this.$invokeRoute('POST', route);
    }

    async ormDbFindAllDimensionalItem(obj = null) {
        let route = 'findAllDimensionalItem';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbFindAllCoilCutPlanByEquip(obj = null) {
        let route = 'findAllCoilCutPlanByEquip';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbFindAllCoilCutPlanById(obj = null) {
        let route = 'findAllCoilCutPlanById';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbFindCoilCutPlan(obj = null) {
        let route = 'findCoilCutPlan';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbFindOrderAllocationCoilCutPlan(obj = null) {
        let route = 'findOrderAllocationCoilCutPlan';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbFindSmallerMaterial(obj = null) {
        let route = 'smallerMaterial';
        return this.$invokeRoute('POST', route, obj);
    }

    async  ormDbMovementEquipment(filter = null) {
        let route = 'movementEquipment' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async  ormDbMovementDeposit(filter = null) {
        let route = 'movementDeposit' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async  ormDbLotChange(filter = null) {
        let route = 'lotChange' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async  ormDbPendencyTypes(filter = null) {
        let route = 'pendencyTypes' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async  ormDbScrapSequence(filter = null) {
        let route = 'scrapSequence' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async  ormDbMaxSequenceOrder(filter = null) {
        let route = 'maxSequenceOrder' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbRawMaterial(filter = null) {
        let route = 'rawmaterial' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }
    async ormDbSearchRawMaterial(filter = null) {
        let route = 'searchRawMaterial' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbLastAdd(model, select, filter = null) {
        let route = 'lastAdd/' + model + '?' + (select ? 'select=' + select : '') + (filter ? '&where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('GET', route);
    }

    async ormDbEddyCurrent(filter = null) {
        let route = 'eddyCurrent' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbUpdateEquipment(body) {
        let route = 'changeEquipment';
        return this.$invokeRoute('POST', route, body);
    }

    async ormDbLotAllocation(filter = null) {
        let route = 'lotAllocation' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbLotscheduledOrders(filter = null) {
        let route = 'scheduledOrders' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbGetOrder(filter = null) {
        let route = 'getOrder' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbGetOrderScheduled(filter = null) {
        let route = 'getOrderScheduled' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbAllOrderScheduled(filter = null) {
        let route = 'allOrderScheduled' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbPlaySchedulling(filter = null) {
        let route = 'playSchedulling' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }
    
    async ormDbProgramOrderByEquipmentAndSituation(params) {
        let route = 'programOrderByEquipmentAndSituation';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbAllOrderExpected(filter = null) {
        let route = 'allOrderExpected' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbDefaultRawMaterialAllocation(filter = null) {
        let route = 'rawDefaultMaterialAllocation' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbRawMaterialAllocation(filter = null) {
        let route = 'rawMaterialAllocation' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    //MATRIXSETUP
    async ormDbFindMatrix(filter = null) {
        let route = 'matrix' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    //LOTSPENDING
    async ormDbFindLotsPending(filter = null) {
        let route = 'lotsPending' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    /* DETALHES DO LOTE */
    async ormDbAllDetailsLots(filter = null) {
        let route = 'AllDetailsLots' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    /* DETALHES DO LOTE */
    async ormDbGetDetailsLotConsumed(params) {
        let route = 'getDetailsLotConsumed';
        return this.$invokeRoute('POST', route, params);
    }


    /* DETALHES DO LOTE */
    async ormDbGetDetailsLotGenerated(params) {
        let route = 'getDetailsLotGenerated';
        return this.$invokeRoute('POST', route, params);
    }

    /* DETALHES DO LOTE */
    async ormDbGetAllOrder(params) {
        let route = 'getAllOrder';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbReportSetup(params) {
        let route = 'reportSetup'
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbLastLotReadInOrder(params) {
        let route = 'lastLotReadInOrder';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbEquipmentPrinter(params) {
        let route = 'equipmentPrinter';
        return this.$invokeRoute('POST', route, params);
    }

    // LOTSDETAILSEQUIP
    async ormDbGetDetailsLotsEquip(filter = null) {
        let route = 'getDetailsLotsEquip';
        return this.$invokeRoute('POST', route, filter);
    }

    // LOTSDETAILSLOTS
    async ormDbGetDetailsLotsLot(filter = null) {
        let route = 'getDetailsLotsLot';
        return this.$invokeRoute('POST', route, filter);
    }

    // LOTSDETAILSMATERIAL
    async ormDbGetDetailsLotsMaterial(filter = null) {
        let route = 'getDetailsLotsMaterial';
        return this.$invokeRoute('POST', route, filter);
    }

    //LOTSDETAILSORDER
    async ormDbGetDetailsLotsOrder(filter = null) {
        let route = 'getDetailsLotsOrder';
        return this.$invokeRoute('POST', route, filter);
    }


    //LOTSDETAILSUPDATE
    async ormDbUpdateLocalsWeightPieces(params) {
        let route = 'updateLocalsWeightPieces';
        return this.$invokeRoute('POST', route, params);
    }

    //GETGENEALOGY
    async ormDbGetGenealogyGenerated(params) {
        let route = 'getGenealogyGenerated';
        return this.$invokeRoute('POST', route, params);
    }
    async ormDbGetGenealogyConsumed(params) {
        let route = 'getGenealogyConsumed';
        return this.$invokeRoute('POST', route, params);
    }

    //GETLOTSIDRUN
    async ormDbGetLotIdRun(filter = null) {
        let route = 'getLotIdRun' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    //EQUIPMENT LINK
    async ormDbEquipmentLink(filter = null) {
        let route = 'equipmentLink' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    //GETQRCODE
    async ormDbLotDetails(filter = null) {
        let route = 'lotDetails' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    //saveUpdateReceived
    async ormDbSaveUpdateReceived(filter = null, params) {
        let route = 'saveAndUpdateAndReceived' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route, params);
    }

    //saveUpdate POOL Received
    async ormDbSaveUpdatePoolReceived(array = null) {
        let route = 'saveUpdatePoolReceived';
        return this.$invokeRoute('POST', route, { data: array });
    }

    async ormDbUnlinkedMaterial(filter = null) {
        let route = 'unlinkedmaterial' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbFindDefectTypeByOrder(filter = null) {
        let route = 'defectTypeByOrder' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbproductivityperequipment(filter = null) {
        let route = 'productivityperequipment' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbProductivityMaterialEquipment(filter = null) {
        let route = 'productivityMaterialEquipment' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbProductivityMaterial(filter = null) {
        let route = 'productivityMaterial' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbProductivityMaterialDelete(filter = null) {
        let route = 'productivityMaterialDelete' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbProductivityMaterialUpdated(filter = null) {
        let route = 'productivityMaterialUpdate' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbPrint(params) {
        params = this.generateLabelPrinter(params);
        let route = 'print';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbTechnicalSheet(filter = null) {
        let route = 'technicalSheet';
        return this.$invokeRoute('POST', route, filter);
    }

    async ormDbLinkedChecklistItem(filter = null) {
        let route = 'linkedChecklistItem' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbUnlinkedChecklistItem(filter = null) {
        let route = 'unlinkedChecklistItem' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbLinkedStep(filter = null) {
        let route = 'linkedStep' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbLinkedStepByOrder(filter = null) {
        let route = 'linkedStepByOrder' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbUnlinkedStep(filter = null) {
        let route = 'unlinkedStep' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbFindStepPieces(filter = null) {
        let route = 'findStepPieces' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbFindPackedPieces(filter = null) {
        let route = 'findPackedPieces' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbFinishBigMakerOrder(filter = null) {
        let route = 'finishBigMakerOrder' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbCreateStepPieces(obj = null) {
        let route = 'createStepPieces';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbReorganizeStepEquipment(filter = null) {
        let route = 'reorganizeStepEquipment' + (filter ? '?where=' + JSON.stringify(filter) : '');;
        return this.$invokeRoute('POST', route);
    }

    async ormDbSaveChecklistItemResult(array = null) {
        let route = 'saveChecklistItemResult';
        return this.$invokeRoute('POST', route, { checklistitemresult: array });
    }

    async ormDbUpdateChecklistItemResult(array = null) {
        let route = 'updateChecklistItemResult';
        return this.$invokeRoute('POST', route, { updated: array });
    }

    async ormDbFindTransportResourceByLocal(obj = null) {
        let route = 'findTransportResourceByLocal';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbFindResourceTypeByEquipmemt(obj = null) {
        let route = 'findResourceTypeByEquipmemt';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbFindAllResourcetypeEquipmentLink(obj = null) {
        let route = 'findAllResourcetypeEquipmentLink';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbFindAllTransportResourceLocalLink(obj = null) {
        let route = 'findAllTransportResourceLocalLink';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbLinkedReworkItem(filter = null) {
        let route = 'linkedReworkItem' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbUnlinkedReworkItem(filter = null) {
        let route = 'unlinkedReworkItem' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbReworkTypesItems(filter = null) {
        let route = 'reworkTypesItems' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbLotFields(filter = null) {
        let route = 'lotFields';
        return this.$invokeRoute('POST', route, filter);
    }

    async ormDbPendencyFields(filter = null) {
        let route = 'pendencyFields' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbDefectFields(filter = null) {
        let route = 'defectFields' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbMaterialSameSteel(filter = null) {
        let route = 'materialSameSteel';
        return this.$invokeRoute('POST', route, filter);
    }

    async ormDbSaveAllocation(params) {
        let route = 'saveAllocation';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbSaveDimensionalControl(array = null) {
        let route = 'saveDimensionalControl';
        return this.$invokeRoute('POST', route, { itens: array });
    }

    async ormDbUpdateDimensionalControl(array = null) {
        let route = 'updateDimensionalControl';
        return this.$invokeRoute('POST', route, { itens: array });
    }

    async ormDbCreatePendency(obj = null) {
        let route = 'createPendency';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbScrapLot(obj = null) {
        let route = 'scrapLot';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbPendencyRelease(obj = null) {
        let route = 'pendencyrelease';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbReworkTypes(obj = null) {
        let route = 'reworkTypes';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbFindAllReworkNotCollected() {
        let route = 'findAllReworkNotCollected';
        return this.$invokeRoute('POST', route);
    }
    async ormDbFindAllReworkCollected() {
        let route = 'findAllReworkCollected';
        return this.$invokeRoute('POST', route);
    }

    async ormDbFindAllReworkItemByKey(params) {
        let route = 'findAllReworkItemByKey';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbFindAllReworkOrder() {
        let route = 'findAllReworkOrder';
        return this.$invokeRoute('POST', route);
    }

    async ormDbAssociateOrderRework(obj = null) {
        let route = 'associateOrderRework';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbGenerateLotRework(obj = null) {
        let route = 'generateLotRework';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbOrderRelationships(filter = null) {
        let route = 'orderRelationships' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbCreateLot(obj = null) {
        let route = 'createLotAndGenerateProperty';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbCreateBigMakerLot(obj = null) {
        let route = 'createBigMakerLot';
        return this.$invokeRoute('POST', route, obj);
    }

    async ormDbGetAllocation(filter = null) {
        let route = 'getAllocation';
        return this.$invokeRoute('POST', route, filter);
    }

    async ormDbGetStandardPackage(filter = null) {
        let route = 'getStandardPackage';
        return this.$invokeRoute('POST', route, filter);
    }

    async ormDbGetRulesByMaterial(params = null) {
        let route = 'getRulesByMaterial';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbCreate(model, params) {
        let route = 'create/' + model;
        params.iduser = localStorage.getItem('login');
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbUpdate(filter, model, params) {
        let route = 'update/' + model + '?where=' + JSON.stringify(filter);
        params.iduser = localStorage.getItem('login');
        return this.$invokeRoute('PUT', route, params);
    }

    async ormDbDelete(filter, model) {
        let route = 'delete/' + model;
        return this.$invokeRoute('DELETE', route, filter);
    }

    // RELATORIOS ROTA 
    async ormDbAllStops(filter = null) {
        let route = 'AllStops' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbAllInterface(filter = null) {
        let route = 'AllInterface' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbSortOrders(params = null) {
        let route = 'sortOrders';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbAllScraps(filter = null) {
        let route = 'AllScraps' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async ormDbAllMetallography(filter = null) {
        let route = 'AllMetallography' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async getAvaliableLotsToCutPlan() {
        return this.$invoke("getAvaliableLotsToCutPlan", arguments);
    }
    async getLotsCuttingPlan() {
        return this.$invoke("getLotsCuttingPlan", arguments);
    }
    
    async getMaterialsByCharacteristics() {
        return this.$invoke("getMaterialsByCharacteristics", arguments);
    }

    async calcBestYield() {
        return this.$invoke("calcBestYield", arguments);
    }

    async createCoilCutPlan() {
        return this.$invoke("createCoilCutPlan", arguments);
    }

    async deleteCoilCutPlan() {
        return this.$invoke("deleteCoilCutPlan", arguments);
    }

    async DefectInLot(model, filter = null) {
        let route = 'DefectInLot' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async getEquipmentSituation() {
        return this.$invokeRoute("POST", "getEquipmentSituation", arguments);
        // return this.$invoke("getEquipmentSituation", arguments);
    }

    async getEquipmentDetail() {
        return this.$invoke("getEquipmentDetail", arguments);
    }

    async getTotalStopsByType() {
        return this.$invoke("getTotalStopsByType", arguments);
    }

    async getOrdersByCharacteristics() {
        return this.$invoke("getOrdersByCharacteristics", arguments);
    }

    async getCharacteriscsByMaterial() {
        return this.$invoke("getCharacteriscsByMaterial", arguments);
    }

    async getCharacteriscsByLot() {
        return this.$invoke("getCharacteriscsByLot", arguments);
    }

    async getWeightConsumed() {
        return this.$invoke("getWeightConsumed", arguments);
    }

    async getWeightConsumedLots(params = null) {
        let route = 'getWeightConsumedLots';
        return this.$invokeRoute('POST', route, params);
    }

    async getWeightConsumedLotsSec(params = null) {
        let route = 'getWeightConsumedLotsSec';
        return this.$invokeRoute('POST', route, params);
    }

    async listCoilCutPlan() {
        return this.$invoke("listCoilCutPlan", arguments);
    }

    async updateCoilCutPlan() {
        return this.$invoke("updateCoilCutPlan", arguments);
    }

    async  ormDbGetBuffer(filter = null) {
        let route = 'getBuffer' + (filter ? '?where=' + JSON.stringify(filter) : '');
        return this.$invokeRoute('POST', route);
    }

    async programOrders() {
        return this.$invoke("programOrders", arguments);
    }

    async ormDbRemoveAllocation(params) {
        let route = 'removeAllocation';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbFindLogdata(params) {
        let route = 'findLogdata';
        return this.$invokeRoute('POST', route, params);
    }

    async getWeightOutput() {
        return this.$invoke("getWeightOutput", arguments);
    }

    async canFinishOrder() {
        return this.$invoke("canFinishOrder", arguments);
    }

    async ormDbLoadOee(params) {
        let route = 'loadOee';
        return this.$invokeRoute('POST', route, params);
    }

    async ormDbGetNormByMaterial(params) {
        let route = 'getNormByMaterial';
        return this.$invokeRoute('POST', route, params);
    }

    async deleteMoveRequest() {
        return this.$invoke("deleteMoveRequest", arguments);
    }

    async ormDbSaveImage(array = null) {
        let route = 'saveImage';
        return this.$invokeRoute('POST', route, { data: array });
    }

    generateLabelPrinter(object) {
        let labels = {
            labelClient: i18n("P.Client"),
            labelMaterial: i18n("P.Material"),
            labelNetWeight: i18n("P.Net Weight (KG)"),
            labelWeight: i18n("P.Net Weight (KG)"),
            labelGrossWeight: i18n("P.Gross Weight (KG)"),
            labelUN: i18n("P.UN"),
            labelDescription: i18n("P.Material"),
            labelLot: i18n("P.Lot"),
            labelOP: i18n("P.OP"),
            labelOrder: i18n("Order SAP"),
            labelOV: i18n("P.OV"),
            labelItem: i18n("P.Item"),
            labelPieces: i18n("P.Pieces"),
            labelLength: i18n("P.Length"),
            labelTotal: i18n("P.Total"),
            labelDate: i18n("P.Date")
        }
        return Object.assign(object, labels);
    }

}