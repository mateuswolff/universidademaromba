"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
require("reflect-metadata");

const ExpressApplet = require("./ExpressApplet");
const ConfigApplet = require("./ConfigApplet");
const ApiApplet = require("./ApiApplet");
const AuthApplet = require("./AuthApplet");
const ApiImplApplet = require("./ApiImplApplet");
const LoaderApplet = require("./LoaderApplet");
const MessagingApplet = require("./MessagingApplet");
const DatabaseApplet = require("./DatabaseApplet");
const AuditApplet = require("./AuditApplet");

class App {

    constructor() {
        this.configApplet = new ConfigApplet.ConfigApplet(this);
        this.expressApplet = new ExpressApplet.ExpressApplet(this);
        this.apiApplet = new ApiApplet.APIApplet(this);
        this.authApplet = new AuthApplet.AuthApplet(this);
        this.apiImplApplet = new ApiImplApplet.ApiImplApplet(this);
        this.loaderApplet = new LoaderApplet.LoaderApplet(this);
        this.messagingApplet = new MessagingApplet.MessagingApplet(this);
        this.databaseApplet = new DatabaseApplet.DatabaseApplet(this);
        this.auditApplet = new AuditApplet.AuditApplet(this);
    }

    static log(msg) {
        console.log(`${process.env.NODE_ENV ? process.env.NODE_ENV : 'dev'} - ${msg}`);
    }

    static error(err) {
        console.error(err);
    }

    async init() {
        try {
            await this.configApplet.init();
            await this.databaseApplet.init();
            await this.authApplet.init();
            await this.expressApplet.init();
            await this.apiApplet.init();
            await this.apiImplApplet.init();
            await this.loaderApplet.init();
            await this.messagingApplet.init();
            await this.auditApplet.init();
            // Set express app in Response class
        } catch (e) {
            App.error(e);
            process.exit(1);
        }
    }

    async main() {
        await App.i.init();
    }

    get config() {
        return this.configApplet.config;
    }

    get api() {
        return this.apiApplet;
    }

    get express() {
        return this.expressApplet;
    }

    get auth() {
        return this.authApplet;
    }

    get audit() {
        return this.auditApplet;
    }

    get messaging() {
        return this.messagingApplet;
    }
}

App.i = new App();
exports.App = App;