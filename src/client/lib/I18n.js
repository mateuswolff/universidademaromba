import {
    API
} from "./Api.js";
import {
    ls
} from "./LocalStorage.js";
import {
    App
} from "./App.js";

const LS_BUNDLE_NAME = "i18n"

let bundle = {
    lastupdated: 0,
    entries: {}
};

export function i18n(k) {
    let lang = navigator.languages[0];
    bundle = ls.getObj(LS_BUNDLE_NAME, {
        lastupdated: 1,
        entries: {}
    });
    if (bundle.entries[lang] && (k in bundle.entries[lang])) {
        if (bundle.entries[lang][k] == null || bundle.entries[lang][k] == '')
            return k;
        else
            return bundle.entries[lang][k];
    } else {
        new API().notifyI18n(k, lang);
        ls.setObj(LS_BUNDLE_NAME, bundle);
        return k;
    }
    return k;
}

export async function loadI18n() {
    if (App.isOnline) {
        ls.setObj(LS_BUNDLE_NAME, bundle);
        let lastupdated = 0;
        //let lastupdated = Date();
        let lang = navigator.languages[0];
        let entries = await App.api.loadI18nBundle(bundle.lastupdated, lang);

        if (entries && entries.length > 0) {
            bundle.lastupdated = lastupdated;
            for (let e of entries) {
                if (!bundle.entries[e.locale])
                    bundle.entries[e.locale] = {};
                bundle.entries[e.locale][e.key] = e.value;
            }
            ls.setObj(LS_BUNDLE_NAME, bundle);
        }

       webix.i18n.setLocale(lang);
    }
}