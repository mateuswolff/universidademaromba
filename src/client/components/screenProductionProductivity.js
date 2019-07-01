
import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { WebixCrudDatatable, WebixInputSelect, WebixCrudAddButton, WebixBuildReponsiveTopMenu, WebixInputText } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

let aLinkedMaterial = [];
let aUnlinkedMaterial = [];
let allLinkedMaterial = [];
let aProductivity = [];

export async function showScreen(event) {

    const padding = ({
        view: "label",
        label: i18n(""),
    });

    let allEquipment = await App.api.ormDbFind('equipment', {status: true});
    allEquipment.data.sort(function(a,b) {
        if(a.description < b.description) return -1;
        if(a.description > b.description) return 1;
        return 0;
    });

    let dtLinkedMaterial = new WebixCrudDatatable("dtLinkedMaterial");
    
    let dtUnlinkedMaterial = new WebixCrudDatatable("dtUnlinkedMaterial");
    
    let dtProductivity = new WebixCrudDatatable("dtProductivity");
    
    let allMaterial = await App.api.ormDbFind('material');

    if(allMaterial.data){
        allMaterial.data.sort(function(a,b) {
            if(a.description < b.description) return -1;
            if(a.description > b.description) return 1;
            return 0;
        });
    }

    let materialLink = new WebixInputSelect('materialLink', i18n('Material'), allMaterial.data, {
        template: function (obj) {
            return obj.description;
        }
    });

    let equipmentLink = new WebixInputSelect('equipmentsSequenceLink', i18n('Equipments'), allEquipment.data, {
        template: function (obj) {
            return obj.description;
        },
        "onChange": setEquipmentLink
    });

    let btnSearchLink = {
        view: "button",
        id: "btnSearchLink",
        name: "btnSearchLink",
        width: 100,
        height: 30,
        click: search,
        value: i18n("Search"),
        align: "center"
    }

    let btnLink = {
        view: "button",
        id: "btnLink",
        width: 100,
        height: 30,
        click: link,
        value: '< ' + i18n("Link"),
        align: "center"
    };

    let btnUnlink = {
        view: "button",
        id: "btnUnlink",
        width: 100,
        height: 30,
        click: unlink,
        value: i18n("Unlink") + ' >',
        align: "center"
    }

    dtLinkedMaterial.columns = [
        { 
            id: "status", 
            header: "", 
            width: 35, 
            css: "center", 
            template: "{common.checkbox()}", 
            cssFormat: status 
        },
        {
            id: "id",
            header: i18n("Id"),
            width: 130,
            sort: "string"
        },
        {
            id: "value",
            header: i18n("Description"),
            fillspace: true,
            sort: "string"
        }
    ];
    dtLinkedMaterial.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtLinkedMaterial", event);
        }
    };

    dtUnlinkedMaterial.columns = [
        { 
            id: "status", 
            header: "", 
            width: 35, 
            css: "center", 
            template: "{common.checkbox()}", 
            cssFormat: status 
        },
        {
            id: "id",
            header: i18n("Id"),
            width: 130,
            sort: "string"
        },
        {
            id: "value",
            header: i18n("Description"),
            fillspace: true,
            sort: "string"
        }
    ];
    dtUnlinkedMaterial.on = {
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtUnlinkedMaterial", event);
        }
    };

    let txtLinkedMaterial = ({
        view: "label",
        label: i18n("Linked Material"),
        inputWidth: 100,
        align: "center"
    })
    
    let txtUnlinkedMaterial = ({
        view: "label",
        label: i18n("Unlinked Material"),
        inputWidth: 100,
        align: "center"
    })

    let cell1 = {
        header: i18n("Equipment/Material Link"),
        body: {
            view: 'form',
            id: 'linked',
            rows: [
                {
                    cols: [
                        equipmentLink
                    ]
                },
                {
                    cols: [
                        materialLink,
                    ]
                },
                {
                    cols: [
                        {},
                        btnSearchLink,
                        {},
                    ],
                },
                {
                    cols: [
                        txtLinkedMaterial,
                        txtUnlinkedMaterial
                    ]
                },
                {
                    cols: [
                        dtLinkedMaterial,
                        dtUnlinkedMaterial
                    ]
                },
                {
                    cols: [
                        {},
                        btnUnlink,
                        {},
                        btnLink,
                        {}
                    ]
                }
            ]
        }
    };

    //cell2
    let equipmentProductivity = new WebixInputSelect('equipmentsSequenceProductivity', i18n('Equipments'), allEquipment.data, {
        template: function (obj) {
            return obj.description;
        },
        "onChange": setEquipmentProductivity
    });

    let productivity = new WebixInputText("productivity", i18n("Productivity (mts/min)"), {
        disabled: true,
        format: "111.00"
    })

    let maxproductivity = new WebixInputText("maxproductivity", i18n("Max Productivity (mts/min)"), {
        disabled: true,
        format: "111.00"
    })

    let btnAddProductivity = new WebixCrudAddButton('addProductivity', i18n('ADD Productivity'), addProductivity, { height: 80 });

    let txtProductivitybyEquipment = ({
        view: "label",
        label: i18n("Productivity by Equipment"),
        inputWidth: 100,
        align: "center"
    })

    dtProductivity.columns = [
        { 
            id: "status", 
            header: "", 
            width: 35, 
            css: "center", 
            template: "{common.checkbox()}", 
            cssFormat: status
        },
        {
            id: "equipmentdescription",
            header: [i18n("Equipment"), { content: "textFilter" }], sort: "string",
            width: 130
        },
        {
            id: "value",
            header: [i18n("Material"), { content: "textFilter" }], sort: "string",
            fillspace: true
        },
        {
            id: "productivityvalue",
            header: i18n("Productivity"),
            width: 100,
            sort: "string"
        },
        {
            id: "maxproductivity",
            header: i18n("Max Productivity"),
            width: 100,
            sort: "string"
        }
    ];

    dtProductivity.on = {
        "onCheck": setLinkedMaterial,
        "onAfterColumnDrop": function () {
            util.datatableColumsSave("dtProductivity", event);
        }
    };

    let cell2 = {
        header: i18n("Equipment/Material Productivity"),
        body: {
            view: 'form',
            id: 'productivityForm',
            rows: [
                {
                    cols: [
                        equipmentProductivity
                    ]
                },
                {
                    cols: [
                        productivity,
                        maxproductivity
                    ]
                },
                {
                    cols: [
                        padding
                    ]
                },
                {
                    cols: [
                        padding
                    ]
                },
                {
                    cols: [
                        txtProductivitybyEquipment
                    ]
                },
                {
                    cols: [
                        dtProductivity
                    ]
                },
                {
                    cols: [
                        btnAddProductivity
                    ]
                }
        ],
    }
    };

    const tabview = {
        view: 'tabview',
        id: "sequence",
        cells: [
            cell1,
            cell2
        ]
    }

    const grids = {
        view: 'form',
        id: "sequence",
        elements: [
            tabview
        ]
    }

    let menu = createSimpleCrudMenu(i18n('Productivity'), dtProductivity);
    App.replaceMainMenu(menu);
    await App.replaceMainContent(grids);

    await util.datatableColumsGet('dtLinkedMaterial', event);
    await util.datatableColumsGet('dtUnlinkedMaterial', event);
    await util.datatableColumsGet('dtProductivity', event);
}

