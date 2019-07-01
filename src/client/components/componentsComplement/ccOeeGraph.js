
import { i18n } from "../../lib/I18n.js";
import { App } from "../../lib/App.js";
import * as util from "../../lib/Util.js";
import { WebixCrudDatatable, WebixInputDate, WebixInputCombo, WebixBuildReponsiveTopMenu } from "../../lib/WebixWrapper.js";

import * as ccT1Graph from "./ccT1Graph.js";
import * as ccT2Graph from "./ccT2Graph.js";
import * as ccT3Graph from "./ccT3Graph.js";

export async function createOee() {
    // GRAPH
    let chartLineOee = {
        view: "chart",
        container: "chartDiv",
        type: "line",
        id: "oeegraph",
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
                value: "#targetoee#",
                label: "#targetoee#",
                item: {
                    borderColor: "#ff0000",
                    color: "#ffffff"
                },
                line: {
                    color: "#ff0000",
                    width: 3
                },
                tooltip: {
                    template: "#targetoee#"
                }
            },
            {
                value: "#calc#",
                label: "#calc#",
                item: {
                    borderColor: "#66cc00",
                    color: "#ffffff"
                },
                line: {
                    color: "#66cc00",
                    width: 3
                },
                tooltip: {
                    template: "#calc#"
                }
            }
        ],
        data: []
    };

    let chartBarOee = {
        preset: "column",
        view: "chart",
        type: "bar",
        id: "oeeyeargraph",
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
            header: i18n("OEE by Selected Period"),
            body: chartLineOee
        }, 
        {
            header: i18n("Accumulated by years"),
            collapsed: true,
            body: chartBarOee
        }
        ]
    };

    return {
        header: "OEE",
        view: 'form',
        minWidth: 800,
        id: "formoee",
        rows: [
            accordion,
        ]
    };
    
}

export async function changeData(data) {

    let t1 = await ccT1Graph.changeData(data)
    let t2 = await ccT2Graph.changeData(data)
    let t3 = await ccT3Graph.changeData(data)

    let auxt1 = t1.monthlyt1;
    let auxt2 = t2.monthlyt2;
    let auxt3 = t3.monthlyt3;

    let auxMonth = await fillAuxMonth(auxt1, auxt2, auxt3);
    
    $$('oeegraph').clearAll();
    $$('oeegraph').parse(auxMonth, "json");

    auxt1 = t1.accumulatedt1;
    auxt2 = t2.accumulatedt2;
    auxt3 = t3.accumulatedt3;

    let auxYear = await fillAuxYear(auxt1, auxt2, auxt3);

    $$('oeeyeargraph').clearAll();
    $$('oeeyeargraph').parse(auxYear, "json");
    
}

async function fillAuxMonth(t1, t2, t3) {

    let aux = [
        {
            namemonth: "JAN",
            calc: 1,
        },
        {
            namemonth: "FEB",
            calc: 1,
        },
        {
            namemonth: "MAR",
            calc: 1,
        },
        {
            namemonth: "APR",
            calc: 1,
        },
        {
            namemonth: "MAY",
            calc: 1,
        },
        {
            namemonth: "JUN",
            calc: 1,
        },
        {
            namemonth: "JUL",
            calc: 1,
        },
        {
            namemonth: "AUG",
            calc: 1,
        },
        {
            namemonth: "SEP",
            calc: 1,
        },
        {
            namemonth: "OCT",
            calc: 1,
        },
        {
            namemonth: "NOV",
            calc: 1,
        },
        {
            namemonth: "DEC",
            calc: 1,
        },
    ]

    aux = aux.map((elem)=> {
        let auxt1 = t1.filter( (x) => {
            return (x.namemonth === elem.namemonth)
        })

        if (auxt1.length > 0){
            elem.calc = elem.calc * (Number(auxt1[0].calct1) / 100),
            elem.targetoee = auxt1[0].targetoee
        }

        let auxt2 = t2.filter( (x) => {
            return (x.namemonth === elem.namemonth)
        })

        if (auxt2.length > 0){
            elem.calc = elem.calc * (Number(auxt2[0].calct2) / 100),
            elem.targetoee = auxt2[0].targetoee
        }

        let auxt3 = t3.filter( (x) => {
            return (x.namemonth === elem.namemonth)
        })

        if (auxt3.length > 0){
            elem.calc = elem.calc * (Number(auxt3[0].calct3) / 100),
            elem.targetoee = auxt3[0].targetoee
        }

        if(elem.calc != 1){
            elem.calc = (elem.calc * 100).toFixed(2)
        }

        return {
            calc: Number(elem.calc),
            namemonth: elem.namemonth,
            targetoee: elem.targetoee ? elem.targetoee : null
        }

    })

    aux = aux.filter((x) => {
        return x.calc != 1
    })

    return aux
}

async function fillAuxYear(t1, t2, t3){

    let aux = [
        {
            numyear: new Date().getFullYear() - 1,
            percentWorking: 1,
        },
        {
            numyear: new Date().getFullYear(),
            percentWorking: 1,
        }
    ]

    aux = aux.map((elem)=> {
        
        let auxt1 = t1.filter( (x) => {
            return (x.numyear === elem.numyear)
        })

        if (auxt1.length > 0){
            elem.percentWorking = elem.percentWorking * (Number(auxt1[0].percentWorking) / 100)
        }

        let auxt2 = t2.filter( (x) => {
            return (x.numyear === elem.numyear)
        })

        if (auxt2.length > 0){
            elem.percentWorking = elem.percentWorking * (Number(auxt2[0].percentWorking) / 100)
        }

        let auxt3 = t3.filter( (x) => {
            return (x.numyear === elem.numyear)
        })

        if (auxt3.length > 0){
            elem.percentWorking = elem.percentWorking * (Number(auxt3[0].percentWorking) / 100)
        }

        if(elem.percentWorking != 1){
            elem.percentWorking = (elem.percentWorking * 100).toFixed(2)
        }

        return {
            percentWorking: Number(elem.percentWorking),
            numyear: elem.numyear,
            targetoee: elem.targetoee ? elem.targetoee : null
        }



    });

    return aux

}





