import { App } from "../lib/App.js";
import { i18n } from "./I18n.js";

export function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

export function loadScript(url, id, global) {
    var p = new Promise((resolve, reject) => {
        var script = document.createElement("script");
        if (!global)
            script.type = 'module';
        script.id = id;
        if (script.readyState) { //IE
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" ||
                    script.readyState == "complete") {
                    script.onreadystatechange = null;
                }
            };
        }
        else { //Others
            script.onload = function () {
                console.log('Loaded:' + url);
                return resolve();
            };
        }
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    });
    return p;
}

export function loadCss(url, id) {
    var cssId = id; // you could encode the css path itself to generate id..
    if (!document.getElementById(cssId)) {
        var p = new Promise((resolve, reject) => {
            var head = document.getElementsByTagName('head')[0];
            var link = document.createElement('link');
            link.id = cssId;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = url;
            link.media = 'all';
            head.appendChild(link);
            link.onload = () => {
                console.log('Loaded:' + url);
                resolve();
            };
        });
        return p;
    }
    else {
        return Promise.resolve();
    }
}

export function getQueryVariable(variable, defval) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
    return defval;
}

export function createCookie(name, value, days) {
    var expires = '', date = new Date();
    if (days) {
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        //@ts-ignore
        expires = '; expires=' + date.toGMTString();
    }
    document.cookie = name + '=' + value + expires + '; path=/';
}

export function getCookie(name) {
    let ret = '';
    let value = document.cookie;
    let parts = value.split(name + "=");
    if (parts.length == 2) {
        let ret = parts[1];
        return ret;
    }
    return ret;
}

export function toggleFullScreen() {
    var doc = window.document;
    var docEl = doc.documentElement;
    //@ts-ignore  
    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    //@ts-ignore  
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
    //@ts-ignore  
    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
    }
    else {
        cancelFullScreen.call(doc);
    }
}

export function getViewPortDimensions() {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    return { h, w };
}

export function isArray(o) {
    return (o && o.constructor.name === "Array");
}

export async function findMyShift() {
    
    let shift = await App.api.ormDbFindMyShift();
    
    if (shift.success && shift.data.length) {
        return shift.data[0].id;
    } else {
        webix.message(i18n("There's no regitered shift"));
        return null;
    }
}

/**@type: string */
export function checkPassword(password) {
    if (password.length <= 8) {
        return false;
    }

    if (!(/[a-z]/gm.test(password))) {
        return false;
    }

    if (!(/[0-9]/gm.test(password))) {
        return false;
    }

    if (!(/[A-Z]/gm.test(password))) {
        return false;
    }

    return true;
}

/* Start Calculate Weight / Parts Packpages */
export async function calcWeightPartsBigTub(idlot, type, value, rawmaterial, length = null) {
    /* Push material data */
    let materialcharacteristic = await App.api.ormDbMaterialLot({ "idlot": idlot });
    let rawmaterialcharacteristic = await App.api.ormDbMaterialLot({ "idlot": rawmaterial });
    materialcharacteristic.data[0].thicknessm = rawmaterialcharacteristic.data[0].thicknessm;
    if (materialcharacteristic.data.length && materialcharacteristic.data[0].steelm) {
        if (type == 'weight'){
            if(length)
                materialcharacteristic.data[0].lengthm = length
            
            return getWeight(materialcharacteristic.data[0], value);
        } else
            return (getPartsPackages(materialcharacteristic.data[0], value));
    } else {
        webix.message(i18n('We do not identify characteristics for this material (Length or Steel)'));
    }

}

/* Start Calculate Weight / Parts Packpages */
export async function calcWeightParts(idlot, type, value) {
    /* Push material data */
    let materialcharacteristic = await App.api.ormDbMaterialLot({ "idlot": idlot });
    if (materialcharacteristic.data.length && materialcharacteristic.data[0].steelm) {
        if (type == 'weight')
            return getWeight(materialcharacteristic.data[0], value);
        else
            return (getPartsPackages(materialcharacteristic.data[0], value));
    } else {
        webix.message(i18n('We do not identify characteristics for this material (Length or Steel)'));
    }

}

export async function calcWeightPartsTwo(rawmaterial, idrawmaterial, idmaterial, type, value) {
    /* Push material data */
    let materialcharacteristic = await App.api.ormDbRawMaterialAllocation({ rawmaterial: rawmaterial, idrawmaterial: idrawmaterial, idmaterial: idmaterial });
    if (materialcharacteristic.data.length) {
        if (type == 'weight')
            return getWeight(materialcharacteristic.data[0], value);
        else
            return getPartsPackages(materialcharacteristic.data[0], value);
    } else {
        webix.message(i18n('We do not identify characteristics for this material'));
    }

}

