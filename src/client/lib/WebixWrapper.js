import {
    getViewPortDimensions,
    guid,
    isArray,
    datatableColumsSave,
    datatableColumsGet
} from "./Util.js";
import {
    i18n
} from "./I18n.js";

const MAXMOBILEBEHAVIORWIDTH = 600;

// const optionsStatusTest = [
//     { id: true, value: i18n("Active") },
//     { id: false, value: i18n("Inactive") }
// ];

export function WebixComponent(target, key) {
    // property value
    var _val = target[key];
    // property getter
    var getter = function () {
        return $$(key);
    };
    // property setter
    var setter = function (newVal) {
        _val = newVal;
    };
    // Create new property with getter and setter
    Object.defineProperty(target, key, {
        get: getter,
        set: setter
    });
}
export class WebixWrapper {
    constructor(App) {
        this.window = WebixWindow;
        this.app = App;
        this.window = WebixWindow;
        // this.window = WebixWindow;
        // this.datatable = new WebixDatatable(App);
        // this.grid = WebixGrid;
        // this.tree = new WebixTree(App);
        // this.upload = new WebixUpload(App);
        // this.download = new WebixDownload(App);
    }
    /**
     * Returns logo embbeded in webix container for multiple applications
     * @param {object} opts
     * opts.style -  optional style for logo - defaul is 'height:35px'
     * opts.path - optional path - default is '/assets/logo.png'
     * opts.width - optional width - default is 150
     */
    static getLogo(opts = null) {
        let style = opts && opts.style ? opts.style : 'height:30px;vertical-align:middle;align:center';
        let path = opts && opts.path ? opts.path : '/assets/logo_white.png';
        let width = opts && opts.width ? opts.width : 105;
        return {
            view: 'label',
            label: `<img src="${path}" style="${style}">`,
            width: width,
            borderless: true
        };
    }
    static replaceLogoOnLine(opts = null) {
        if ($$("appLogo")) {
            let style = opts && opts.style ? opts.style : 'height:35px; width:auto;vertical-align:middle;align:right';
            let path = opts && opts.path ? opts.path : '/assets/logo.png';
            let width = opts && opts.width ? opts.width : 120;
            webix.ui({
                id: "appLogo",
                template: `<img src="${path}" style="${style}">`,
                height: 40,
                width: width,
                borderless: true
            }, $$("appLogo"));
        }
    }
    static replaceLogoOffline(opts = null) {
        if ($$("appLogo")) {
            let style = opts && opts.style ? opts.style : 'height:35px; width:auto;vertical-align:middle;align:right';
            let path = opts && opts.path ? opts.path : '/assets/logo_offline.png';
            let width = opts && opts.width ? opts.width : 120;
            webix.ui({
                id: "appLogo",
                template: `<img src="${path}" style="${style}">`,
                height: 40,
                width: width,
                borderless: true
            }, $$("appLogo"));
        }
    }
}
export let WebixConstants = {
    VIEW_TEMPLATE: 'template',
    VIEW_BUTTON: 'button',
    VIEW_ICON: 'icon',
    VIEW_DATATABLE: 'datatable',
    VIEW_TREETABLE: 'treetable',
    VIEW_TOOLBAR: 'toolbar',
    VIEW_RICHSELECT: 'richselect',
    VIEW_DATEPICKER: 'datepicker',
    VIEW_WINDOW: 'window',
    VIEW_FORM: 'form',
    EDITOR_TEXT: 'text',
    EDITOR_PASSWORD: 'password',
    EDITOR_INLINETEXT: 'inline-text',
    EDITOR_SELECT: 'select',
    EDITOR_RICHSELECT: 'richselect',
    EDITOR_MULTISELECT: 'multiselect',
    EDITOR_CHECKBOX: 'checkbox',
    EDITOR_COLOR: 'color',
    EDITOR_DATE: 'date',
    EDITOR_DATEPICKER: 'datepicker',
    EDITOR_POPUP: 'popup',
    EDITOR_COMBO: 'combo',
    EVT_ONITEMCLICK: 'onItemClick'
};
export class WebixGui {
    constructor() {
        this.rows = [];
        this.cols = [];
        this.id = guid();
        this.view = WebixConstants.VIEW_TEMPLATE;
        this.on = {};
    }
    get w() {
        return $$(this.id);
    }
    addCol(ngui) {
        if (!this.cols)
            this.cols = [];
        this.cols.push(ngui);
    }
    addRow(ngui) {
        if (!this.rows)
            this.rows = [];
        this.rows.push(ngui);
    }
}

