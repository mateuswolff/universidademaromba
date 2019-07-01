import { checkClientPermission } from "../control/permission.js";

var dates = [];
let _idLoopSyncData;
async function finishLoopSyncData(event) {
    clearInterval(_idLoopSyncData);
};

// SETTINGS
export async function redirectSettings(event) { }

// import * as createPassword from "../components/createPassword.js";

//#region SECURITY
import * as screenSecurityInterface from "../components/screenSecurityInterface.js";
import * as screenSecurityLogdata from "../components/screenSecurityLogdata.js";

export async function redirectSecurityInterface() {
    finishLoopSyncData();
    await screenSecurityInterface.showScreen(event);
    checkClientPermission('security.interface');
}

export async function redirectSecurityLogdata() {
    finishLoopSyncData();
    await screenSecurityLogdata.showScreen(event);
    checkClientPermission('security.logdata');
}
//#endsecurity

//#region CONFIGURATIONS 
import * as screenConfigArea from "../components/screenConfigArea.js";
import * as screenConfigHangar from "../components/screenConfigHangar.js";
import * as screenConfigLocal from "../components/screenConfigLocal.js";
import * as screenConfigEquipmentType from "../components/screenConfigEquipmentType.js";
import * as screenConfigEquipment from "../components/screenConfigEquipment.js";
import * as screenConfigOperation from "../components/screenConfigOperation.js";
import * as screenConfigResourceType from "../components/screenConfigResourceType.js";
import * as screenConfigResourceTypeEquipamentLink from "../components/screenConfigResourceTypeEquipamentLink.js";
import * as screenConfigResource from "../components/screenConfigResource.js";
import * as screenConfigDefectType from "../components/screenConfigDefectType.js";
import * as screenConfigReleaseTeam from "../components/screenConfigReleaseTeam.js";
import * as screenConfigDisposalType from "../components/screenConfigDisposalType.js";
import * as screenConfigPendencyType from "../components/screenConfigPendencyType.js";
import * as screenConfigMaterialType from "../components/screenConfigMaterialType.js";
import * as screenConfigStopType from "../components/screenConfigStopType.js";
import * as screenConfigStopReason from "../components/screenConfigStopReason.js";
import * as screenConfigSetupParameter from "../components/screenConfigSetupParameter.js";
import * as screenConfigScrapReason from "../components/screenConfigScrapReason.js";
import * as screenConfigNorm from "../components/screenConfigNorm.js";
import * as screenConfigHardness from "../components/screenConfigHardness.js";
import * as screenConfigVisualCharacteristics from "../components/screenConfigVisualCharacteristics.js";
import * as screenConfigWeldType from "../components/screenConfigWeldType.js";
import * as screenConfigStandardPackage from "../components/screenConfigStandardPackage.js";
import * as screenConfigPrint from "../components/screenConfigPrint.js";
import * as screenConfigStep from "../components/screenConfigStep.js";
import * as screenConfigInstrumentType from "../components/screenConfigInstrumentType.js";
import * as screenConfigOrderGroup from "../components/screenConfigOrderGroup.js";
import * as screenConfigPackingType from "../components/screenConfigPackingType.js";
import * as screenConfigTestType from "../components/screenConfigTestType.js";
import * as screenConfigSteelSimilarity from "../components/screenConfigSteelSimilarity.js";
import * as screenConfigLinksEquipment from "../components/screenConfigLinksEquipment.js";
import * as screenConfigRework from "../components/screenConfigRework.js";

