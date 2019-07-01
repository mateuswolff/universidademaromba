import {
    WebixWindow, WebixInputText
} from "../lib/WebixWrapper.js";
import {
    i18n
} from "../lib/I18n.js";
import {
    App
} from "../lib/App.js";

export async function showModal(item, hiddenItem = false) {
    return new Promise(async function (resolve, reject) {

        let equipment = item.equipment;
        let order = item.order;
        let linked = await App.api.ormDbLinkedChecklistItem({ equipment: equipment });
        linked = linked.data;

        let allChecklistItemResult = await App.api.ormDbFind('checklistitemresult', { idchecklist: linked[0].idchecklist, idordermes: order.toString() });
        allChecklistItemResult = allChecklistItemResult.data;

        if (allChecklistItemResult.length == 0) {
            await App.api.ormDbSaveChecklistItemResult({ checklistItems: linked, order: order });
        }
        else if (linked.length > allChecklistItemResult.length) {
            linked.forEach(async (e) => {
                if (allChecklistItemResult.findIndex(x => x.idchecklistitem == e.checklistitem) == -1) {
                    let linkedAr = [];
                    linkedAr.push(e)
                    await App.api.ormDbSaveChecklistItemResult({ checklistItems: linkedAr, order: order });
                }
            })
        }

        const padding = ({
            view: "label",
            label: i18n(""),
        });

        let items = []
        let field = {};

        let btnSave = {
            hidden: hiddenItem,
            view: "button",
            id: "btnSave",
            name: "btnSave",
            click: updateRegister,
            value: i18n("Save"),
            align: "center"
        }

        for (let i = 0; i < linked.length; i++) {

            let checklistitemresult = await App.api.ormDbFind('checklistitemresult', { idchecklist: linked[i].idchecklist, idordermes: order.toString() });
            checklistitemresult = checklistitemresult.data

            let numbervalue = 0;
            let textvalue = "";

            let index = checklistitemresult.findIndex(x => x.idchecklistitem == linked[i].checklistitem)

            if (index != -1) {
                if (checklistitemresult[index].numbervalue && checklistitemresult[index].numbervalue != '') {
                    numbervalue = checklistitemresult[index].numbervalue
                }
                if (checklistitemresult[index].textvalue && checklistitemresult[index].textvalue != '') {
                    textvalue = checklistitemresult[index].textvalue
                }
                if (linked[i].typevalue == 'NUMBER') {
                    field = new WebixInputText("num-" + linked[i].checklistitem, null, {
                        format: "1111.00",
                        labelPosition: "left",
                        labelAlign: "right",
                        disabled: hiddenItem
                    },
                        numbervalue)
                }
                else {

                    field = new WebixInputText("txt-" + linked[i].checklistitem, null, {
                        labelPosition: "left",
                        labelAlign: "right",
                        disabled: hiddenItem
                    },
                        textvalue)
                }

                let checked;

                checklistitemresult[index].checked ? checked = 1 : checked = 0

                let status = (
                    {
                        view: "toggle", type: "iconButton", name: "btn-" + linked[i].checklistitem,
                        width: 80,
                        offIcon: "fa fa-times",
                        onIcon: "fa fa-check",
                        offLabel: i18n("Not OK"),
                        onLabel: "OK",
                        css: 'colour_toggle',
                        value: checked,
                        disabled: hiddenItem
                    }
                );

                items.push(
                    {
                        view: "fieldset",
                        label: i18n(linked[i].checklistitemdescription),
                        borderless: true,
                        body: {
                            rows: [{
                                cols: [
                                    field,
                                    status
                                ]
                            }],

                        }
                    }
                )

                items.push(padding);

            }
        }

        if (items.length) {
            items.push(btnSave);
        } else {
            items.push({
                view: 'label',
                label: i18n('No checklists linked for this equipment.')
            })
        }

        let modal = new WebixWindow({
            onClosed: (modal) => {

                if (items.length < 1 || hiddenItem) {
                    modal.close();
                    return;
                }

                webix.confirm({
                    type: "confirm-warning",
                    text: "<strong>" + i18n("Unsaved changes!!") + "</strong>",
                    ok: i18n("Save"),
                    cancel: i18n("Don't save"),
                    callback: async function (result) {
                        if (result) {
                            updateRegister()
                            if (modal)
                                modal.close();
                        } else {
                            if (modal)
                                modal.close();
                        }
                    }
                });
            }
        });

        modal.body = {
            view: "form",
            id: "formChecklist",
            elements: [
                {
                    rows: items
                }
            ]
        };

        modal.modal = true;
        modal.show();

        async function updateRegister() {

            let aChli = [];
            let formValues = $$('formChecklist').getValues();

            let aFormValues = Object.keys(formValues);
            let checklist = linked[0].idchecklist;

            aFormValues.forEach(e => {

                let idchecklistitem = e.substring(4);
                let objChli = {};

                let index = aChli.findIndex(x => x.idchecklistitem == idchecklistitem)

                if (index == -1) {
                    objChli.idchecklistitem = idchecklistitem;
                    objChli.idchecklist = checklist;
                    objChli.idordermes = order;

                    if (e.substring(4, 0) == "txt-")
                        objChli.textvalue = formValues[e]
                    else
                        objChli.numbervalue = formValues[e]

                    if (idchecklistitem != "ave")
                        aChli.push(objChli)
                }
                else {
                    if (formValues[e] == 0)
                        aChli[index].checked = false
                    else
                        aChli[index].checked = true
                }
            });

            await App.api.ormDbUpdateChecklistItemResult(aChli);

            modal.close();

        }

        modal.setTitle(i18n("Checklist"));

    });
}