export class WebixWindow extends WebixGui {
    constructor(opts = null) {
        super();
        this.id = opts && opts.id ? opts.id : '';
        this.view = WebixConstants.VIEW_WINDOW;
        this.width = opts && opts.width ? opts.width : 600;
        this.modal = true;
        this.height = opts && opts.height ? opts.height : null;
        this.fullscreen = false;
        this.move = true;
        this.resize = opts && opts.resize ? opts.resize : false;
        this.position = 'center';
        this.title = 'No Title';
        this.titleid = this.id + 'title';
        this.body = {
            template: '<H1>PLEASE ADD ME A BODY</H1>'
        };
        this.onshow = (winid) => {
            webix.message(`onshow ${winid}- see console`);
        };

        if (opts && opts.type == 'login') {

            this.head = {
                view: 'toolbar',
                margin: -4,
                cols: [{
                    id: this.titleid,
                    view: 'label',
                    label: this.title
                },
                ]
            };

        } else {

            this.head = {
                view: 'toolbar',
                margin: -4,
                cols: [{
                    id: this.titleid,
                    view: 'label',
                    label: this.title
                },
                {
                    view: 'icon',
                    icon: 'fas fa-window-maximize',
                    value: 'change mode',
                    width: 30,
                    click: () => {
                        this.w.config.fullscreen = !this.w.config.fullscreen;
                        this.w.resize();
                    }
                },
                {
                    view: 'icon',
                    icon: 'fas fa-window-close',
                    width: 30,
                    click: () => {
                        if (opts && opts.onClosed) {
                            opts.onClosed(this);
                        } else {
                            this.close();
                        }
                    }
                }
                ]
            };

        }

    }

    show() {
        try {
            var window = webix.ui(this).show();
            return window;
        } catch (e) {
            console.error(e);
        }
    }
    close() {
        this.w.close();
    }
    setTitle(t) {
        this.title = t;
        if (this.w) {
            $$(this.titleid).setValue(t);
        }
    }
    static showWindow(body, title, opts) {
        let ret = new WebixWindow(opts);
        ret.id = opts && opts.id ? opts.id : 0;
        ret.body = body;
        ret.title = title;
        if (opts) {
            Object.assign(ret, opts);
        }
        let dim = getViewPortDimensions();
        if (dim.w < MAXMOBILEBEHAVIORWIDTH) {
            ret.fullscreen = true;
        }
        let w = ret.show();
        ret.setTitle(title);
        return ret;
    }
}
export class WebixDatatable extends WebixGui {
    constructor(iddatatable = null) {
        //console.log(iddatatable);
        super();
        this.id = iddatatable;
        this.view = "datatable";
        this.fixedRowHeight = false;
        //@ts-ignore
        // width: string = "100%";
        //@ts-ignore
        // height: string = "100%";
        this.select = "row";
        this.multiselect = false;
        this.resizeColumn = true;
        this.editable = true;
        this.sortable = true;
        this.editaction = "dblclick";
        this.columns = [];
        this.checkboxRefresh = true;
        this.data = [];
        this.responsive = true;
        this.dragColumn = true;
        this.leftSplit = 1;     
    }
    get w() {
        return $$(this.id);
    }
    add(item) {
        let items = item;
        if (!isArray(item)) {
            items = [item];
        }
        for (let i of items) {
            this.w.add(i, this.w.count());
        }
    }
    removeSelected() {
        let items = this.w.getSelectedItem(true);
        for (let i of items) {
            this.w.remove(i.id);
        }
    }
}
export class WebixToolbar extends WebixGui {
    constructor() {
        super();
        this.view = "toolbar";
        // width: string = "100%";
        // height: string = "100%";
        this.select = "row";
        this.multiselect = true;
        this.resizeColumn = true;
        this.editable = true;
        this.sortable = true;
        this.editaction = "dblclick";
        this.columns = [];
        this.elements = [];
    }
    get w() {
        return $$(this.id);
    }
}
export class WebixTreeTable extends WebixGui {
    constructor() {
        super();
        this.view = "treetable";
        //@ts-ignore
        // width: string = "100%";
        //@ts-ignore
        // height: string = "100%";
        this.select = "row";
        this.multiselect = true;
        this.resizeColumn = true;
        this.editable = true;
        this.sortable = true;
        this.editaction = "dblclick";
        this.columns = [];

    }
    get w() {
        return $$(this.id);
    }
    add(item) {
        let items = item;
        if (!isArray(item)) {
            items = [item];
        }
        for (let i of items) {
            this.w.add(i, this.w.count());
        }
    }
    removeSelected() {
        let items = this.w.getSelectedItem(true);
        for (let i of items) {
            this.w.remove(i.id);
        }
    }
    static mapObjInTree(obj) {
        let ret = [];

        function recurseObj(origcounter, obj, root) {
            let counter = 1;
            if (obj) {
                for (let k of Object.keys(obj)) {
                    let v = obj[k];
                    let cv = {
                        id: origcounter.length < 1 ? (counter++) : origcounter + "." + (counter++),
                        name: k,
                        data: [],
                        value: "",
                        open: true
                    };
                    root.push(cv);
                    if (typeof v === "object") {
                        recurseObj(cv.id, v, cv.data);
                    } else {
                        cv.value = v;
                    }
                }
            }
        }
        let root = [];
        recurseObj("", obj, root);
        return root;
    }
    static mapTreeInObj(tree) {
        let ret = {};

        function recurse(branch, objnode) {
            for (let b of branch) {
                if (b && b.data && b.data.length > 0) {
                    objnode[b.name] = {};
                    recurse(b.data, objnode[b.name]);
                } else {
                    objnode[b.name] = b.value;
                }
            }
        }
        recurse(tree, ret);
        return ret;
    }
}

