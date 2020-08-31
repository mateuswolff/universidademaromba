import { API } from "./Api.js";
import { i18n } from "./I18n.js";
import { ls } from "./LocalStorage.js";
import { WebixWrapper } from "./WebixWrapper.js";
const LS_MAIN_FAVORITES = "MAIN_FAVORITES";

import * as redirect from "../control/redirectScreens.js";
import * as screenDashboardList from "../components/screenDashboardList.js";

export class MainScreenFrame {

    constructor(napp) {
        this.triggerTree = (id) => {
            this.app.emit('treeMenu', id);
            this.app.emit(id);
            let state = this.app.getURLState();
            state.loc = id;
            this.app.setURLState(state);
        };
        this.updateFavs = () => {
            this.listFavs.clearAll();
            let favs = this.getFavorites();
            if (favs) {
                for (let k in favs) {
                    this.listFavs.add(favs[k]);
                }
            }
        };
        this.app = napp;
    }

    toggleSidebar() {
        let App = this.app;
        let state = App.getURLState();

        if (state.st != false) {
            state.st = false;
            $$('sidebar').hide();
            $$('sidebarresizer').hide();
        }
        else {
            state.st = true;
            $$('sidebar').show();
            $$('sidebarresizer').show();
        }

        App.setURLState(state);
    }

    addSimpleItem(parent, title, evt) {
        this.treemenu.add({ id: evt, value: i18n(title) }, 9999, parent);
    }

    get sidebar() {
        return $$('sidebar');
    }

    get treemenu() {
        let ret = $$('treemenu');
        return ret;
    }

    get listFavs() {
        return $$("listFavs");
    }

    getFavorites() {
        let favs = ls.getObj(LS_MAIN_FAVORITES, {});
        return favs;
    }

    saveFavorites(favs) {
        ls.setObj(LS_MAIN_FAVORITES, favs);
    }

    addFavorite(id, value) {
        let favs = this.getFavorites();
        favs[id] = { id: id, value: value };
        this.listFavs.add(favs[id]);
        this.saveFavorites(favs);
    }

    removeFavorite(id) {
        let favs = this.getFavorites();
        delete favs[id];
        this.listFavs.remove(id);
        this.saveFavorites(favs);
    }

