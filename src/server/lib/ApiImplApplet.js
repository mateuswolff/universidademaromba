"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const Applet = require("./Applet");
const Server = require("./Server");
const uuid = require("uuid");
const _ = require("lodash");
const moment = require('moment');
const fs = require("fs");
const path = require("path");
const CrudRequestController = require('../controllers/crudRequestController');
const SpecificRequestController = require('../controllers/specificRequestController');
const config = require('../config/sequelize.conf');

class ApiImplApplet extends Applet.Applet {
    constructor(app) {
        super(app);
    }

    init() {
        let api = this.app.api;

        configSyncRouters(this.app);

        //#region Login
        api.register('login', async (login, password, ctx) => {

            let item;
            let { user, session, group } = config.postgres.DB;

            const crudRequestController = new CrudRequestController.crudRequestController(user);
            const crudReqGroups = new CrudRequestController.crudRequestController(group);

            item = await crudRequestController.findOne({ user: login.toUpperCase() }, null);
            item = item.data;

            // Check user situation
            if (item && item.situation == 'A') {
                adConnect(this.app, login, password).then(async function (result) {

                    if (result) {
                        let userPerms = [];

                        if (item.groups != null) {
                            let groups = item.groups.split(',');
                            for (let group of groups) {
                                if (group != "") {
                                    let groupPerms = await crudReqGroups.findById(group);
                                    if (groupPerms.data)
                                        userPerms = userPerms.concat(groupPerms.data.perms);
                                }
                            }
                        }

                        // Remove duplicates items
                        userPerms = Array.from(new Set(userPerms));

                        let sessionSave = {};
                        sessionSave.key = uuid.v4();
                        sessionSave.login = login;
                        sessionSave.permissions = {};

                        // Get all serverside permissions
                        sessionSave.permissions.serverside = [];
                        sessionSave.permissions.serverside = await getAllPerms('actions', userPerms);

                        // Get all clienteside permissions
                        sessionSave.permissions.clientside = [];
                        sessionSave.permissions.clientside = await getAllPerms('objects', userPerms);

                        const crudSessionRequestController = new CrudRequestController.crudRequestController(session);
                        let saving = await crudSessionRequestController.create(sessionSave);
                        saving = saving.data;

                        if (saving) {
                            require('simple-git')().tags((err, tags) => {
                                ctx.res.api.send({ key: sessionSave.key, version: tags.all[0], userName: result.Name }, 200, {}, null, sessionSave.key);
                            });
                        }
                    }
                    else {
                        ctx.res.status(400).json({
                            status: 'error',
                            err: "Authentication Failed",
                            message: result
                        });
                        return null;
                    }
                });
            } else {
                ctx.res.status(400).json({
                    status: 'error',
                    err: "Authentication Failed"
                });
                return null;
            }
        }, {
                webpublic: true
            });

        api.register('logout', async (ctx) => {
            let key = ctx && ctx.req && ctx.req.cookies && ctx.req.cookies['X-SESSION'] ? ctx.req.cookies['X-SESSION'] : '';
            let {
                session
            } = config.postgres.DB;

            const crudRequestController = new CrudRequestController.crudRequestController(session);

            let sess = await crudRequestController.findOne({
                key: key
            }, null, true);

            sess = sess.data;

            if (sess) {
                await sess.destroy();

                ctx.res.cookie('X-SESSION', '', {
                    expires: new Date(0)
                });
                ctx.res.status(200).json({
                    status: 'ok'
                });
            }
        }, {
                public: true
            });

        api.register('isloggedin', async (ctx) => {
            let key = ctx.req.cookies['X-SESSION'];
            let {
                session
            } = config.postgres.DB;

            const crudRequestController = new CrudRequestController.crudRequestController(session);

            let sess = await crudRequestController.findOne({
                key: key
            });

            sess = sess.data;

            if (sess) {
                ctx.res.status(200).json({
                    status: 'ok'
                });
            } else {
                ctx.res.status(200).json({
                    status: 'notok'
                });
            }

        }, {
                webpublic: true
            });

        api.register("getPermission", async (ctx) => {
            return ctx.permissions;
        }, {
                public: true
            });

        api.register("getAvailablePermissions", async (ctx) => {
            return await createPermsList();
        }, { public: true })

        // TODO - DESENVOLVER MÉTODO
        api.register("killSessions", async (user, ctx) => {
        });

        api.register("config", async (ctx) => {
            return this.app.config.client;
        }, {
                webpublic: true
            });

        //#endregion

        //#region i18n

        api.register("notifyI18n", async (key, locale, ctx) => {
            let { i18n } = config.postgres.DB;
            const crudRequestController = new CrudRequestController.crudRequestController(i18n);

            let item = await crudRequestController.findOne({
                key: key,
                locale: locale
            });

            item = item.data;

            if (!item) {
                let newItem = {
                    key: key,
                    locale: locale,
                    lastupdatedat: 0,
                    value: ''
                }

                try {
                    await crudRequestController.create(newItem);

                    ctx.res.status(200).json({
                        status: 'ok'
                    });
                } catch (error) {
                    ctx.res.status(500).json({
                        status: 'error',
                        error: error
                    });
                }
            } else {
                ctx.res.status(200).json({
                    status: 'error',
                    error: 'No translation for this key ' + key
                });
            }
        }, {
                webpublic: true
            });

        api.register("loadI18nBundle", async (since, locale, ctx) => {
            const Op = config.postgres.sequelize.Op;
            let { i18n } = config.postgres.DB;
            //const crudRequestController = new CrudRequestController.crudRequestController(i18n);

            let res = await i18n.findAll({
                where: {
                    dtupdated: {
                        [Op.gte]: since
                    },
                    locale: locale
                }
            });

            ctx.res.status(200).json(res);

        }, {
                webpublic: true
            });
        //#endregion

        //#region Integration
        api.register('updateUsers', async (list, ctx) => {
            let contInsert = 0, contUpdate = 0;
            let { user } = config.postgres.DB;

            const crudRequestController = new CrudRequestController.crudRequestController(user);

            for (let item of list) {
                // Find if the user already exists in the database
                let result = await user.findOne({
                    where: {
                        user: item.user
                    }
                });

                if (result == null) {
                    await user.create(item);
                    contInsert++;
                }
                else {
                    await user.update(item, {
                        where: {
                            user: item.user
                        }
                    });

                    contUpdate++;
                }
            }

            ctx.res.status(200).json({
                insert: contInsert, update: contUpdate
            });
        }, {
                webpublic: true
            });
        //#endregion
    }
}

