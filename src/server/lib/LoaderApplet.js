"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Applet = require("./Applet");
const mdlpath = require("path");

class LoaderApplet extends Applet.Applet {
    constructor(app) {
        super(app);
    }

    async init() {
        let extpaths = this.app.config.extensions.paths;
        
        if (extpaths && extpaths.length && extpaths.length > 0 && extpaths instanceof Array)
            for (let p of extpaths) {
                let mdlname = mdlpath.join(process.cwd(), p);
                let mdlclass = require(mdlname);
                let mdl = new mdlclass(this.app);

                await mdl.init();
            }
    }
}

exports.LoaderApplet = LoaderApplet;