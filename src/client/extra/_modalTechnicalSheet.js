import {
    WebixWindow
} from "../lib/WebixWrapper.js";
import {
    i18n
} from "../lib/I18n.js";
import {
    App
} from "../lib/App.js";

export async function showModal(item) {
    return new Promise(async function (resolve, reject) {

        let technicalSheet = await App.api.ormDbTechnicalSheet({ idmaterial: item })
        technicalSheet = technicalSheet.data[0]

        if (technicalSheet.diameter === null)
            technicalSheet.diameter = 0;
        if (technicalSheet.edge === null)
            technicalSheet.edge = '';
        if (technicalSheet.length === null)
            technicalSheet.length = 0;
        if (technicalSheet.materialtype === null)
            technicalSheet.materialtype = '';
        if (technicalSheet.steel === null)
            technicalSheet.steel = '';
        if (technicalSheet.thickness === null)
            technicalSheet.steel = 0;
        if (technicalSheet.width === null)
            technicalSheet.width = 0;

        const padding = ({
            view: "label",
            label: i18n("")
        });

        let labelMin = ({
            view: "label",
            label: `<strong>${i18n('Min.')}</strong>`,
            align: "center"
        });

        let labelMax = ({
            view: "label",
            label: `<strong>${i18n('Max.')}</strong>`,
            align: "center"
        });

        let material = ({
            view: "label",
            label: technicalSheet.material
        });

        let labelProduct = ({
            view: "label",
            label: `<strong>${i18n('Product')}</strong>`,
            align: "center"
        });

        let labelSteel = ({
            view: "label",
            label: `<strong>${i18n('Steel')}</strong>`,
            align: "center"
        });

        let labelDiamWidth = ({
            view: "label",
            label: `<strong>${i18n('Diam./Width')}</strong>`,
            align: "center"
        });

        let labelThickness = ({
            view: "label",
            label: `<strong>${i18n('Thickness')}</strong>`,
            align: "center"
        });

        let labelLength = ({
            view: "label",
            label: `<strong>${i18n('Length')}</strong>`,
            align: "center"
        });

        let product = ({
            view: "label",
            label: technicalSheet.materialtype,
            align: "center"
        });

        let steel = ({
            view: "label",
            label: technicalSheet.steel,
            align: "center"
        });

        let diameter = ({
            view: "label",
            label: technicalSheet.diameter,
            align: "center"
        });
        
        let thickness = ({
            view: "label",
            label: technicalSheet.thickness,
            align: "center"
        });

        let length = ({
            view: "label",
            label: technicalSheet.length,
            align: "center"
        });

        let labelDiamWidthC = ({
            view: "label",
            label: `<strong>${i18n('Diameter')}/${i18n('Width')}</strong>`,
            align: "center"
        });

        let labelThicknessC = ({
            view: "label",
            label: `<strong>${i18n('Thickness')}</strong>`,
            align: "center"
        });

        let labelLengthC = ({
            view: "label",
            label: `<strong>${i18n('Length')}</strong>`,
            align: "center"
        });

        let labelMinDiamWidth = {};
        let labelMaxDiamWidth = {};

        if (technicalSheet.diameter === null) {
            labelMinDiamWidth = ({
                view: "label",
                label: (minDiamWidth(technicalSheet.width)).toFixed(2),
                align: "center"
            });

            labelMaxDiamWidth = ({
                view: "label",
                label: (maxDiamWidth(technicalSheet.width)).toFixed(2),
                align: "center"
            });
        }
        else {
            labelMinDiamWidth = ({
                view: "label",
                label: (minDiamWidth(technicalSheet.diameter)).toFixed(2),
                align: "center"
            });

            labelMaxDiamWidth = ({
                view: "label",
                label: (maxDiamWidth(technicalSheet.diameter)).toFixed(2),
                align: "center"
            });
        }

        let labelMinThickness = ({
            view: "label",
            label: (technicalSheet.thickness * 0.9).toFixed(2),
            align: "center"
        });

        let labelMaxThickness = ({
            view: "label",
            label: (technicalSheet.thickness * 1.1).toFixed(2),
            align: "center"
        });

        //Cálculo do comprimento ainda será calculado.
        let labelMinLength = ({
            view: "label",
            label: (technicalSheet.length * 0.9).toFixed(2),
            align: "center"
        });

        let labelMaxLength = ({
            view: "label",
            label: (technicalSheet.length * 1.1).toFixed(2),
            align: "center"
        });

        let labelMaxOvalization = ({
            view: "label",
            label: `<strong>${i18n('Maximum Ovalization')}</strong>`,
            align: "center"
        });

        let labelOvalizationEdge = ({
            view: "label",
            label: `<strong>${i18n('Ovalization in the Edges')}</strong>`,
            align: "center"
        });

        let maxOvalization = ({
            view: "label",
            label: (maxDiamWidth(technicalSheet.diameter) - minDiamWidth(technicalSheet.diameter)).toFixed(2),
            align: "center"
        });

        let ovalizationEdge = ({
            view: "label",
            label: ((maxDiamWidth(technicalSheet.diameter) - minDiamWidth(technicalSheet.diameter)) * 1.5).toFixed(2),
            align: "center"
        });

        let labelSquare = ({
            view: "label",
            label: `<strong>${i18n('Square')}</strong>`,
            align: "center"
        });

        let square = ({
            view: "label",
            label: (squareCalc(technicalSheet.diameter)).toFixed(2),
            align: "center"
        });

        let labelEdge = ({
            view: "label",
            label: `<strong>${i18n('Edge Type')}</strong>`,
            align: "center"
        });

        let edge = ({
            view: "label",
            label: technicalSheet.edge,
            align: "center"
        });

        let modal = new WebixWindow();

        modal.body = {
            view: "form",
            id: "formProductionOrderCreate",
            elements: [
                {
                    rows: [
                        {
                            view: "fieldset",
                            label: i18n("Material"),
                            borderless: true,
                            body: {
                                rows: [
                                    material
                                ]
                            }
                        },
                        {
                            view: "fieldset",
                            label: i18n("Description"),
                            borderless: true,
                            body: {
                                rows: [
                                    {
                                        cols: [
                                            labelProduct,
                                            labelSteel,
                                            labelDiamWidth,
                                            labelThickness,
                                            labelLength
                                        ]
                                    },
                                    {
                                        cols: [
                                            product,
                                            steel,
                                            diameter,
                                            thickness,
                                            length
                                        ]
                                    }
                                ]
                            }
                        },
                        {
                            view: "fieldset",
                            label: i18n("Checklist"),
                            borderless: true,
                            body: {
                                rows: [
                                    {
                                        cols: [
                                            padding,
                                            labelMin,
                                            labelMax
                                        ]
                                    },
                                    {
                                        cols: [
                                            labelDiamWidthC,
                                            labelMinDiamWidth,
                                            labelMaxDiamWidth
                                        ]
                                    },
                                    {
                                        cols: [
                                            labelThicknessC,
                                            labelMinThickness,
                                            labelMaxThickness
                                        ]
                                    },
                                    {
                                        cols: [
                                            labelLengthC,
                                            labelMinLength,
                                            labelMaxLength
                                        ]
                                    },
                                    {
                                        cols: [
                                            padding
                                        ]
                                    },
                                    {
                                        cols: [
                                            labelMaxOvalization,
                                            maxOvalization,
                                        ]
                                    },
                                    {
                                        cols: [
                                            labelOvalizationEdge,
                                            ovalizationEdge,
                                        ]
                                    },
                                    {
                                        cols: [
                                            labelSquare,
                                            square,
                                        ]
                                    },
                                    {
                                        cols: [
                                            labelEdge,
                                            edge
                                        ]
                                    }
                                ]
                            }
                        }
                    ]
                }
            ]
        };

        modal.modal = true;
        modal.show();
        modal.setTitle(i18n("Technical Sheet"));

    });
}