export async function getWeight(data, value) {
    if (data.materialgroupm == "TB" || data.materialgroupm == "TU") {
        let str = data.steelm.substring(0, 1);

        if (str == '4')
            return calcWeight(data, 0.02463, value);
        else
            return calcWeight(data, 0.02503, value);

    } else {

        if (data.materialgroupm == "BO" || data.materialgroupm == "FI" || data.materialgroupm == "BL") {

            return calcWeight(data, 0.007967, value);

        } else {

            // MESSAGE
            webix.message(i18n('This Application only works for Tubes, Coils or Thin Coils!'));

        }

    }
}

function calcWeight(data, tax, value) {

    let result = 0;
    if (data.materialgroupm == "TB" || data.materialgroupm == "TU") {
        // Peso = Pecas * ((Diametro - Espessura) X Espessura X *tax*))
        let a = parseFloat(data.diameterm) - parseFloat(data.thicknessm);
        let b = a * parseFloat(data.thicknessm) * tax;
        let c = value * b * (parseFloat(data.lengthm) / 1000);
        result = c.toFixed(3);
    } else {
        // Peso = Pecas * (Largura X Espessura X *tax*)
        let a = parseFloat(data.widthm) * parseFloat(data.thicknessm) * tax;
        let b = value * a;
        result = b.toFixed(3);
    }
    return result;
}

function getPartsPackages(data, value) {
    if (data.materialgroupm == "TB" || data.materialgroupm == "TU") {
        let str = data.steelm.substring(0, 1);

        if (str == '4')
            return calcPartsPackages(data, 0.02463, value);
        else
            return calcPartsPackages(data, 0.02503, value);

    } else {

        if (data.materialgroupm == "BO" || data.materialgroupm == "FI" || data.materialgroupm == "BL") {

            return calcPartsPackages(data, 0.007967, value);

        } else {

            // MESSAGE
            webix.message(i18n('This Application only works for Tubes, Coils or Thin Coils!'));

        }
    }
}

function calcPartsPackages(data, tax, value) {
    let result = 0;

    if (data.materialgroupm == "TB" || data.materialgroupm == "TU") {

        // Numero de peças = Peso / ((Diametro - Espessura) X Espessura X *tax*)) / Comprimento do material
        let a = parseFloat(data.diameterm) - parseFloat(data.thicknessm);
        let b = a * parseFloat(data.thicknessm) * tax;
        let c = value / b / (parseFloat(data.lengthm) / 1000);  // result = Math.ceil(c);

        result = c.toFixed(0);

    } else {

        // Numero de peças = Peso / (Largura X  Espessura X *tax*)
        let a = parseFloat(data.widthm) * parseFloat(data.thicknessm) * tax;
        let b = value / a;
        result = b.toFixed(0);
    }

    return result;
}

/* End Calculate Weight / Parts Packpages */
Object.defineProperty(Array.prototype, 'groupBy', {
    enumerable: false,
    value: function (key) {
        let map = {};
        this.map(e => ({ k: key(e), d: e })).forEach(e => {
            map[e.k] = map[e.k] || [];
            map[e.k].push(e.d);
        });
        return Object.keys(map).map(k => ({ key: k, data: map[k] }));
    }
});

/* Generator Color */
export async function generatorColor() {
    var hexadecimal = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) { color += hexadecimal[Math.floor(Math.random() * 16)]; }
    return color;
}

/* Loading */
export async function loading(type) {
    document.getElementById('loading').style.display = type;
}

/* Save Datatable Colums Position */
export async function datatableColumsSave(datatable, event) {

    let filter = {
        iddatatable: datatable,
        screen: event,
        iduser: localStorage.getItem('login')
    };

    let state = await App.api.ormDbFind('columsdatatable', filter);

    if (state.data.length === 0) {
        
        let data = {
            iddatatable: datatable,
            screen: event,
            description: $$(datatable).getState(), 
            iduser: localStorage.getItem('login')            
        }
        
        await App.api.ormDbCreate('columsdatatable', data);
    
    } else {
        
        let filter = {
            iddatatable: datatable,
            screen: event,
            iduser: localStorage.getItem('login')
        };

        let data = {
            description: $$(datatable).getState(), 
        }

        await App.api.ormDbUpdate(filter, 'columsdatatable', data);
    }

}

/* Get Datatable Colums Position */ 
export async function datatableColumsGet(datatable, event) {

    let filter = {
        iddatatable: datatable,
        screen: event,
        iduser: localStorage.getItem('login')
    };

    let state = await App.api.ormDbFind('columsdatatable', filter);
    
    if (state.data.length > 0) $$(datatable).setState(state.data[0].description);
}