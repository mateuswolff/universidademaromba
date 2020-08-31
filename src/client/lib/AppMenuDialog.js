import { i18n } from "./I18n.js";
import { WebixWindow, WebixWrapper } from "./WebixWrapper.js";
import { log } from "./Log.js";
import { APP } from "./App.js";
export class AppMenuDialog extends WebixWindow {
    constructor(napp) {
        super();
        this.app = napp;
        this.app.on("AppMenuDialog", () => {
            this.build();
        });
    }

    build() {
        let config = this.app.config;
        let App = this.app;
        let self = this;
        
        let mainViewConfig = {
            id: 'multiviewMain',
            header: i18n('Main'),
            rows: [
                WebixWrapper.getLogo({ width: 600, minHeight: 300 }),
                {
                    view: 'template',
                    borderless: true,
                    template: '<H1>' + config.app.name + '</H1>'
                }, {
                    view: 'template',
                    borderless: true,
                    template: '<H2><b>' + `${i18n("User")}: </b>${App.login}</H2>`
                }, {
                    view: 'button',
                    label: i18n('Logout'),
                    id: 'buttonLogout'
                }
            ]
        };

        let permsViewConfig = {
            id: 'multiviewPerms',
            header: i18n('Permissions'),
            view: "treetable",
            columns: [
                { id: "id", header: i18n('ID'), fillspace: 1, template: "{common.treetable()} #id#" },
                {
                    id: "value", header: i18n('Value'), fillspace: 3,
                }
            ],
        };
        
        let tabbarConfig = {
            view: "tabview",
            id: 'tabbarAppMenuDiag',
            multiview: true,
            cells: [
                mainViewConfig,
                permsViewConfig
            ]
        };

        if (!$$('winAppMenu')) {
            WebixWindow.showWindow(tabbarConfig, i18n("User Menu"), { id: "winAppMenu" });
        }

        let buttonLogout = $$("buttonLogout");
        
        buttonLogout.attachEvent('onItemClick', function () {
            self.close();
            App.logout();
        });
    }
    close() {
        $$("winAppMenu").close();
    }
}