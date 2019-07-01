import { App } from "../App.js";
import { WebixBuildReponsiveTopMenu, WebixDatatable, WebixToolbar, WebixTreeTable, 
         WebixWindow, WebixCrudDatatable, WebixInputText } from "../WebixWrapper.js";
import { i18n } from "../I18n.js";
import { checkClientPermission } from "../../control/permission.js";

import * as redirect from "../../control/redirectScreens.js";

App.addSimpleItem("", "Security", "security");
App.addSimpleItem("security", "Groups", "security.groups");
App.addSimpleItem("security", "Users", "security.users");
App.addSimpleItem("security", "Sessions", "security.sessions");
App.addSimpleItem("security", "Interface", "security.interface");
App.addSimpleItem("security", "Logdata", "security.logdata");

App.on("security.interface", redirect.redirectSecurityInterface);
App.on("security.logdata", redirect.redirectSecurityLogdata);

App.on("security.groups", async () => {
    
    let dtGroups = new WebixCrudDatatable("dtGroups");

    let windowChangePerms = new WebixWindow();

    dtGroups.columns = [
        { id: "id", header: [i18n("Id"), { content: "textFilter" }], editor: "text", fillspace: 1 },
        { id: "name", header: [i18n("Name"), { content: "textFilter" }], editor: "text", fillspace: 2 },
        { id: "description", header: [i18n("Description"), { content: "textFilter" }], editor: "text", fillspace: 4 }
    ];

    dtGroups.createStatusColumn();
    dtGroups.changeFilterOptions();

    let itens = [
        new WebixInputText("id", i18n("Id")),
        new WebixInputText("name", i18n("Name")),
        new WebixInputText("description", i18n("Description"))
    ];

    let rules = {
        "id": webix.rules.isNotEmpty,
        "name": webix.rules.isNotEmpty,
        "description": webix.rules.isNotEmpty,
    };

    windowChangePerms.modal = true;
    windowChangePerms.width = 800;
    windowChangePerms.height = 600;

    let items = [
        {
            id: "btnPermissions",
            icon: "fas fa-list",
            label: "Permissions",
            click: async () => {
                let item = $$('dtGroups').getSelectedItem();

                if (item == null) {
                    webix.message(i18n('An item must be selected'));
                    return;
                } else {
                    let permissions = await App.api.getAvailablePermissions();

                    if (permissions != null) {
                        for (let perm of permissions) {
                            translatePerms(perm)
                        }
                    }

                    let treetable = {
                        view: "treetable",
                        id: "treePerms",
                        threeState: true,
                        columns: [
                            { id: "id", fillspace: 3, header: "Item", template: "{common.treetable()} {common.treecheckbox()} &nbsp; #title#" },
                            { id: "description", header: "Descrição", fillspace: 4 }
                        ],
                        data: permissions
                    }

                    let form = {
                        view: "form",
                        rows: [
                            treetable,
                            {
                                cols: [
                                    {
                                        view: "button", label: i18n('Cancel'),
                                        click: () => {
                                            windowChangePerms.close();
                                        }
                                    },
                                    {
                                        view: "button", label: i18n('Save'),
                                        click: async () => {
                                            let checkedItems = $$('treePerms').getChecked();
                                            await App.api.ormDbUpdate({ id: item.id }, 'group', { perms: checkedItems });
                                            await App.loadAllCrudData('group', dtGroups);
                                            windowChangePerms.close();
                                        }
                                    }
                                ]
                            }
                        ]
                    }

                    windowChangePerms.body = form;
                    windowChangePerms.show();
                    windowChangePerms.setTitle(i18n('Set Permissions'));

                    if (item.perms && item.perms) {
                        for (let perm of item.perms) {
                            $$('treePerms').checkItem(perm);
                        }
                    }
                }
            }
        }
    ]

    App.createDefaultFormCrud('Group', dtGroups, itens, rules, 'group', { items: items });
    App.replaceMainContent(dtGroups, async () => App.loadAllCrudData('group', dtGroups));
    checkClientPermission("security.groups");
});

