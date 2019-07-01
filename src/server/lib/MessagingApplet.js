"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const URL = require("url");
const FCM = require("fcm-node");
const Applet = require("./Applet");

class MessagingApplet extends Applet.Applet {
    constructor(app) {
        super(app);
    }

    async init() {
        if (this.app.config.web.fcmserverkey) {
            this.fcm = new FCM(this.app.config.web.fcmserverkey);
        }
    }

    async sendMessage(to, msg) {
        if (to.startsWith("http"))
            to = this.getEPFromUrl(to);

        msg.to = to;

        let p = new Promise((resolve, reject) => {
            this.fcm.send(msg, (err, resp) => {
                if (err) {
                    return reject(err);
                }

                return resolve(resp);
            });
        });
        return p;
    }    

    getEPFromUrl(url) {
        let pu = URL.parse(url);

        if (pu) {
            let paths = pu.path ? pu.path.split("/") : [];
            if (paths && paths.length > 1)
                return paths[3];
        }
        
        return "";
    }
}

exports.MessagingApplet = MessagingApplet;