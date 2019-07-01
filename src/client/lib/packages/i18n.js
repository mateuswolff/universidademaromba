import { App } from "../App.js";
import { WebixDatatable } from "../WebixWrapper.js";
import { i18n } from "../I18n.js";
import { WebixBuildReponsiveTopMenu } from "../WebixWrapper.js";
import { checkClientPermission } from "../../control/permission.js";

App.addSimpleItem("", "I18N", "i18n");
App.addSimpleItem("i18n", "Internationalization", "i18n.internationalization");

App.on("i18n.internationalization", async () => {

    let dt = new WebixDatatable();

    function getDateFormat(date) {
        if (date) {
            let dt = new Date(date);
            let dia = dt.getDate();
            let mes = (dt.getMonth() + 1);
            let ano = dt.getFullYear();
            let horas = dt.getHours();
            let minutos = dt.getMinutes();

            let str = '';
            if (dia < 10) { str = '0' + dia + '/'; }
            else { str = dia + '/'; }
            if (mes < 10) { str = str + '0' + mes + '/' + ano + ' '; }
            else { str = str + mes + '/' + ano + ' '; }
            if (horas < 10) { str = str + '0' + horas; }
            else { str = str + horas; }
            if (minutos < 10) { str = str + ':' + '0' + minutos; }
            else { str = str + ':' + minutos; }
            return str;
        }
        return "";
    }

    function buildTopbar() {
        let textFilter = {
            id: 'textFilterI18N',
            view: "text",
            label: i18n("Filter"),
            on: {
                onTimedKeyPress: () => {
                    filterTable();
                }
            }
        };

        let topbarConfig = {
            view: "toolbar",
            elements: [textFilter]
        };

        return topbarConfig;
    }

    async function buildTable() {
        dt.id = "dti18n";
        dt.name = "dti18n";
        dt.columns = [
            { id: 'key', name: 'key', header: i18n("Key"), fillspace: 1, sort: 'string', fillspace: true },
            { id: 'value', name: 'value', header: i18n("Value"), fillspace: true, editor: "text", sort: 'string' },
            { id: 'locale', name: 'locale', header: i18n("Locale"), width: 60 },
            {
                id: 'dtupdated',
                header: i18n("Last Updated At"),
                width: 100,
                template: function (obj) {
                    if (obj.dtupdated)
                        return getDateFormat(obj.dtupdated);
                    else
                        return "";
                },
            },
        ];

        dt.on.onAfterEditStop = async function (state, editor, ignoreUpdate) {
            let item = dt.w.getSelectedItem();

            await App.api.ormDbUpdate({
                "key": item.key,
                "locale": item.locale
            }, 'i18n', {
                "value": item.value,
                "dtupdated": Date()
            });

            item.dtupdated = Date();
            dt.w.refresh();
        }

        let result = await App.api.ormDbFind('i18n');

        dt.data = result.data;
        return dt;
    }

    function filterTable() {
        let filterText = ($$("textFilterI18N")).getValue();
        if (filterText && filterText.length > 0) {
            dt.w.filter((row) => {
                if (
                    (row
                        && row.key
                        && row.key.toUpperCase().indexOf(filterText.toUpperCase()) != -1)
                    ||
                    (row
                        && row.value
                        && row.value.toUpperCase().indexOf(filterText.toUpperCase()) != -1)
                    ||
                    (row
                        && row.locale
                        && row.locale.toUpperCase().indexOf(filterText.toUpperCase()) != -1)
                ) return true;
                return false;
            });
        } else {
            dt.w.filter((row) => {
                return true;
            });
        }
    }

    let screenConf = { rows: [buildTopbar(), await buildTable()] };
    let menu = WebixBuildReponsiveTopMenu("Internationalization", []);

    App.replaceMainMenu(menu);

    App.replaceMainContent(screenConf, () => {
        let dti18n = ($$("dti18n"));
        dti18n.sort("key", "asc", "string");
    });
    checkClientPermission("i18n.internationalization");
})