App.on("security.users", async () => {
    
    let dtUsers = new WebixCrudDatatable("dtUsers");
    let windowGroups;

    dtUsers.columns = [
        { id: "user", header: [i18n("User"),{ content: "textFilter" }] , fillspace: 0.5},
        { id: "email", header: [i18n("Email"),{ content: "textFilter" }] , fillspace: 1},
        { id: "name", header: [i18n("Name"), { content: "textFilter" }] , fillspace: 1},
        { 
            id: "situation", fillspace: 0.5,
            template: (obj) => {
                return (obj.situation == 'A') ? i18n("Active") : i18n("Inactive");
            },
            header: [i18n("Status"), {
                content: "selectFilter",
                compare: (cellValue, filterValue) => {
                    return cellValue.toString() == filterValue.toString();
                }
            }],
            sort: "string"
        }
    ];

    dtUsers.on = {        
        onCollectValues: (id, req) => {
            if (id == 'situation') {
                for (var i = 0; i < req.values.length; i++) {
                    req.values[i].value = (req.values[i].value == 'A') ? i18n("Active") : i18n("Inactive");
                }
            }
        }
    } 

    //dtUsers.data = users;    

    await App.replaceMainContent(dtUsers);

    refreshList();

    function buildMenu() {
        let tb = WebixBuildReponsiveTopMenu("Users", [
            {
                id: "btnEnable",
                icon: "fas fa-check",
                label: "Enable",
                click: async () => {
                    let grid = $$('dtUsers');
                    let item = grid.getSelectedItem();

                    if (item == null) {
                        webix.message(i18n('An item must be selected'));
                        return;
                    } else {
                        await App.api.ormDbUpdate({ code: item.code }, 'user', { situation: 'A' });
                        webix.message(i18n('Item enabled successfully'));
                        refreshList();
                    }
                }
            }, 
            {
                id: "btnDisable",
                icon: "fas fa-minus",
                label: "Disable",
                click: async () => {
                    let grid = $$('dtUsers');
                    let item = grid.getSelectedItem();

                    if (item == null) {
                        webix.message(i18n('An item must be selected'));
                        return;
                    } else {
                        await App.api.ormDbUpdate({ code: item.code }, 'user', { situation: 'D' });
                        webix.message(i18n('Item disabled successfully'));
                        refreshList();
                    }
                }
            },
            {
                id: "btnGroups",
                icon: "fas fa-users",
                label: "Groups",
                click: async () => {
                    showGroupsScreen();
                }
            }

        ]);
        return tb;
    }

    async function showGroupsScreen() {
        let user = dtUsers.w.getSelectedItem(false);
        let groups = await App.api.ormDbFind('group', { status: true });

        let groupOptions = await groups.data.map((item) => {
            return {
                id: item.id,
                value: item.name
            }
        })

        let form = {
            view: "form",
            elements: [
                new WebixInputText("email", i18n("Email"), { disabled: true }, user.email),
                {
                    view: "dbllist",
                    id: "listGroups",
                    list: { autoheight: false },
                    labelLeft: i18n("Available groups"),
                    labelRight: i18n("Selected"),
                    data: groupOptions,
                    value: (user.groups) ? user.groups : ''
                },
                {
                    cols:[
                        {
                            view: "button", label: i18n('Cancel'),
                            click: () => {
                                windowGroups.close();
                            }
                        },
                        {
                            view: "button", label: i18n('Save'),
                            click: async () => {
                                let groups = $$('listGroups').getValue();
                                await App.api.ormDbUpdate({ user: user.user }, 'user', { groups: groups });
                                windowGroups.close();
                            }
                        }
                    ]
                }
            ]
        }

        windowGroups = WebixWindow.showWindow(form, i18n('List of Groups'));
    }

    async function refreshList(){
        let users = await App.api.ormDbFind('user');

        let dtTable = $$('dtUsers')
        dtTable.clearAll();
        dtTable.parse(users.data, "json");
    }

    let menu = buildMenu();
    App.replaceMainMenu(menu);
    checkClientPermission("security.users");
});

App.on("security.sessions", async () => {
    
    let menu = WebixBuildReponsiveTopMenu("User Sessions", []);
    let dt = new WebixDatatable();
    
    let data = [];
    dt.columns = [
        { id: "login", fillspace: 1 },
        { id: "dtcreated:", fillspace: 1 },
    ];
    dt.data = data;
    App.replaceMainContent(dt);
    App.replaceMainMenu(menu);
    checkClientPermission("security.sessions");
});