export function WebixBuildReponsiveTopMenu(label, items) {
    function buildAsToolbar() {
        let tb = {
            view: "toolbar",
            height: 30,
        };
        tb.elements = [];
        tb.elements.push({
            view: "label",
            label: i18n(label)
        });
        for (let t of items) {
            tb.elements.push({
                id: t.id,
                name: t.name,
                view: "toggle",
                type: "icon",
                autowidth: true,
                label: i18n(t.label),
                icon: t.icon,
                click: t.click
            });
        }
        return tb;
    }

    function buildAsRichSelect() {
        let tb = {
            view: "toolbar",
            height: 40,
        };
        tb.elements = [];
        let rsoptions = {
            view: "richselect",
            options: [],
            value: "menu"
        };
        items.unshift({
            id: "menu",
            label: i18n(label),
            value: i18n(label),
            icon: "chevron-circle-down",
            click: () => { }
        });
        let handlers = {};
        let counter = 1;
        for (let t of items) {
            t.id = t.id ? t.id : (counter++).toString();
            handlers[t.id] = t.click;
            rsoptions.options.push({
                id: t.id,
                value: i18n(t.label),
                icon: t.icon
            });
        }
        tb.elements.push(rsoptions);
        tb.elements.push({
            icon: "arrow-left",
            view: "icon",
            click: () => {
                let hid = $$(rsoptions.id).getValue();
                handlers[hid]();
            }
        });
        return tb;
    }
    let dim = getViewPortDimensions();
    if (dim.w < MAXMOBILEBEHAVIORWIDTH) {
        return buildAsRichSelect();
    } else {
        return buildAsToolbar();
    }
}

export class WebixInputText {
    constructor(name, label, opts = null, value = "") {
        this.view = WebixConstants.EDITOR_TEXT;
        this.label = label;
        this.name = name;
        this.id = opts && opts.id ? opts.id : "txt" + name.charAt(0).toUpperCase() + name.slice(1);
        this.patter = opts && opts.pattern ? opts.pattern : "";
        this.labelPosition = opts && opts.labelPosition ? opts.labelPosition : "top";
        this.labelAlign = opts && opts.labelAlign ? opts.labelAlign : "";
        this.value = value;
        this.disabled = opts && opts.disabled ? opts.disabled : false;
        this.suggest = opts && opts.suggest ? opts.suggest : null;
        this.css = opts && opts.css ? opts.css : null;
        this.width = opts && opts.width ? opts.width : null;
        this.labelWidth = opts && opts.labelWidth ? opts.labelWidth : null;
        this.inputHeight = opts && opts.inputHeight ? opts.inputHeight : null;
        this.height = opts && opts.height ? opts.height : 40;
        this.attributes = opts && opts.attributes ? opts.attributes : null;
        this.on = {
            onChange: opts && opts.onChange ? opts.onChange : () => { },
            onKeyPress: opts && opts.onKeyPress ? opts.onKeyPress : () => { },
            onBlur: opts && opts.onBlur ? opts.onBlur : () => { }
        }
        this.format = opts && opts.format ? opts.format : "";

    }
}

