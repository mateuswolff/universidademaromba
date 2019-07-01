"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server = require("./Server");
const Applet = require("./Applet");

class AuditApplet extends Applet.Applet {
    constructor(app) {
        super(app);
    }

    init() {
        let api = Server.App.i.api;
    }

    log(req, res, next) {
        let ctx = {};
        ctx.req = req;
        ctx.res = res;
        next();
    }
}

exports.AuditApplet = AuditApplet;