App.on("security.groups.editperms", async (g) => {
    let tree = new WebixTreeTable();
    tree.columns = [
        { id: "id", header: "", fillspace: 1 },
        { id: "name", header: "Name", fillspace: 3, template: "{common.treetable()} #name#", editor: "text" },
        {
            id: "value",
            header: "Value",
            fillspace: 5,
            editor: "text",
        }
    ];
    const ID_TEXT_FILTER = "textFilter";
    function removeSelected() {
        tree.removeSelected();
    }
    function addRoot() {
        tree.w.add({ name: i18n("New Entry"), value: i18n("New Entry Value") }, -1, undefined);
    }
    function add() {
        let sel = tree.w.getSelectedItem(false);
        tree.w.add({ name: i18n("New Entry"), value: i18n("New Entry Value") }, -1, sel.id);
    }
    async function addAll() {
        // let availablePerms: any = await App.api.getAvailablePermissions();
        // let merged = _.merge(availablePerms, g.permissions ? g.permissions : {});
        // let treePerms = WebixTreeTable.mapObjInTree(merged);
        // tree.w.clearAll();
        // tree.w.parse(JSON.stringify(treePerms), "json");
    }
    function buildTopBar() {
        let buttonAddRoot = {
            view: "button",
            type: "icon",
            label: i18n("Add Root"),
            autowidth: true,
            icon: "plus",
            click: () => {
                addRoot();
            }
        };
        let buttonAdd = {
            view: "button",
            type: "icon",
            label: i18n("Add Node"),
            autowidth: true,
            icon: "plus-circle",
            click: () => {
                add();
            }
        };
        let buttonAddAll = {
            view: "button",
            type: "icon",
            label: i18n("Add All"),
            autowidth: true,
            icon: "star",
            click: () => {
                addAll();
            }
        };
        let buttonRem = {
            view: "button",
            type: "icon",
            label: i18n("Remove Node"),
            autowidth: true,
            icon: "minus",
            click: () => {
                removeSelected();
            }
        };
        let filter = {
            view: "text",
            id: ID_TEXT_FILTER,
            label: i18n("Filter")
            // on: {
            //     onTimedKeyPress: () => {
            //         let text = ($$(ID_TEXT_FILTER) as webix.ui.text).getValue()
            //         if (text && text.length > 0) {
            //             text = text.toUpperCase();
            //             tree.w.filter((row: TTreeEntry) => {
            //                 return (row.id && _.isString(row) && row.id.toUpperCase().indexOf(text) != -1)
            //                     || row.name.toUpperCase().indexOf(text) != -1
            //                     || (_.isString(row.value) && row.value.toUpperCase().indexOf(text) != -1)
            //             })
            //         } else {
            //             tree.w.filter((row: TTreeEntry) => {
            //                 return true;
            //             })
            //         }
            //     }
            // }
        };
        let tb = {
            view: "toolbar",
            elements: [buttonAddRoot, buttonAdd, buttonAddAll, buttonRem, filter]
        };
        return tb;
    }
    let treePerms = WebixTreeTable.mapObjInTree(g.permissions || {});
    tree.data = treePerms;
    tree.scheme = {
        $update: function (obj) {
            if (obj.type == 'BOOLEAN') {
                if (obj.value == "1")
                    obj.value = 1;
                else
                    obj.value = 0;
            }
            else if (obj.type == "number") {
                obj.value = Number.parseInt(obj.value);
            }
            else {
                obj.value = obj.value;
            }
        }
    };
    let tb = new WebixToolbar();
    let btnSave = {
        view: "button", label: i18n("Save"), type: "form",
        click: () => {
            let objPerms = WebixTreeTable.mapTreeInObj(tree.w.serialize());
            g.permissions = objPerms;
            webix.message("Saving Perms...");
        }
    };
    tb.elements.push(btnSave);
    WebixWindow.showWindow({ rows: [buildTopBar(), tree, tb] }, i18n("Permissions Editor"));
});

function translatePerms(perm) {
    if (perm.data != null) {
        for (let child of perm.data) {
            translatePerms(child);
        }

        perm.title = i18n(perm.title);
        perm.description = i18n(perm.description);
    }
    else {
        perm.title = i18n(perm.title);
        perm.description = i18n(perm.description);
    }
}