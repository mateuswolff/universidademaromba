import { i18n } from "../../lib/I18n.js";
import { App } from "../../lib/App.js";

export async function create(order) {
    let dimensionalControl = await App.api.ormDbFind('detailOfDimensionControl', { idorder: order.idordermes, idequipment: order.idequipmentscheduled });
    let dimensionalControlData = dimensionalControl.data[dimensionalControl.data.length - 1] ? dimensionalControl.data[dimensionalControl.data.length - 1] : [];
    return {
        view: "form",
        scroll: false,
        // width: 300,
        elementsConfig: { margin: 5 },
        elements: [
            {
                view: "fieldset",
                label: i18n("Dimensional Controls"),
                borderless: true,
                body: {
                    rows: [
                        {
                            view: "datatable",
                            id: "dtDetailOfDimensionControls",
                            scroll: false,
                            columns: [
                                { id: "packageNumber", header: i18n("Package Number"), width: 80 },
                                { id: "piecesNumber", header: i18n("Pieces Number"), width: 50 },
                                { id: "minExternalDiameter", header: i18n("Min External Diameter"), width: 50 },
                                { id: "maxExternalDiameter", header: i18n("Max External Diameter"), width: 50 },
                                { id: "minThickness", header: i18n("Min Thickness"), width: 50 },
                                { id: "maxThickness", header: i18n("Max Thickness"), width: 50 },
                                { id: "length", header: i18n("Length"), width: 60 },
                                { id: "visualCharacteristic", header: i18n("Visual Characteristic"), width: 150 },
                                { id: "idHardness", header: i18n("Hardness"), width: 60 },
                                { id: "idWeldType", header: i18n("WeldType"), width: 60 },
                            ],
                            data: dimensionalControlData
                        }
                    ]
                }
            }
        ]
    }
}