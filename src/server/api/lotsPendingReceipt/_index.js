const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const util = require('../../controllers/util.js');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // URL BASE
    const resourceBase = '/api/';

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;
    const { lot, materialreceipt, lotcharacteristic, pendency } = config.postgres.DB;

    // SAVE AND UPDATE RECEIVED
    app.api.register('saveAndUpdateAndReceived', async (body, where) => {

        let data = body;

        return sequelize.transaction(async (t) => {
            return materialreceipt.findById(data.idlot, {
                raw: true,
                transaction: t
            }).then(async (one) => {
                if (one !== null) {
                    return materialreceipt.update(data, {
                        where: {
                            idlot: data.idlot,
                        },
                        raw: true,
                        transaction: t
                    }).then(async () => {
                        if (data.detet === 'approved') {
                            await lot.update({ situation: 'A', idlocal: data.idlocal }, {
                                where: {
                                    id: data.idlot,
                                },
                                raw: false,
                                transaction: t
                            })

                            let lottest = await lot.findById(data.idlot, {
                                raw: false,
                                transaction: t
                            });

                            let lotcharacteristictest = await lotcharacteristic.findOne({
                                where: {
                                    idlot: data.idlot,
                                    name: 'CG_LOCALIZACAO'
                                }
                            }, {
                                    transaction: t
                                })

                            if (!lotcharacteristictest) {
                                await lotcharacteristic.create({
                                    idmaterial: lottest.idmaterial,
                                    idlot: data.idlot,
                                    name: 'CG_LOCALIZACAO',
                                    textvalue: data[i].idlocal,
                                    numbervalue: 0,
                                    iduser: data.iduser
                                }, {
                                        raw: true,
                                        transaction: t
                                    });
                            }
                            else {
                                lot.update({ situation: 'A', idlocal: data.idlocal, iduser: data.iduser }, {
                                    where: {
                                        id: data.idlot,
                                    },
                                    raw: false,
                                    transaction: t
                                });

                                await lotcharacteristic.update({
                                    textvalue: data.idlocal,
                                    iduser: data.iduser
                                },
                                    {
                                        where: {
                                            idlot: data.idlot,
                                            name: 'CG_LOCALIZACAO'
                                        },
                                        raw: false,
                                        transaction: t
                                    }
                                );
                            }

                            return
                        }
                    }).catch(err => {
                        console.error(err)
                    });
                } else {
                    return materialreceipt.create(data, {
                        raw: true,
                        transaction: t
                    }).then(async () => {
                        if (data.detet === 'approved') {
                            await lot.update({ situation: 'A', idlocal: data.idlocal }, {
                                where: {
                                    id: data.idlot,
                                },
                                raw: false,
                                transaction: t
                            })

                            let lottest = await lot.findById(data.idlot, {
                                raw: false,
                                transaction: t
                            });

                            let lotcharacteristictest = await lotcharacteristic.findOne({
                                where: {
                                    idlot: data.idlot,
                                    name: 'CG_LOCALIZACAO'
                                }
                            }, {
                                    transaction: t
                                })

                            if (!lotcharacteristictest) {
                                await lotcharacteristic.create({
                                    idmaterial: lottest.idmaterial,
                                    idlot: data.idlot,
                                    name: 'CG_LOCALIZACAO',
                                    textvalue: data[i].idlocal,
                                    numbervalue: 0,
                                    iduser: data.iduser
                                }, {
                                        raw: true,
                                        transaction: t
                                    });
                            }
                            else {
                                lot.update({ situation: 'A', idlocal: data.idlocal, iduser: data.iduser }, {
                                    where: {
                                        id: data.idlot,
                                    },
                                    raw: false,
                                    transaction: t
                                });

                                await lotcharacteristic.update({
                                    textvalue: data.idlocal,
                                    iduser: data.iduser
                                },
                                    {
                                        where: {
                                            idlot: data.idlot,
                                            name: 'CG_LOCALIZACAO'
                                        },
                                        raw: false,
                                        transaction: t
                                    }
                                );
                            }

                            return
                        }
                    }).catch((err) => {
                        console.error(err)
                    });
                }
            })
        }).then((result) => {
            return { data: result, success: true }
        }).catch((err) => {
            console.error(err)
            return { data: err, success: false }
        })
    }, { method: "POST" });

    // SAVE AND UPDATE A POOL OF RECEIVED LOTS
    app.api.register('saveUpdatePoolReceived', async (data) => {

        data = data.data;

        return sequelize.transaction(async (t) => {

            for (let i = 0; i < data.length; i++) {

                let lotN = await materialreceipt.findById(data[i].idlot, {
                    raw: false,
                    transaction: t
                });

                if (lotN != null) {
                    await materialreceipt.update(data[i], {
                        where: {
                            idlot: data[i].idlot,
                        },
                        raw: true,
                        transaction: t
                    });;

                    let lot = await lot.update({ situation: 'A', idlocal: data[i].idlocal, iduser: data[i].iduser }, {
                        where: {
                            id: data[i].idlot,
                        },
                        raw: false,
                        transaction: t
                    });

                    let lottest = await lot.findById(data[i].idlot, {
                        raw: false,
                        transaction: t
                    });

                    let lotcharacteristictest = await lotcharacteristic.findOne({
                        where: {
                            idlot: data[i].idlot,
                            name: 'CG_LOCALIZACAO'
                        }
                    }, {
                            transaction: t
                        })

                    if (!lotcharacteristictest) {
                        await lotcharacteristic.create({
                            idmaterial: lottest.idmaterial,
                            idlot: data[i].idlot,
                            name: 'CG_LOCALIZACAO',
                            textvalue: data[i].idlocal,
                            numbervalue: 0,
                            iduser: data[i].iduser
                        }, {
                                raw: true,
                                transaction: t
                            });
                    }
                    else {
                        lot.update({ situation: 'A', idlocal: data[i].idlocal, iduser: data[i].iduser }, {
                            where: {
                                id: data[i].idlot,
                            },
                            raw: false,
                            transaction: t
                        });

                        await lotcharacteristic.update({
                            textvalue: data[i].idlocal,
                            iduser: data[i].iduser
                        },
                            {
                                where: {
                                    idlot: data[i].idlot,
                                    name: 'CG_LOCALIZACAO'
                                },
                                raw: false,
                                transaction: t
                            }
                        );
                    }

                } else {

                    await materialreceipt.create(
                        {
                            idlot: data[i].idlot,
                            receivingdate: new Date(),
                            situation: 'RELEASED',
                            idlocal: data[i].idlocal,
                            detet: data[i].detet == 1 ? 'APPROVED' : data[i].detet == 0 ? 'REPROVED' : null,
                            iduser: data[i].iduser,
                            status: true
                        }, {
                            raw: true,
                            transaction: t
                        });

                    await lot.update(
                        {
                            situation: data[i].detet == 1 || data[i].detet == 2 ? 'A' : 'P', 
                            idlocal: data[i].idlocal, 
                            iduser: data[i].iduser
                        }, {
                            where: {
                                id: data[i].idlot,
                            },
                            raw: true,
                            transaction: t
                        });

                    let lotcharacteristictest = await lotcharacteristic.findOne({
                        where: {
                            idlot: data[i].idlot,
                            name: 'CG_LOCALIZACAO'
                        }
                    }, {
                            transaction: t
                        })

                    if (!lotcharacteristictest) {
                        await lotcharacteristic.create({
                            idmaterial: data[i].idmaterial,
                            idlot: data[i].idlot,
                            name: 'CG_LOCALIZACAO',
                            textvalue: data[i].idlocal,
                            numbervalue: 0,
                            iduser: data[i].iduser
                        }, {
                                raw: true,
                                transaction: t
                            });
                    }
                    else {

                        await lotcharacteristic.update({
                            textvalue: data[i].idlocal,
                            iduser: data[i].iduser
                        },
                            {
                                where: {
                                    idlot: data[i].idlot,
                                    name: 'CG_LOCALIZACAO'
                                },
                                raw: false,
                                transaction: t
                            }
                        );
                    }

                }
            }


        }).then((result) => {
            return { data: result, success: true }
        }).catch((err) => {
            console.error(err)
            return { data: err, success: false }
        })
    }, { method: "POST" });

    //GET LOTS PENDING
    app.api.register('lotsPending', async (req) => {
        let sql = `select l.id, 
        l.situation, 
        l.idmaterial, 
        l.idlocal,
        l.quality, 
        l.idrun,
        l.dtcreated,
        lo.description as local,
        concat(TO_NUMBER(m.id, '999999999999999999'), ' - ', m.description) as "namematerial", 
        comprimentom1 as "length",
        diametrom1 as "diameter",
        espessuram1 as "thickness",
        larguram1 as "width",
        acom as "steel",
        grupomaterialm as "materialgroup",
        peso as weight,
        quantidade as piece,
        mr.detet 
        from ${schema}.lot l 
        inner join ${schema}."local" lo on lo."id" = l."idlocal"
      	inner join ${schema}.material m on l."idmaterial" = m.id
        left  join ${schema}."materialreceipt" mr on (l.id = mr."idlot" and mr.detet = 'disapproved') 
    left join (
        SELECT * 
        FROM crosstab(
    'select "idmaterial", "idcharacteristic", "numbervalue" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1,2',
    'select distinct "idcharacteristic" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1'
    ) 
            AS result_test(materiam character varying(200), acom1 REAL, comprimentom1 REAL, diametrom1 REAL, espessuram1 REAL, grupomaterialm1 character varying(200),larguram1 REAL)
        ) as cm1 on (l."idmaterial" = cm1.materiam)
    left join (
        SELECT * 
        FROM crosstab(
    'select "idmaterial", "idcharacteristic", "textvalue" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1,2',
    'select distinct "idcharacteristic" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1'
    ) 
            AS result_test(materiam character varying(200), acom character varying(200), comprimentom character varying(200), diametrom character varying(200), espessuram character varying(200), grupomaterialm character varying(200),larguram character varying(200))
        ) as cm2 on (l."idmaterial" = cm2.materiam)
    left join (
        SELECT * 
        FROM crosstab(
    'select "idlot", "name", "numbervalue" from ${schema}."lotcharacteristic" where "name" in (''CG_PESO_LIQUIDO'',''CG_QUANTIDADE'') ORDER BY 1,2',
    'select distinct "name" from ${schema}."lotcharacteristic" where "name" in (''CG_PESO_LIQUIDO'',''CG_QUANTIDADE'') ORDER BY 1'
    ) 
            AS result_test(idlot bigint, peso REAL, quantidade REAL)
        ) as cm3 on (l."id" = cm3.idlot)
        where l.status = true and l.situation = 'R'
        order by m.description`;
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })

    });

    // GET LOTS IDRUN
    app.api.register('getLotIdRun', async (req) => {
        let idrun = req.idrun;

        let sql = ` select l."idrun" from ${schema}.lot l inner join
      ${schema}."materialreceipt" mr on l.id = mr."idlot"  
      where l.status = true and l."idrun" = '${idrun}'; `;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    });
}