exports.ApiImplApplet = ApiImplApplet;

function configSyncRouters(app) {

    app.api.register("sum", async (model, select, where, limit, offset, ctx) => {
        let item = config.postgres.DB[model];
        const crudRequestController = new CrudRequestController.crudRequestController(item);
        return await crudRequestController.sum(select, JSON.parse(where), limit, offset);
    });

    app.api.register("find", async (model, select, where, limit, offset, ctx) => {
        let item = config.postgres.DB[model];
        const crudRequestController = new CrudRequestController.crudRequestController(item);
        return await crudRequestController.findAll(select, JSON.parse(where), limit, offset);
    });

    app.api.register("lastAdd", async (model, select, where, limit, offset, ctx) => {
        let item = config.postgres.DB[model];
        const crudRequestController = new CrudRequestController.crudRequestController(item);
        return await crudRequestController.lastAdd(select, JSON.parse(where), limit, offset);
    });

    app.api.register("findOne", async (model, select, where) => {
        let item = config.postgres.DB[model];
        const crudRequestController = new CrudRequestController.crudRequestController(item);
        return crudRequestController.findOne(JSON.parse(where), select);
    });

    app.api.register("create", async (model, object, ctx) => {
        let item = config.postgres.DB[model];
        const crudRequestController = new CrudRequestController.crudRequestController(item);

        return crudRequestController.create(object, model);
    });

    app.api.register("update", async (model, object, query, ctx) => {
        let item = config.postgres.DB[model];
        const crudRequestController = new CrudRequestController.crudRequestController(item);

        return crudRequestController.update(JSON.parse(query), object);
    });

    app.api.register("delete", async (model, query, ctx) => {
        let item = config.postgres.DB[model];
        const crudRequestController = new CrudRequestController.crudRequestController(item);

        return crudRequestController.delete(query);
    });

    app.api.register("findAssociate", async (model, select, where, limit, offset, ctx) => {
        let associate = [];
        let item = config.postgres.DB[model];
        where = JSON.parse(where);

        if ('associate' in where) {
            where.associate.forEach((model) => {
                associate.push(config.postgres.DB[model]);
            });
        }

        const crudRequestController = new SpecificRequestController.specificRequestController(item, associate);

        if ('associate' in where)
            delete where.associate;

        if ('id' in where || 'findOne' in where) {
            delete where.findOne;
            return await crudRequestController.findOneAssociate(select, where, limit, offset);
        } else {
            return await crudRequestController.findAllAssociate(select, where, limit, offset);
        }
    });

    fs.readdirSync(path.join(__dirname, '../api'))
        .forEach((module) => {
            // Module index file, should exists to import
            const moduleIndex = path.join(__dirname, `../api/${module}/_index.js`);
            require(moduleIndex).default(app);
        });
}

