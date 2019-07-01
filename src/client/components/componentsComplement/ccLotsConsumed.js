import { i18n } from "../../lib/I18n.js";
import { App } from "../../lib/App.js";

export async function create(order) {
    
    let Allocation = await App.api.ormDbOrderAllocation({idorder: order.idordermes});
    Allocation = Allocation.data;

    Allocation.sort(function(a,b) {
        if(a.idorderentry < b.idorderentry) return -1;
        if(a.idorderentry > b.idorderentry) return 1;
        return 0;
    });

    //let lotconsumedData = lotconsumed.data[lotconsumed.data.length - 1] ? lotconsumed.data[lotconsumed.data.length - 1] : [];
    return {
        view: "form",
        scroll: false,
        // height: 130,
        width: 510,
        elements: [
            {
                view: "fieldset",
                label: i18n("Raw Material Lots"),
                borderless: true,
                body: {
                    rows: [
                        {
                            view: "datatable",
                            id: "dtAllocation",
                            scrollX:false,
                            columns: [
                                { id: "idlot", header: i18n("Lot"), width: 80 },
                                { id: "description", header: i18n("Material"), width: 180 },
                                { id: "weight", header: i18n("Weight"), width: 50 },
                                { id: "situationmovement", 
                                  header: i18n("Situation"), 
                                  width: 130,
                                  format: (value) => {
                                    return (value == 'P') ? i18n('Moving Pendant') : (value == 'E') ? i18n('In Front Of') : (value == 'C') ? i18n('Canceled') : (value == 'R') ? i18n('Finished') : (value == 'T') ? i18n('Processing') : i18n('In Stock')
                                }},
                            ],
                            data: Allocation
                        }
                    ]
                }
            }
        ]
    }
}