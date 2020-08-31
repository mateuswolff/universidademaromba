import { WebixWindow } from "./WebixWrapper.js";
import { i18n } from "./I18n.js";
import { checkPassword} from './Util.js';

export class CreatePassScreen {

    constructor(napp) {
        this.window = null;
        this.app = napp;
    }

    async show(token) {
        let config = await this.app.config;
        let user = await this.app.api.ormDbFind('user', JSON.stringify({token: token}));

        let formConfig = {
            view: "form",
            id: "createPassForm",
            elements: [
                {
                    view: "label", 
                    label: i18n("Welcome") + ` <strong>${user.data.name}</strong>`
                },
                {
                    view: "text",
                    labelPosition: "top",
                    label: "Password",
                    type: "password",
                    name: "password"
                },
                {
                    view: "text",
                    labelPosition: "top",
                    label: "Re-Password",
                    type: "password",
                    name: "rePassword"
                },
                {
                    label: "Cadastrar",
                    view: "button",
                    click: () => {
                        let form = $$('createPassForm'),
                            person = form.getValues();

                        if (person.password === "" || person.password === undefined || person.rePassword === "" || person.rePassword === undefined) {
                            webix.message(i18n('Please fill in all required fields of the form.'));
                        } else if (person.password !== person.rePassword) {
                            webix.message(i18n('Password fields do not match.'));
                        } else {
                            if (!checkPassword(person.password)) {
                                webix.message(i18n('Very weak password, use uppercase, lowercase and number in at least 8 characters.'));
                            } else {
                                user.data.password = person.password;
                                user.data.token = null;
                                user.data.tokenexperein = null;
                                
                                this.app.api.ormDbUpdate(
                                    {idEmployee: user.data.idEmployee}, 
                                    'user', 
                                    user.data
                                )
                                .then((response) => {
                                    if (response.success) {
                                        webix.message(i18n('Success when creating your password.'));
                                        this.window.close();
                                        this.app.loginScreen.show();
                                    } else {
                                        webix.message(i18n('Error changing password, please try again.'));
                                    }
                                });
                            }
                        }
                    }
                }
            ]
        };
    
        let w = WebixWindow.showWindow(formConfig, config.app.name + " - Create Pass");
        this.window = w.w;
    }

    close() {
        if (this.window) {
            this.window.close();
            this.window = null;
        }
    }
}