function createCrudPerms(parent, ev, title) {

    let id = parent + '.' + ev;

    let ret = {
        id: id,
        title: title,
        description: "Register of " + title,
        data: [
            {
                id: id + '.' + 'list',
                title: 'List',
                description: 'List all items',
                actions: ['/api/find/' + ev],
                objects: []
            },
            {
                id: id + '.' + 'add',
                title: 'Add',
                description: 'Add new item',
                actions: ['/api/create/' + ev],
                objects: ['btnAdd']
            },
            {
                id: id + '.' + 'remove',
                title: 'Remove',
                description: 'Remove an item',
                actions: ['/api/delete/' + ev],
                objects: ['btnRemove']
            },
            {
                id: id + '.' + 'changeStatus',
                title: 'Change status',
                description: 'Enable ou disable an item',
                actions: ['/api/update/' + ev],
                objects: ['btnEnable', 'btnDisable']
            },
            {
                id: id + '.' + 'edit',
                title: 'Edit',
                description: 'Edit the informations of an item',
                actions: ['/api/update/' + ev],
                objects: ['btnEdit']
            },
            {
                id: id + '.' + 'export',
                title: 'Export',
                description: 'Export a lista to PDF',
                actions: [],
                objects: ['btnExport']
            }
        ]
    }

    return ret;
}

function createSpecificPerm(parent, ev, title, description, actions, objects) {

    let id = parent + '.' + ev;

    let ret = {
        id: id,
        title: title,
        description: description,
        data: []
    }

    if (actions)
        ret.actions = actions;

    if (objects)
        ret.objects = objects;

    return ret;
}

async function createPermsList() {

    /* Gerar JSON das permissões */
    const { permissionmenu, permissionitems, permissionsubitems, equipment, equipmenttype } = config.postgres.DB;

    let menus = await permissionmenu.findAll({ where: { status: true }, raw: true });

    let permissions = [];

    for (let menu of menus) {

        let permission = { id: menu.id, title: menu.title, description: menu.description, data: [] };

        let items = await permissionitems.findAll({ where: { idmenu: menu.id, status: true }, raw: true });

        for (let item of items) {

            let itemMenu = createSpecificPerm(item.idmenu, item.env, item.title, item.description);

            let subItems = await permissionsubitems.findAll({ where: { iditem: item.env, status: true }, raw: true });

            let route = item.idmenu + '.' + item.env;

            for (let subItem of subItems) {

                if (subItem.actions)
                    subItem.actions = subItem.actions.split(", ");
                else if (subItem.actions !== null)
                    subItem.actions = [subItem.actions];
                else
                    subItem.actions = [];

                if (subItem.objects)
                    subItem.objects = subItem.objects.split(", ");
                else if (subItem.objects !== null)
                    subItem.objects = [subItem.objects]
                else
                    subItem.objects = [];

                itemMenu.data.push(createSpecificPerm(route, subItem.env, subItem.title, subItem.description,
                    subItem.actions,
                    subItem.objects)
                );

            }

            permission.data.push(itemMenu);
        }

        permissions.push(permission);
    }

    let equipmenttypes = await equipmenttype.findAll({ where: { status: true }, raw: true });
    
    for (let equipmenttype of equipmenttypes) {
    
        let permission = { id: equipmenttype.id, title: equipmenttype.description, description: equipmenttype.description, data: [] };

        let equipments = await equipment.findAll({ where: { idtype: equipmenttype.id, status: true }, raw: true });

        for (let equipment of equipments) {

            let route = equipment.idtype + '.' + equipment.id;

            let equipmentMenu = createSpecificPerm(equipment.idtype, equipment.id, equipment.description, equipment.description);
        
            equipmentMenu.data.push(createSpecificPerm(route, 'equipmentDetails', 'Details Equipment', 'Detail Equipment',
                [],
                ['btnEquipmentDetails'])
            );

            equipmentMenu.data.push(createSpecificPerm(route, 'programProduction', 'Production Program', 'Production Program',
                [],
                ['btnProgramProduction'])
            );
            
            permission.data.push(equipmentMenu);

        }
        
        permissions.push(permission);

    }

    return permissions;
}

