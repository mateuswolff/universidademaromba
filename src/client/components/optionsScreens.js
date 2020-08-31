import { i18n } from "../lib/I18n.js";

export const optionsTypeNorm = [
    { id: 'D', value: i18n("Default") },
    { id: 'S', value: i18n("Special") }
];  

export const optionsTypeOperation = [
    { id: 'I', value: i18n("Inspection") },
    { id: 'M', value: i18n("Movement") },
    { id: 'P', value: i18n("Product") }
];

export const optionsSituationMovement = [
    { id: 'C', value: i18n("Canceled") },
    { id: 'E', value: i18n("Lean") },
    { id: 'P', value: i18n("Pending") },
    { id: 'R', value: i18n("Realized") },
    { id: 'T', value: i18n("Working") }
];

export const optionsTypeValue = [
    { id: 'BOOLEAN', value: i18n('BOOLEAN') },
    { id: 'minmax', value: i18n('MIN MAX') },
    { id: 'number', value: i18n('NUMBER') },
    { id: 'select', value: i18n('SELECT') },
    { id: 'text', value: i18n('TEXT') },
];

export const optionsStatus = [
    { id: true, value: i18n("Active") },
    { id: false, value: i18n("Inactive") }
];

export const optionsSituationCutPlan = [
    { id: 'I', value: i18n("In Process") },
    { id: 'P', value: i18n("Pendent") },
    { id: 'R', value: i18n("Released") }
];

// T0 e T1
export const optionsOEECategory = [
    { id: 'T0', value: "T0" },
    { id: 'T1', value: "T1" }
];

// FTO / FTP / FTS / FTT / FTW / SDC / SDE / SDM / SDO1 / SDO2 / SDO3 / SDO4 / SDP e UOT
export const optionsTUC = [
    { id: 'FTO',  value: "FTO"  }, 
    { id: 'FTP',  value: "FTP"  }, 
    { id: 'FTS',  value: "FTS"  }, 
    { id: 'FTT',  value: "FTT"  }, 
    { id: 'FTW',  value: "FTW"  }, 
    { id: 'SDC',  value: "SDC"  }, 
    { id: 'SDE',  value: "SDE"  }, 
    { id: 'SDM',  value: "SDM"  }, 
    { id: 'SDO1', value: "SDO1" }, 
    { id: 'SDO2', value: "SDO2" }, 
    { id: 'SDO3', value: "SDO3" }, 
    { id: 'SDO4', value: "SDO4" }, 
    { id: 'SDP',  value: "SDP"  }, 
    { id: 'UOT',  value: "UOT"  }
];

// Interface
export const optionsInterface = [
    { id: 'MS01', value: "MS01 - Ordem" },
    { id: 'MS02', value: "MS02 - Coleta e fechamento de Ordem" },
    { id: 'MS04', value: "MS04 - Pendencia" },
    { id: 'SM01', value: "SM01 - Material" },
    { id: 'SM02', value: "SM02 - Caracteristica Lote" },
    { id: 'SM03', value: "SM03 - Lote" },
    { id: 'SM04', value: "SM04 - Reserva Lote" },
    { id: 'SM08', value: "SM08 - Ordem e Alocação SAP" }
];

// Status
export const optionsStatusInterface = [
    { id: 'OK',  value: "Ok"    },
    { id: 'ERR', value: "Error" },
    { id: 'NEW', value: "New"   },
    { id: 'BLK', value: "Blocked"   },
    { id: 'PRO', value: "Processing"   },
    { id: 'RSD', value: "Resended"   }
    
];

export const associationFields = (data, id, value) => {
    return data.map((item) => {
        return {
            id: item[id],
            value: item[value]
        };
    });
};

