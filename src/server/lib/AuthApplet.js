"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server = require("./Server");
const Applet = require("./Applet");
const CrudRequestController = require('../controllers/crudRequestController');
const config = require('../config/sequelize.conf');

class AuthApplet extends Applet.Applet {
    constructor(app) {
        super(app);
    }

    init() {
        let api = Server.App.i.api;
    }

    authFilter(req, res, next) {
        let ctx = {};
        ctx.req = req;
        ctx.res = res;
        ctx.login = "UNKNOWN";
        ctx.isauth = false;
        ctx.permissions = {};
        req.$ctx = ctx;

        function finishReqWStatus401() {            
            Server.App.log(`${req.path} - ACCESS FORBIDDEN.`);
            return res.status(401).json({ status: 'User not authorized' }).end();
        }

        async function handleSession(key) {
            let {session} = config.postgres.DB;
            const crudRequestController = new CrudRequestController.crudRequestController(session);
            let item = await crudRequestController.findOne({key: key}, null);  
            
            if (item.metadata.success) {
                item = item.data;
                ctx.login = item.login;
                ctx.permissions = item.permissions;
                ctx.isauth = true;

                if (checkIsPublic()){
                    return next();
                }
                else{
                    //if (ctx.permissions.serverside.some(x => x == req.path)){
                        return next();
                    //} else {
                       return finishReqWStatus401();
                    //}
                }
            }
            else {
                return finishReqWStatus401();
            }
        }

        function handleNotAuthed() {
            return finishReqWStatus401();
        }

        function checkIsWebPublic() {
            for (let u of Server.App.i.config.web.publicurls) {
                if (req.path.match(new RegExp(u))) {
                    Server.App.log(`${req.path} matches ${u} pattern - public access.`);
                    return true;
                }
            }
            return false;
        }

        function checkIsPublic() {
            for (let u of Server.App.i.config.web.authorizedurls) {
                if (req.path.match(new RegExp(u))) {
                    Server.App.log(`${req.path} matches ${u} pattern - public access.`);
                    return true;
                }
            }
            return false;
        }

        if (checkIsWebPublic()) {
            return next();
        }
        else {
            let session = req.cookies['X-SESSION'];
            if (session)
                handleSession(session);
            else
                handleNotAuthed();
        }
    }
}

exports.AuthApplet = AuthApplet;