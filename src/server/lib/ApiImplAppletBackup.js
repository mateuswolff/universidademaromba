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
                        sessionSave.permissions.serverside = getAllPerms('actions', userPerms);

                        // Get all clienteside permissions
                        sessionSave.permissions.clientside = [];
                        sessionSave.permissions.clientside = getAllPerms('objects', userPerms);

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
            return createPermsList();
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

function createPermsList() {

    let permissions = [
        {
            id: "security",
            title: "Security",
            description: "User Permissions",
            data: []
        },
        {
            id: "i18n",
            title: "I18n",
            description: "System Translate",
            data: []
        },
        {
            id: "config",
            title: "Register",
            description: "System Register",
            data: []
        },
        {
            id: "pcp",
            title: "PCP",
            description: "Advanced Planning and Scheduling ",
            data: []
        },
        {
            id: "quality",
            title: "Quality",
            description: "Team Quality",
            data: []
        },
        {
            id: "production",
            title: "Production",
            description: "Team Production",
            data: []
        },
        {
            id: "reports",
            title: "Reports",
            description: "Reports",
            data: []
        },
        {
            id: "oee",
            title: "OEE",
            description: "OEE",
            data: []
        }
    ]

    //#region Security
    let groups = createCrudPerms("security", "groups", "Groups")
    groups.data.push({
        id: 'security.groups.permissions',
        title: 'Permissions',
        description: 'Manager group permissions',
        actions: ['/api/getAvailablePermissions', '/api/update/group'],
        objects: ['btnPermissions']
    })
    permissions[0].data.push(groups);

    let users = createSpecificPerm('security', 'users', 'Users', 'Manager users');
    users.data.push(createSpecificPerm('security.users', 'changeStatus', 'Change status', 'Enable ou disable an item',
        ['/api/update/user'],
        ['btnEnable', 'btnDisable'])
    );
    users.data.push(createSpecificPerm('security.users', 'killSession', 'Kill session', 'Kill the user session',
        ['/api/killSessions'],
        ['btnKillSession'])
    );
    users.data.push(createSpecificPerm('security.users', 'Groups', 'Groups', 'Change access groups',
        ['/api/update/user'],
        ['btnGroups'])
    );
    permissions[0].data.push(users);

    let sessions = createSpecificPerm('security', 'sessions', 'Sessions', 'Manager Sessions');

    sessions.data.push(createSpecificPerm('security.sessions', 'sessions', 'Sessions', 'Kill Session',
        ['/api/update/session'],
        ['btnKillSession']));
    permissions[0].data.push(sessions);
    //#endregion

    //#region I18N
    let i18nTranslate = createSpecificPerm('i18n', 'internationalization', 'Internationalization', 'Internationalization');
    i18nTranslate.data.push(createSpecificPerm('i18n.internationalization', 'translation', 'Translations', 'Translations',
        ['/api/find/i18n', '/api/update/i18n'],
        []));
    permissions[1].data.push(i18nTranslate);
    //#endregion

    //#region Register
    permissions[2].data.push(createCrudPerms("config", "area", "Area"));
    permissions[2].data.push(createCrudPerms("config", "defecttype", "Defect Type"));
    permissions[2].data.push(createCrudPerms("config", "equipment", "Equipment"));
    permissions[2].data.push(createCrudPerms("config", "hardness", "Hardness"));
    permissions[2].data.push(createCrudPerms("config", "hangar", "Hangar"));
    permissions[2].data.push(createCrudPerms("config", "instrumenttype", "Instrument Type"));
    permissions[2].data.push(createCrudPerms("config", "materialtype", "Material Type"));
    permissions[2].data.push(createCrudPerms("config", "norm", "Norm"));
    permissions[2].data.push(createCrudPerms("config", "disposaltype", "Disposal Type"));
    permissions[2].data.push(createCrudPerms("config", "local", "Local"));
    permissions[2].data.push(createCrudPerms("config", "operation", "Operation"));
    permissions[2].data.push(createCrudPerms("config", "ordergroup", "Order Group"));
    permissions[2].data.push(createCrudPerms("config", "packingtype", "Packing Type"));
    permissions[2].data.push(createCrudPerms("config", "releaseteam", "Release Team"));
    permissions[2].data.push(createCrudPerms("config", "resource", "Resource"));
    permissions[2].data.push(createCrudPerms("config", "resourcetype", "Resource Type"));

    let transportResourceLocalLink = createSpecificPerm('config', 'transportResourceLocalLink', 'Transport Resource Local Link', 'Manager transport resource');
    transportResourceLocalLink.data.push(createSpecificPerm('config.transportResourceLocalLink', 'search', 'Search', 'Search by equipments',
        ['/api/find/local', '/api/findAllTransportResourceLocalLink', '/api/findTransportResourceByLocal',],
        [])
    );
    transportResourceLocalLink.data.push(createSpecificPerm('config.transportResourceLocalLink', 'link', 'Link', 'Linked transport resource in local',
        ['/api/find/local', '/api/findAllTransportResourceLocalLink', '/api/findTransportResourceByLocal', '/api/delete/transportresourcelocallink', '/api/create/transportresourcelocallink'],
        ['btnLink', 'btnUnlink'])
    );
    permissions[2].data.push(transportResourceLocalLink);

    permissions[2].data.push(createCrudPerms("config", "scrapreason", "Scrap Reason"));
    permissions[2].data.push(createCrudPerms("config", "pendencytype", "Pendency Type"));
    permissions[2].data.push(createCrudPerms("config", "stopreason", "Stop Reason"));
    permissions[2].data.push(createCrudPerms("config", "weldtype", "Weld Type"));
    permissions[2].data.push(createCrudPerms("config", "visualcharacteristics", "Visual Characteristics"));
    permissions[2].data.push(createCrudPerms("config", "stoptype", "Stop Type"));
    permissions[2].data.push(createCrudPerms("config", "step", "Step"));
    permissions[2].data.push(createCrudPerms("config", "testtype", "Test Type"));
    permissions[2].data.push(createCrudPerms("config", "transportresource", "Transport Resource"));
    //#endregion

    //#region PCP
    let allocation = createSpecificPerm('pcp', 'allocation', 'Allocation', 'Allocate and deallocate lots');
    allocation.data.push(createSpecificPerm('pcp.allocation', 'search', 'Search', 'Search by equipments',
        ['/api/find/equipment', '/api/findLots', '/api/find/material',
        '/api/scheduledOrders', '/api/rawMaterialAllocation', '/api/find/allocation',
        '/api/rawDefaultMaterialAllocation', '/api/getAllocation'],
        [])
    );
    allocation.data.push(createSpecificPerm('pcp.allocation', 'save', 'Save', 'Save changes',
        ['/api/saveAllocation', '/api/find/order'],
        ['btnDesalloc', 'btnAlloc', 'btnSave'])
    );
    permissions[3].data.push(allocation);

    let matrixSetup = createSpecificPerm('pcp', 'matrixSetup', 'Matrix Setup', 'Matrix Setup');
    matrixSetup.data.push(createSpecificPerm('pcp.matrixSetup', 'list', 'List', 'Lis all items',
        ['/api/find/matrixsetup'],
        [])
    );
    matrixSetup.data.push(createSpecificPerm('pcp.matrixSetup', 'save', 'Save', 'Save, edit, remove the informations of an item',
        ['/api/find/', '/api/find/equipment', '/api/find/material', '/api/find/matrixsetup', '/api/matrix', '/api/create/matrix',],
        ['btnSave', 'btnRemove', 'btnRefresh'])
    );
    permissions[3].data.push(matrixSetup);

    let stops = createSpecificPerm('pcp', 'stops', 'Stops', 'Manager stops');
    stops.data.push(createSpecificPerm('pcp.stops', 'list', 'List', 'Lis all items',
        ['/api/find/equipment', '/api/AllStops', '/api/find/stop'],
        ['btnXls', 'btnPdf'])
    );
    stops.data.push(createSpecificPerm('pcp.stops', 'add', 'Add', 'Add new item',
        ['/api/update/stop', '/api/find/equipment', '/api/AllStops', '/api/find/stop'],
        ['btnAdd', 'btnEdit', 'btnXls', 'btnPdf'])
    );
    stops.data.push(createSpecificPerm('pcp.stops', 'remove', 'Remove', 'Remove an item',
        ['/api/delete/stop', '/api/find/equipment', '/api/AllStops', '/api/find/stop'],
        ['btnRemove', 'btnAdd', 'btnEdit', 'btnXls', 'btnPdf'])
    );
    stops.data.push(createSpecificPerm('pcp.stops', 'edit', 'Edit', 'Edit the informations of an item',
        ['/api/update/stop', '/api/find/equipment', '/api/AllStops', '/api/find/stop'],
        ['btnEdit', 'btnAdd', 'btnXls', 'btnPdf'])
    );
    permissions[3].data.push(stops);

    let tubesCuttingPlan = createSpecificPerm('pcp', 'tubesCuttingPlan', 'Tubes Cutting Plan', 'Tubes cutting plan');
    tubesCuttingPlan.data.push(createSpecificPerm('pcp.tubesCuttingPlan', 'search', 'Search', 'Search by equipments',
        ['/api/tubesCuttingPlan', '/api/calcPlannedHours', '/api/find/equipment', '/api/allocatedRawMaterial', '/api/smallerMaterial'])
    );
    tubesCuttingPlan.data.push(createSpecificPerm('pcp.tubesCuttingPlan', 'save', 'Save', 'Save changes',
        ['/api/update/order', '/api/create/interface'],
        ['btnSave'])
    );
    permissions[3].data.push(tubesCuttingPlan);

    let stripsCuttingPlan = createSpecificPerm('pcp', 'stripsCuttingPlan', 'Strips Cutting Plan', 'Strips Cutting Plan');
    stripsCuttingPlan.data.push(createSpecificPerm('pcp.stripsCuttingPlan', 'list', 'List', 'Lis all items',
        ['/api/tubesCuttingPlan', '/api/find/equipment', '/api/calcPlannedHours', '/api/allocatedRawMaterial', '/api/smallerMaterial'],
        [])
    );
    stripsCuttingPlan.data.push(createSpecificPerm('pcp.stripsCuttingPlan', 'save', 'Save', 'Save, edit, remove the informations of an item',
        ['/api/tubesCuttingPlan', '/api/find/equipment', '/api/calcPlannedHours', '/api/allocatedRawMaterial', '/api/smallerMaterial',
        '/api/create/interface', '/api/findOne/order', '/api/findOne/equipment', '/api/getCharacteriscsByMaterial', '/api/create/order',
        '/api/find/material', '/api/maxSequenceOrder'],
        ['btnSave'])
    );
    permissions[3].data.push(stripsCuttingPlan);

    let schedulling = createSpecificPerm('pcp', 'schedulling', 'Schedulling', 'Order Schedulling');
    schedulling.data.push(createSpecificPerm('pcp.schedulling', 'search', 'Search', 'Search by equipments',
        ['/api/find/equipment', '/api/allOrderScheduled', '/api/allOrderExpected'],
        [])
    );
    schedulling.data.push(createSpecificPerm('pcp.schedulling', 'change', 'Change', 'Change order schedulling',
        ['/api/find/equipment', '/api/update/order', '/api/allOrderScheduled', '/api/allOrderExpected', '/api/changeEquipment'],
        ['btnChangeEquipSequence', 'btnRemoveOrder', 'btnGenerateOP', 'btnOrderSECUP', 'btnOrderSECDOWN', 'btnOrderSEC', 'btnOrderDESEC'])
    );
    permissions[3].data.push(schedulling);

    // let transportResourceLocalLink = createSpecificPerm('pcp', 'transportResourceLocalLink', 'Transport Resource Local Link', 'Manager transport resource');
    // transportResourceLocalLink.data.push(createSpecificPerm('pcp.transportResourceLocalLink', 'search', 'Search', 'Search by equipments',
    //     ['/api/find/local', '/api/findAllTransportResourceLocalLink', '/api/findTransportResourceByLocal',],
    //     [])
    // );
    // transportResourceLocalLink.data.push(createSpecificPerm('pcp.transportResourceLocalLink', 'link', 'Link', 'Linked transport resource in local',
    //     ['/api/find/local', '/api/findAllTransportResourceLocalLink', '/api/findTransportResourceByLocal', '/api/delete/transportresourcelocallink', '/api/create/transportresourcelocallink'],
    //     ['btnLink', 'btnUnlink'])
    // );
    // permissions[3].data.push(transportResourceLocalLink);
    //#endregion

    //#region Quality
    let checklist = createSpecificPerm('quality', 'checklist', 'Checklist', 'Checklist');
    checklist.data.push(createSpecificPerm('quality.checklist', 'list', 'List', 'Lis all items',
        ['/api/find/equipment', '/api/find/checklist', '/api/find/checklistitem'],
        [])
    );
    checklist.data.push(createSpecificPerm('quality.checklist', 'save', 'Save', 'Save, edit, remove the informations of an item',
        ['/api/find/equipment', '/api/create/checklist', '/api/find/checklist', '/api/find/checklistitem', '/api/update/checklistitem',
        '/api/delete/checklistitemlink', '/api/create/checklistitemlink', '/api/linkedChecklistItem', '/api/unlinkedChecklistItem'],
        ['btnUnlink', 'btnLink', 'btnAddChecklistItem'])
    );
    permissions[4].data.push(checklist);

    let eddyCurrent = createSpecificPerm('quality', 'EddyCurrent', 'EddyCurrent', 'EddyCurrent');
    eddyCurrent.data.push(createSpecificPerm('quality.EddyCurrent', 'list', 'List', 'Lis all items',
        ['/api/eddyCurrent'],
        [])
    );
    eddyCurrent.data.push(createSpecificPerm('quality.EddyCurrent', 'add', 'Add', 'Create new items',
        ['/api/eddyCurrent', '/api/create/eddycurrent', '/api/find/equipment'],
        ['btnAdd'])
    );
    eddyCurrent.data.push(createSpecificPerm('quality.EddyCurrent', 'edit', 'Edit', 'Edit item',
        ['/api/eddyCurrent', '/api/update/eddycurrent', '/api/find/equipment',],
        ['btnEdit'])
    );
    eddyCurrent.data.push(createSpecificPerm('quality.EddyCurrent', 'remove', 'Remove', 'Remove item',
        ['/api/eddyCurrent', '/api/delete/eddycurrent'],
        ['btnRemove'])
    );
    permissions[4].data.push(eddyCurrent);

    permissions[4].data.push(createCrudPerms("quality", "controlPlans", "Control Plans"));

    let searchRNC = createSpecificPerm('quality', 'searchRNC', 'Search RNC', 'Search RNC');
    searchRNC.data.push(createSpecificPerm('quality.searchRNC', 'list', 'List', 'Lis all items',
        ['/api/find/pendencytype', '/api/allSearchRNC'],
        [])
    );
    searchRNC.data.push(createSpecificPerm('quality.searchRNC', 'add', 'Add', 'Add new item',
        ['/api/find/scrapreason', '/api/find/pendencytype', '/api/createPendency', '/api/update/pendency',
        '/api/find/lot', '/api/find/scrapreason', '/api/find/pendency', '/api/update/pendency', '/api/lotFields',
        '/api/getDetailsLotsLot', '/api/create/interface'],
        ['btnAdd'])
    );
    searchRNC.data.push(createSpecificPerm('quality.searchRNC', 'pendencyRelease', 'Pendency Release', 'Pendency Realease',
        ['/api/find/pendencytype', '/api/allSearchRNC', '/api/lotFields', '/api/pendencyFields', '/api/defectFields', '/api/orderRelationships',
        '/api/reworkTypesItems', '/api/find/lot', '/api/find/pendency', '/api/find/order', '/api/find/local', '/api/create/interface',
        '/api/pendencyrelease', '/api/materialSameSteel', '/api/reworkTypes', '/api/find/pendencyrelease',],
        ['btnPendencyrelease'])
    );
    searchRNC.data.push(createSpecificPerm('quality.searchRNC', 'cancelar', 'Cancelar', 'Cancel RNC',
        ['/api/find/pendencytype', '/api/allSearchRNC', '/api/update/pendency', '/api/update/pendencyrelease',],
        ['btnCancel'])
    );
    searchRNC.data.push(createSpecificPerm('quality.searchRNC', 'edit', 'Edit', 'Edit one item',
        ['/api/find/pendencytype', '/api/allSearchRNC', '/api/createPendency', '/api/update/pendency',
        '/api/find/lot', '/api/find/scrapreason', '/api/find/pendency', '/api/update/pendency', '/api/lotFields',
        '/api/getDetailsLotsLot', '/api/create/interface'],
        ['btnEdit'])
    );
    permissions[4].data.push(searchRNC);

    let testAndDimensionalControl = createSpecificPerm('quality', 'testAndDimensionalControl', 'Test And Dimensional Control', 'Screen Test And Dimensional Control');
    testAndDimensionalControl.data.push(createSpecificPerm('quality.testAndDimensionalControl', 'list', 'List', 'Lis all items',
        ['/api/find/equipment', '/api/find/dimensionalcontrolitem', '/api/find/dimensionalcontrollink', '/api/find/materialcharacteristic'],
        [])
    );
    testAndDimensionalControl.data.push(createSpecificPerm('quality.testAndDimensionalControl', 'linkedItem', 'Linked Items', 'Linked Items',
        ['/api/find/equipment', '/api/find/dimensionalcontrolitem', '/api/find/dimensionalcontrollink', '/api/find/materialcharacteristic', '/api/create/dimensionalcontrollink', '/api/delete/dimensionalcontrollink', '/api/update/dimensionalcontrolitem', '/api/create/dimensionalcontrolitem',],
        ['btnUnlink', 'btnLink', 'btnNew', 'btnEdit', 'btnRemove', 'btnAddChecklistItem'])
    );
    permissions[4].data.push(testAndDimensionalControl);
    //#endregion

    //#region Production
    //checkClientPermission('production.program'); (NAO APARECE MENU)
    let productProgram = createSpecificPerm('production', 'program', 'Production Program', 'Production Program');
    productProgram.data.push(createSpecificPerm('production.program', 'listitens', 'List Itens', 'List Itens',
        [],
        [])
    );
    permissions[5].data.push(productProgram);

    //checkClientPermission('production.movement');
    let productMovement = createSpecificPerm('production', 'movement', 'Movement', 'Movement');
    productMovement.data.push(createSpecificPerm('production.movement', 'listitens', 'List Itens', 'List Itens',
        ['/api/movementEquipment', 
        '/api/find/transportresource', 
        '/api/lotChange', 
        '/api/update/lotcharacteristic', 
        '/api/create/lothistory', 
        '/api/movementEquipment', 
        '/api/movementDeposit', 
        '/api/find/moverequest',
        '/api/lotChangeLocal',
        '/api/find/local/', 
        '/api/update/moverequest'],
        [])
    );
    productMovement.data.push(createSpecificPerm('production.movement', 'alloc', 'Alloc', 'Alloc',
        [],
        ['btnRequestRM'])
    );
    permissions[5].data.push(productMovement);

    //checkClientPermission('production.programstart'); (NAO APARECE MENU)
    let productProgramStart = createSpecificPerm('production', 'programStart', 'Production Program Start', 'Production Program Start');
    productProgramStart.data.push(createSpecificPerm('production.programStart', 'listitens', 'List Itens', 'List Itens',
        [],
        [])
    );
    permissions[5].data.push(productProgramStart);

    //checkClientPermission('production.defectRegistry'); 
    let productDefectRegistry = createSpecificPerm('production', 'defectRegistry', 'Defect Registry', 'Defect Registry');
    productDefectRegistry.data.push(createSpecificPerm('production.defectRegistry', 'listitens', 'List Itens', 'List Itens',
        ['/api/find/defect', 
        '/api/update/defect', 
        '/api/find/defecttype', 
        '/api/find/lotFields', 
        '/api/find/operation'],
        [])
    );
    productDefectRegistry.data.push(createSpecificPerm('production.defectRegistry', 'remove', 'Remove itens', 'Remove Itens',
        [],
        ['remove'])
    );
    productDefectRegistry.data.push(createSpecificPerm('production.defectRegistry', 'edit', 'Edit Itens', 'Edit Itens',
        [],
        ['edit'])
    );
    permissions[5].data.push(productDefectRegistry);

    //checkClientPermission('production.lotspendingreceipt');
    let productLotsPendingReceipt = createSpecificPerm('production', 'lotsPendingReceipt', 'Lots Pending Receipt', 'Lots Pending Receipt');
    productLotsPendingReceipt.data.push(createSpecificPerm('production.lotsPendingReceipt', 'listitens', 'List Itens', 'List Itens',
        ['/api/lotsPending', 
        '/api/find/local', 
        '/api/saveAndUpdateAndReceived', 
        '/api/getLotIdRun', 
        '/api/print'],
        [])
    );
    productLotsPendingReceipt.data.push(createSpecificPerm('production.lotsPendingReceipt', 'print', 'Print', 'Print',
        [''],
        ['print'])
    );
    productLotsPendingReceipt.data.push(createSpecificPerm('production.lotsPendingReceipt', 'received', 'Received', 'Received',
        [''],
        ['received'])
    );
    permissions[5].data.push(productLotsPendingReceipt);

    //checkClientPermission('production.detailslots');
    let productDetailsLots = createSpecificPerm('production', 'detailsLots', 'Details Lots', 'Details Lots');
    productDetailsLots.data.push(createSpecificPerm('production.detailsLots', 'listitens', 'List Itens', 'List Itens',
        ['/api/find/equipment',
        '/api/find/material',
        '/api/find/lot',,
        '/api/AllDetailsLots',
        '/api/find/local',
        '/api/updateLocalsWeightPieces',
        '/api/find/lothistory',
        '/api/getGenealogyGenerated',
        '/api/getGenealogyConsumed',
        '/api/getDetailsLotsLot',
        '/api/getDetailsLotsEquip',
        '/api/getDetailsLotsMaterial',
        '/api/getDetailsLotsOrder'],
        ['pdf'])
    );
    productDetailsLots.data.push(createSpecificPerm('production.detailsLots', 'movement', 'Movement', 'Movement',
        [],
        ['btnMovement'])
    );
    productDetailsLots.data.push(createSpecificPerm('production.detailsLots', 'rnc', 'RNC', 'RNC',
        [],
        ['btnRnc'])
    );
    productDetailsLots.data.push(createSpecificPerm('production.detailsLots', 'qrCodeGenerator', 'Qr Code', 'QR Code',
        [],
        ['btnQrCodeGenerator'])
    );
    productDetailsLots.data.push(createSpecificPerm('production.detailsLots', 'edit', 'Edit', 'Edit',
        [],
        ['btnEdit'])
    );
    productDetailsLots.data.push(createSpecificPerm('production.detailsLots', 'history', 'History', 'History',
        [],
        ['btnHistory'])
    );
    productDetailsLots.data.push(createSpecificPerm('production.detailsLots', 'genealogy', 'Genealogy', 'Genealogy',
        [],
        ['btnGenealogy'])
    );
    permissions[5].data.push(productDetailsLots);

    //checkClientPermission('production.coilCollect'); (NAO APARECE MENU)
    let productCoilCollect = createSpecificPerm('production', 'coilCollect', 'Coil Collect', 'Coil Collect');
    productCoilCollect.data.push(createSpecificPerm('production.coilCollect', 'listitens', 'List Itens', 'List Itens',
        ['/api/findAllCoilCutPlanByEquip'],
        [])
    );
    permissions[5].data.push(productCoilCollect);

    //checkClientPermission('production.productivity');
    let productProductivity = createSpecificPerm('production', 'productivity', 'Productivity', 'Productivity');
    productProductivity.data.push(createSpecificPerm('production.productivity', 'listitens', 'List Itens', 'List Itens',
        ['/api/find/equipment', 
        '/api/find/material',
        '/api/productivityMaterialEquipment',
        '/api/unlinkedMaterial'],
        ['search'])
    );
    productProductivity.data.push(createSpecificPerm('production.productivity', 'pdf', 'Export PDF', 'Export PDF',
        [],
        ['pdf'])
    );
    productProductivity.data.push(createSpecificPerm('production.productivity', 'linkunlink', 'Link/Unlink', 'Link/Unlink',
        [],
        ['btnUnlink, btnLink'])
    );
    productProductivity.data.push(createSpecificPerm('production.productivity', 'productivity', 'ADD Productivity', 'ADD Productivity',
        [],
        ['btnaddProductivity'])
    );
    permissions[5].data.push(productProductivity);

    //checkClientPermission('production.metallography');
    let productMetallography = createSpecificPerm('production', 'metallography', 'Metallography', 'Metallography');
    productMetallography.data.push(createSpecificPerm('production.metallography', 'listitens', 'List Itens', 'List Itens',
        ['/api/find/metallography', '/api/AllMetallography'],
        [])
    );
    productMetallography.data.push(createSpecificPerm('production.metallography', 'register', 'Registro', 'Registro',
        ['/api/update/metallography', '/api/find/metallography'],
        ['btnRegister', 'btnApproved', 'btnReproved'])
    );
    permissions[5].data.push(productMetallography);
    //#endregion

    //#region Reports
    let reportsStops = createSpecificPerm('reports', 'stops', 'Stops', 'Reports Stops');
    reportsStops.data.push(createSpecificPerm('reports.stops', 'export', 'Export', 'Export XLS/PDF',
        ['/api/reportStops', '/api/find/equipment', '/api/graphsStops', ],
        ['Xls', 'pdf']));
    permissions[6].data.push(reportsStops);

    let reportsRNCS = createSpecificPerm('reports', 'rncs', 'RNCS', 'Reports RNCS');
    reportsRNCS.data.push(createSpecificPerm('reports.rncs', 'export', 'Export', 'Export XLS/PDF',
        ['/api/reportRNC', '/api/find/shift', '/api/graphsRNC' ],
        ['Xls', 'pdf']));
    permissions[6].data.push(reportsRNCS);

    let reportsShifts = createSpecificPerm('reports', 'shifts', 'Shifts', 'Reports Production per Shift');
    reportsShifts.data.push(createSpecificPerm('reports.shifts', 'export', 'Export', 'Export XLS/PDF',
        ['/api/reportShifts', '/api/find/shift', '/api/find/equipment',  '/api/graphsShifts' ],
        ['Xls', 'pdf']));
    permissions[6].data.push(reportsShifts);

    let reportsScrapsRecord = createSpecificPerm('reports', 'scrapsrecord', 'Scraps Record', 'Reports Scraps Record');
    reportsScrapsRecord.data.push(createSpecificPerm('reports.scrapsrecord', 'export', 'Export', 'Export XLS/PDF',
        ['/api/find/equipment',  '/api/AllScraps' ],
        ['Xls', 'pdf']));
    permissions[6].data.push(reportsScrapsRecord);
    //#endregion

    //#region OEE
    let oeeYield = createSpecificPerm('oee', 'yield', 'Yield', 'OEE Yield');
    oeeYield.data.push(createSpecificPerm('oee.yield', 'listitens', 'List Itens', 'List Itens',
        ['/api/kpiYield', 
        '/api/weightOP', 
        '/api/weightScrap', 
        '/api/find/equipment'],
        ['btnSearch']));
    permissions[7].data.push(oeeYield);

    let oeePerformance = createSpecificPerm('oee', 'performance', 'Performance', 'OEE Performance');
    oeePerformance.data.push(createSpecificPerm('oee.performance', 'listitens', 'List Itens', 'List Itens',
        ['/api/find/equipment'],
        ['btnSearch'])
    );
    permissions[7].data.push(oeePerformance);
    //#endregion

    return permissions;
}

function adConnect(app, login, password) {
    return new Promise(function (resolve, reject) {
        var ldap = require('ldapjs');

        var client = ldap.createClient({
            url: app.config.authentication.URL
        });

        var opts = {
            filter: '(SAMAccountName=' + login + ')',
            scope: 'sub',
            attributes: ['objectGUID', 'userAccountControl', 'cn']
        };

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
    })
}

function getAllPerms(type, userPerms) {
    let ret = [];
    let list = createPermsList();

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