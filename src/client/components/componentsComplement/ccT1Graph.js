
import { i18n } from "../../lib/I18n.js";

export async function createT1() {

    // GRAPH
    let chartLineT1 = {
        view: "chart",
        container: "chartDiv",
        type: "line",
        id: "t1graph",
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
                value: "#targett1#",
                label: "#targett1#",
                item: {
                    borderColor: "#ff0000",
                    color: "#ffffff"
                },
                line: {
                    color: "#ff0000",
                    width: 3
                },
                tooltip: {
                    template: "#targett1#"
                }
            },
            {
                value: "#calct1#",
                label: "#calct1#",
                item: {
                    borderColor: "#66cc00",
                    color: "#ffffff"
                },
                line: {
                    color: "#66cc00",
                    width: 3
                },
                tooltip: {
                    template: "#calct1#"
                }
            }
        ],
        data: []
    };

    let chartBarT1 = {
        preset: "column",
        view: "chart",
        type: "bar",
        id: "t1yeargraph",
        value: "#percentWorking#",
        label: "#percentWorking#",
        border: false,
        color: (obj) => {
            if (obj.numyear == new Date().getFullYear()) {
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
            header: i18n("T1 by Selected Period"),
            body: chartLineT1
        }, {
            header: i18n("Accumulated by years"),
            collapsed: true,
            body: chartBarT1
        }
        ]
    };

    return {
        header: "T1",
        view: 'form',
        minWidth: 800,
        id: "formt1",
        rows: [
            accordion,
        ]
    };
}

function sum(items, prop) {
    return items.reduce((a, b) => {
        return a + b[prop];
    }, 0)
}

export async function changeData(data) {

    let dataResultT0 = data.resultT0.data;
    let dataResultT1 = data.resultT1.data;
    let dataResultAccumlatedT1 = data.resultAccumulatedT1.data;


    //Filling T1 Line Graph
    let sumFilteredt1 = null;

    var datasetResultT1 = dataResultT1.map(
        (elem) => {

            let filtered = dataResultT1.filter(e => e.nummonth == elem.nummonth);
            sumFilteredt1 = sum(filtered, 'stopedtimet1');

            elem.namemonth = nameMonth(elem.nummonth)

            return {
                sumFilteredt1: sumFilteredt1,
                minutes: elem.minutes,
                namemonth: elem.namemonth,
                nummonth: elem.nummonth,
                targett1: elem.targett1,
                idequipment: elem.idequipment
            }
        }
    );

    datasetResultT1 = datasetResultT1.reduce((unique, o) => {
        if (!unique.some(obj => obj.nummonth === o.nummonth)) {
            unique.push(o)
        }
        return unique
    }, [])


    //Filling T0 data to calculate
    let sumFilteredt0 = null;

    var datasetResultT0 = dataResultT0.map(
        (elem) => {

            let filtered = dataResultT0.filter(e => e.nummonth == elem.nummonth);
            sumFilteredt0 = sum(filtered, 'stopedtimet0');

            elem.namemonth = nameMonth(elem.nummonth)

            return {
                sumFilteredt0: sumFilteredt0,
                namemonth: elem.namemonth,
                nummonth: elem.nummonth,
                targett0: elem.targett0,
                idequipment: elem.idequipment
            }
        }
    );

    datasetResultT0 = datasetResultT0.reduce((unique, o) => {
        if (!unique.some(obj => obj.nummonth === o.nummonth)) {
            unique.push(o)
        }
        return unique
    }, []);

    datasetResultT1 = datasetResultT1.map((e) => {
        let index = datasetResultT0.findIndex(x => x.nummonth == e.nummonth)

        if (index != -1) {
            let calc = (parseFloat(e.minutes) - datasetResultT0[index].targett0 - e.targett1) / (parseFloat(e.minutes) - datasetResultT0[index].targett0)

            calc = calc * 100
            calc = calc.toFixed(2)

            return {
                sumFilteredt1: sumFilteredt1,
                calct1: calc,
                namemonth: e.namemonth,
                nummonth: e.nummonth,
                targett1: e.targett1,
                idequipment: e.idequipment,
                targetoee: e.targetoee
            }
        }
    })

    $$('t1graph').clearAll();
    $$('t1graph').parse(datasetResultT1, "json");


    //Filling Accumulated T1 Graph

    let datasetAccumulated = dataResultAccumlatedT1.map((elem) => {

        let percentWorking = elem.finalcalc / elem.minutes;

        percentWorking = percentWorking * 100
        percentWorking = percentWorking.toFixed(2)

        return {
            percentWorking: percentWorking,
            numyear: elem.numyear
        }
    });

    $$('t1yeargraph').clearAll();
    $$('t1yeargraph').parse(datasetAccumulated, "json");

    return {
        monthlyt1: datasetResultT1, 
        accumulatedt1: datasetAccumulated
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



