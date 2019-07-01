import { App } from "../lib/App.js";
import { WebixWindow } from "./WebixWrapper.js";
import { i18n } from "./I18n.js";
import { ls } from "./LocalStorage.js";
export class LoginScreen {
    
    constructor(napp) {
        this.window = null;
        this.app = napp;
    }

    async show() {

        let rules = {
            "login": webix.rules.isNotEmpty,
            "password": webix.rules.isNotEmpty
        };

        let config = await this.app.config;
        let formConfig = {
            view: "form",
            id: 'formLogin',
            rules: rules,
            borderless: true,
            elements: [
                {
                    view: "text",
                    label: i18n("Login"),
                    name: 'login'
                },
                {
                    view: "text",
                    type: "password",
                    label: i18n("Password"),
                    name: 'password'
                },
                {
                    cols: [{}, {
                            view: "button",
                            value: "Login",
                            id: 'buttonLogin',
                            name: 'buttonLogin',
                            hotkey: 'enter',
                            click: async () => {
                                let o = form.getValues();

                                if ($$("formLogin").validate()) {                                    
                                    let ret = await this.app.api.login(o.login, o.password);
                                    if (ret.success === true) {
                                        localStorage.setItem('version', ret.data.version);
                                        ls.set("userName", ret.data.userName);
                                        this.close();
                                        this.app.emit("login", o.login);
                                    } else {
                                        webix.message({ text: i18n('Pass or user Invalid.') });
                                    }
                                } else {
                                    webix.message(i18n('Required fields are empty.'));
                                    return;
                                }
                            }
                        },
                    {}]
                }
            ]
        };
        
        let w = WebixWindow.showWindow({
            rows: [{
                    rows: [{},
                        { minHeight: 200, borderless: true, template: "<img src='/assets/logo.png' style='height:200px;display:block;margin:auto; vertical-align: middle'>" },
                        {}]
                }, formConfig, {}]
        }, config.app.name + " - Login",{type: 'login'});
        
        this.window = w.w;
        let form = $$('formLogin');
     }
    
    close() {
        if (this.window) {
            this.window.close();
            this.window = null;
        }
    }
}