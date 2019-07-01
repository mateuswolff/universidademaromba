"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server = require("./Server");
const yamljs = require("yamljs");
const Applet = require("./Applet");

class ConfigApplet extends Applet.Applet {
    constructor(app) {
        super(app);
        this.config = {};
    }

    async init() {
        let f = process.env.NODE_ENV ? `config/${process.env.NODE_ENV}.yaml` : 'config/config-dev.yaml';
        Server.App.log(`Loading config from:${f}`);
        this.config = yamljs.load(f);
    }
}

exports.ConfigApplet = ConfigApplet;