    async show() {
        // Responsavel por trocar o dashboard quando tem link ou não
        // foi necessario criar este item pois quando o body vem com algum item do webix
        // ele sempre vai exibir este item primeiro ao invez da tela em que o usuario estava 
        // anteriormente.
        let body = [];
        if (window.location.hash === "") {
            body = screenDashboardList.showScreen();
        } 

        let self = this;
        let App = this.app;
        let sidebarselected = ls.get('sidetabbar.selected');
        let buttonTreeToggleConfig = {
            id: 'buttonTreeToggle',
            view: 'icon',
            icon: 'wxi-drag',
            value: 'TT',
            width: 35,
            on: {
                onItemClick: () => {
                    this.toggleSidebar();
                }
            }
        };

        let treeMenuConfig = {
            view: "tree",
            id: "treemenu",
            select: true,
            data: [],
            on: {
                onItemClick: (a, b) => {
                    self.triggerTree(a);
                },
                onKeyPress: (code, e) => {
                    let treeMenu = $$("treeMenu");
                    if (code === 13)
                        this.triggerTree(self.treemenu.getSelectedItem(false).id);
                }
            }
        };

        let treeMenuWFilterConfig = {
            id: 'treeMenuWFilter',
            width: 200,
            selected: sidebarselected == 'treeMenuWFilter',
            rows: [
                {
                    cols: [
                        {
                            view: "text",
                            value: "",
                            id: 'textTreeFilter',
                            on: {
                                onTimedKeyPress: () => {
                                    self.treemenu.filter("#value#", textTreeFilter.getValue());
                                }
                            }
                        }, {
                            view: 'button',
                            label: '+',
                            width: 40,
                            id: 'buttonAddFav',
                            on: {
                                onItemClick: () => {
                                    let item = self.treemenu.getSelectedItem(false);
                                    if (item) {
                                        self.addFavorite(item.id, item.value);
                                        this.updateFavs();
                                    }
                                }
                            }
                        }
                    ]
                },
                treeMenuConfig
            ]
        };

        let listFavsConfig = {
            view: "list",
            id: 'listFavs',
            select: true,
            width: 300,
            template: "#value#",
            data: [],
            on: {
                onItemClick: (a, b) => {
                    self.triggerTree(a);
                },
                onKeyPress: (code, e) => {
                    if (code === 13)
                        self.triggerTree(listFavs.getSelectedItem().id);
                }
            }
        };

        let listFavsWFilterConfig = {
            id: 'listFavsWFilter',
            selected: sidebarselected == 'listFavsWFilter',
            width: 250,
            rows: [
                {
                    cols: [
                        {
                            view: "text",
                            value: "",
                            id: 'textFavsFilter',
                            on: {
                                onTimedKeyPress: () => {
                                    listFavs.filter("#value#", textFavsFilter.getValue());
                                }
                            }
                        }, {
                            view: 'button',
                            label: '-',
                            id: 'buttonRemFav',
                            width: 40,
                            on: {
                                onItemClick: () => {
                                    let item = listFavs.getSelectedItem();
                                    if (item) {
                                        self.removeFavorite(item.id);
                                        this.updateFavs();
                                    }
                                }
                            }
                        }
                    ]
                },
                listFavsConfig
            ]
        };

        let sidetabbarConfig = {
            id: 'sidetabbar',
            view: "tabbar", type: "bottom", multiview: true, options: [
                {
                    value: ``,
                    id: 'treeMenuWFilter'
                }
                
            ],
            height: 32,
            on: {
                onChange: (newv) => {
                    ls.set('sidetabbar.selected', newv);
                }
            }
        };

        let dataConfig = {
            cells: [
                listFavsWFilterConfig,
                treeMenuWFilterConfig
            ]
        };

        let tabViewSidebarConfig = {
            id: 'sidebar',
            rows: [
                dataConfig,
                sidetabbarConfig,
            ]
        }

        let mainContent = {
            id: 'layoutMain',
            rows: body

        };

        let mainFooter = {
            view: "toolbar",
            height: 30,
            elements: [
                { view: "button", type: "icon", icon: "copyright", label: "Universidade Maromba - Gestão de Academias", align: "center" },
                {},
                { view: "button", type: "icon", icon: "copyright", css: 'pull-right', label: "VERSÃO 1.0.0", align: "right" }
            ]
        };

        let mainToolbar = {
            view: "toolbar",
            height: 35,
            elements: [
                {
                    width: 260,
                    cols: [
                        buttonTreeToggleConfig,
                        {
                            view: 'icon',
                            width: 38,
                            css: "fontAppmenu",
                            icon: 'fas fa-user-circle',
                            on: {
                                onItemClick: () => {
                                    App.emit('AppMenuDialog');
                                }
                            }
                        },                   
                        {
                            view: "template",
                            id: "txtUserName",
                            css: "userName",
                            borderless: true
                        }
                    ]
                },
                {
                    template: App.config.app.name,
                    type: "header",
                    borderless: true
                },
                WebixWrapper.getLogo()
            ]
        };

        let layout = {
            id: "mainFrame",
            rows: [
                mainToolbar,
                {
                    cols: [
                        tabViewSidebarConfig,
                        {
                            id: "sidebarresizer",
                            view: "resizer"
                        },
                        {
                            rows: [
                                {
                                    id: 'layoutMainMenu',
                                    hidden: true,
                                    borderless: true
                                },
                                mainContent
                            ]
                        }
                    ]
                },
                mainFooter
            ]
        };

        webix.ui(layout, $$("mainFrame"));
        webix.ui.fullScreen();

        let sidetabbar = $$('sidetabbar');
        let textTreeFilter = $$("textTreeFilter");
        let textFavsFilter = $$("textFavsFilter");
        let listFavs = $$("listFavs");

        this.updateFavs();
        sidetabbar.setValue(sidebarselected);
        let state = App.getURLState();

        if (state && state.st === false) {
            $$('sidebar').hide();
        }

        document.onkeyup = (evt) => {
            if (evt && evt.key === '/' && evt.ctrlKey) {
                textTreeFilter.focus();
            }

            if (evt && evt.key === '.' && evt.ctrlKey) {
                this.toggleSidebar();
            }
        };

        App.emit("MainScreenReady");
    }
}