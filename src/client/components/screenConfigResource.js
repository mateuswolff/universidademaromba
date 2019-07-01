import { App } from "../lib/App.js";
import { i18n } from "../lib/I18n.js";
import { optionsStatus } from "../components/optionsScreens.js"
import { WebixCrudDatatable, WebixInputText, WebixInputDate, WebixInputCombo } from "../lib/WebixWrapper.js";
import * as util from "../lib/Util.js";

export async function showScreen() {

    let dtResource = new WebixCrudDatatable("dtResource");

    let allResourceType = await App.api.ormDbFind('resourcetype');

    dtResource.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], sort: "string", width: 80 },
        {
            id: "idresourcetype", template: (obj) => {
                return (allResourceType.data.find(x => x.id == obj.idresourcetype)).description;
            },
            header: [i18n("Instrument Type"), { content: "selectFilter" }],
            sort: "string",
            fillspace: true
        },
        {
            id: "recorddate",
            format: webix.Date.dateToStr("%d/%m/%y"),
            header: [i18n("Record Date"), { content: "dateFilter" }],
            sort: "date",
            width: 80
        },
        {
            id: "dategauging",
            format: webix.Date.dateToStr("%d/%m/%y"),
            header: [i18n("Gauging Date"), { content: "dateFilter" }],
            sort: "date",
            width: 80
        },
        {
            id: "duedate",
            format: webix.Date.dateToStr("%d/%m/%y"),
            header: [i18n("Due Date"), { content: "dateFilter" }],
            sort: "date",
            width: 80
        },
        {
            id: "certified",
            header: [i18n("Certified"), { content: "textFilter" }],
            sort: "string",
            fillspace: true
        },
        {
            id: "model",
            header: [i18n("Model"), { content: "textFilter" }],
            sort: "string",
            fillspace: true
        },
        {
            id: "local",
            header: [i18n("Local"), { content: "textFilter" }],
            sort: "string",
            fillspace: true
        },

    ]

    dtResource.createStatusColumn();
    let validate = (id, req) => {
        if (id == 'idresourcetype') {
            for (var i = 0; i < req.values.length; i++) {
                let option = (allResourceType.data.find(x => x.id == req.values[i].value));
                if (option) {
                    req.values[i].value = option.description;
                }
            }
        }
    }

    dtResource.changeFilterOptions(validate);

    let itens = [
        new WebixInputText("id", i18n("Id")),
        new WebixInputCombo("idresourcetype", i18n("Resource Type"), allResourceType.data, {
            template: function (obj) {
                return obj.description;
            },

            onChange: (obj) => {
                
                let index = allResourceType.data.findIndex(x => x.id == obj);
                
                let targetDate = moment($$('frmCrud').elements.dategauging.getValue()).add(allResourceType.data[index].validity, 'M').format('MM/DD/YYYY');

                $$('frmCrud').elements.duedate.setValue(targetDate)

            }

        }),
        {
            cols: [
                new WebixInputDate("recorddate", i18n("Record Date"), { disabled: true }, new Date()),
                new WebixInputDate("dategauging", i18n("Gauging Date"),
                {
                    onChange: (obj) => {
                        
                        let rt = $$('frmCrud').elements.idresourcetype.getValue()

                        let index = allResourceType.data.findIndex(x => x.id == rt);
                        
                        let targetDate = moment(obj).add(allResourceType.data[index].validity, 'M');
                        
                        targetDate = new Date(targetDate);
                        
                        $$('frmCrud').elements.duedate.setValue(targetDate)

                    }
                }),
                new WebixInputDate("duedate", i18n("Target Date"), { disabled: true }),
            ]
        },
        new WebixInputText("certified", i18n("Certified")),
        new WebixInputText("model", i18n("Model")),
        new WebixInputText("local", i18n("Local")),
    ]

    let rules = {
        "id": webix.rules.isNotEmpty,
        "idresourcetype": webix.rules.isNotEmpty,
        "recorddate": webix.rules.isNotEmpty,
        "dategauging": webix.rules.isNotEmpty,
        "duedate": webix.rules.isNotEmpty,
    }

    async function reloadData() {
        let data = await App.api.ormDbFind('resource');
        let temp = [];

        for (let item of data.data) {
            item.recorddate = new Date(item.recorddate);
            item.dategauging = new Date(item.dategauging);
            item.duedate = new Date(item.duedate);
            item.scrapdate = new Date(item.scrapdate);
            temp.push(item);
        }

        $$('dtResource').clearAll();
        $$('dtResource').parse(temp, "json");
    }

    App.createDefaultFormCrud('Resource', dtResource, itens, rules, 'resource', { "reloadDate": reloadData });
    App.replaceMainContent(dtResource, reloadData);
}