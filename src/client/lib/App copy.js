import { API } from "./Api.js";
import { DefaultEventEmitterImpl } from "./EventEmitter.js";
import { WebixBuildReponsiveTopMenu, WebixWindow, WebixWrapper } from "./WebixWrapper.js";
import { LoginScreen } from "./LoginScreen.js";
import { MainScreenFrame } from "./MainScreen.js";
import { guid, loadScript, getCookie } from "./Util.js";
import { AppMenuDialog } from "./AppMenuDialog.js";
import { ls } from "./LocalStorage.js";
import { i18n, loadI18n } from "./I18n.js";
import { CreatePassScreen } from "./CreatePassScreen.js";

export class APP {
    constructor() {
        this.eventEmitter = new DefaultEventEmitterImpl();
        this.login = "UNKNOWN";
        this.permissions = {};
        this.api = new API();
        this.webix = {};
        this.appMenuDialog = {};
        this.loginScreen = {};
        this.mainScreenFrame = {};
        this.config = {};
        this.sub = {};
        this.isLogged = false;
        this.serviceWorkerRegistration = null;
        this.onLine = navigator.onLine;

        this.on("login", async (login) => {
            ls.set("login", login);
            this.permissions = await this.api.getPermission();
            ls.setObj("permissions", this.permissions);
            this.boot();
        });

        this.on("logout", () => {
            ls.del("login");
            ls.del("userName");
            localStorage.clear();
            window.location.replace(window.location.origin);
        });

        this.on("error", (e) => {
            webix.message(i18n("Oops, we identified an error."));
            console.error(e);
        });

        window.addEventListener('online', (e) => {
            this.emit("online");
        }, false);

        window.addEventListener('offline', (e) => {
            this.emit("offline");
        }, false);
    }

    async boot() {
        this.isLogged = await this.checkLogin();
        this.config = await this.checkConfig();

        await loadI18n();

        this.initServiceWorker();
        this.login = ls.get("login") || "UNKNOWN";
        this.ctx = {};
        this.webix = new WebixWrapper(this);
        this.loginScreen = new LoginScreen(this);
        this.createPassScreen = new CreatePassScreen(this);

        window.addEventListener('online', () => {
            WebixWrapper.replaceLogoOnLine();

            if (this.config.pushenabled) {
                this.connectPush();
            }

        }, false);

        window.addEventListener('offline', () => {
            WebixWrapper.replaceLogoOffline();
        }, false);

        if (!App.isOnline) {
            WebixWrapper.replaceLogoOffline();
        }

        if (this.isLogged) {
            let promises = [];

            this.permissions = ls.getObj("permissions", {});
            this.mainScreenFrame = new MainScreenFrame(this);
            this.appMenuDialog = new AppMenuDialog(this);

            this.on("MainScreenReady", () => {
                for (let f of this.config.bootfile) {
                    promises.push(loadScript(f, guid(), false));
                }
            });
            

            this.mainScreenFrame.show();
            Promise.all(promises).then(() => {
                let urldata = this.getURLState();

                if (urldata && urldata.loc)
                    this.emit(urldata.loc);
            });

            $$('txtUserName').setHTML(ls.get("login")+' - '+ls.get("userName"));
        }
        else {
            if (this.getURLState().loc) {
                if (this.getURLState().loc.indexOf('createPassword') == 0) {
                    let token = (this.getURLState().loc.split('/'))[1];
                    this.createPassScreen.show(token);
                }
            }
            else
                this.loginScreen.show();
        }
    }

    async checkLogin() {
        let recheckLogin = async () => {
            let isLogged = await this.api.isloggedin();
            if (!isLogged) {
                ls.del("isloggedin");
                return false;
            }
            else
                return true;
        };

        let check = ls.get("isloggedin");

        if (check && check === "true") {
            return await recheckLogin();
        }

        return false;
    }

    async checkConfig() {
        let updateConfig = async () => {
            let c = await this.api.config();
            ls.setObj("config", c);
            return c;
        };

        let ret = ls.getObj("config", {});
        let retjson = JSON.stringify(ret);

        if (retjson === "{}") {
            ret = await updateConfig();
            return ret;
        }

        updateConfig();
        return ret;
    }

    showNotificationPermissionRequest(doSub) {
        let msg = {
            template: i18n("This App requires your permission in order to receive notifications. Please click ok on the button below to allow it")
        };

        let bt = {
            view: "button",
            type: "icon",
            icon: "bell",
            label: i18n("Allow Notifications"),
            click: () => {
                w.close();
                doSub();
            }
        };

        let tb = {
            view: "toolbar",
            height: 40,
            elements: [bt]
        };

        let w = WebixWindow.showWindow({
            rows: [msg, tb]
        }, i18n("Allow Notifications"));
    }

