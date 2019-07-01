import { App } from "./lib/App.js";
//import "./lib/packages/devutils.js";
import "./lib/packages/dashboard.js";
import "./lib/packages/security.js";
import "./lib/packages/i18n.js";
import * as redirect from "./control/redirectScreens.js";

//#region Config
App.addSimpleItem("", "Register", "config");
App.addSimpleItem("config", "Area", "config.area");
App.addSimpleItem("config", "Hangar", "config.hangar");
App.addSimpleItem("config", "Local", "config.local");
App.addSimpleItem("config", "Equipment Type", "config.equipmenttype");
App.addSimpleItem("config", "Equipment", "config.equipment");
App.addSimpleItem("config", "Operation", "config.operation");
App.addSimpleItem("config", "Resource Type", "config.resourcetype");
App.addSimpleItem("config", "Resource Type Link", "config.resourcetypeequipamentlink");
App.addSimpleItem("config", "Resource", "config.resource");

App.addSimpleItem("config", "Transport Resource", "config.transportresource");
App.on("config.transportresource", redirect.redirectConfigTransportResource);

App.addSimpleItem("config", "Transport Resource Local Link", "config.transportresourcelocallink");
App.on("config.transportresourcelocallink", redirect.redirectConfigTransportResourceLocalLink);

App.addSimpleItem("config", "Defect Type", "config.defecttype");
App.addSimpleItem("config", "Release Team", "config.releaseteam");
App.addSimpleItem("config", "Disposal Type", "config.disposaltype");
App.addSimpleItem("config", "Pendency Type", "config.pendencytype");
App.addSimpleItem("config", "Rework", "config.rework");
// App.addSimpleItem("config", "Material Type", "config.materialtype");
App.addSimpleItem("config", "Stop Type", "config.stoptype");
App.addSimpleItem("config", "Stop Reason", "config.stopreason");
App.addSimpleItem("config", "Setup Parameter", "config.setupparameter");
App.addSimpleItem("config", "Scrap Reason", "config.scrapreason");
App.addSimpleItem("config", "Norm", "config.norm");
App.addSimpleItem("config", "Hardness", "config.hardness");
App.addSimpleItem("config", "Visual Characteristics", "config.visualcharacteristics");
App.addSimpleItem("config", "Weld Type", "config.weldtype");
App.addSimpleItem("config", "Standard Package", "config.standardpackage");
App.addSimpleItem("config", "Printers", "config.printers");
App.addSimpleItem("config", "Big Maker Steps", "config.step");
App.addSimpleItem("config", "Steel Similarity", "config.steelsimilarity");
App.addSimpleItem("config", "Links Equipment", "config.linksequipment");

// App.addSimpleItem("config", "Instrument Type", "config.instrumenttype");
// App.addSimpleItem("config", "Order Group", "config.ordergroup");
// App.addSimpleItem("config", "Packing Type", "config.packingtype");
// App.addSimpleItem("config", "Test Type", "config.testtype");

App.on("config.area", redirect.redirectConfigArea);
App.on("config.defecttype", redirect.redirectConfigDefectType);
App.on("config.equipment", redirect.redirectConfigEquipment);
App.on("config.equipmenttype", redirect.redirectConfigEquipmentType);
App.on("config.hardness", redirect.redirectConfigHardness);
App.on("config.hangar", redirect.redirectConfigHangar);
App.on("config.instrumenttype", redirect.redirectConfigInstrumentType);
// App.on("config.materialtype", redirect.redirectConfigMaterialType);
App.on("config.norm", redirect.redirectConfigNorm);
App.on("config.disposaltype", redirect.redirectConfigDisposalType);
App.on("config.local", redirect.redirectConfigLocal);
App.on("config.operation", redirect.redirectConfigOperation);
App.on("config.ordergroup", redirect.redirectConfigOrderGroup);
App.on("config.packingtype", redirect.redirectConfigPackingType);
App.on("config.releaseteam", redirect.redirectConfigReleaseTeam);
App.on("config.resource", redirect.redirectConfigResource);
App.on("config.resourcetypeequipamentlink", redirect.redirectConfigResourceTypeEquipamentLink);
App.on("config.resourcetype", redirect.redirectConfigResourceType);
App.on("config.scrapreason", redirect.redirectConfigScrapReason);
App.on("config.pendencytype", redirect.redirectConfigPendencyType);
App.on("config.rework", redirect.redirectConfigRework);
App.on("config.stopreason", redirect.redirectConfigStopReason);
App.on("config.setupparameter", redirect.redirectConfigSetupParameter);
App.on("config.weldtype", redirect.redirectConfigWeldType);
App.on("config.stoptype", redirect.redirectConfigStopType);
App.on("config.step", redirect.redirectConfigStep);
App.on("config.testtype", redirect.redirectConfigTestType);
App.on("config.visualcharacteristics", redirect.redirectConfigVisualCharacteristics);
App.on("config.standardpackage", redirect.redirectConfigStandardPackage);
App.on("config.printers", redirect.redirectConfigPrinters);
App.on("config.steelsimilarity", redirect.redirectConfigSteelSimilarity);
App.on("config.linksequipment", redirect.redirectConfigLinksEquipment);
//#endregion