function createSimpleCrudMenu(title, dtProductivity) {
    let menu = WebixBuildReponsiveTopMenu(title, [{
        id: "pdf",
        icon: "fas fa-file-pdf",
        label: i18n("Export") + " PDF",
        click: async () => {
            let grid = $$(dtProductivity.id);
            let dateString = Date();
            webix.toPDF(grid, {
                filename: i18n("Productivity") +" "+ dateString,
                orientation:"portrait",
                autowidth:true
            });
        }
    }]);

    return menu;
}

async function menu(status) {
    if (status)
        $$("pdf").enable();
    else
        $$("pdf").disable();
}

async function setEquipmentLink() {

    $$('linked').elements.materialLink.enable();

    let idEquip = $$('linked').elements.equipmentsSequenceLink.data.value
    let linkedMaterial = await App.api.ormDbProductivityMaterialEquipment({ idequipment: idEquip })
    $$('dtLinkedMaterial').clearAll();

    aLinkedMaterial = linkedMaterial.data;

    if (linkedMaterial.data.length > 0) {
        reloadTableLink();
    }

}

async function search() {
    
    let equip = $$('linked').elements.equipmentsSequenceLink.getValue();
    let mat = $$('linked').elements.materialLink.getValue();

    let unlinkedMaterial = await App.api.ormDbUnlinkedMaterial({ material: mat, equipment: equip });

    aUnlinkedMaterial = unlinkedMaterial.data;

    if (unlinkedMaterial.data.length > 0) {
        reloadTableLink();
    }
    else {
        webix.message(i18n("The select material is already linked"));
        reloadTableLink();
    }
}

async function link() {

    let equip = $$('linked').elements.equipmentsSequenceLink.getValue();

    if(equip) {

        let item = $$('dtUnlinkedMaterial').serialize();

        let selectedLink = [];
        
        item.map((elem) => {
            if (elem.status == 1) {
                selectedLink.push({
                    idequipment: equip,
                    idmaterial: elem.id,
                    iduser: localStorage.getItem('login')
                })
            }
            return;
        });

        if (selectedLink.length > 0) {

            let result = await App.api.ormDbProductivityMaterial(selectedLink);
        
            if (result.success) {
                webix.message(i18n('Linked successfully!'));
                reloadTableLink();
            } else {
                webix.message(i18n('Linked error!'));
            }

        }
        else {
            webix.message('Select some material to Link!');
        }

    } else {
        webix.message(i18n("Please select an equipment!"));
    }

}

