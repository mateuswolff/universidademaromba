
import { i18n } from "../../lib/I18n.js";

export async function createT3() {

    // GRAPH
    let chartLineT3 = {
        view: "chart",
        container: "chartDiv",
        type: "line",
        id: "t3graph",
        xAxis: {
            template: "#namemonth#"
        },
        yAxis: {
            start: 0,
            step: 10,
            end: 100
        },
        legend: {
            values: [{ text: i18n("Goal") + " 100", color: "#ff0000" }, { text: i18n("Monthly Accumulated"), color: "#66cc00" }],
            align: "right",
            valign: "middle",
            layout: "y",
            width: 100,
            margin: 8
        },
        series: [
            {
                value: "#targett3#",
                label: "#targett3#",
                item: {
                    borderColor: "#ff0000",
                    color: "#ffffff"
                },
                line: {
                    color: "#ff0000",
                    width: 3
                },
                tooltip: {
                    template: "#targett3#"
                }
            },
            {
                value: "#calct3#",
                label: "#calct3#",
                item: {
                    borderColor: "#66cc00",
                    color: "#ffffff"
                },
                line: {
                    color: "#66cc00",
                    width: 3
                },
                tooltip: {
                    template: "#calct3#"
                }
            }
        ],
        data: []
    };

    let chartBarT3 = {
        preset: "column",
        view: "chart",
        type: "bar",
        id: "t3yeargraph",
        value: "#percentWorking#",
        label: "#percentWorking#",
        border: false,
        color: (obj) => {
            if (obj.numyear == new Date().getFullYear()){
                return "#66cc00";
            }
            else {
                return "#ff0000";
            }
        },
        yAxis: {
            start: 0,
            step: 10,
            end: 100,
            template: function (value) {
                return (value % 20 ? "" : value);
            }
        },
        xAxis: {
            template: "#numyear#"
        },
        data: []
    }

    let accordion = {
        multi: true,
        view: "accordion",
        type: "wide",
        rows: [{
            header: i18n("T3 by Selected Period"),
            body: chartLineT3
        }, {
            header: i18n("Accumulated by years"),
            collapsed: true,
            body: chartBarT3
        }
        ]
    };

    return {
        header: "T3",
        view: 'form',
        minWidth: 800,
        id: "formt3",
        rows: [
            accordion,
        ]
    };
}

export async function changeData(data) {

    let dataResultT3 = data.resultT3.data;
    let dataResultAccumlatedT3 = data.resultAccumulatedT3.data;


    //Filling T3 Line Graph
    
    var datasetResultT3 = dataResultT3.map(
        (elem) => {

            elem.namemonth = nameMonth(elem.nummonth)

            return {
                calct3: elem.resultt3.toFixed(2),
                namemonth: elem.namemonth,
                nummonth: elem.nummonth,
                targett3: elem.targett3,
                idequipment: elem.idequipment,
                targetoee: elem.targetoee
            }
        }
    );



    $$('t3graph').clearAll();
    $$('t3graph').parse(datasetResultT3, "json");

    
    //Filling Accumulated T3 Graph

    let datasetAccumulated = dataResultAccumlatedT3.map((elem) => {
        
        let percentWorking = elem.t3 ;
       
        percentWorking = percentWorking.toFixed(2)
        
        return {
            percentWorking: percentWorking,
            numyear: elem.numyear
        }
    });

    $$('t3yeargraph').clearAll();
    $$('t3yeargraph').parse(datasetAccumulated, "json");

    return {
        monthlyt3: datasetResultT3, 
        accumulatedt3: datasetAccumulated
    }

}

function nameMonth(value) {
    switch (value) {
        case 1:
            return i18n("JAN");
        case 2:
            return i18n("FEB");
        case 3:
            return i18n("MAR");
        case 4:
            return i18n("APR");
        case 5:
            return i18n("MAY");
        case 6:
            return i18n("JUN");
        case 7:
            return i18n("JUL");
        case 8:
            return i18n("AUG");
        case 9:
            return i18n("SEP");
        case 10:
            return i18n("OCT");
        case 11:
            return i18n("NOV");
        case 12:
            return i18n("DEZ");
    }
}



