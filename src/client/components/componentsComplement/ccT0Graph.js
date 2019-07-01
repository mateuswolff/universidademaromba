
import { i18n } from "../../lib/I18n.js";


export async function createT0() {

    // GRAPH
    let chartLineT0 = {
        view: "chart",
        container: "chartDiv",
        type: "line",
        id: "t0graph",
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
                value: "#targett0#",
                label: "#targett0#",
                item: {
                    borderColor: "#ff0000",
                    color: "#ffffff"
                },
                line: {
                    color: "#ff0000",
                    width: 3
                },
                tooltip: {
                    template: "#targett0#"
                }
            },
            {
                value: "#percentWorking#",
                label: "#percentWorking#",
                item: {
                    borderColor: "#66cc00",
                    color: "#ffffff"
                },
                line: {
                    color: "#66cc00",
                    width: 3
                },
                tooltip: {
                    template: "#percentWorking#"
                }
            }
        ],
        data: []
    };


    let chartBarT0 = {
        preset: "column",
        view: "chart",
        type: "bar",
        id: "t0yeargraph",
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
            header: i18n("T0 by Selected Period"),
            body: chartLineT0
        }, {
            header: i18n("Accumulated by years"),
            collapsed: true,
            body: chartBarT0
        }
        ]
    };

    return {
        header: "T0",
        view: 'form',
        minWidth: 800,
        id: "formt0",
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
    let dataResultAccumlatedT0 = data.resultAccumulatedT0.data;


    //Filling T0 Line Graph
    let sumFiltered = null;

    var datasetResultT0 = dataResultT0.map(
        (elem) => {

            let filtered = dataResultT0.filter(e => e.nummonth == elem.nummonth);
            sumFiltered = sum(filtered, 'stopedtimet0');

            elem.namemonth = nameMonth(elem.nummonth)

            let percentWorking = (elem.minutes - sumFiltered) / elem.minutes
            percentWorking = percentWorking * 100
            percentWorking = percentWorking.toFixed(2)

            return {
                percentWorking: percentWorking,
                namemonth: elem.namemonth,
                nummonth: elem.nummonth,
                targett0: elem.targett0,
                idequipment: elem.idequipment
            }
        }
    )

    datasetResultT0 = datasetResultT0.reduce((unique, o) => {
        if (!unique.some(obj => obj.nummonth === o.nummonth)) {
            unique.push(o)
        }
        return unique
    }, [])

    $$('t0graph').clearAll();
    $$('t0graph').parse(datasetResultT0, "json");


    //Filling Accumulated T0 Graph

    let datasetAccumulated = dataResultAccumlatedT0.map((elem) => {

        let percentWorking = (elem.minutes - elem.stopedtimet0) / elem.minutes
        percentWorking = percentWorking * 100
        percentWorking = percentWorking.toFixed(2)

        return {
            percentWorking: percentWorking,
            numyear: elem.numyear
        }
    });

    $$('t0yeargraph').clearAll();
    $$('t0yeargraph').parse(datasetAccumulated, "json");

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



