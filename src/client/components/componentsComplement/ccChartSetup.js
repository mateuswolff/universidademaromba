import { i18n } from "../../lib/I18n.js";
import { App } from "../../lib/App.js";

export async function create(data) {
    if (!data.length) {
        return {
            template: `<center style="margin-top: 50px;"> ${i18n('No items found for this search')} </center>`
        };
    } else {

        data = data.map(item => {
            item.startdate = moment(item.startdate).format('DD/MM/YYYY');
            return item;
        })
        return {
            view: "chart",
            height: 250,
            type: "line",
            xAxis: {
                template: "#startdate#"
            },
            yAxis: {
                start: 0,
                step: 10,
                end: 100
            },
            legend: {
                values: [{ text: i18n('Default'), color: "#1293f8" }, { text: i18n('Produced'), color: "#66cc00" }],
                align: "right",
                valign: "middle",
                layout: "y",
                width: 100,
                margin: 8
            },
            series: [
                {
                    value: "#default#",
                    item: {
                        borderColor: "#1293f8",
                        color: "#ffffff"
                    },
                    line: {
                        color: "#1293f8",
                        width: 3
                    },
                    tooltip: {
                        template: `#default# ${i18n('minute')}`
                    }
                },
                {
                    value: "#produced#",
                    item: {
                        borderColor: "#66cc00",
                        color: "#ffffff"
                    },
                    line: {
                        color: "#66cc00",
                        width: 3
                    },
                    tooltip: {
                        template: `#produced# ${i18n('minute')} <br/> order: #idorder#`
                    }
                }
            ],
            data: data
        };
    }
}