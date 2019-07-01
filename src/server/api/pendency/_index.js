const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // URL BASE
    const resourceBase = '/api/';

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;
    const { pendency, pendencyrelease, lot, reworkresult, lothistory, scrap } = config.postgres.DB;

    app.api.register('pendency', async (req, ctx) => {
        
        let data = req;
        let sql = `	 

                select l.id as "lot", m.id as "materialid", concat(TO_NUMBER(m.id, '999999999999999999'), ' - ', m.description) as material, e.id as "equipmentid", e.description as equipment, o."idclient", o."idordermes" as order
                from ${schema}.lot l
                inner join ${schema}.material m on (m.id = l."idmaterial")
                left join ${schema}.allocation a on (a."idlot" = l.id)
                left join ${schema}."order" o on (o."idordermes" = a."idorder")
                left join ${schema}.equipment e on (e.id = o."idequipmentscheduled")
                where l.id = ${data.lot}`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    });

    //PENDENCY FIELDS (to RNC)
    app.api.register('pendencyFields', async (req, ctx) => {
        
        let data = req;
        let sql = `	 
                    select distinct p.id as pendency,
                    p."observationtext",
                    p."pendencystatus",
                    pt.id as "idpendencytype", 
                    pt.description as "pendencytype", 
                    dt.id as "iddisposaltype", 
                    dt."disposaltypesequence" as sequence,
                    rt.id as "idreleaseteam",
                    rt."teamtype" as "releaseteam",
                    pr."chkmd",
                    pr."chkscrap",
                    pr."idmaterialreclass",
                    pr."idscrapreason",
                    pr.situation as "pendencyreleasesituation",
                    pr."reporttext" as "reportRelease"
                from ${schema}."pendencytype" pt
                    inner join ${schema}."disposaltype" dt on (pt."iddisposaltype" = dt.id)
                    inner join ${schema}."releaseteam" rt on (dt."idreleaseteam" = rt.id)
                    inner join ${schema}.pendency p on (pt.id = p."idpendencytype")
                    left join ${schema}."pendencyrelease" pr on (p.id = pr."idpendency" and pr."disposaltypesequence" = dt."disposaltypesequence")
                where 
                    p.id = '${data.pendency}'`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })

    });

    //DEFECT FIELDS (to RNC)
    app.api.register('defectFields', async (req, ctx) => {
        
        let data = req;
        let sql = `	 
        select dt.description as "defecttypedescription", d.weight, d.quantity, d."idoperation"  
        from ${schema}.defect d 
            inner join ${schema}."defecttype" dt on (d."iddefecttype" = dt.id)
        where d."idlot" = ${data.lot}`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })

    });

    // SAVE PENDENCY AND PENDENCY RELEASES
    app.api.register('createPendency', async (data) => {

        let idlot = data.lot;
        let pendencytype = data.pendencytype;
        let order = data.order;
        let todayDate = new Date();
        let equipment = data.equipment;
        let observation = data.observationtext;
        let iduser = data.iduser;
        let idshift = data.idshift;

        equipment = equipment = "" ? null : equipment
        order = order == "" ? null : order

        return sequelize.transaction(async (t) => {
            let sql = `select 
                                dt.id as "disposaltypeid", 
                                dt."disposaltypesequence" as sequence, 
                                pt.id as "pendencytypeid",
                                pt.description as "pendencytype", 
                                rt.id as "idreleaseteam", 
                                rt. description as "releaseteam"
                            from ${schema}."pendencytype" pt 
                                inner join ${schema}."disposaltype" dt on (pt."iddisposaltype" = dt.id)
                                inner join ${schema}."releaseteam" rt on (dt."idreleaseteam" = rt.id)
                            where pt.id = '${pendencytype}'`;

            return sequelize.query(sql).spread(async (result) => {

                let pendencyCreated = await pendency.create({
                    idorder: order,
                    idlot: parseInt(idlot),
                    idpendencytype: pendencytype,
                    pendencydate: todayDate,
                    observationtext: observation,
                    pendencystatus: 'A',
                    iduser: iduser,
                    idshift: idshift
                }, { transaction: t });

                await lot.update({
                    situation: 'P'
                },
                    {
                        where: {
                            id: parseInt(idlot)
                        },
                        raw: false,
                        transaction: t
                    });

                for (i = 0; i < result.length; i++) {

                    await pendencyrelease.create({
                        idpendency: pendencyCreated.id,
                        disposaltypesequence: parseInt(result[i].sequence),
                        reporttext: null,
                        situation: 'A',
                        date: todayDate,
                        iduser: iduser
                    }, { transaction: t });
                }
            });
        }).then(function (result) {
            return { data: result, success: true }
        }).catch(function (err) {
            return { data: err, success: false }
        });
    }, { method: "POST" });

    // SCRAP LOT (To RNC)
    app.api.register('scrapLot', async (data) => {

        let lotUpdate = data.idlot;
        let scrapreason = data.scrapreasonid;
        let report = data.report;
        let pendencyUpdate = data.pendency;
        let iduser = data.iduser;

        return sequelize.transaction(async (t) => {
            let sql = `select * from ${schema}."pendencyrelease"
                        where "idpendency" = ${pendencyUpdate}`;

            return sequelize.query(sql).spread(async (result) => {

                await pendency.update({
                    pendencystatus: 'S'
                },
                    {
                        where: {
                            id: pendencyUpdate
                        },
                        raw: false,
                        transaction: t
                    });
                await lot.update({
                    situation: 'S'
                },
                    {
                        where: {
                            id: lotUpdate
                        },
                        raw: false,
                        transaction: t
                    });

                for (i = 0; i < result.length; i++) {

                    await pendencyrelease.update({
                        chkScrap: true,
                        idscrapreason: scrapreason,
                        reporttext: report,
                        situation: 'S'
                    },
                        {
                            where: {
                                idpendency: result[i].idpendency,
                                disposaltypesequence: result[i].disposaltypesequence
                            },
                            raw: false,
                            transaction: t
                        });
                }

                let sql2 = `
                            select l.id, lc1.numbervalue as weight, lc2.numbervalue as quantity
                            from ${schema}.lot l 
                                left join ${schema}.lotcharacteristic lc1 on (l.id = lc1.idlot and lc1."name" = 'CG_PESO_LIQUIDO')
                                left join ${schema}.lotcharacteristic lc2 on (l.id = lc2.idlot and lc2."name" = 'CG_QUANTIDADE')
                            where l.id = ${lotUpdate}
                                and l.status = true`;

                return sequelize.query(sql2).spread(async (result) => {

                    await scrap.create({
                        idlot: lotUpdate,
                        idscrapreason: scrapreason,
                        weight: result[0].weight,
                        quantity: result[0].quantity,
                        iduser: iduser,
                        status: true
                    }, { transaction: t });

                });
            });
        }).then(function (result) {
            return { data: result, success: true }
        }).catch(function (err) {
            return { data: err, success: false }
        });
    }, { method: "POST" });

    // Pendency release (To RNC)
    app.api.register('pendencyrelease', async (data) => {

        let idmaterialreclass = data.idmaterialreclass;
        let reporttext = data.reporttext;
        let reworks = data.reworks;
        let secondchoice = data.secondchoice;
        let lotRnc = data.lot;
        let disposal = data.disposal;
        let idpendency = data.idpendency;
        let sequence = data.sequence;
        let iduser = data.iduser;

        return sequelize.transaction(async (t) => {

            let length = disposal.length;

            if (length == 1) {

                //REWORK
                if (reworks != "") {

                    let reworkArray = reworks.split(",");

                    for (let i = 0; i < reworkArray.length; i++) {

                        let reworktype = parseInt(reworkArray[i]);

                        let sql = ` select r."idreworktype", rt.description, r."idreworkitem", ri.description
                                    from ${schema}."reworktype" rt
                                        inner join ${schema}.rework r on (r."idreworktype" = rt.id)
                                        inner join ${schema}."reworkitem" ri on (r."idreworkitem" = ri.id)
                                    where rt.id = ${reworktype}`;

                        await sequelize.query(sql).spread(async (result) => {

                            for (let j = 0; j < result.length; j++) {

                                await reworkresult.create({
                                    idlot: lotRnc,
                                    idpendency: idpendency,
                                    idreworktype: reworktype,
                                    idreworkitem: result[j].idreworkitem,
                                    iduser: iduser,
                                    status: true
                                }, { transaction: t });
                            }
                        });
                    }

                    await pendency.update({
                        pendencystatus: 'P'
                    },
                        {
                            where: {
                                id: idpendency
                            },
                            raw: false,
                            transaction: t
                        });

                }
                else {
                    await pendencyrelease.update({
                        situation: 'L'
                    },
                        {
                            where: {
                                idpendency: idpendency,
                            },
                            raw: false,
                            transaction: t
                        });

                    await lot.update({
                        situation: 'A'
                    },
                        {
                            where: {
                                id: lotRnc,
                            },
                            raw: false,
                            transaction: t
                        });

                    await pendency.update({
                        pendencystatus: 'L'
                    },
                        {
                            where: {
                                id: idpendency
                            },
                            raw: false,
                            transaction: t
                        });
                }

                //SECOND CHOICE
                if (secondchoice == 1) {
                    await pendencyrelease.update({
                        chkmd: true
                    },
                        {
                            where: {
                                idpendency: idpendency,
                            },
                            raw: false,
                            transaction: t
                        });
                }
                else {
                    await pendencyrelease.update({
                        chkmd: false
                    },
                        {
                            where: {
                                idpendency: idpendency,
                            },
                            raw: false,
                            transaction: t
                        });
                }

                //MATERIAL RECLASS
                if (idmaterialreclass != "") {
                    await pendencyrelease.update({
                        idmaterialreclass: idmaterialreclass
                    },
                        {
                            where: {
                                idpendency: idpendency,
                            },
                            raw: false,
                            transaction: t
                        });

                    await lot.update({
                        idmaterial: idmaterialreclass
                    },
                        {
                            where: {
                                id: lotRnc,
                            },
                            raw: false,
                            transaction: t
                        });

                    let sql = `select "idmaterial" from ${schema}.lot where id = ${lotRnc}`;

                    await sequelize.query(sql).spread(async (result) => {
                        await lothistory.create({
                            lot: lotRnc,
                            field: 'idmaterial',
                            valuebefore: result[0].idmaterial,
                            valueafter: idmaterialreclass,
                            iduser: iduser,
                            status: true
                        }, { transaction: t });
                    });
                }

                //REPORT TEXT
                if (reporttext != "") {
                    await pendencyrelease.update({
                        reporttext: reporttext
                    },
                        {
                            where: {
                                idpendency: idpendency,
                            },
                            raw: false,
                            transaction: t
                        });
                }
            }
            else if (length == 2) {
                let statusRR = false;

                //REWORK
                if (sequence == 2) {

                    statusRR = true;

                    await reworkresult.destroy({
                        where: {
                            idlot: lotRnc,
                            idpendency: idpendency,
                            status: false
                        }
                    }, { transaction: t });

                    if (reworks == "") {
                        await lot.update({
                            situation: 'A'
                        },
                            {
                                where: {
                                    id: lotRnc,
                                },
                                raw: false,
                                transaction: t
                            });

                        await pendency.update({
                            pendencystatus: 'L'
                        },
                            {
                                where: {
                                    id: idpendency
                                },
                                raw: false,
                                transaction: t
                            });
                    }
                    else {
                        await pendency.update({
                            pendencystatus: 'P'
                        },
                            {
                                where: {
                                    id: idpendency
                                },
                                raw: false,
                                transaction: t
                            });
                    }
                }

                await pendencyrelease.update({
                    situation: 'L'
                },
                    {
                        where: {
                            idpendency: idpendency,
                            disposaltypesequence: sequence
                        },
                        raw: false,
                        transaction: t
                    });

                if (reworks != "") {

                    let reworkArray = reworks.split(",");

                    for (let i = 0; i < reworkArray.length; i++) {

                        let reworktype = parseInt(reworkArray[i]);

                        let sql = ` select r."idreworktype", rt.description, r."idreworkitem", ri.description
                                    from ${schema}."reworktype" rt
                                        inner join ${schema}.rework r on (r."idreworktype" = rt.id)
                                        inner join ${schema}."reworkitem" ri on (r."idreworkitem" = ri.id)
                                    where rt.id = ${reworktype}`;

                        await sequelize.query(sql).spread(async (result) => {

                            for (let j = 0; j < result.length; j++) {

                                await reworkresult.create({
                                    idlot: lotRnc,
                                    idpendency: idpendency,
                                    idreworktype: reworktype,
                                    idreworkitem: result[j].idreworkitem,
                                    iduser: iduser,
                                    status: statusRR
                                }, { transaction: t });
                            }
                        });
                    }
                }

                //SECOND CHOICE
                if (secondchoice == 1) {
                    await pendencyrelease.update({
                        chkmd: true
                    },
                        {
                            where: {
                                idpendency: idpendency,
                                disposaltypesequence: sequence
                            },
                            raw: false,
                            transaction: t
                        });
                }
                else {
                    await pendencyrelease.update({
                        chkmd: false
                    },
                        {
                            where: {
                                idpendency: idpendency,
                                disposaltypesequence: sequence
                            },
                            raw: false,
                            transaction: t
                        });
                }

                //MATERIAL RECLASS
                if (idmaterialreclass != "") {
                    await pendencyrelease.update({
                        idmaterialreclass: idmaterialreclass
                    },
                        {
                            where: {
                                idpendency: idpendency,
                                disposaltypesequence: sequence
                            },
                            raw: false,
                            transaction: t
                        });

                    if (sequence == 2) {
                        await lot.update({
                            idmaterial: idmaterialreclass
                        },
                            {
                                where: {
                                    id: lotRnc,
                                },
                                raw: false,
                                transaction: t
                            });

                        let sql = `select "idmaterial" from ${schema}.lot where id = ${lotRnc}`;

                        await sequelize.query(sql).spread(async (result) => {
                            await lothistory.create({
                                lot: lotRnc,
                                field: 'idmaterial',
                                valuebefore: result[0].idmaterial,
                                valueafter: idmaterialreclass,
                                iduser: iduser,
                                status: true
                            }, { transaction: t });
                        });
                    }
                }
                else {
                    await pendencyrelease.update({
                        idmaterialreclass: null
                    },
                        {
                            where: {
                                idpendency: idpendency,
                                disposaltypesequence: sequence
                            },
                            raw: false,
                            transaction: t
                        });
                }

                //REPORT TEXT
                if (reporttext != "") {
                    await pendencyrelease.update({
                        reporttext: reporttext
                    },
                        {
                            where: {
                                idpendency: idpendency,
                                disposaltypesequence: sequence
                            },
                            raw: false,
                            transaction: t
                        });
                }
                else {
                    await pendencyrelease.update({
                        reporttext: null
                    },
                        {
                            where: {
                                idpendency: idpendency,
                                disposaltypesequence: sequence
                            },
                            raw: false,
                            transaction: t
                        });
                }
            }

        }).then(function (result) {
            return { data: result, success: true }
        }).catch(function (err) {
            return { data: err, success: false }
        });

    }, { method: "POST" });



    // REWORK TYPES (To RNC)
    app.api.register('reworkTypes', async (data) => {

        let idpendency = data.idpendency;

        let sql = `select distinct l.id as lot, p.id as pendency, rt.id as "idreworktype", rt.description as "reworktype", pt.id as "idpendencytype", pt.description as "pendencytype"
            from ${schema}."reworkresult" rr
            inner join ${schema}.lot l on(rr."idlot" = l.id)
            inner join ${schema}.pendency p on(rr."idpendency" = p.id)
            inner join ${schema}."reworktype" rt on(rr."idreworktype" = rt.id)
            inner join ${schema}."pendencytype" pt on(p."idpendencytype" = pt.id)
            where p.id = ${idpendency}`;

        return sequelize.query(sql).spread(async (result) => {

            return { data: result, success: true }

        }).catch(function (err) {
            return { data: err, success: false }
        });

    }, { method: "POST" });

}