export async function redirectConfigArea(event) {
    finishLoopSyncData();
    await screenConfigArea.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigHangar(event) {
    finishLoopSyncData();
    await screenConfigHangar.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigLocal(event) {
    finishLoopSyncData();
    await screenConfigLocal.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigEquipmentType(event) {
    finishLoopSyncData();
    await screenConfigEquipmentType.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigEquipment(event) {
    finishLoopSyncData();
    await screenConfigEquipment.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigOperation(event) {
    finishLoopSyncData();
    await screenConfigOperation.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigResourceType(event) {
    finishLoopSyncData();
    await screenConfigResourceType.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigResourceTypeEquipamentLink(event) {
    finishLoopSyncData();
    await screenConfigResourceTypeEquipamentLink.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigResource(event) {
    finishLoopSyncData();
    await screenConfigResource.showScreen(event);
    checkClientPermission(event);
}

import * as screenConfigTransportResource from "../components/screenConfigTransportResource.js";
export async function redirectConfigTransportResource(event) {
    finishLoopSyncData();
    await screenConfigTransportResource.showScreen(event);
    checkClientPermission(event);
}

import * as screenConfigTransportResourceLocalLink from "../components/screenConfigTransportResourceLocalLink.js";
export async function redirectConfigTransportResourceLocalLink(event) {
    finishLoopSyncData();
    await screenConfigTransportResourceLocalLink.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigDefectType(event) {
    finishLoopSyncData();
    await screenConfigDefectType.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigReleaseTeam(event) {
    finishLoopSyncData();
    await screenConfigReleaseTeam.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigDisposalType(event) {
    finishLoopSyncData();
    await screenConfigDisposalType.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigPendencyType(event) {
    finishLoopSyncData();
    await screenConfigPendencyType.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigMaterialType(event) {
    finishLoopSyncData();
    await screenConfigMaterialType.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigStopType(event) {
    finishLoopSyncData();
    await screenConfigStopType.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigStopReason(event) {
    finishLoopSyncData();
    await screenConfigStopReason.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigSetupParameter(event) {
    finishLoopSyncData();
    await screenConfigSetupParameter.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigScrapReason(event) {
    finishLoopSyncData();
    await screenConfigScrapReason.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigNorm(event) {
    finishLoopSyncData();
    await screenConfigNorm.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigHardness(event) {
    finishLoopSyncData();
    await screenConfigHardness.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigVisualCharacteristics(event) {
    finishLoopSyncData();
    await screenConfigVisualCharacteristics.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigWeldType(event) {
    finishLoopSyncData();
    await screenConfigWeldType.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigStandardPackage(event) {
    finishLoopSyncData();
    await screenConfigStandardPackage.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigPrinters(event) {
    finishLoopSyncData();
    await screenConfigPrint.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigStep(event) {
    finishLoopSyncData();
    await screenConfigStep.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigInstrumentType(event) {
    finishLoopSyncData();
    await screenConfigInstrumentType.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigOrderGroup(event) {
    finishLoopSyncData();
    await screenConfigOrderGroup.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigPackingType(event) {
    finishLoopSyncData();
    await screenConfigPackingType.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigTestType(event) {
    finishLoopSyncData();
    await screenConfigTestType.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigSteelSimilarity(event) {
    finishLoopSyncData();
    await screenConfigSteelSimilarity.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigLinksEquipment(event) {
    finishLoopSyncData();
    await screenConfigLinksEquipment.showScreen(event);
    checkClientPermission(event);
}

export async function redirectConfigRework(event) {
    finishLoopSyncData();
    await screenConfigRework.showScreen(event);
    checkClientPermission(event);
}
//#endregion

//#region PCP
import * as screenPcpAllocation from "../components/screenPcpAllocation.js";
import * as screenPcpMatrixSetup from "../components/screenPcpMatrixSetup.js";
import * as screenPcpStops from "../components/screenPcpStops.js";
import * as screenPcpStripsCuttingPlan from "../components/screenPcpStripsCuttingPlan.js";
import * as screenPcpTubesCuttingPlan from "../components/screenPcpTubesCuttingPlan.js";
import * as screenPcpSchedulling from "../components/screenPcpSchedulling.js";
import * as screenPcpBuffer from "../components/screenPcpBuffer.js";


export async function redirectPcpAllocation(event) {
    finishLoopSyncData();
    await screenPcpAllocation.showScreen(event);
    checkClientPermission(event);
}

export async function redirectPcpMatrixSetup(event) {
    finishLoopSyncData();
    await screenPcpMatrixSetup.showScreen(event);
    checkClientPermission(event);
}

export async function redirectPcpStops(event) {
    finishLoopSyncData();
    await screenPcpStops.showScreen(event);
    checkClientPermission(event);
}

export async function redirectPcpStripsCuttingPlan(event) {
    finishLoopSyncData();
    await screenPcpStripsCuttingPlan.showScreen(event);
    checkClientPermission(event);
}

export async function redirectPcpTubesCuttingPlan(event) {
    finishLoopSyncData();
    await screenPcpTubesCuttingPlan.showScreen(event);
    checkClientPermission(event);
}

export async function redirectPcpSchedulling(event) {
    finishLoopSyncData();
    await screenPcpSchedulling.showScreen(event);
    checkClientPermission(event);
}

export async function redirectPcpBuffer(event) {
    finishLoopSyncData();
    await screenPcpBuffer.showScreen(event);
    checkClientPermission(event);
}
//#endregion

//#region QUALITY
import * as screenQualitySearchRNC from "../components/screenQualitySearchRNC.js";
import * as screenQualityTestAndDimensionalControl from "../components/screenQualityTestAndDimensionalControl.js";
import * as screenQualityEddyCurrent from "../components/screenQualityEddyCurrent.js";
import * as screenQualityControlPlans from "../components/screenQualityControlPlans.js";
import * as screenQualityChecklist from "../components/screenQualityChecklist.js";
import * as screenQualityControlPlanEquipmentLink from "../components/screenQualityControlPlanEquipmentLink.js";
import * as screenQualityReworkCollection from "../components/screenQualityReworkCollection.js";

export async function redirectQualitySearchRNC(event) {
    finishLoopSyncData();
    await screenQualitySearchRNC.showScreen(event);
    checkClientPermission(event);
}

export async function redirectQualityTestAndDimensionalControl(event) {
    finishLoopSyncData();
    await screenQualityTestAndDimensionalControl.showScreen(event);
    checkClientPermission(event);
}

export async function redirectQualityEddyCurrent(event) {
    finishLoopSyncData();
    await screenQualityEddyCurrent.showScreen(event);
    checkClientPermission(event);
}

export async function redirectQualityControlPlans(event) {
    finishLoopSyncData();
    await screenQualityControlPlans.showScreen(event);
    checkClientPermission(event);
}

export async function redirectQualityChecklist(event) {
    finishLoopSyncData();
    await screenQualityChecklist.showScreen(event);
    checkClientPermission(event);
}

export async function redirectQualityControlPlanEquipmentLink(event) {
    finishLoopSyncData();
    await screenQualityControlPlanEquipmentLink.showScreen(event);
    checkClientPermission(event);
}

export async function redirectQualityReworkCollection(event) {
    finishLoopSyncData();
    await screenQualityReworkCollection.showScreen(event);
    checkClientPermission(event);
}
//#endregion

//#region PRODUCTION
import * as screenProductionProgram from "../components/screenProductionProgram.js";
import * as screenProductionMovement from "../components/screenProductionMovement.js";
import * as screenProductionProgramStart from "../components/screenProductionProgramStart.js";
import * as screenProductionDefectRegistry from "../components/screenProductionDefectRegistry.js";
import * as screenProductionLotsPendingReceipt from "../components/screenProductionLotsPendingReceipt.js";
import * as screenProductionDetailsLots from "../components/screenProductionDetailsLots.js";
import * as screenProductionDetailOrder from "../components/screenProductionDetailOrder.js";
import * as screenProductionCoilCollect from "../components/screenProductionCoilCollect.js";
import * as screenProductionProductivity from "../components/screenProductionProductivity.js";
import * as screenProductionMetallography from "../components/screenProductionMetallography.js";

export async function redirectProductionProgram(event) {
    finishLoopSyncData();
    await screenProductionProgram.showScreen(event);
    checkClientPermission(event);
}

export async function redirectProductionMovement(event) {
    finishLoopSyncData();
    await screenProductionMovement.showScreen(event);
    checkClientPermission(event);
}

export async function redirectProductionProgramStart(type, orderevent) {
    finishLoopSyncData();
    await screenProductionProgramStart.showScreen(type, order);
    checkClientPermission(event);
}

export async function redirectProductionDefectRegistry(event) {
    finishLoopSyncData();
    await screenProductionDefectRegistry.showScreen(event);
    checkClientPermission(event);
}

export async function redirectProductionLotsPendingReceipt(event) {
    finishLoopSyncData();
    await screenProductionLotsPendingReceipt.showScreen(event);
    checkClientPermission(event);
}

export async function redirectProductionDetailsLots(event) {
    finishLoopSyncData();
    await screenProductionDetailsLots.showScreen(event);
    checkClientPermission(event);
}

export async function redirectProductionDetailsOrder(event) {
    finishLoopSyncData();
    await screenProductionDetailOrder.showScreen(event);
    checkClientPermission(event);
}

export async function redirectProductionCoilCollect(event) {
    finishLoopSyncData();
    await screenProductionCoilCollect.showScreen(event);
    checkClientPermission(event);
}

export async function redirectProductionProductivity(event) {
    finishLoopSyncData();
    await screenProductionProductivity.showScreen(event);
    checkClientPermission(event);
}

export async function redirectProductionMetallography(event) {
    finishLoopSyncData();
    await screenProductionMetallography.showScreen(event);
    checkClientPermission(event);
}
//#endregion

//#region REPORTS 
import * as screenReportsStops from "../components/screenReportsStops.js";
import * as screenReportsRNCS from "../components/screenReportsRNCS.js";
import * as screenReportsShifts from "../components/screenReportsShifts.js";
import * as screenReportsScrapsRecord from "../components/screenReportsScrapsRecord.js";
import * as screenReportsSetup from "../components/screenReportsSetup.js";

export async function redirectReportsStops(event) {
    finishLoopSyncData();
    await screenReportsStops.showScreen(event);
    checkClientPermission(event);
}

export async function redirectReportsRNCS(event) {
    finishLoopSyncData();
    await screenReportsRNCS.showScreen(event);
    checkClientPermission(event);
}

export async function redirectReportsShifts(event) {
    finishLoopSyncData();
    await screenReportsShifts.showScreen(event);
    checkClientPermission(event);
}

export async function redirectReportsScrapsRecord(event) {
    finishLoopSyncData();
    await screenReportsScrapsRecord.showScreen(event);
    checkClientPermission(event);
}

export async function redirectReportsSetup(event) {
    finishLoopSyncData();
    await screenReportsSetup.showScreen(null, null, null, event);
    checkClientPermission(event);
}
//#endregion

//#region DASHBOARDS
import * as screenDashboardList from "../components/screenDashboardList.js";

export async function redirectDashboardList(event) {
    finishLoopSyncData();
    await screenDashboardList.showScreen(event);
    checkClientPermission(event);
}
//#endregion

//#region OEE
import * as screenOeeYield from "../components/screenOeeYield.js";
import * as screenOeePerformance from "../components/screenOeePerformance.js";
import * as screenOeeParameter from "../components/screenOeeParameter.js";

export async function redirectOeeYield(event) {
    finishLoopSyncData();
    await screenOeeYield.showScreen(event);
    checkClientPermission(event);
}

export async function redirectOeePerformance(event) {
    finishLoopSyncData();
    await screenOeePerformance.showScreen(event);
    checkClientPermission(event);
}

export async function redirectOeeParameter(event) {
    finishLoopSyncData();
    await screenOeeParameter.showScreen(event);
    checkClientPermission(event);
}
//#endregion

export async function redirectCreatePassword(event) {
    finishLoopSyncData();
    createPassword.showScreen(event);
}