//#region PCP
App.addSimpleItem("", "PCP", "pcp");
App.addSimpleItem("pcp", "Allocation", "pcp.allocation");
App.addSimpleItem("pcp", "Setup Matrix", "pcp.matrixsetup");
App.addSimpleItem("pcp", "Stops", "pcp.stops");
App.addSimpleItem("pcp", "Coil Cutting Plan", "pcp.stripscuttingplan");
App.addSimpleItem("pcp", "Tubes Cutting Plan", "pcp.tubescuttingplan");
App.addSimpleItem("pcp", "Schedulling", "pcp.schedulling");
App.addSimpleItem("pcp", "Buffer", "pcp.buffer");

App.on("pcp.allocation", redirect.redirectPcpAllocation);
App.on("pcp.matrixsetup", redirect.redirectPcpMatrixSetup);
App.on("pcp.stops", redirect.redirectPcpStops);
App.on("pcp.stripscuttingplan", redirect.redirectPcpStripsCuttingPlan);
App.on("pcp.tubescuttingplan", redirect.redirectPcpTubesCuttingPlan);
App.on("pcp.schedulling", redirect.redirectPcpSchedulling);
App.on("pcp.buffer", redirect.redirectPcpBuffer);
//#endregion

//#region Quality
App.addSimpleItem("", "Quality", "quality");
App.addSimpleItem("quality", "Checklist", "quality.checklist");
App.addSimpleItem("quality", "EDDY Current", "quality.eddyCurrent");
App.addSimpleItem("quality", "Control Plans", "quality.controlPlans");
App.addSimpleItem("quality", "RNC", "quality.searchRNC");
App.addSimpleItem("quality", "Test and Dimensional Control", "quality.testAndDimensionalControl");
App.addSimpleItem("quality", "Control Plan Equipment Link", "quality.controlPlanEquipmentLink");
App.addSimpleItem("quality", "Rework Collection", "quality.reworkCollection");

App.on("quality.searchRNC", redirect.redirectQualitySearchRNC);
App.on("quality.testAndDimensionalControl", redirect.redirectQualityTestAndDimensionalControl);
App.on("quality.eddyCurrent", redirect.redirectQualityEddyCurrent);
App.on("quality.controlPlans", redirect.redirectQualityControlPlans);
App.on("quality.checklist", redirect.redirectQualityChecklist);
App.on("quality.controlPlanEquipmentLink", redirect.redirectQualityControlPlanEquipmentLink);
App.on("quality.reworkCollection", redirect.redirectQualityReworkCollection);
//#endregion

//#region Production
App.addSimpleItem("", "Production", "production");
App.addSimpleItem("production", "Movement", "production.movement");
App.addSimpleItem("production", "Defect Register", "production.defectRegister");
App.addSimpleItem("production", "Lots Pending Receipt", "production.lotsPendingReceipt");
App.addSimpleItem("production", "Details Lots", "production.detailsLots");
App.addSimpleItem("production", "Details Order", "production.detailsorder");
App.addSimpleItem("production", "Productivity", "production.productivity");
App.addSimpleItem("production", "Metallography", "production.metallography");

App.on("production.movement", redirect.redirectProductionMovement);
App.on("production.defectRegister", redirect.redirectProductionDefectRegistry);
App.on("production.lotsPendingReceipt", redirect.redirectProductionLotsPendingReceipt);
App.on("production.detailsLots", redirect.redirectProductionDetailsLots);
App.on("production.detailsorder", redirect.redirectProductionDetailsOrder);
App.on("production.productivity", redirect.redirectProductionProductivity);
App.on("production.metallography", redirect.redirectProductionMetallography);
//#endregion

//#region Reports
App.addSimpleItem("", "Reports", "reports");
App.addSimpleItem("reports", "Stops", "reports.stops");
App.addSimpleItem("reports", "Pendencies", "reports.rncs");
App.addSimpleItem("reports", "Production per Shift", "reports.shifts");
App.addSimpleItem("reports", "Scraps Record", "reports.scrapsRecord");
App.addSimpleItem("reports", "Setup", "reports.setup");

App.on("reports.stops", redirect.redirectReportsStops);
App.on("reports.rncs", redirect.redirectReportsRNCS);
App.on("reports.shifts", redirect.redirectReportsShifts);
App.on("reports.scrapsRecord", redirect.redirectReportsScrapsRecord);
App.on("reports.setup", redirect.redirectReportsSetup);
//#endregion

//#region OEE
App.addSimpleItem("", "OEE", "oee");
App.addSimpleItem("oee", "Yield", "oee.yield");             // OEE Yield
App.addSimpleItem("oee", "Performance", "oee.performance"); // OEE Performance
App.addSimpleItem("oee", "Parameter", "oee.parameter"); // OEE Parameter

App.on("oee.yield", redirect.redirectOeeYield);
App.on("oee.performance", redirect.redirectOeePerformance);
App.on("oee.parameter", redirect.redirectOeeParameter);
//#endregion