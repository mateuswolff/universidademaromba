"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server = require("./Server");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const Applet = require("./Applet");
var Cors = require('cors');
const Response = require("./ResponseApplet");
const SSL = require("./SSLApplet");
const yamljs = require("yamljs");
const https = require('https');
//const bodyParser = require('body-parser');


       


class ExpressApplet extends Applet.Applet {
    constructor(app) {
        super(app);
        this.expressInst = express();
    }

    async init() {
        let bp = bodyParser.json();
        let cp = cookieParser();

        const ssl = new SSL().getCredentials();

        for (let e of Server.App.i.config.web.staticmappings) {
            let fp = process.cwd() + '/' + e.folder;
            let staticroot = express.static(fp);
            Server.App.log(`Express: Mapping Static Root ${fp} => ${e.root}`);
            this.expressInst.use(e.root, staticroot);
        }
        
        this.expressInst.use(bodyParser.json({ limit: '50mb' }));
        this.expressInst.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

        this.express.use(cp);
        this.expressInst.use(bp);
        this.expressInst.use(this.app.auth.authFilter);
        this.expressInst.use(compression({ threshold: 100 }));

        //this.expressInst.use(this.app.audit.log); 

        this.expressInst.use(Cors({
            'allowedHeaders': ['sessionId', 'Content-Type'],
            'exposedHeaders': ['sessionId'],
            'origin': '*',
            'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            'preflightContinue': false
        }));

        Server.App.log(`SSL ${this.app.config.web.security ? 'ON': 'OFF'}`);

        if (this.app.config.web.security) {
            https.createServer(ssl, this.expressInst).listen(this.app.config.web.port, () => {
                Server.App.log('Listen security on port ' + this.app.config.web.port);
            });
        } else {
            this.expressInst.listen(this.app.config.web.port, () => {
                Server.App.log('Listen on port ' + this.app.config.web.port);
            });
        }

        Response.response.setApp(this.expressInst);
    }

    get express() {
        return this.expressInst;
    }
}

exports.ExpressApplet = ExpressApplet;