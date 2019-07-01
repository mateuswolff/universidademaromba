"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const Applet = require("./Applet");
const Server = require("./Server");

/** middleware */
const sq = require('../middleware/sequenceGenerator');
const rq = require('../middleware/requestQuery');

function APIMethod() { }

exports.APIMethod = APIMethod;

class APIApplet extends Applet.Applet {

    constructor(app) {
        super(app);
        this.reg = {};
    }

    async init() {
        let thereg = this.reg;

        this.app.express.express.post('/api/:method', async (req, res) => {
            let method = req.params.method;
            let params = this.isEmpty(req.body) ? [] : req.body;
            let ctx = req.$ctx;

            if (!params)
                params = [];
            else if (params.constructor.name !== 'Array') {
                params = [params];
            }

            if (!this.isEmpty(req.query))
                params.push(JSON.parse(req.query.where));

            if (method != 'login')
                Server.App.log(`USER:${ctx.login} API:${method} PARAMS:${JSON.stringify(params)}`);

            params.push(ctx);
            let handler = thereg[method];

            if (handler != null && handler != undefined) {
                let ret = await handler(...params);
                if (ret && ret !== null)
                    res.json(ret).end();
            } else {
                return res.api.send(null, 500, { success: false }, `METHOD ${method} not found`);
            }
        });

        /**
         * Exemplo request GET:
         *  localhost:3000/api/find/area?where={"item": "type_item"} :> Tem função de pesquisa
         *  localhost:3000/api/find/area?select=name :> Tem função de select na query
         *  localhost:3000/api/find/area?limit=10 :> Limita o retorno da query
         *  localhost:3000/api/find/area?offset=2 :> Pega os dados apos '2' itens
         *  localhost:3000/api/findAssociate/area?where={"associate": ["model_name_1", "model_name_2"]} :> Pega os dados de model com associação
         */
        this.app.express.express.get('/api/:method/:model', rq.parseQuery, async (req, res) => {

            let method = req.params.method;
            let params = [];
            let ctx = req.$ctx;

            params.push(req.params.model);

            if (req.query.select)
                params.push(req.query.select);
            else
                params.push(null)

            if (req.query.where)
                params.push(req.query.where);
            else
                params.push(null)

            if (req.query.limit)
                params.push(req.query.limit);
            else
                params.push(null)

            if (req.query.offset)
                params.push(req.query.offset);
            else
                params.push(1)

            params.push(ctx);

            Server.App.log(`USER:${ctx.login} API:${method} PARAMS:${params}`);

            let handler = thereg[method];

            if (handler != null && handler != undefined) {
                let ret = await handler(...params);
                return res.api.send(ret.data, 200, ret.metadata, ret.message);
            } else {
                return res.api.send(null, 500, { success: false }, `METHOD ${method} not found`);
            }
        });

        this.app.express.express.post('/api/:method/:model', sq.sequenceGenerator, async (req, res) => {
            let method = req.params.method;
            let params = req.body;
            let ctx = req.$ctx;

            if (!params)
                params = [];
            else if (params.constructor.name !== 'Array') {
                params = [params];
            }

            // TODO - Check if the item it's in the correct method
            if (params.password) {
                let salt = bcrypt.genSaltSync(10);
                let hash = bcrypt.hashSync(params.password);
                params.password = hash;
            }

            Server.App.log(`USER:${ctx.login} API:${method} PARAMS:${JSON.stringify(params)}`);

            params.unshift(req.params.model);
            params.push(ctx);

            let handler = thereg[method];

            if (handler != null && handler != undefined) {
                let ret = await handler(...params);
                return res.api.send(ret.data, 200, ret.metadata, ret.message);
            } else {
                return res.api.send(null, 500, { success: false }, `METHOD ${method} not found`);
            }
        });

        this.app.express.express.put('/api/:method/:model', async (req, res) => {
            let method = req.params.method;
            let params = req.body;
            let ctx = req.$ctx;

            if (!params)
                params = [req.params.model];
            else if (params.constructor.name !== 'Array') {
                params = [req.params.model, params];
            }

            if (req.query && req.query.where != undefined)
                params.push(req.query.where);
            else
                params.push(null);

            // TODO - Check if the item it's in the correct method
            if (params.password) {
                let salt = bcrypt.genSaltSync(10);
                let hash = bcrypt.hashSync(params.password);
                params.password = hash;
            }

            Server.App.log(`USER:${ctx.login} API:${method} PARAMS:${JSON.stringify(params)}`);

            params.push(ctx);

            let handler = thereg[method];

            if (handler != null && handler != undefined) {
                let ret = await handler(...params);
                return res.api.send(ret.data, 200, ret.metadata, ret.message);
            } else {
                return res.api.send(null, 500, { success: false }, `METHOD ${method} not found`);
            }
        });

        this.app.express.express.delete('/api/:method/:model', async (req, res) => {
            let method = req.params.method;
            let params = req.body;
            let ctx = req.$ctx;

            if (!params)
                params = [req.params.model];
            else if (params.constructor.name !== 'Array') {
                params = [req.params.model, params];
            }

            Server.App.log(`USER:${ctx.login} API:${method} PARAMS:${JSON.stringify(params)}`);

            params.push(ctx);

            let handler = thereg[method];

            if (handler != null && handler != undefined) {
                let ret = await handler(...params);
                return res.api.send(ret.data, 200, ret.metadata, ret.message);
            } else {
                return res.api.send(null, 500, { success: false }, `METHOD ${method} not found`);
            }
        });
    }

    register(name, entry, opts = {}) {
        if (opts.webpublic) {
            entry.webpublic = true;
            Server.App.i.config.web.publicurls.push(`/api/${name}$`);
        }

        if (opts.public) {
            entry.public = true;

            if (!Server.App.i.config.web.authorizedurls)
                Server.App.i.config.web.authorizedurls = [];

            Server.App.i.config.web.authorizedurls.push(`/api/${name}$`);
        }

        this.reg[name] = entry;
    }

    isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
}

exports.APIApplet = APIApplet;