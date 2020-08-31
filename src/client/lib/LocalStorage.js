export class LocalStorage {
    set(k, v) {
        if (v === null || v === undefined) {
            window.localStorage.removeItem(k);
        }
        else {
            window.localStorage.setItem(k, v);
        }
    }
    get(k, devfal) {
        let ret = window.localStorage.getItem(k);
        ret = ret ? ret : (devfal ? devfal : null);
        return ret;
    }
    getObj(k, def) {
        let str = this.get(k);
        if (!str)
            return def;
        return JSON.parse(str);
    }
    setObj(k, o) {
        this.set(k, JSON.stringify(o));
    }
    del(k) {
        window.localStorage.removeItem(k);
    }
    exist(k) {
        return window.localStorage.getItem(k) != null;
    }
    map(fn) {
        for (var key in localStorage) {
            fn(key);
        }
    }
}
export let ls = new LocalStorage();