    connectPush() {
        let me = this;
        let notifiedServer = false;

        //@ts-ignore TODO:Check how to get a Typescript fix for this
        if (Notification.permission === 'denied') {
            console.warn('The user has blocked notifications.');
            return;
        }

        if (!('PushManager' in window)) {
            console.warn('Push messaging isn\'t supported.');
            return;
        }

        function sendSubscriptionToServer(sub) {
            me.api.registerFCMEndpoint(sub.endpoint);
            console.dir(sub);
            console.log("Notification Endpoint registered - Youre a Happy Camper!⛺️🔥⛺️");
        }

        function doSub() {
            navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
                me.serviceWorkerRegistration = serviceWorkerRegistration;
                serviceWorkerRegistration.pushManager.subscribe({
                    userVisibleOnly: true
                })
                    .then(function (subscription) {
                        // TODO: Send the subscription.endpoint to your server
                        me.sub = subscription;
                        return sendSubscriptionToServer(subscription);
                    })
                    .catch(function (e) {
                        console.error(e);
                        //@ts-ignore TODO: Find a fix for this...
                        if (Notification.permission === 'denied') {
                            console.warn('Permission for Notifications was denied');
                        } else {
                            console.error('Unable to subscribe to push.', e);
                        }
                    });
            });
        }

        this.serviceWorkerRegistration.pushManager.getSubscription()
            .then(function (subscription) {
                if (!subscription) {
                    me.showNotificationPermissionRequest(doSub);
                    return;
                }
                me.sub = subscription;
                if (!notifiedServer) {
                    notifiedServer = true;
                    sendSubscriptionToServer(subscription);
                }
            }).catch(function (err) {
                console.warn('Error during getSubscription()', err);
            });
    }

    initServiceWorker() {
        let me = this;

        function initialiseState(reg) {
            me.serviceWorkerRegistration = reg;
            navigator.serviceWorker.addEventListener("alert", (e) => {
                let msg = e.data;
                if (msg && msg.msgtype && msg.msgtype === "push") {
                    me.emit("push", msg);
                }
                // console.dir(e);
            });
            if (me.isLogged) {
                if (me.config && me.config.pushenabled) {
                    me.connectPush();
                }
            }
            if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
                console.warn('Notifications aren\'t supported.');
                return;
            }
        }
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(initialiseState).catch(function (err) {
                console.error('ServiceWorker registration failed: ', err);
            });
        }
    }

    async logout() {
        try {
            let key = getCookie("X-SESSION");
            this.api.logout(key);
        } catch (err) {
            console.error(err);
        }
        this.emit("logout");
    }

    getLogin() {
        return this.login;
    }

    getURLState() {
        let hash = window.location.hash;
        if (hash && hash.length > 1) {
            hash = hash.split('#')[1];
            let state = JSON.parse(decodeURI(atob(hash)));
            return state;
        }
        return {};
    }

    setURLState(state) {
        let str = JSON.stringify(state);
        let b64 = btoa(encodeURI(str));
        let loc = window.location.toString().split('#')[0];
        let nloc = loc + '#' + b64;
        window.history.pushState(this.config.app.name, 'Location', nloc);
    }

    addSimpleItem(parent, title, evt) {

        this.mainScreenFrame.addSimpleItem(parent, title, evt);

        // if (this.permissions.clientside.some(x => x.object.match(new RegExp(evt)) && x.enabled == true)){
        //     if (this.permissions.clientside.some(x => x.object.match(new RegExp(parent)) && x.enabled == true)){
        //         this.mainScreenFrame.addSimpleItem(parent, i18n(title), evt);
        //     }
        //     else{
        //         this.mainScreenFrame.addSimpleItem("", i18n(title), evt);
        //     }
        // }

    }

    replaceMainContent(config, after) {
        let parent = $$('layoutMain') ? $$('layoutMain').getParentView() : {};
        let mainContent = {
            id: 'layoutMain',
            rows: [config]
        };

        let ret = webix.ui(mainContent, parent, 'layoutMain');

        if (config.onAfterRender) {
            config.onAfterRender();
        }

        if (after)
            after();
    }

    replaceFullScreen(config, after) {
        let parent = $$('mainFrame'); //? $$('mainFrame').getParentView() : {};
        let mainContent = {
            id: 'mainFrame',
            rows: [config]
        };
        let ret = webix.ui(mainContent, $$("mainFrame"));
        if (config.onAfterRender) {
            config.onAfterRender();
        }
        if (after)
            after();
    }

    replaceMainMenu(config, after) {
        $$('layoutMainMenu').show();
        let parent = $$('layoutMainMenu') ? $$('layoutMainMenu').getParentView() : {};
        let mainContent = {
            id: 'layoutMainMenu',
            rows: [config]
        };
        webix.ui(mainContent, parent, 'layoutMainMenu');
        if (after)
            after();
    }

    getViewPortDimensions() {
        var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        return {
            h,
            w
        };
    }

    emit(e, ...params) {
        params.push(e);
        this.eventEmitter.emit(e, ...params);
    }

    on(e, h) {
        this.eventEmitter.on(e, h);
    }

    //FIXME: improve this
    get isOnline() {
        //return navigator.onLine;
        return true;
    }

    set isOnline(n) {
        this.onLine = n;
        if (n)
            this.emit("online");
        else
            this.emit("offline");
    }

    hideMainMenu() {
        $$('layoutMainMenu').hide();
    }

    async loadAllCrudData(route, datatable, ORDER = { "colum": 'id', "sort": 'ASC' }) {
        let data = await App.api.ormDbFind(route);

        function isLetter(c) {
            return c.toLowerCase() != c.toUpperCase();
        }

        function NumeroFloat(d) {
            if (d) {
                if (isLetter(d.toString())) {
                    return parseFloat(d.toUpperCase().charCodeAt());
                } else {
                    return parseFloat(d);
                }
            }
        }

        if (ORDER && ORDER.sort == 'ASC') {
            if(data){
                data.data.sort(function (a, b) { return NumeroFloat(a[ORDER.colum]) - NumeroFloat(b[ORDER.colum]) });
            }
            //data.data.sort(function (a, b) { return NumeroFloat(a[ORDER.colum]) - NumeroFloat(b[ORDER.colum]) });
        } else if (ORDER && ORDER.sort == 'DESC') {
            if(data){
                data.data.sort(function (a, b) { return NumeroFloat(b[ORDER.colum]) - NumeroFloat(a[ORDER.colum]) });
            }
        }


        if (data.code == 200) {
            let dtTable = $$(datatable.id);
            if (dtTable) {
                dtTable.clearAll();
                dtTable.parse(data.data, "json");
            }
        }
    }

 


    objectToXml(obj) {
        var xml = '';

        for (var prop in obj) {

            if (!obj.hasOwnProperty(prop)) {
                continue;
            }
            if (obj[prop] == undefined || obj[prop] == null || obj[prop] === "") {
                continue;
            } 

            if (obj[prop].length == undefined || typeof obj[prop] == "string") {
                xml += "<" + prop + ">";
            }

            if (typeof obj[prop] == "object") {
                if (obj[prop].length) {
                    for (let i = 0; i < obj[prop].length; i++) {
                        xml += "<" + prop + ">";
                        xml += this.objectToXml(new Object(obj[prop][i]));
                        xml += "</" + prop + ">";
                    }
                }
                else {
                    xml += this.objectToXml(new Object(obj[prop]));
                }
            }
            else
                xml += obj[prop];

            if (obj[prop].length == undefined || typeof obj[prop] == "string") {
                xml += "</" + prop + ">";
            }
        }

        return xml;
    }

    randomFixedInteger(length) {
        return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
    }

    /**
     * Responsavel por criar o padrão de interface junto ao mes
     * 
     * @param {Object} item - Receive object with order
     * @param {Object} opts
     * @param {Object} opts.idinterface - Identifier of the interface with the EAI
     * @param {Object} opts.idstatus - Regarding the return status of the MES
     * @param {Object} opts.messagestatus - Referring to the return message of the MES
     * @param {Object} opts.operation - Regarding the operation with the MES (D - delete, U - update, C - create)
     * @param {Object} opts.ordernumber - Referring to the order number
     * @param {Object} opts.itemorder - Referring to the order SaleOrderItem
     * @param {Object} opts.weightorder - Referring to the weight of the order
     * @param {Object} opts.orderplanned - Referring to the plenary order
     * @param {Object} opts.rework - Referring to order rework
     * @param {Object} opts.numberofmaterialLoad - Referring to the material loading number
     * @param {Object} opts.lotload - Referring to the load batch
     * @param {Object} opts.weightconsumed - Regarding the weight consumed of the order
     */


    makeGUID() {
        var d = new Date().getTime();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            d += performance.now(); //use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    makeSTRING(length = 0) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        length = length < 0 ? 5 : length;

        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    createSimpleCrudMenu(title, datatable, window, route, opts) {
        let items = [{
            id: "btnAdd",
            label: "Add",
            disabled: true,
            icon: "fas fa-plus",
            click: async () => {
                window.show();
                window.setTitle(i18n('New Item'));
                let form = $$(window.body.id);
                let elements = Object.values(form.elements);

                for (let element of elements) {
                    if (opts && opts.reload) {
                        if (element.config.name == 'sequenceView') {
                            $$(element.config.id).hide();
                        }
                    }
                }
                if ($$("txtId"))
                    $$("txtId").focus();
            }
        }, {
            id: "btnRemove",
            icon: "fas fa-trash-alt",
            label: "Remove",
            click: async () => {

                let enabled = { success: false, alert: "success" };
                if (opts && opts.beforeRemove) {
                    enabled = await opts.beforeRemove();
                    if (enabled && enabled.data.length == 0) {
                        webix.confirm({
                            //title: "Close",
                            text: i18n("Do you want to remove this item?"),
                            type: "confirm-warning",
                            callback: async (result) => {

                                if (result) {

                                    let grid = $$(datatable.id);
                                    let item = grid.getSelectedItem();

                                    if (item == null) {
                                        webix.message("Um ítem deve ser selecionado");
                                        return;
                                    } else {
                                        let result = null;
                                        if (opts && opts.reload) {
                                            result = await App.api.ormDbDelete({
                                                id: item.newId,
                                                disposaltypesequence: item.sequenceView
                                            }, route);
                                        } else {
                                            if (route == 'steelsimilarity') {
                                                result = await App.api.ormDbDelete(item, route);
                                            } else {
                                                result = await App.api.ormDbDelete({
                                                    id: item.id
                                                }, route);
                                            }
                                        }
                                        if (result && result.success) {
                                            webix.message(i18n('Item removed successfully'));

                                            if (opts && opts.reload)
                                                opts.reload();
                                            else if (opts && opts.reloadDate)
                                                opts.reloadDate()
                                            else
                                                this.loadAllCrudData(route, datatable);
                                        } else {
                                            webix.message(i18n('Error ' + result && result.alert ? result.alert : ''));
                                        }

                                    }
                                }
                            }
                        });

                    } else {
                        webix.message(i18n('There are items registered!'));
                    }
                } else {
                    webix.confirm({
                        //title: "Close",
                        text: i18n("Do you want to remove this item?"),
                        type: "confirm-warning",
                        callback: async (result) => {

                            if (result) {

                                let grid = $$(datatable.id);
                                let item = grid.getSelectedItem();

                                if (item == null) {
                                    webix.message("Um ítem deve ser selecionado");
                                    return;
                                } else {
                                    let result = null;
                                    if (opts && opts.reload) {
                                        result = await App.api.ormDbDelete({
                                            id: item.newId,
                                            disposaltypesequence: item.sequenceView
                                        }, route);
                                    } else {
                                        if (route == 'steelsimilarity') {
                                            delete item.id;
                                            result = await App.api.ormDbDelete(item, route);
                                        } else {
                                            result = await App.api.ormDbDelete({
                                                id: item.id
                                            }, route);
                                        }
                                    }
                                    if (result && result.success) {
                                        webix.message(i18n('Item removed successfully'));

                                        if (opts && opts.reload)
                                            opts.reload();
                                        else if (opts && opts.reloadDate)
                                            opts.reloadDate()
                                        else
                                            this.loadAllCrudData(route, datatable);
                                    } else {
                                        webix.message(i18n('Error ' + result && result.alert ? result.alert : ''));
                                    }

                                }
                            }
                        }
                    });
                }
            }
        }, {
            id: "btnEdit",
            icon: "fas fa-edit",
            label: "Edit",
            click: async () => {
                let grid = $$(datatable.id);
                let item = grid.getSelectedItem();

                if (item == null) {
                    webix.message("Um ítem deve ser selecionado");
                    return;
                } else {

                    if (item.status == false) {
                        webix.message(i18n('the item can not be edited!'));
                        return;
                    }

                    window.show();
                    window.setTitle(i18n('Edit Item'));
                    let form = $$(window.body.id);
                    let elements = Object.values(form.elements);

                    for (let element of elements) {

                        if (element != null) {
                            if (opts && opts.reload) {
                                if (element.config.name == 'id') {
                                    $$(element.config.id).setValue(item.newId);
                                    $$(element.config.id).disable();
                                }
                                if (element.config.name == 'disposaltypesequence') {
                                    $$(element.config.id).setValue(item.sequenceView);
                                    $$(element.config.id).disable();
                                }
                            } else {
                                if (element.config.name in item) {
                                    $$(element.config.id).setValue(item[element.config.name]);
                                    if (element.config.name == 'id') {
                                        $$(element.config.id).disable();
                                    }
                                }
                            }

                        }
                    }
                }
            }
        }, {
            id: "btnExport",
            icon: "fas fa-file-pdf",
            label: "Export",
            click: async () => {
                let grid = $$(datatable.id);
                let dateString = Date();
                webix.toPDF(grid, {
                    filename: i18n(title) + " " + dateString,
                    orientation: "portrait",
                    autowidth: true
                });
            }
        }];

        if (opts && opts.items) {
            for (let item of opts.items) {
                items.push(item);
            }
        }

        let menu = WebixBuildReponsiveTopMenu(title, items);

        return menu;
    }

    createDefaultFormCrud(title, datatable, elements, rules, route, opts) {
        elements.push({
            cols: [
                {
                    view: 'button',
                    id: 'btnCancel',
                    value: i18n('Cancel'),
                    click: () => {
                        modal.close();
                    }
                },
                {
                view: 'button',
                id: 'btnConfirm',
                value: i18n('Confirm'),
                click: async () => {

                    let enabled = true;

                    let form = $$('frmCrud');
                    let itemId = form.elements['id'];
                    let values = this.prepareObjectToSaveOrUpdate(form.getValues());

                    if (itemId && itemId.isEnabled() || !values.id) {
                        if (opts && opts.beforeCreate) {
                            enabled = await opts.beforeCreate();
                            if (enabled) {
                                this.editData(title, datatable, elements, rules, route, opts, modal);
                            } else {
                                webix.message("Ítem já registrado.");
                            }
                        } else {
                            this.editData(title, datatable, elements, rules, route, opts, modal);
                        }

                    } else {

                        if (opts && opts.beforeEdit) {
                            enabled = await opts.beforeEdit();
                            if (enabled) {
                                this.editData(title, datatable, elements, rules, route, opts, modal);
                            } else {
                                webix.message("Ítem já registrado.");
                            }
                        } else {
                            this.editData(title, datatable, elements, rules, route, opts, modal);
                        }

                    }

                }
            },
            
            ]
        });

        const frmCrud = {
            view: "form",
            id: "frmCrud",
            elements: elements,
            rules: rules
        };

        let modal = new WebixWindow({
            width: opts && opts.width ? opts.width : 600
        });

        modal.body = frmCrud;
        modal.modal = true;

        let menu = this.createSimpleCrudMenu(title, datatable, modal, route, opts);
        this.replaceMainMenu(menu);
    }

    // EDIT CRUD
    async editData(title, datatable, elements, rules, route, opts, modal) {

        let ret = null;
        let form = $$('frmCrud');

        if (form.validate()) {

            let itemId = form.elements['id'];

            let values = this.prepareObjectToSaveOrUpdate(form.getValues());

            if (itemId && itemId.isEnabled() || !values.id) {

                ret = await this.api.ormDbCreate(route, values);

                if (ret.success) {
                    webix.message("Ítem cadastrado com sucesso!");
                    modal.close();
                } else {
                    webix.message("Ítem já registrado.");
                }

            } else {

                if (opts && opts.reload && opts.dt) {
                    let itemSequence = form.elements['disposaltypesequence'];
                    ret = await this.api.ormDbUpdate({
                        "id": itemId.getValue(),
                        "disposaltypesequence": itemSequence.getValue()
                    }, route, values);
                    if (ret.success) {
                        webix.message("Ítem editado com sucesso!");
                        modal.close();
                    }
                } else {
                    ret = await this.api.ormDbUpdate({
                        "id": itemId.getValue()
                    }, route, values);
                    if (ret.success) {
                        webix.message("Ítem editado com sucesso!");
                        modal.close();
                    }
                }
            }

            if (ret.code == 200) {
                if (opts && opts.reload)
                    opts.reload();
                else if (opts && opts.reloadDate)
                    opts.reloadDate()
                else
                    this.loadAllCrudData(route, datatable);
            }

        } else {
            webix.message("Ítens obrigatórios inválidos ou vazios.");
            return;
        }

    }



    toggleSidebar() {
        $$('sidebar').hide();
        $$('sidebarresizer').hide();
        // this.mainScreenFrame.toggleSidebar();
    }

    prepareObjectToSaveOrUpdate(object) {
        for (let key in object) {
            if (object[key] == "" || object[key] == null) {
                delete object[key]
            }
        }
        return object;
    }

}

export let App = new APP();