async function unlink() {

    let equip = $$('linked').elements.equipmentsSequenceLink.getValue();
    let item = $$('dtLinkedMaterial').serialize();

    let selectedUmLink = [];
    
    item.map((elem) => {
        if (elem.status == 1) {
            selectedUmLink.push({
                idequipment: equip,
                idmaterial: elem.id,
                productivityvalue: elem.productivityvalue,
                iduser: localStorage.getItem('login')
            })
        }
        return;
    });

    let getProductivityvalue = item.findIndex(x => x.productivityvalue != null);

    if (selectedUmLink.length > 0) {

        if (getProductivityvalue != -1) {

            webix.confirm(i18n('This Equipment/Material Link has a Productivity Value. Are you sure you want to Unlink this field? '), '', async (result) => {
                if (result) {
                    let data = await App.api.ormDbProductivityMaterialDelete(selectedUmLink);
                    
                    if (data.success) {
                        webix.message(i18n('Unlinked successfully!'));
                        reloadTableLink();
                    } else {
                        webix.message(i18n('Unlinked error!'));
                    }
                }
            });

        } else {

            let data = await App.api.ormDbProductivityMaterialDelete(selectedUmLink);
                    
            if (data.success) {
                webix.message(i18n('Unlinked successfully!'));
                reloadTableLink();
            } else {
                webix.message(i18n('Unlinked error!'));
            }

        }

    } else {
        webix.message('Select some material to Link!');
    }

}

async function reloadTableLink() {

    let idEquip = $$('linked').elements.equipmentsSequenceLink.data.value;
    let equip = $$('linked').elements.equipmentsSequenceLink.getValue();
    let mat = $$('linked').elements.materialLink.getValue();

    $$('dtUnlinkedMaterial').clearAll();
    $$('dtLinkedMaterial').clearAll();

    let linkedMaterial = await App.api.ormDbProductivityMaterialEquipment({ idequipment: idEquip })
    $$('dtLinkedMaterial').parse(linkedMaterial.data, 'json');

    let unlinkedMaterial = await App.api.ormDbUnlinkedMaterial({ material: mat, equipment: equip });
    $$('dtUnlinkedMaterial').parse(unlinkedMaterial.data, 'json');
}

async function setEquipmentProductivity() {
    let idEquip = $$('productivityForm').elements.equipmentsSequenceProductivity.data.value
    let productivity = await App.api.ormDbProductivityMaterialEquipment({ idequipment: idEquip })

    productivity.data.sort(function(a,b) {
        if(a.value < b.value) return -1;
        if(a.value > b.value) return 1;
        return 0;
    });

    allLinkedMaterial = productivity.data;

    $$('dtProductivity').clearAll();
    $$('dtProductivity').parse(allLinkedMaterial);
}

async function setLinkedMaterial() {

    let item = $$('dtProductivity').serialize();

    let getProductivity = item.filter((value) => { return value.status === 1; });

    if (getProductivity.length > 0) {

        $$('productivityForm').elements.productivity.enable();
        $$('productivityForm').elements.maxproductivity.enable();

        if (getProductivity.length === 1) {
            await setForm();
        } else {
            $$('productivityForm').elements.productivity.setValue("0");
            $$('productivityForm').elements.maxproductivity.setValue("0");
        }
    
    } else {
    
        $$('productivityForm').elements.productivity.disable();
        $$('productivityForm').elements.maxproductivity.disable();
    
    }

}

async function addProductivity() {

    let equip = $$('cmbEquipmentsSequenceProductivity').getValue();
    let item = $$('dtProductivity').serialize();

    let selectedProductivity = [];
    
    let productivity = $$('productivityForm').elements.productivity.getValue();
    let maxproductivity = $$('productivityForm').elements.maxproductivity.getValue();

    item.map((elem) => {
        if (elem.status == 1) {
            selectedProductivity.push({
                idequipment: equip,
                idmaterial: elem.id,
                productivityvalue: productivity,
                maxproductivity: maxproductivity,
                iduser: localStorage.getItem('login')
            })
        }
        return;
    });

    if (productivity > 0) {
    
        let data = await App.api.ormDbProductivityMaterialUpdated(selectedProductivity);
                    
        if (data.success) {
            webix.message(i18n('Linked Updated successfully!'));
            setEquipmentProductivity();
        } else {
            webix.message(i18n('Linked Updated error!'));
        }

    } else {
        webix.message(i18n('The productivity value cannot be 0 or less then 0!'));
    }

}

async function setForm() {
    let value = $$('dtProductivity').serialize();

    let idItemSelect = value.findIndex(x => x.status != null);

    let item = value[idItemSelect];

    let valueProductivity = item.productivityvalue ? item.productivityvalue : 0;
    let valueMaxProductivity = item.maxproductivity ? item.maxproductivity : 0;
    
    $$('productivityForm').elements.productivity.setValue(valueProductivity);
    $$('productivityForm').elements.maxproductivity.setValue(valueMaxProductivity);
}

async function reloadTableProductivity() {

    $$('dtProductivity').clearAll();
    $$('dtProductivity').parse(aProductivity, 'json');

}