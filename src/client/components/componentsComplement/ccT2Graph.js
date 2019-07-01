
import { i18n } from "../../lib/I18n.js";

export async function createT2() {

    // GRAPH
    let chartLineT2 = {
        view: "chart",
        container: "chartDiv",
        type: "line",
        id: "t2graph",
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
                value: "#targett2#",
                label: "#targett2#",
                item: {
                    borderColor: "#ff0000",
                    color: "#ffffff"
                },
                line: {
                    color: "#ff0000",
                    width: 3
                },
                tooltip: {
                    template: "#targett2#"
                }
            },
            {
                value: "#calct2#",
                label: "#calct2#",
                item: {
                    borderColor: "#66cc00",
                    color: "#ffffff"
                },
                line: {
                    color: "#66cc00",
                    width: 3
                },
                tooltip: {
                    template: "#calct2#"
                }
            }
        ],
        data: []
    };

    let chartBarT2 = {
        preset: "column",
        view: "chart",
        type: "bar",
        id: "t2yeargraph",
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
            header: i18n("T2 by Selected Period"),
            body: chartLineT2
        }, {
            header: i18n("Accumulated by years"),
            collapsed: true,
            body: chartBarT2
        }
        ]
    };

    return {
        header: "T2",
        view: 'form',
        minWidth: 800,
        id: "formt2",
        rows: [
            accordion,
        ]
    };
}


export async function changeData(data) {

    let dataResultT2 = data.resultT2.data;
    let dataResultAccumlatedT2 = data.resultAccumulatedT2.data;


    //Filling T2 Line Graph
    
    var datasetResultT2 = dataResultT2.map(
        (elem) => {

            elem.namemonth = nameMonth(elem.nummonth)

            return {
                calct2: elem.resultt2.toFixed(2),
                minutes: elem.minutes,
                namemonth: elem.namemonth,
                nummonth: elem.nummonth,
                targett2: elem.targett2,
                idequipment: elem.idequipment,
                targetoee: elem.targetoee
            }
        }
    );


    $$('t2graph').clearAll();
    $$('t2graph').parse(datasetResultT2, "json");

    
    //Filling Accumulated T2 Graph

    let datasetAccumulated = dataResultAccumlatedT2.map((elem) => {
        
        let percentWorking = elem.finalcalc ;

        percentWorking = percentWorking * 100
        percentWorking = percentWorking.toFixed(2)
        
        return {
            percentWorking: percentWorking,
            numyear: elem.numyear
        }
    });

    $$('t2yeargraph').clearAll();
    $$('t2yeargraph').parse(datasetAccumulated, "json");

    return {
        monthlyt2: datasetResultT2, 
        accumulatedt2: datasetAccumulated
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