function minDiamWidth(value) {
    if (value == 0) {
        return 0
    }
    if (value > 0 && value <= 38.1) {
        return value - 0.15
    }
    if (value >= 38.2 && value <= 50) {
        return value - 0.2
    }
    if (value >= 50.01 && value <= 60) {
        return value - 0.25
    }
    if (value >= 60.01 && value <= 76.2) {
        return value - 0.3
    }
    if (value >= 76.21 && value <= 101.6) {
        return value - 0.4
    }
    if (value >= 101.61 && value <= 114) {
        return value - 0.4
    }
    if (value >= 114.01 && value <= 127) {
        return value - 0.5
    }
}

function maxDiamWidth(value) {
    if (value == 0) {
        return 0
    }
    if (value > 0 && value <= 38.1) {
        return value + 0.15
    }
    if (value >= 38.2 && value <= 50) {
        return value + 0.2
    }
    if (value >= 50.01 && value <= 60) {
        return value + 0.25
    }
    if (value >= 60.01 && value <= 76.2) {
        return value + 0.3
    }
    if (value >= 76.21 && value <= 101.6) {
        return value + 0.4
    }
    if (value >= 101.61 && value <= 114) {
        return value + 0.4
    }
    if (value >= 114.01 && diameter <= 127) {
        return diameter + 0.5
    }
}

function squareCalc(value) {
    if (value <= 50.8) {
        return (value * 0.00872686) + 0.01
    }
    else {
        return (value * 0.00436335) + 0.01
    }
}