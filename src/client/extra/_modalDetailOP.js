import { WebixWindow, WebixCrudDatatable, WebixInputTextArea } from "../lib/WebixWrapper.js";
import { i18n } from "../lib/I18n.js";
import { App } from "../lib/App.js";

export async function showModal(item) {
    return new Promise(async function (resolve, reject) {

        let modal = new WebixWindow({
            width: 800,
            height: 600
        });

        let txaSpecialInstruction = new WebixInputTextArea("txaSpecialInstruction");
        txaSpecialInstruction.scroll = false;

        let txaDescriptionNorm = new WebixInputTextArea("description");
        txaDescriptionNorm.scroll = true;
        txaDescriptionNorm.readonly = true;

        /* Detail OP */
        let allDetailOP = await App.api.ormDbTubesLotSystem({ idordermes: item.idordermes, status: true });
        
        /* Pego Somente Material Produce */
        let filterProduceMaterial = allDetailOP.data[0];

        /* NormDescription */
        let NormDescription = ({
            view: "label",
            label: i18n("Control Plan Descriptions"),
            name: "txNorm"
        });

        let allOrderNorm = await App.api.ormDborderNorm({ idordermes: item.idordermes, status: true });
        allOrderNorm = allOrderNorm.data;

        let allDescriptions = "";
        for (let i = 0; i < allOrderNorm.length; i++) {
            if (allOrderNorm[i]){
                allDescriptions += allOrderNorm[i].description + '\n\n\n';
            }
        }
        txaDescriptionNorm.value = allDescriptions;

        let specialInstruction = ({
            view: "label",
            label: i18n("Special Instruction"),
            name: "txsi"
        });

        txaSpecialInstruction.value = filterProduceMaterial.specialinstruction;

        let exportPDF = {
            view: "button",
            id: "btnExportPDF",
            click: async () => {

                let grid = $$(txaDescriptionNorm.value);
                let dateString = Date();
                webix.toPDF(grid, {
                    filename: i18n("Detail OP") + " " + dateString,
                    orientation: "landscape",
                    autowidth: true
                });

            },
            value: i18n("Export") + " PDF",
        }

        modal.body = {
            view: "form",
            id: "frmDetailOP",
            rows: [
                specialInstruction,
                {   
                    height: 100,
                    cols: [txaSpecialInstruction]
                },
                NormDescription,
                txaDescriptionNorm
                //exportPDF
            ]
        };

        modal.modal = true;
        await modal.show();
        modal.setTitle(i18n("Detail OP"));
    });

}