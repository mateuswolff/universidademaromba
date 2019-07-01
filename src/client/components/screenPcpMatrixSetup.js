import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixInputText, WebixInputSelect, WebixCrudDatatable } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen(event) {

    let allEquipment = await App.api.ormDbFind('equipment', {status: true});
    allEquipment.data.sort(function(a,b) {
        if(a.description < b.description) return -1;
        if(a.description > b.description) return 1;
        return 0;
    });

    let allMaterials = await App.api.ormDbFind('material');
    allMaterials.data.sort(function(a,b) {
        if(a.description < b.description) return -1;
        if(a.description > b.description) return 1;
        return 0;
    });

    let allMatrixSetup = await App.api.ormDbFind('matrixsetup');
    allMatrixSetup.data.sort(function(a,b) {
        if(a.description < b.description) return -1;
        if(a.description > b.description) return 1;
        return 0;
    });

    let allMatrix = await App.api.ormDbFindMatrix();

    let dtProductivityByEquipmentMaterial = new WebixCrudDatatable("dtProductivityByEquipmentMaterial");

    async function refreshForm(){

        $$('idmatrixsetup').elements.idequipment.refresh();
        $$('idmatrixsetup').elements.idmaterialfrom.refresh();
        $$('idmatrixsetup').elements.idmaterialto.refresh();
        $$('idmatrixsetup').elements.time.refresh();

    }

    async function setForm() {

        let item = $$('dtProductivityByEquipmentMaterial').getSelectedItem();
        $$('idmatrixsetup').elements.idequipment.setValue(item.idequipment)
        $$('idmatrixsetup').elements.idmaterialfrom.setValue(item.idmaterialfrom)
        $$('idmatrixsetup').elements.time.setValue(item.time)
        $$('idmatrixsetup').elements.idmaterialto.setValue(item.idmaterialto)
        refreshForm();
        $$('idmatrixsetup').elements.idequipment.disable();
        $$('idmatrixsetup').elements.idmaterialfrom.disable();
        $$('idmatrixsetup').elements.idmaterialto.disable();

    }

    async function checkMaterial(){

        let matrix = allMatrixSetup.data
        let data = $$("idmatrixsetup").getValues();
        for(let i = 0; i < matrix.length; i++){
            if(matrix[i].idmaterialfrom == data.idmaterialfrom &&
                matrix[i].idmaterialto == data.idmaterialto &&
                matrix[i].idequipment == data.idequipment){
                    $$('idmatrixsetup').elements.time.setValue(matrix[i].time)
            }
        }
    }

    let equip = new WebixInputSelect('idequipment', i18n('Equipment'), allEquipment.data, {
        template: (obj) => {
            return obj.description;
        },
        "onChange": checkMaterial
    });
    
    let materialFrom = new WebixInputSelect('idmaterialfrom', i18n('Material From'), allMaterials.data, {
        template: (obj) => {
            return obj.description;
        },
        "onChange": checkMaterial
    });

    let timeHour = new WebixInputText("time", i18n("Time(Hour)"))

    let materialTo = new WebixInputSelect('idmaterialto', i18n('Material To'), allMaterials.data, {
        template: (obj) => {
            return obj.description;
        },
        "onChange": checkMaterial
    });

    let itens = [
        equip,
        materialFrom,
        timeHour,
        materialTo
    ]

    dtProductivityByEquipmentMaterial.on = {
        "onItemClick": setForm,
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtProductivityByEquipmentMaterial", event);
        }
    };

    dtProductivityByEquipmentMaterial.columns = [
        { id: "description", header: i18n("Equipment"), fillspace: true, sort: "string", width: 200 },
        { id: "materialFROM", header: i18n('Material From'), fillspace: true, sort: "string", width: 200 },
        { id: "materialto", header: i18n('Material To'), fillspace: true, sort: "string", width: 200 },
        { id: "time", header: i18n("Time(Hour)"), fillspace: true, sort: "string", width: 200 }
    ]
    dtProductivityByEquipmentMaterial.data = allMatrix;

    let titleProductivityByEquipmentMaterial = ({
        view: "label",
        label: i18n("Productivity by Equipment/Material"),
        inputWidth: 100,
        align: "left"
    })

    let grids = {
        view: 'form',
        id: "idmatrixsetup",
        minWidth: 800,
        rows:[
            itens[0],
            {
                cols: [
                    itens[1],
                    {},
                    itens[2],
                    {}
                ],
            },
            {
                cols: [
                    itens[3],
                    {},
                    {},
                    {}
                ],
            },
            titleProductivityByEquipmentMaterial,
            dtProductivityByEquipmentMaterial,
        ]
    }

    App.createDefaultMatrixSetup(i18n('Setup Matrix'), 'matrixsetup');
    App.replaceMainContent(grids);

    await util.datatableColumsGet('dtProductivityByEquipmentMaterial', event);
}