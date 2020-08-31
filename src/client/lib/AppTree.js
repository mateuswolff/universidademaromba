import { guid } from "./Util.js";
import { i18n } from "./I18n.js";
import { ls } from "./LocalStorage.js";
export class AppTree {
    //app: APP;
    constructor() {
        this.items = {};
        this.itemsArr = [];
        this.items = {};
        this.itemsArr = [];
        //this.app = napp;
    }
    async addSimpleItem(parent, str, evt) {
        let stri18n = await i18n(str);
        let treeItem = { id: evt, value: stri18n, data: [] };
        this.items[evt] = treeItem;
        if (parent && this.items[parent]) {
            this.items[parent].data.push(treeItem);
        }
        else {
            this.itemsArr.push(treeItem);
        }
    }
    getTree() {
        return this.itemsArr;
    }
    addFavorite(item) {
        let favs = ls.getObj('favs', {});
        favs[item.id] = item;
        ls.setObj('favs', favs);
    }
    removeFavorite(item) {
        let id = "";
        if (typeof item === 'string') {
            id = item;
        }
        else {
            id = item.id;
        }
        let favs = ls.getObj('favs', {}) || {};
        delete favs[id];
        ls.setObj('favs', favs);
    }
    getFavorites() {
        return ls.getObj('favs', {});
    }
}