function adConnect(app, login, password) {
    return new Promise(function (resolve, reject) {
        var ldap = require('ldapjs');
        var userReg;
        login = login.toUpperCase()
        console.log(login)
        console.log(login.substring(2, 0))
        if(login.substring(2, 0) == 'AC' || 
           login.substring(2, 0) == 'AX' ||
           login.substring(2, 0) == 'AZ')
        {
            userReg = ldap.createClient({
                url: app.config.authentication.URL
            });
        }
        else {
            userReg = ldap.createClient({
                url: app.config.authenticationTubes.URL
            });
        }
        var client = userReg;
        var opts = {
            filter: '(SAMAccountName=' + login + ')',
            scope: 'sub',
            attributes: ['objectGUID', 'userAccountControl', 'cn']
        };

        if(login.substring(2, 0) == 'AC' || 
           login.substring(2, 0) == 'AX' ||
           login.substring(2, 0) == 'AZ')
        {
            client.bind(login + '@' + app.config.authentication.domain, password, function (err) {
                if (err) {
                    console.error(err);
                    client.destroy();
                    resolve(null);
                }
                else {
                    client.search(app.config.authentication.base, opts, function (err, search) {
                        console.error(err)
                        search.on('searchEntry', function (entry) {
                            
                            let control = entry.object.userAccountControl;

                            if (control == "514" || control == "66050" || control == "66082") {
                                client.destroy();
                                resolve(null);
                            } else {
                                let result = {};
                                result.Name = entry.object.cn;
                                result.AdPath = entry.object.dn;
                                result.Control = control;

                                client.destroy();
                                resolve(result);
                            }
                        });
                    });
                }
            });
        }
        else
        {
            client.bind(login + '@' + app.config.authenticationTubes.domain, password, function (err) {
                if (err) {
                    console.error(err);
                    client.destroy();
                    resolve(null);
                }
                else {
                    client.search(app.config.authenticationTubes.base, opts, function (err, search) {
                        console.error(err)
                        search.on('searchEntry', function (entry) {
                            
                            let control = entry.object.userAccountControl;

                            if (control == "514" || control == "66050" || control == "66082") {
                                client.destroy();
                                resolve(null);
                            } else {
                                let result = {};
                                result.Name = entry.object.cn;
                                result.AdPath = entry.object.dn;
                                result.Control = control;

                                client.destroy();
                                resolve(result);
                            }
                        });
                    });
                }
            }); 
        }
    })
}

async function getAllPerms(type, userPerms) {
    let ret = [];
    let list = await createPermsList();

    for (let perm of list) {
        let result = getInternalPerms(type, perm, userPerms);

        if (result && result.length > 0)
            ret = ret.concat(result);
    }

    return Array.from(new Set(ret));
}

function getInternalPerms(type, item, userPerms) {

    let ret = [];

    if (item.data && item.data.length > 0) {
        for (let child of item.data) {
            let result = getInternalPerms(type, child, userPerms);

            if (result && result.length > 0)
                ret = ret.concat(result);
        }

        return ret;
    }
    else {
        if (type == 'actions') {
            if (item.actions && userPerms.some(x => x == item.id))
                return item.actions;
            else
                return null;
        }
        else if (type == 'objects') {
            if (item.objects) {
                let screen = item.id.substr(0, item.id.lastIndexOf('.'));
                let result = [];

                if (item.objects.length == 0) {
                    if (userPerms.some(x => x == item.id))
                        result.push({ object: screen, enabled: true });
                }
                else {
                    for (let object of item.objects) {
                        if (userPerms.some(x => x == item.id))
                            result.push({ object: screen + '.' + object, enabled: true });
                        else
                            result.push({ object: screen + '.' + object, enabled: false });
                    }
                }

                return result;
            }
            else
                return null;
        }
    }
}