export class WebixInputNumber {
    constructor(name, label, opts = null, value = "") {
        this.view = WebixConstants.EDITOR_TEXT;
        this.label = label;
        this.name = name;
        this.id = opts && opts.id ? opts.id : "txt" + name.charAt(0).toUpperCase() + name.slice(1);
        this.patter = opts && opts.pattern ? opts.pattern : "";
        this.labelPosition = opts && opts.labelPosition ? opts.labelPosition : "top";
        this.labelAlign = opts && opts.labelAlign ? opts.labelAlign : "";
        this.value = value;
        this.disabled = opts && opts.disabled ? opts.disabled : false;
        this.suggest = opts && opts.suggest ? opts.suggest : null;
        this.css = opts && opts.css ? opts.css : null;
        this.width = opts && opts.width ? opts.width : null;
        this.labelWidth = opts && opts.labelWidth ? opts.labelWidth : null;
        this.inputHeight = opts && opts.inputHeight ? opts.inputHeight : null;
        this.height = opts && opts.height ? opts.height : 40;
        this.attributes = opts && opts.attributes ? opts.attributes : { type: "number" };
        this.on = {
            onChange: opts && opts.onChange ? opts.onChange : () => { },
            onKeyPress: opts && opts.onKeyPress ? opts.onKeyPress : () => { },
            onBlur: opts && opts.onBlur ? opts.onBlur : () => { }
        }
        this.format = opts && opts.format ? opts.format : "";

    }
}

export class WebixInputDate {
    constructor(name, label, opts = null, value) {
        webix.i18n.setLocale("pt-BR");
        webix.i18n.dateFormat = "%d/%m/%Y";
        this.view = opts && opts.view ? opts.view : "datepicker";
        this.align = opts && opts.view ? opts.view : "right";
        this.width = opts && opts.width ? opts.width : null;
        this.label = label || '';
        this.name = name;
        this.editable = true,
        this.id = opts && opts.id ? opts.id : "date" + name.charAt(0).toUpperCase() + name.slice(1);
        this.labelPosition = opts && opts.labelPosition ? opts.labelPosition : "top";
        this.value = value || '';
        this.on = {
            onChange: opts && opts.onChange ? opts.onChange : () => { },
            onBlur: opts && opts.onBlur ? opts.onBlur : () => { }
        };
        this.disabled = opts && opts.disabled ? opts.disabled : false
    }
}

export class WebixCrudAddButton {
    constructor(name, value, click, opts = null) {
        this.view = WebixConstants.VIEW_BUTTON;
        this.width = opts && opts.width ? opts.width : '';
        this.height = opts && opts.height ? opts.height : '25';
        this.css = opts && opts.css ? opts.css : '25';
        this.name = name;
        this.id = "btn" + name.charAt(0).toUpperCase() + name.slice(1);
        this.value = value;
        this.click = click;
        this.disabled = opts && opts.disabled ? opts.disabled : false
    }
}

export class WebixInputCombo {
    constructor(name, label, data, opts = null) {
        this.view = "combo";
        this.label = label;
        this.name = name;
        this.width = opts && opts.width ? opts.width : '';
        this.height = opts && opts.height ? opts.height : '50';
        this.id = opts && opts.id ? opts.id : "cmb" + name.charAt(0).toUpperCase() + name.slice(1);
        this.labelPosition = opts && opts.labelPosition ? opts.labelPosition : "top";
        this.options = {
            body: {
                template: opts && opts.template ? opts.template : "#value#",
                data: data
            }
        };
        this.on = {
            onChange: opts && opts.onChange ? opts.onChange : () => { }
        };
        this.disabled = opts && opts.disabled ? opts.disabled : false;
        this.value = opts && opts.value ? opts.value : ""
    };
}

