import { i18n } from "../../lib/I18n.js";
import { App } from "../../lib/App.js";
import * as  _modalRegisterRNC from "../../extra/_modalRegisterRNC.js";
import * as _modalDefectRegistry from "../../extra/_modalDefectRegistry.js";
import * as util from "../../lib/Util.js"

export async function create(data, event) {
    return {
        view: "datatable",
        columns: [
            {
                id: "rawmaterial",
                header: [i18n("Raw material"), { content: "textFilter" }],
                sort: "string",
                fillspace: true
            },
            {
                id: "material",
                header: [i18n("Material"), { content: "textFilter" }],
                sort: "string",
                fillspace: true
            },
            {
                id: "datecreated",
                header: [i18n("Date created"), { content: "textFilter" }],
                format: (value) => { return value ? moment(value).format("DD/MM/YYYY hh:mm") : '' },
                sort: "string",
                fillspace: true
            },
            {
                id: "shift",
                header: [i18n("Shift"), { content: "textFilter" }],
                sort: "string",
                fillspace: true
            },
            {
                id: "startdate",
                header: [i18n("Start date"), { content: "textFilter" }],
                format: (value) => { return value ? moment(value).format("DD/MM/YYYY") : '' },
                sort: "string",
                fillspace: true
            },
            {
                id: "enddate",
                header: [i18n("End date"), { content: "textFilter" }],
                format: (value) => { return value ? moment(value).format("DD/MM/YYYY") : '' },
                sort: "string",
                fillspace: true
            },
            {
                id: "iduser",
                header: [i18n("Responsible"), { content: "textFilter" }],
                sort: "string",
                fillspace: true
            },
            {
                id: "equipment",
                header: [i18n("Equipment"), { content: "selectFilter" }],
                sort: "string",
                fillspace: true
            },
        ],
        data: data,
        id: "dtReportsSetup",
        dragColumn: true,
        leftSplit: 1,
        on: {
            "onAfterColumnDrop": function () {
                util.datatableColumsSave("dtReportsSetup", event);
            }
        }
    };
}