export class WebixInputSelect {
    constructor(name, label, data, opts = null) {
        this.view = "richselect";
        this.label = label;
        this.name = name;
        this.id = opts && opts.id ? opts.id : "cmb" + name.charAt(0).toUpperCase() + name.slice(1);
        this.labelPosition = opts && opts.labelPosition ? opts.labelPosition : "top";
        this.options = {
            body: {
                template: opts && opts.template ? opts.template : "#value#",
                data: data
            }
        };
        this.on = {
            onChange: opts && opts.onChange ? opts.onChange : () => { }
        };
        // this.onChange = opts && opts.onChange ? opts.onChange : () => { }
        this.disabled = opts && opts.disabled ? opts.disabled : false;
        this.value = opts && opts.value ? opts.value : ""
    };
}

export class WebixInputMultiSelect {
    constructor(name, label, data, opts = null) {
        this.view = "multiselect";
        this.label = label;
        this.name = name;
        this.id = opts && opts.id ? opts.id : "cmb" + name.charAt(0).toUpperCase() + name.slice(1);
        this.labelPosition = opts && opts.labelPosition ? opts.labelPosition : "top";
        this.options = {
            body: {
                template: opts && opts.template ? opts.template : "#value#",
                data: data
            }
        };
        this.on = {
            onChange: opts && opts.onChange ? opts.onChange : () => { }
        };
        // this.onChange = opts && opts.onChange ? opts.onChange : () => { }
        this.disabled = opts && opts.disabled ? opts.disabled : false;
        this.value = opts && opts.value ? opts.value : ""
    };
}

export class WebixInputMultiText {
    constructor(name, label, data, opts = null) {
        this.view = "multitext";
        this.label = label;
        this.name = name;
        this.id = opts && opts.id ? opts.id : "mt" + name.charAt(0).toUpperCase() + name.slice(1);
        this.labelPosition = opts && opts.labelPosition ? opts.labelPosition : "";
        this.labelWidth = 70;
        this.hidden = opts && opts.hidden ? opts.hidden : false;
        this.options = {
            body: {
                template: opts && opts.template ? opts.template : "#value#",
                data: data
            }
        };
        this.on = {
            onChange: opts && opts.onChange ? opts.onChange : () => { }
        };
        this.disabled = opts && opts.disabled ? opts.disabled : false;
        this.value = opts && opts.value ? opts.value : ""
    };
}

export class WebixInputTextArea {
    constructor(name, label, data, opts = null) {
        this.view = "textarea";
        this.label = label;
        this.name = name;
        this.id = opts && opts.id ? opts.id : "txa" + name.charAt(0).toUpperCase() + name.slice(1);
        this.labelPosition = opts && opts.labelPosition ? opts.labelPosition : "top";
        this.value = data ? data : null;
        this.height = opts && opts.height ? opts.height : '';
        this.disabled = opts && opts.disabled ? opts.disabled : false,
            this.options = {
                body: {
                    template: opts && opts.template ? opts.template : "#value#"
                }
            };
    }
}

export class WebixLabel {
    constructor(name, label, opts = null) {
        this.view = "label";
        this.label = label;
        this.name = name;
        this.id = "lb" + name.charAt(0).toUpperCase() + name.slice(1);
        this.align = opts && opts.align ? opts.align : "center";
        this.height = opts && opts.height ? opts.height : 50;
    }
}

export class WebixCrudDatatable extends WebixDatatable {
    constructor(iddatatable = null) {
        super(iddatatable);
        this.editable = false;
    }

    get optionsStatus() {
        return [{
            id: true,
            value: i18n("Active")
        },
        {
            id: false,
            value: i18n("Inactive")
        }
        ]
    }

    createStatusColumn() {
        this.columns.push({
            id: "status",
            template: (obj) => {
                let option = (this.optionsStatus.find(x => x.id == obj.status));
                return option.value;
            },
            header: [i18n("Status"), {
                content: "selectFilter",
                compare: (cellValue, filterValue) => {
                    return cellValue.toString() == filterValue.toString();
                }
            }],
            sort: "string",
            width: 50
        })
    }

    changeFilterOptions(after) {
        this.on = {
            onCollectValues: (id, req) => {
                if (id == 'status') {
                    for (var i = 0; i < req.values.length; i++) {
                        let option = (this.optionsStatus.find((x) => x.id == req.values[i].value));
                        if (option) {
                            req.values[i].value = option.value;
                        }
                    }
                }
                if (after) after(id, req)
            }
        }
    }
}