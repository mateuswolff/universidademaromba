const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const util = require('../../controllers/util.js');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;
    const {
        lot,
        lotcharacteristic,
        lotgenerated,
        moverequest,
        local,
        lothistory,
        cuttingplanhistory,
        order,
        interface,
        lotconsumed,
        steppieces
    } = config.postgres.DB;

    app.api.register('sumPiciesLotGenereted', async (req, ctx) => {
        let sql = `select sum(lc.numbervalue) as pieces from ${schema}.lotgenerated lg
        left join ${schema}.lotcharacteristic lc on lc.idlot = lg.idlot and lc."name" = 'CG_QUANTIDADE'
        where idorder = ${req.idorder} `;

        return sequelize.query(sql).spread((results, metadata) => {
            return {
                data: results,
                success: true
            };
        })
    });

    app.api.register('lotsGeneratedPerOrder', async (req, ctx) => {
        let sql = `select lg.idorder, lg.idlot, lg.idorder, lg.idequipment, lg.idoutputorder, lg.lotconsumed1, lg.lotweight1, lg.lotconsumed2, lg.lotweight2, lp.numbervalue as weight, lq.numbervalue as quantity 
        from ${schema}.lotgenerated lg
            left join ${schema}.lotcharacteristic lq on lq.idlot = lg.idlot and lq."name" = 'CG_QUANTIDADE'
            left join ${schema}.lotcharacteristic lp on lp.idlot = lg.idlot and lp."name" = 'CG_PESO_LIQUIDO'
            left join ${schema}.lotcharacteristic lc on lc.idlot = lg.idlot and lc."name" = 'CG_COMPRIMENTO'
        where lg.idorder = ${req.idorder}`;

        return sequelize.query(sql).spread((results, metadata) => {
            return {
                data: results,
                success: true
            };
        })
    });

    app.api.register('AllDetailsLots', async (req, ctx) => {

        let where = req;

        let sql = `select 
            lo.id,
            lo.situation,
            lo.dtupdated,
            lo.saleorder,
            lo.saleorderitem,
            al.idorder,
            concat(TO_NUMBER(ma.id, '999999999999999999'), ' - ', ma.description) as "description",
            mc4.textvalue as steel,
            mc1.numbervalue as thickness, 
            mc2.numbervalue as length, 
            mc3.numbervalue as diameter, 
            mc5.textvalue as width,
            lc.idequipment,
            lc.description as local,
            lc1.textvalue as weight,
            lc2.textvalue as pieces,
            lc3.textvalue as localLot,
            lc4.textvalue as origincode
        from ${schema}.lot lo
            left join ${schema}.material ma on (ma.id = lo.idmaterial)
            left join ${schema}.allocation al on (al.idlot = lo.id)
            left join ${schema}.lotcharacteristic lc1 on (lc1.idlot = lo.id and lc1."name" = 'CG_PESO_LIQUIDO')
            left join ${schema}.lotcharacteristic lc2 on (lc2.idlot = lo.id and lc2."name" = 'CG_QUANTIDADE')
            left join ${schema}.lotcharacteristic lc3 on (lc3.idlot = lo.id and lc3."name" = 'CG_LOCALIZACAO')
            left join ${schema}.lotcharacteristic lc4 on (lc4.idlot = lo.id and lc4."name" = 'CG_CODIGO_ORIGEM')
            left join ${schema}.local lc on (lc.id = lc3.textvalue)
            left join ${schema}.materialcharacteristic mc1 on (mc1.idmaterial = lo.idmaterial and mc1.idcharacteristic = 'CG_ESPESSURA')
            left join ${schema}.materialcharacteristic mc2 on (mc2.idmaterial = lo.idmaterial and mc2.idcharacteristic = 'CG_COMPRIMENTO')
            left join ${schema}.materialcharacteristic mc3 on (mc3.idmaterial = lo.idmaterial and mc3.idcharacteristic = 'CG_DIAMETRO')
            left join ${schema}.materialcharacteristic mc4 on (mc4.idmaterial = lo.idmaterial and mc4.idcharacteristic = 'CG_ACO')
            left join ${schema}.materialcharacteristic mc5 on (mc5.idmaterial = lo.idmaterial and mc5.idcharacteristic = 'CG_LARGURA')`;

        sql += ` where lo.status = true`;

        // Object {idlot: null, idorder: null, cmbEquipment: null, cmbMaterial: null}

        if (where.idlot != null) {
            sql += ` and lo.id = '${where.idlot}'`;
        }

        if (where.idorder != null) {
            sql += ` and al.idorder = '${where.idorder}'`;
        }

        if (where.cmbEquipment != null) {
            sql += ` and lc.idequipment = '${where.cmbEquipment}'`;
        }

        if (where.cmbMaterial != null) {
            sql += ` and lo."idmaterial" = '${where.cmbMaterial}'`;
        }

        return sequelize.query(sql).spread((results, metadata) => {
            return {
                data: results,
                success: true
            };
        })

    });

    //GET ORDER ALLOCATION
    app.api.register('OrderAllocation', async (data) => {
        let where = data;
        let sql = `select a.idlot, c.description, coalesce(cast(d.originalweight as integer), cast(a.weight as integer)) weight, e.situationmovement, idorderentry
                   from ${schema}.allocation a 
                        inner join ${schema}.lot b on (a.idlot = b.id)
                        inner join ${schema}.material c on (b.idmaterial = c.id)
                        left join  ${schema}.lotconsumed d on (d.idlot = a.idlot)
                        left join  ${schema}.moverequest e on (e.idlot = a.idlot)
                   where a.idorder = ${where.idorder}
                   order by c.description, coalesce(cast(d.originalweight as integer), cast(a.weight as integer)) desc`;

        return sequelize.query(sql).spread((results, metadata) => {
            return {
                data: results,
                success: true
            };
        })
    }), {
            method: "POST"
        };

    //GET ALLOCATION
    app.api.register('findLots', async (data) => {
        let sql = `select * from ${schema}.lot where status = true and situation = 'A'`;
        return sequelize.query(sql).spread((results, metadata) => {
            return {
                data: results,
                success: true
            };
        })

    }, {
            method: "POST"
        });

    //GET ALLOCATION
    app.api.register('sumTubesWithOrderAndEquipment', async (data) => {
        let where = data;
        let sql = `select SUM(lc."numbervalue") 
                    from ${schema}."lotgenerated" lg 
                        inner join ${schema}."lotcharacteristic" lc on (lc."idlot" = lg."idlot" and lc.name = 'CG_QUANTIDADE') 
                    where "idorder" = ${where.idorder} 
                        and "idequipment" = '${where.idequipment}'`;
        return sequelize.query(sql).spread((results, metadata) => {
            return {
                data: results,
                success: true
            };
        })

    }), {
            method: "POST"
        };

    //LOT FIELDS (to RNC)
    app.api.register('lotFields', async (data) => {

        let sql = `select l.id as "lot", 
                l.situation, 
                m.id as "materialid", 
                concat(TO_NUMBER(m.id, '999999999999999999'), ' - ', m.description) as material, 
                e.id as "equipmentid", 
                e.description as equipment, 
                o.idordermes as order,
                o.idclient as client
                from ${schema}.lot l
                inner join ${schema}.material m on (m.id = l."idmaterial")
                left join ${schema}.allocation a on (a."idlot" = l.id)
                left join ${schema}."order" o on (o."idordermes" = a."idorder")
                left join ${schema}.equipment e on (e.id = o."idequipmentscheduled")
                where l.id = ${data.lot}
                and l.status = true`;

        return sequelize.query(sql).spread((results, metadata) => {
            return {
                data: results,
                success: true
            };
        })

    }, {
            method: "POST"
        });

    //GET LOTS FOR DETAILS
    app.api.register('getDetailsLotsEquip', async (data) => {
        let idEquip = data.idEquip;
        let sql = `select l.id, l.situation, l."dtupdated" as date,
        concat(TO_NUMBER(m.id, '999999999999999999'), ' - ', m.description) as material, 
        lo."idequipment", lo.description as local, lo.id as "idlocal",
        mce."numbervalue" as thickness, mcl."numbervalue" as length, mcd."numbervalue" as diameter, mca."textvalue" as steel,
        a."idorder" as order,
        lcp."numbervalue" as weight, 
        lcq."numbervalue" as pieces
        from ${schema}.lot l 
            left join ${schema}.local lo on lo.id = l."idlocal" 
            left join ${schema}.allocation a on l.id = a."idlot" 
            left join ${schema}."lotcharacteristic" lcp on (l.id = lcp."idlot" and lcp.name = 'CG_PESO_LIQUIDO')
            left join ${schema}."lotcharacteristic" lcq on (l.id = lcq."idlot" and lcq.name = 'CG_QUANTIDADE')
            left join ${schema}.material m on l."idmaterial" = m.id
            left join ${schema}."materialcharacteristic" mce on (l."idmaterial" = mce."idmaterial" and mce."idcharacteristic" = 'CG_ESPESSURA')
            left join ${schema}."materialcharacteristic" mcl on (l."idmaterial" = mcl."idmaterial" and mcl."idcharacteristic" = 'CG_COMPRIMENTO')
            left join ${schema}."materialcharacteristic" mcd on (l."idmaterial" = mcd."idmaterial" and mcd."idcharacteristic" = 'CG_DIAMETRO')
            left join ${schema}."materialcharacteristic" mca on (l."idmaterial" = mca."idmaterial" and mca."idcharacteristic" = 'CG_ACO')
            where l.status = true
            order by 1;`;

        return sequelize.query(sql).spread((results, metadata) => {
            return {
                data: results,
                success: true
            };
        })

    }, {
            method: "POST"
        });

    app.api.register('getDetailsLotsLot', async (data) => {
        let idlot = data.idlot;
        let sql = `select l.id, l.situation, l."dtupdated" as date,
        concat(TO_NUMBER(m.id, '999999999999999999'), ' - ', m.description) as material, l.idmaterial,
        lo."idequipment", lo.description as local, lcl.textvalue as "idlocal",
        mce."numbervalue" as thickness, mcl."numbervalue" as length, mcd."numbervalue" as diameter, mca."textvalue" as steel,
        a."idorder" as order,
        lcp."numbervalue" as pieces, lcp."numbervalue" as weight
        from ${schema}.lot l 
            left join ${schema}.allocation a on (l.id = a."idlot")
            left join ${schema}."lotcharacteristic" lcp on (l.id = lcp."idlot" and lcp.name = 'CG_PESO_LIQUIDO')
            left join ${schema}."lotcharacteristic" lcw on (l.id = lcw."idlot" and lcw.name = 'CG_QUANTIDADE')
            left join ${schema}."lotcharacteristic" lcl on (l.id = lcl."idlot" and lcl.name = 'CG_LOCALIZACAO')
            left join ${schema}.local lo on lo."id" = lcl.textvalue
            left join ${schema}.material m on l."idmaterial" = m.id
            left join ${schema}."materialcharacteristic" mce on (l."idmaterial" = mce."idmaterial" and mce."idcharacteristic" = 'CG_ESPESSURA')
            left join ${schema}."materialcharacteristic" mcl on (l."idmaterial" = mcl."idmaterial" and mcl."idcharacteristic" = 'CG_COMPRIMENTO')
            left join ${schema}."materialcharacteristic" mcd on (l."idmaterial" = mcd."idmaterial" and mcd."idcharacteristic" = 'CG_DIAMETRO')
            left join ${schema}."materialcharacteristic" mca on (l."idmaterial" = mca."idmaterial" and mca."idcharacteristic" = 'CG_ACO')
            where l.id = ${idlot} and l.status = true
            order by 1;`;

        return sequelize.query(sql).spread((results, metadata) => {
            return {
                data: results,
                success: true
            };
        })

    }, {
            method: "POST"
        });

    app.api.register('getDetailsLotsMaterial', async (data) => {
        let idmaterial = data.idmaterial;
        let sql = `select l.id, l.situation, l."dtupdated" as date,
        concat(TO_NUMBER(m.id, '999999999999999999'), ' - ', m.description) as material, 
        lo."idequipment", lo.description as local, lcl.textvalue as "idlocal",
        mce."numbervalue" as thickness, mcl."numbervalue" as length, mcd."numbervalue" as diameter, mca."textvalue" as steel,
        a."idorder" as order,
        lcp."numbervalue" as pieces, lcw."numbervalue" as weight
        from ${schema}.lot l 
            left join ${schema}.allocation a on (l.id = a."idlot")
            left join ${schema}."lotcharacteristic" lcp on (l.id = lcp."idlot" and lcp.name = 'CG_PESO_LIQUIDO')
            left join ${schema}."lotcharacteristic" lcw on (l.id = lcw."idlot" and lcw.name = 'CG_QUANTIDADE')
            left join ${schema}."lotcharacteristic" lcl on (l.id = lcl."idlot" and lcl.name = 'CG_LOCALIZACAO')
            left join ${schema}.local lo on lo."id" = lcl.textvalue
            left join ${schema}.material m on (l."idmaterial" = m.id and m.id = '${idmaterial}')
            left join ${schema}."materialcharacteristic" mce on (l."idmaterial" = mce."idmaterial" and mce."idcharacteristic" = 'CG_ESPESSURA')
            left join ${schema}."materialcharacteristic" mcl on (l."idmaterial" = mcl."idmaterial" and mcl."idcharacteristic" = 'CG_COMPRIMENTO')
            left join ${schema}."materialcharacteristic" mcd on (l."idmaterial" = mcd."idmaterial" and mcd."idcharacteristic" = 'CG_DIAMETRO')
            left join ${schema}."materialcharacteristic" mca on (l."idmaterial" = mca."idmaterial" and mca."idcharacteristic" = 'CG_ACO')
            where l.status = true
            order by 1;`;

        return sequelize.query(sql).spread((results, metadata) => {
            return {
                data: results,
                success: true
            };
        })

    }, {
            method: "POST"
        });

    app.api.register('getDetailsLotsOrder', async (data) => {
        let idorder = data.idorder;
        let sql = `select l.id, l.situation, l."dtupdated" as date,
        concat(TO_NUMBER(m.id, '999999999999999999'), ' - ', m.description) as material, 
        lo."idequipment", lo.description as local, lcl.textvalue as "idlocal",
        mce."numbervalue" as thickness, mcl."numbervalue" as length, mcd."numbervalue" as diameter, mca."textvalue" as steel,
        a."idorder" as order,
        lcp."numbervalue" as pieces, lcw."numbervalue" as weight
        from ${schema}.lot l 
            inner join ${schema}.allocation a on (l.id = a."idlot" and a."idorder" = ${idorder})
            left join ${schema}."lotcharacteristic" lcp on (l.id = lcp."idlot" and lcp.name = 'CG_PESO_LIQUIDO')
            left join ${schema}."lotcharacteristic" lcw on (l.id = lcw."idlot" and lcw.name = 'CG_QUANTIDADE')
            left join ${schema}."lotcharacteristic" lcl on (l.id = lcl."idlot" and lcl.name = 'CG_LOCALIZACAO')
            left join ${schema}.local lo on lo."id" = lcl.textvalue
            left join ${schema}.material m on l."idmaterial" = m.id
            left join ${schema}."materialcharacteristic" mce on (l."idmaterial" = mce."idmaterial" and mce."idcharacteristic" = 'CG_ESPESSURA')
            left join ${schema}."materialcharacteristic" mcl on (l."idmaterial" = mcl."idmaterial" and mcl."idcharacteristic" = 'CG_COMPRIMENTO')
            left join ${schema}."materialcharacteristic" mcd on (l."idmaterial" = mcd."idmaterial" and mcd."idcharacteristic" = 'CG_DIAMETRO')
            left join ${schema}."materialcharacteristic" mca on (l."idmaterial" = mca."idmaterial" and mca."idcharacteristic" = 'CG_ACO')
            where l.status = true
            order by 1;`;

        return sequelize.query(sql).spread((results, metadata) => {
            return {
                data: results,
                success: true
            };
        })

    }, {
            method: "POST"
        });


    /** POST para salvar o lot */
    app.api.register('createLotAndGenerateProperty', async (data) => {
        return sequelize.transaction(async (t) => {
            try {
                let order = data;

                let newLot = await lot.findOne({
                    where: {
                        idmaterial: order.idmaterial,
                        idorderprod: order.idordermes.toString(),
                        new: true
                    }
                }, {
                        transaction: t
                    });
                let lotsituation = null;

                if (newLot) {

                    if (data.RNC)
                        lotsituation = 'P'
                    else
                        lotsituation = 'A'

                    await lot.update({
                        new: false,
                        idorderprod: '',
                        situation: lotsituation
                    }, {
                            where: {
                                id: newLot.id
                            }
                        });

                    let ov = await lotcharacteristic.findOne({
                        where: {
                            idlot: Number(order.lotconsumed1),
                            name: 'CG_PEDIDO'
                        },
                        raw: true
                    }, {
                            transaction: t
                        });

                    if (ov) {
                        await lotcharacteristic.create({
                            idmaterial: order.idmaterial,
                            idlot: newLot.id,
                            name: 'CG_PEDIDO',
                            numbervalue: ov.numbervalue,
                            textvalue: ov.textvalue,
                            iduser: order.usercreatelot
                        }, {
                                transaction: t
                            });
                    }

                    let cg_item = await lotcharacteristic.findOne({
                        where: {
                            idlot: Number(order.lotconsumed1),
                            name: 'CG_ITEM'
                        },
                        raw: true
                    }, {
                            transaction: t
                        });

                    if (cg_item) {
                        await lotcharacteristic.create({
                            idmaterial: order.idmaterial,
                            idlot: newLot.id,
                            name: 'CG_ITEM',
                            numbervalue: cg_item.numbervalue,
                            textvalue: cg_item.textvalue,
                            iduser: order.usercreatelot
                        }, {
                                transaction: t
                            });
                    }

                    let cg_codigo_origem = await lotcharacteristic.findOne({
                        where: {
                            idlot: Number(order.lotconsumed1),
                            name: 'CG_CODIGO_ORIGEM'
                        },
                        raw: true
                    }, {
                            transaction: t
                        });

                    if (cg_codigo_origem) {
                        await lotcharacteristic.create({
                            idmaterial: order.idmaterial,
                            idlot: newLot.id,
                            name: 'CG_CODIGO_ORIGEM',
                            numbervalue: cg_codigo_origem.numbervalue,
                            textvalue: cg_codigo_origem.textvalue,
                            iduser: order.usercreatelot
                        }, {
                                transaction: t
                            });
                    }

                    if (order.lengthdigit) {
                        await lotcharacteristic.create({
                            idmaterial: order.idmaterial,
                            idlot: newLot.id,
                            name: 'CG_COMPRIMENTO',
                            numbervalue: order.lengthdigit,
                            textvalue: order.lengthdigit,
                            iduser: order.usercreatelot
                        }, {
                                transaction: t
                            });
                    }

                    await lotcharacteristic.create({
                        idmaterial: order.idmaterial,
                        idlot: newLot.id,
                        name: 'CG_QUANTIDADE',
                        numbervalue: order.valuelot,
                        textvalue: order.valuelot,
                        iduser: order.usercreatelot
                    }, {
                            transaction: t
                        });
                    await lotcharacteristic.create({
                        idmaterial: order.idmaterial,
                        idlot: newLot.id,
                        name: 'CG_PESO_LIQUIDO',
                        numbervalue: order.weightlot,
                        textvalue: order.weightlot,
                        iduser: order.usercreatelot
                    }, {
                            transaction: t
                        });
                    await lotcharacteristic.create({
                        idmaterial: order.idmaterial,
                        idlot: newLot.id,
                        name: 'CG_PESO_BRUTO',
                        numbervalue: order.weightlot,
                        textvalue: order.weightlot,
                        iduser: order.usercreatelot
                    }, {
                            transaction: t
                        });
                    await lotcharacteristic.create({
                        idmaterial: order.idmaterial,
                        idlot: newLot.id,
                        name: 'CG_DEPOSITO_DESTINO',
                        textvalue: order.quality,
                        iduser: order.usercreatelot
                    }, {
                            transaction: t
                        });
                    let item = await lotgenerated.create({
                        idequipment: order.idequipmentscheduled,
                        idorder: order.idordermes,
                        idoutputorder: order.idordersap,
                        idshift: order.idshift,
                        idlot: newLot.id,
                        iduser: order.usercreatelot,
                        lotconsumed1: Number(order.lotconsumed1),
                        lotweight1: order.lotweight1,
                        lotconsumed2: order.lotconsumed2 ? Number(order.lotconsumed2) : null,
                        lotweight2: order.lotweight2 ? order.lotweight2 : null
                    }, {
                            transaction: t
                        });
                    await moverequest.create({
                        idequipment: order.idequipmentscheduled,
                        idlot: newLot.id,
                        situationmovement: 'P',
                        momentdate: new Date(),
                        iduser: order.usercreatelot
                    }, {
                            transaction: t
                        })
                    return {
                        data: true,
                        success: true
                    };
                } else {
                    return {
                        data: false,
                        success: false,
                        message: 'No previously generated lot, contact your system administrator.'
                    };
                }
            } catch (error) {
                return {
                    data: false,
                    success: false,
                    message: error
                };
            }
        });
    }, {
            method: "POST"
        });

    /** POST para salvar o lot */
    app.api.register('createBigMakerLot', async (data) => {
        return sequelize.transaction(async (t) => {
            try {
                let order = data;

                let localeEquipment = await local.findOne({
                    where: {
                        idequipment: data.idequipmentscheduled
                    },
                    raw: true
                });
                let lotsituation = null;

                if (data.RNC)
                    lotsituation = 'P'
                else
                    lotsituation = 'A'

                let sql = `select NEXTVAL('${schema}.SEQ_LOT')`;

                let id = await sequelize.query(sql).spread(async (results) => {
                    return {
                        data: results,
                        success: true
                    }
                });

                id = id.data[0].nextval;

                let newLot = await lot.create({
                    id: id,
                    new: false,
                    idorderprod: '',
                    idmaterial: order.idmaterial,
                    situation: lotsituation,
                    idlocal: localeEquipment.id,
                    iduser: order.usercreatelot
                }, {
                        transaction: t
                    });

                let ov = await lotcharacteristic.findOne({
                    where: {
                        idlot: Number(order.lotconsumed1),
                        name: 'CG_PEDIDO'
                    },
                    raw: true
                }, {
                        transaction: t
                    });

                if (ov) {
                    await lotcharacteristic.create({
                        idmaterial: order.idmaterial,
                        idlot: newLot.id,
                        name: 'CG_PEDIDO',
                        numbervalue: ov.numbervalue,
                        textvalue: ov.textvalue,
                        iduser: order.usercreatelot
                    }, {
                            transaction: t
                        });
                }

                let cg_item = await lotcharacteristic.findOne({
                    where: {
                        idlot: Number(order.lotconsumed1),
                        name: 'CG_ITEM'
                    },
                    raw: true
                }, {
                        transaction: t
                    });

                if (cg_item) {
                    await lotcharacteristic.create({
                        idmaterial: order.idmaterial,
                        idlot: newLot.id,
                        name: 'CG_ITEM',
                        numbervalue: cg_item.numbervalue,
                        textvalue: cg_item.textvalue,
                        iduser: order.usercreatelot
                    }, {
                            transaction: t
                        });
                }

                let cg_codigo_origem = await lotcharacteristic.findOne({
                    where: {
                        idlot: Number(order.lotconsumed1),
                        name: 'CG_CODIGO_ORIGEM'
                    },
                    raw: true
                }, {
                        transaction: t
                    });

                if (cg_codigo_origem) {
                    await lotcharacteristic.create({
                        idmaterial: order.idmaterial,
                        idlot: newLot.id,
                        name: 'CG_CODIGO_ORIGEM',
                        numbervalue: cg_codigo_origem.numbervalue,
                        textvalue: cg_codigo_origem.textvalue,
                        iduser: order.usercreatelot
                    }, {
                            transaction: t
                        });
                }

                await lotcharacteristic.create({
                    idmaterial: order.idmaterial,
                    idlot: newLot.id,
                    name: 'CG_QUANTIDADE',
                    numbervalue: order.valuelot,
                    textvalue: order.valuelot,
                    iduser: order.usercreatelot
                }, {
                        transaction: t
                    });
                await lotcharacteristic.create({
                    idmaterial: order.idmaterial,
                    idlot: newLot.id,
                    name: 'CG_PESO_LIQUIDO',
                    numbervalue: order.weightlot,
                    textvalue: order.weightlot,
                    iduser: order.usercreatelot
                }, {
                        transaction: t
                    });
                await lotcharacteristic.create({
                    idmaterial: order.idmaterial,
                    idlot: newLot.id,
                    name: 'CG_PESO_BRUTO',
                    numbervalue: order.weightlot,
                    textvalue: order.weightlot,
                    iduser: order.usercreatelot
                }, {
                        transaction: t
                    });
                await lotcharacteristic.create({
                    idmaterial: order.idmaterial,
                    idlot: newLot.id,
                    name: 'CG_LOCALIZACAO',
                    textvalue: localeEquipment ? localeEquipment.id : 'NOT_REGISTERED',
                    iduser: data.usercreatelot
                }, {
                        transaction: t
                    });

                await lotgenerated.create({
                    idequipment: order.idequipmentscheduled,
                    idorder: order.idordermes,
                    idoutputorder: order.idordersap,
                    idshift: order.idshift,
                    idlot: newLot.id,
                    iduser: order.usercreatelot,
                    lotconsumed1: Number(order.lotconsumed1),
                    lotweight1: order.lotweight1,
                }, {
                        transaction: t
                    });

                await moverequest.create({
                    idequipment: order.idequipmentscheduled,
                    idlot: newLot.id,
                    situationmovement: 'P',
                    momentdate: new Date(),
                    iduser: order.usercreatelot
                }, {
                        transaction: t
                    })

                for (let i = 0; i < data.pieces.length; i++) {
                    await steppieces.update({
                        ispacked: true
                    }, {
                            where: {
                                idequipment: order.idequipmentscheduled,
                                idordermes: order.idordermes,
                                idlot: order.lotconsumed1,
                                piece: order.pieces[i].piece
                            },
                            raw: false,
                            transaction: t
                        })
                }

                return {
                    data: newLot,
                    success: true
                };

            } catch (error) {
                return {
                    data: false,
                    success: false,
                    message: error
                };
            }
        });
    }, {
            method: "POST"
        });

    app.api.register('updateLocalsWeightPieces', async (data, res) => {
        try {

            let obj = data;

            return sequelize.transaction(async (t) => {

                let updatedLot = {
                    idlocal: obj.idlocal
                };

                if (obj.weight == 0 || obj.pieces == 0 || obj.weight == null || obj.pieces == null) {
                    updatedLot.situation = 'D';
                }

                if (obj.situation == 'D' && obj.weight != 0 && obj.pieces != 0 && obj.weight != null && obj.pieces != null) {
                    updatedLot.situation = 'A';
                }

                await lot.update(updatedLot, {
                    where: {
                        id: data.id,
                    },
                    raw: true,
                    transaction: t
                })

                await lotcharacteristic.update({
                    numbervalue: obj.weight,
                    textvalue: obj.weight
                }, {
                        where: {
                            idlot: data.id,
                            name: 'CG_PESO_LIQUIDO'
                        },
                        raw: false,
                        transaction: t
                    })

                await lotcharacteristic.update({
                    numbervalue: obj.weight,
                    textvalue: obj.weight
                }, {
                        where: {
                            idlot: data.id,
                            name: 'CG_PESO_BRUTO'
                        },
                        raw: false,
                        transaction: t
                    })

                await lotcharacteristic.update({
                    numbervalue: obj.pieces,
                    textvalue: obj.pieces
                }, {
                        where: {
                            idlot: data.id,
                            name: 'CG_QUANTIDADE'
                        },
                        raw: false,
                        transaction: t
                    })

                if (obj.beforeidLocal != obj.idlocal) {
                    await lothistory.create({
                        lot: obj.id,
                        field: 'CG_LOCAL',
                        valuebefore: obj.beforeidLocal,
                        valueafter: obj.idlocal,
                        iduser: obj.iduser
                    }, {
                            raw: false,
                            transaction: t
                        })
                }

                if (obj.beforepieces != obj.pieces) {
                    await lothistory.create({
                        lot: obj.id,
                        field: 'CG_QUANTIDADE',
                        valuebefore: obj.beforepieces,
                        valueafter: obj.pieces,
                        iduser: obj.iduser
                    }, {
                            raw: false,
                            transaction: t
                        })
                }
                if (obj.beforeweight != obj.weight) {
                    await lothistory.create({
                        lot: obj.id,
                        field: 'CG_PESO_LIQUIDO',
                        valuebefore: obj.beforeweight,
                        valueafter: obj.weight,
                        iduser: obj.iduser
                    }, {
                            raw: false,
                            transaction: t
                        })
                }
                if (updatedLot.situation) {
                    await lothistory.create({
                        lot: obj.id,
                        field: 'CG_STATUS',
                        valuebefore: obj.situation,
                        valueafter: updatedLot.situation,
                        iduser: obj.iduser
                    }, {
                            raw: false,
                            transaction: t
                        })
                }
                return true;
            }).then(() => {
                return {
                    data: true,
                    success: true
                }
            }).catch((err) => {
                return {
                    data: false,
                    success: false
                }
            });
        } catch (error) {
            console.error(error)
            return {
                data: error,
                success: false
            }
        }

    }, {
            method: "POST"
        });

    app.api.register('createScondaryLot', async (data) => {
        return sequelize.transaction(async (t) => {
            let sql = `select NEXTVAL('${schema}.SEQ_LOT')`;
            return sequelize.query(sql).spread(async (result) => {
                let order = data;
                let id = result[0].nextval;


                if (id) {
                    let lotCreated = await lot.create({
                        id: id,
                        situation: 'A',
                        idmaterial: order.idmaterial,
                        idlocal: order.idequipmentscheduled,
                        idrun: order.idrun,
                        iduser: order.usercreatelot
                    }, {
                            transaction: t
                        });


                    let ov = await lotcharacteristic.findOne({
                        where: {
                            idlot: Number(order.lotconsumed1),
                            name: 'CG_PEDIDO'
                        },
                        raw: true
                    }, {
                            transaction: t
                        });

                    if (ov) {
                        await lotcharacteristic.create({
                            idmaterial: order.idmaterial,
                            idlot: newLot.id,
                            name: 'CG_PEDIDO',
                            numbervalue: ov.numbervalue,
                            textvalue: ov.textvalue,
                            iduser: order.usercreatelot
                        }, {
                                transaction: t
                            });
                    }

                    let cg_item = await lotcharacteristic.findOne({
                        where: {
                            idlot: Number(order.lotconsumed1),
                            name: 'CG_ITEM'
                        },
                        raw: true
                    }, {
                            transaction: t
                        });

                    if (cg_item) {
                        await lotcharacteristic.create({
                            idmaterial: order.idmaterial,
                            idlot: newLot.id,
                            name: 'CG_ITEM',
                            numbervalue: cg_item.numbervalue,
                            textvalue: cg_item.textvalue,
                            iduser: order.usercreatelot
                        }, {
                                transaction: t
                            });
                    }

                    await lotcharacteristic.create({
                        idmaterial: order.idmaterial,
                        idlot: id,
                        name: 'CG_QUANTIDADE',
                        numbervalue: order.secPackage.quantityOfTubes,
                        textvalue: order.secPackage.quantityOfTubes,
                        iduser: order.usercreatelot
                    }, {
                            transaction: t
                        });
                    await lotcharacteristic.create({
                        idmaterial: order.idmaterial,
                        idlot: id,
                        name: 'CG_PESO_LIQUIDO',
                        numbervalue: order.secPackage.weight,
                        textvalue: order.secPackage.weight,
                        iduser: order.usercreatelot
                    }, {
                            transaction: t
                        });
                    await lotcharacteristic.create({
                        idmaterial: order.idmaterial,
                        idlot: id,
                        name: 'CG_PESO_BRUTO',
                        numbervalue: order.secPackage.weight,
                        textvalue: order.secPackage.weight,
                        iduser: order.usercreatelot
                    }, {
                            transaction: t
                        });
                    await lotgenerated.create({
                        idequipment: order.idequipmentscheduled,
                        idorder: order.idordermes,
                        idoutputorder: order.idordersap,
                        idlot: id,
                        lotconsumed1: order.lotconsumed1,
                        lotweight1: order.lotweight1,
                        lotconsumed2: order.lotconsumed2,
                        lotweight2: order.lotweight2,
                        iduser: order.usercreatelot,
                        idshift: order.idshift,
                    }, {
                            transaction: t
                        });
                    await moverequest.create({
                        idequipment: order.idequipmentscheduled,
                        idlot: id,
                        situationmovement: 'P',
                        momentdate: new Date(),
                        iduser: order.usercreatelot
                    }, {
                            transaction: t
                        });
                    return {
                        data: lotCreated,
                        success: true
                    }
                } else {
                    return {
                        data: false,
                        success: false
                    }
                }
            });
        });
    }, {
            method: "POST"
        });

    app.api.register('createLotCoil', async (data) => {
        try {
            return sequelize.transaction(async (t) => {

                /* pesquisa o consumo do lote e verifica se o peso vai dar negativo caso positivo retorna com erro */
                let newWeight = 0;

                let sql_lot = `select * 
                from ${schema}.lotconsumed
                where idlot = ${data.idlotconsumed} and idorder = ${data.idordermes} `;

                let lotconsumedresult = await sequelize.query(sql_lot).spread(async (results) => {
                    return {
                        data: results,
                        success: true
                    }
                });

                if (lotconsumedresult.data.length == 0) {

                    let sql = ` select * from ${schema}.lotconsumed l1
                    where l1.dtupdated = (select max(dtupdated) 
                                            from ${schema}.lotconsumed l2 
                                            where l1.idequipment = l2.idequipment
                                            and l1.idlot = l2.idlot)
                        and l1.idlot = ${data.idlotconsumed}
                        and l1.idequipment = '${data.idequipmentscheduled}'`;

                    let lotupdate = await sequelize.query(sql).spread(async (results) => {
                        return {
                            data: results,
                            success: true
                        }
                    });

                    if (lotupdate.data.length == 0)
                        newWeight = parseFloat(data.lotweight) - parseFloat(data.weight)
                    else
                        newWeight = lotupdate.data[0].weight - parseFloat(data.weight)

                    if (newWeight < 0)
                        return {
                            data: 'Insuficient Weight: ' + newWeight.toFixed(3),
                            success: false
                        }

                    await lotconsumed.create({
                        idequipment: data.idequipmentscheduled,
                        idorder: data.idordermes,
                        idorderentry: 1,
                        idlot: data.idlotconsumed,
                        iduser: data.usercreatelot,
                        weight: newWeight.toFixed(2),
                        originalweight: parseFloat(data.lotweight)
                    }, {
                            transaction: t
                        });
                }

                sql = `select NEXTVAL('${schema}.SEQ_LOT')`;

                let idnewlot = await sequelize.query(sql).spread(async (result) => {
                    return {
                        data: result,
                        success: true
                    }
                });

                let id = idnewlot.data[0].nextval;

                let localeEquipment = await local.findOne({
                    where: {
                        idequipment: data.idequipmentscheduled
                    },
                    raw: true
                });
                let CG_PEDIDO = await lotcharacteristic.findOne({
                    where: {
                        idlot: data.idlotconsumed,
                        name: "CG_PEDIDO"
                    },
                    raw: true
                });
                let CG_ITEM = await lotcharacteristic.findOne({
                    where: {
                        idlot: data.idlotconsumed,
                        name: "CG_ITEM"
                    },
                    raw: true
                });

                let CG_CODIGO_ORIGEM = await lotcharacteristic.findOne({
                    where: {
                        idlot: data.idlotconsumed,
                        name: "CG_CODIGO_ORIGEM"
                    },
                    raw: true
                });

                if (id && id != 1) {
                    let lotRawMaterial = await lot.findOne({
                        where: {
                            id: data.idlotconsumed
                        }
                    }, {
                            transaction: t
                        });

                    let lotCreated = await lot.create({
                        id: id,
                        situation: 'A',
                        idmaterial: data.idmaterial,
                        idlocal: data.idequipmentscheduled,
                        idrun: data.idrun,
                        quality: data.quality,
                        iduser: data.usercreatelot,
                        thicknessbegin: lotRawMaterial.thicknessbegin ? lotRawMaterial.thicknessbegin : null,
                        thicknessmiddle: lotRawMaterial.thicknessmiddle ? lotRawMaterial.thicknessmiddle : null,
                        thicknessend: lotRawMaterial.thicknessend ? lotRawMaterial.thicknessend : null,
                        reallength: lotRawMaterial.reallength ? lotRawMaterial.reallength : null

                    }, {
                            transaction: t
                        });

                    await order.update({
                        orderstatus: 'FINISHED'
                    }, {
                            where: {
                                idordermes: data.idordermes,
                            },
                            raw: true,
                            transaction: t
                        });

                    await lotcharacteristic.create({
                        idmaterial: data.idmaterial,
                        idlot: id,
                        name: 'CG_QUANTIDADE',
                        numbervalue: 1,
                        textvalue: 1,
                        iduser: data.usercreatelot
                    }, {
                            transaction: t
                        });

                    await lotcharacteristic.create({
                        idmaterial: data.idmaterial,
                        idlot: id,
                        name: 'CG_PESO_LIQUIDO',
                        numbervalue: data.weight,
                        textvalue: data.weight,
                        iduser: data.usercreatelot
                    }, {
                            transaction: t
                        });

                    await lotcharacteristic.create({
                        idmaterial: data.idmaterial,
                        idlot: id,
                        name: 'CG_LARGURA',
                        numbervalue: data.width.toFixed(2),
                        textvalue: data.width.toFixed(2),
                        iduser: data.usercreatelot
                    }, {
                            transaction: t
                        });

                    await lotcharacteristic.create({
                        idmaterial: data.idmaterial,
                        idlot: id,
                        name: 'CG_LOCALIZACAO',
                        textvalue: localeEquipment ? localeEquipment.id : 'NOT_REGISTERED',
                        iduser: data.usercreatelot
                    }, {
                            transaction: t
                        });

                    await lotcharacteristic.create({
                        idmaterial: data.idmaterial,
                        idlot: id,
                        name: 'CG_PEDIDO',
                        textvalue: CG_PEDIDO ? CG_PEDIDO.textvalue : null,
                        iduser: data.usercreatelot
                    }, {
                            transaction: t
                        });

                    await lotcharacteristic.create({
                        idmaterial: data.idmaterial,
                        idlot: id,
                        name: 'CG_ITEM',
                        textvalue: CG_ITEM ? CG_ITEM.textvalue : null,
                        iduser: data.usercreatelot
                    }, {
                            transaction: t
                        });

                    await lotcharacteristic.create({
                        idmaterial: data.idmaterial,
                        idlot: id,
                        name: 'CG_CODIGO_ORIGEM',
                        textvalue: CG_CODIGO_ORIGEM ? CG_CODIGO_ORIGEM.textvalue : null,
                        iduser: data.usercreatelot
                    }, {
                            transaction: t
                        });

                    await lotgenerated.create({
                        idequipment: data.idequipmentscheduled,
                        idorder: data.idordermes,
                        idoutputorder: 0,
                        idlot: id,
                        iduser: data.usercreatelot,
                        idshift: data.idshift,
                        lotconsumed1: data.idlotconsumed,
                        lotweight1: data.weight
                    }, {
                            transaction: t
                        });

                    await moverequest.create({
                        idequipment: data.idequipmentscheduled,
                        idlot: parseInt(id),
                        situationmovement: 'P',
                        momentdate: new Date(),
                        iduser: data.usercreatelot
                    }, {
                            transaction: t
                        });

                    await cuttingplanhistory.create({
                        idcuttingplan: data.idcuttingplan,
                        idlotgenerated: id,
                        idlotconsumed: data.idlotconsumed,
                        idmaterial: data.idmaterial,
                        quantity: data.quantity,
                        iduser: data.usercreatelot
                    }, {
                            transaction: t
                        });



                    //início do trecho de interface de coleta
                    sql_seq = `select NEXTVAL('public.SEQ_INT')`;

                    let sequence = await sequelize.query(sql_seq).spread(async (results) => {
                        return {
                            data: results,
                            success: true
                        }
                    });

                    let seqint = sequence.data[0].nextval

                    sql_com = `select * from ${schema}.company`;

                    let company = await sequelize.query(sql_com).spread(async (results) => {
                        return {
                            data: results,
                            success: true
                        }
                    });

                    let saleorder = data.saleorder ? '<LOTCHARACTERISTICS><CHARACTERISTICCODE>CG_ORDEM</CHARACTERISTICCODE><NOMINALVALUE>' + data.saleorder + '</NOMINALVALUE></LOTCHARACTERISTICS>' : ''
                    let orderproduction = data.idordersap ? '<ORDERPRODUCTION>' + data.idordersap + '</ORDERPRODUCTION>' : ''

                    data.width = Number(data.width).toFixed(2)
                    data.width = data.width.toString()

                    let rnc = data.rnc ? '<RNC>X</RNC>' : ''

                    //Problemas com arredondamento no calculo do peso do lote e da sucata.
                    let data_weight = 0;
                    if (Number(data.weight) > 0)
                        data_weight = data.weight - 0.0005;


                    CG_PEDIDO = CG_PEDIDO ? `<LOTCHARACTERISTICS>
                                    <CHARACTERISTICCODE>CG_PEDIDO</CHARACTERISTICCODE>
                                    <NOMINALVALUE>${CG_PEDIDO.textvalue}</NOMINALVALUE>
                                    <UNIT>kg</UNIT>
                                </LOTCHARACTERISTICS>` : '';

                    CG_ITEM = CG_ITEM ? `<LOTCHARACTERISTICS>
                                    <CHARACTERISTICCODE>CG_ITEM</CHARACTERISTICCODE>
                                    <NOMINALVALUE>${CG_ITEM.textvalue}</NOMINALVALUE>
                                    <UNIT>kg</UNIT>
                                </LOTCHARACTERISTICS>` : '';

                    CG_CODIGO_ORIGEM = CG_CODIGO_ORIGEM ? `<LOTCHARACTERISTICS>
                                                                <CHARACTERISTICCODE>CG_CODIGO_ORIGEM</CHARACTERISTICCODE>
                                                                <NOMINALVALUE>${CG_CODIGO_ORIGEM.textvalue}</NOMINALVALUE>
                                                                <UNIT>kg</UNIT>
                                                            </LOTCHARACTERISTICS>` : ''

                    let xml = `<?xml version="1.0" encoding="UTF-8"?>
                                 <COLLECT>
                                     <SEQUENCE>${seqint}</SEQUENCE>
                                     <CENTER>${company.data[0].center}</CENTER>
                                     <WORKCENTER>${data.idequipmentscheduled}</WORKCENTER>
                                     <PRODUCED>
                                         <MATERIAL>${data.idmaterial}</MATERIAL>
                                         <LOTGENERATED>${("0000000000" + lotCreated.id).slice(-10)}</LOTGENERATED>
                                         <PIECES>1</PIECES>
                                         <WEIGHT>${Number(data_weight).toFixed(3)}</WEIGHT>
                                         ${rnc}
                                         <LOTCHARACTERISTICS>
                                             <CHARACTERISTICCODE>CG_QUANTIDADE</CHARACTERISTICCODE>
                                             <NOMINALVALUE>1</NOMINALVALUE>
                                         </LOTCHARACTERISTICS>
                                         <LOTCHARACTERISTICS>
                                             <CHARACTERISTICCODE>CG_PESO_LIQUIDO</CHARACTERISTICCODE>
                                             <NOMINALVALUE>${Number(data_weight).toFixed(0)}</NOMINALVALUE>
                                             <UNIT>kg</UNIT>
                                         </LOTCHARACTERISTICS>
                                         ${CG_PEDIDO}
                                         ${CG_ITEM}
                                         ${CG_CODIGO_ORIGEM}
                                         <LOTCHARACTERISTICS>
                                             <CHARACTERISTICCODE>CG_PESO_BRUTO</CHARACTERISTICCODE>
                                             <NOMINALVALUE>${Number(data_weight).toFixed(0)}</NOMINALVALUE>
                                             <UNIT>kg</UNIT>
                                         </LOTCHARACTERISTICS>
                                         <LOTCHARACTERISTICS>
                                             <CHARACTERISTICCODE>CG_LARGURA</CHARACTERISTICCODE>
                                             <NOMINALVALUE>${data.width.replace(".", ",")}</NOMINALVALUE>
                                             <UNIT>mm</UNIT>
                                         </LOTCHARACTERISTICS>
                                         <LOTCHARACTERISTICS>
                                             <CHARACTERISTICCODE>CG_LOCALIZACAO</CHARACTERISTICCODE>
                                             <NOMINALVALUE>${localeEquipment ? localeEquipment.id : 'NOT_REGISTERED'}</NOMINALVALUE>
                                         </LOTCHARACTERISTICS>
                                         ${saleorder}
                                         <LOTCONSUMED>
                                             <MATERIALCONSUMED>${data.idrawmaterial}</MATERIALCONSUMED>
                                             <LOTCONSUMED>${("0000000000" + data.idlotconsumed).slice(-10)}</LOTCONSUMED>
                                             <WEIGHTCONSUMED>${Number(data_weight).toFixed(3)}</WEIGHTCONSUMED>
                                             ${orderproduction}
                                         </LOTCONSUMED>
                                     </PRODUCED>
                                 </COLLECT>`;


                    xml = xml.replace(/(\r\n|\n|\r)/gm, "")

                    xml = xml.replace(/\s+/g, '');

                    let statusinterface = await interface.findAll({
                        where: {
                            idordermes: data.idordermes,
                            idstatus: {
                                $notIn: ['OK', 'RSD']
                            }
                        },
                        transaction: t,
                        raw: true
                    });

                    let idstatus = statusinterface.length > 0 ? 'BLK' : 'NEW';

                    await interface.create({
                        id: seqint,
                        idinterface: 'MS02',
                        date: new Date(),
                        idstatus: idstatus,
                        messageinterface: xml,
                        iduser: data.usercreatelot,
                        idordermes: data.idordermes,
                        idordersap: data.idordersap ? data.idordersap : null,
                        idlot: lotCreated.id
                    }, {
                            transaction: t,
                        });
                    //fim da interface de coleta

                    //trecho da interface de finalização da OP
                    let scrappedweight = 0

                    if (data.last) {
                        /*
                                                sql_weight = `select sum(lotweight1) 
                                                                    from ${schema}.lotgenerated
                                                                  where lotconsumed1 = ${data.idlotconsumed}`;
                        
                                                let weightconsumed = await sequelize.query(sql_weight).spread(async (results) => {
                                                    return {
                                                        data: results,
                                                        success: true
                                                    }
                                                });
                        
                                                weightconsumed = weightconsumed.data[0].sum + Number(data.weight);
                        
                                                scrappedweight = data.lotweight - weightconsumed;
                        */
                        scrappedweight = newWeight;

                        if (scrappedweight < 0) {
                            console.log('Scrapped Weight less than zero')
                            return {
                                data: 'Scrapped Weight less than zero',
                                success: false
                            }
                        } else if (scrappedweight > 0) {
                            scrappedweight = scrappedweight - 0.0005;
                        }

                        sql_seq = `select NEXTVAL('public.SEQ_INT')`;

                        sequence = await sequelize.query(sql_seq).spread(async (results) => {
                            return {
                                data: results,
                                success: true
                            }
                        });

                        seqint2 = sequence.data[0].nextval

                        sql_orders = `
                                        select l.idmaterial, l.id as idlot, lc.numbervalue as weight, o.idordersap
                                        from ${schema}.allocation al
                                            inner join ${schema}."order" o on (al.idorder = o.idordermes)
                                            inner join ${schema}.lot l on (al.idlot = l.id)
                                            inner join ${schema}.lotgenerated lg on (lg.idorder = o.idordermes)
                                            inner join ${schema}.lotcharacteristic lc on (lc.idlot = lg.idlot and lc."name" = 'CG_PESO_LIQUIDO')
                                        where l.id = ${data.idlotconsumed}`;

                        let orderconsumed = await sequelize.query(sql_orders).spread(async (results) => {
                            return {
                                data: results,
                                success: true
                            }
                        });
                        orderconsumed = orderconsumed.data;

                        xml = `<?xml version="1.0" encoding="UTF-8"?>
                                     <COLLECT>
                                         <SEQUENCE>${seqint2}</SEQUENCE>
                                         <CENTER>${company.data[0].center}</CENTER>
                                         <WORKCENTER>${data.idequipmentscheduled}</WORKCENTER>
                                         <SCRAPP>
                                             <MATERIALCONSUMED>${data.idrawmaterial}</MATERIALCONSUMED>
                                             <LOTCONSUMED>${("0000000000" + data.idlotconsumed).slice(-10)}</LOTCONSUMED>
                                             <WEIGHTSCRAPPED>${Number(scrappedweight).toFixed(3)}</WEIGHTSCRAPPED>
                                             <END>X</END>
                                         </SCRAPP>
                                         <PRODUCED>`;

                        for (let i = 0; i < orderconsumed.length; i++) {

                            xml += `
                                        <LOTCONSUMED>
                                            <MATERIALCONSUMED>${orderconsumed[i].idmaterial}</MATERIALCONSUMED>
                                            <LOTCONSUMED>${("0000000000" + orderconsumed[i].idlot).slice(-10)}</LOTCONSUMED>
                                            <WEIGHTCONSUMED>${(Number(orderconsumed[i].weight).toFixed(3) - 0.0005).toFixed(3)}</WEIGHTCONSUMED> 
                                            <ORDERPRODUCTION>${orderconsumed[i].idordersap}</ORDERPRODUCTION>
                                        </LOTCONSUMED>`;

                        }
                        let index = orderconsumed.findIndex(item => item.idordermes == data.idordermes)

                        if (index == -1) {
                            xml += `
                                        <LOTCONSUMED>
                                            <MATERIALCONSUMED>${data.idrawmaterial}</MATERIALCONSUMED> 
                                            <LOTCONSUMED>${("0000000000" + data.idlotconsumed).slice(-10)}</LOTCONSUMED>
                                            <WEIGHTCONSUMED>${(Number(data.weight).toFixed(3) - 0.0005).toFixed(3)}</WEIGHTCONSUMED>
                                            <ORDERPRODUCTION>${data.idordersap}</ORDERPRODUCTION>
                                        </LOTCONSUMED>`;
                        }

                        xml += `</PRODUCED>
                                     </COLLECT>`;

                        xml = xml.replace(/(\r\n|\n|\r)/gm, "")

                        xml = xml.replace(/\s+/g, '');

                        let statusinterface = await interface.findAll({
                            where: {
                                idordermes: data.idordermes,
                                idstatus: {
                                    $notIn: ['OK', 'RSD']
                                }
                            },
                            transaction: t,
                            raw: true
                        });

                        let idstatus = statusinterface.length > 0 ? 'BLK' : 'NEW'

                        await interface.create({
                            id: seqint2,
                            idinterface: 'MS02',
                            date: new Date(),
                            idstatus: idstatus,
                            messageinterface: xml,
                            iduser: data.usercreatelot,
                            idordermes: data.idordermes
                        }, {
                                transaction: t,
                            });
                    }

                    else {

                        sql_seq = `select NEXTVAL('public.SEQ_INT')`;

                        sequence = await sequelize.query(sql_seq).spread(async (results) => {
                            return { data: results, success: true }
                        });

                        let seqint3 = sequence.data[0].nextval

                        orderproduction = data.idordersap ? '<ORDERPRODUCTION>' + data.idordersap + '</ORDERPRODUCTION>' : ''

                        xml = `<?xml version="1.0" encoding="UTF-8"?>
                                <COLLECT>
                                    <SEQUENCE>${seqint3}</SEQUENCE>
                                    <CENTER>${company.data[0].center}</CENTER>
                                    <WORKCENTER>${data.idequipmentscheduled}</WORKCENTER>
                                    <SCRAPP>
                                        <MATERIALCONSUMED>${data.idrawmaterial}</MATERIALCONSUMED>
                                        <LOTCONSUMED>${("0000000000" + data.idlotconsumed).slice(-10)}</LOTCONSUMED>
                                        <WEIGHTSCRAPPED>0</WEIGHTSCRAPPED>
                                        <END>X</END>
                                    </SCRAPP>
                                    <PRODUCED>
                                        <LOTCONSUMED>
                                            <MATERIALCONSUMED>${data.idrawmaterial}</MATERIALCONSUMED>
                                            <LOTCONSUMED>${("0000000000" + data.idlotconsumed).slice(-10)}</LOTCONSUMED>
                                            <WEIGHTCONSUMED>${Number(data.weight)}</WEIGHTCONSUMED> 
                                            ${orderproduction}
                                        </LOTCONSUMED>
                                    </PRODUCED>
                                </COLLECT>`;

                        xml = xml.replace(/(\r\n|\n|\r)/gm, "")

                        xml = xml.replace(/\s+/g, '');

                        await interface.create({
                            id: seqint3,
                            idinterface: 'MS02',
                            date: new Date(),
                            idstatus: 'NEW',
                            messageinterface: xml,
                            iduser: data.usercreatelot
                        },
                            {
                                transaction: t,
                            });

                    }

                    //fim da interface de encerramento da OP

                    return {
                        data: {
                            idlot: id,
                            //idclient: CG_PEDIDO && CG_ITEM ? CG_PEDIDO.textvalue + ' / ' + CG_ITEM.textvalue : null
                        },
                        success: true
                    }
                } else {
                    return {
                        data: false,
                        success: false
                    }
                }

            });
        } catch (err) { }
    }, {
            method: "POST"
        });

    app.api.register('findAllDimensionalItem', async (data) => {
        let sql = `SELECT di.*
        FROM ${schema}.dimensionalcontrollink as dl left join ${schema}.dimensionalcontrolitem as di on  dl.iddimensionalcontrolitem = di.id
        where dl.idequipment = '${data.idequipment}'
        order by di.description;`

        return sequelize.query(sql).spread(async (result) => {
            return {
                data: result,
                success: true
            };
        });
    }, {
            method: "POST"
        })

    app.api.register('getAvaliableLotsToCutPlan', async () => {
        let sql = `
          select 
                 bo.id as "idlot"
                ,mc."idmaterial"
                ,bo."materialDescription"
                ,mc."idcharacteristic"
                ,mc."description"
                ,mc."textvalue"
                ,mc."numbervalue"
                ,trunc(lc.numbervalue) weight
            from ${schema}."materialcharacteristic" as mc
            inner join	  
                (select
                        l.id
                       ,l."idmaterial"
                       ,m."description" as "materialDescription"
                    from ${schema}.lot as l
                    inner join ${schema}.material m 
                        on m.id = l."idmaterial"
                    inner join ${schema}."materialtype" t
                        on t.id = m."idmaterialtype"
                    where 
                        l.situation = 'A'
                    and l.status    = true) as bo
                on mc."idmaterial" = bo."idmaterial"
            inner join ${schema}."materialcharacteristic" as mc2 
                on (mc.idmaterial = mc2.idmaterial and mc2.idcharacteristic = 'CG_GRUPO_MAT' and MC2.textvalue in ('BO','FI'))
            inner join ${schema}.lotcharacteristic lc
                on lc.idlot = bo.id
            where
                mc."idcharacteristic" in ('CG_ACO', 'CG_ESPESSURA', 'CG_LARGURA', 'CG_PESO_LIQUIDO')
                and lc.name = 'CG_PESO_LIQUIDO'
                and trunc(lc.numbervalue) > 0
                and bo.id not in (
                    select idlot from ${schema}.coilcuttingplan where status = true
                    )
            order by bo."materialDescription"`
        return sequelize.query(sql).spread((results, metadata) => {
            let utilFunc = new util.util();
            let result = utilFunc.DefineItemCharacteristic(results);
            //result.sort(x => x.material)
            result.sort(function (a, b) {
                var materialA = a.material.toLowerCase(),
                    materialB = b.material.toLowerCase()
                if (materialA < materialB) //sort string ascending
                    return -1
                if (materialA > materialB)
                    return 1
                return 0 //default return value (no sorting)
            })
            return result;
        })
    }, {
            method: "POST"
        })

    app.api.register('getLotsCuttingPlan', async () => {
        let sql = `
          select 
                 bo.id as "idlot"
                ,mc."idmaterial"
                ,bo."materialDescription"
                ,mc."idcharacteristic"
                ,mc."description"
                ,mc."textvalue"
                ,mc."numbervalue"
                ,trunc(lc.numbervalue) weight
            from ${schema}."materialcharacteristic" as mc
            inner join	  
                (select
                        l.id
                       ,l."idmaterial"
                       ,m."description" as "materialDescription"
                    from ${schema}.lot as l
                    inner join ${schema}.material m 
                        on m.id = l."idmaterial"
                    inner join ${schema}."materialtype" t
                        on t.id = m."idmaterialtype"
                    where 
                        l.situation = 'A'
                    and l.status    = true) as bo
                on mc."idmaterial" = bo."idmaterial"
            inner join ${schema}."materialcharacteristic" as mc2 
                on (mc.idmaterial = mc2.idmaterial and mc2.idcharacteristic = 'CG_GRUPO_MAT' and MC2.textvalue in ('BO','FI'))
            inner join ${schema}.lotcharacteristic lc
                on lc.idlot = bo.id
            where
                mc."idcharacteristic" in ('CG_ACO', 'CG_ESPESSURA', 'CG_LARGURA', 'CG_PESO_LIQUIDO')
                and lc.name = 'CG_PESO_LIQUIDO'
                and trunc(lc.numbervalue) > 0
                and bo.id in (
                    select idlot from ${schema}.coilcuttingplan where status = true
                    )
            order by bo."materialDescription"`
        return sequelize.query(sql).spread((results, metadata) => {
            let utilFunc = new util.util();
            let result = utilFunc.DefineItemCharacteristic(results);

            return result;
        })
    }, {
            method: "POST"
        })

    //GET LOTS FOR GENEALOGY
    app.api.register('getGenealogyGenerated', async (data, res) => {

        let obj = data;

        let sqlorder = `select lc."idorder" 
                            from ${schema}.lot l 
                            inner join ${schema}."lotconsumed" lc on l.id = lc."idlot"
                            where lc."idlot" = ${obj.idlot}
                        and l.status = true`;


        return sequelize.query(sqlorder).spread((results, metadata) => {
            if (results.length != 0) {
                let sql = `select l.id, lg."idorder", lg."dtcreated"
                from ${schema}.lot l 
                inner join ${schema}."lotgenerated" lg on  l.id = lg."idlot"
                inner join ${schema}."lotconsumed"  lc on  lc."idorder" = lg."idorder"
                where l.status = true
                and lg."idorder" = ${results[0].idorder}
                order by 1`;

                return sequelize.query(sql).spread((results, metadata) => {
                    return results;
                })
            } else {
                return [{
                    idorder: 'Not consumed'
                }]
            }
        });
    }, {
            method: "POST"
        });

    app.api.register('getGenealogyConsumed', async (data, res) => {

        let obj = data;

        let sqlorder = `select lg."idorder", lg."dtcreated"
                    from ${schema}.lot l 
                        inner join ${schema}."lotgenerated" lg on  l.id  = lg."idlot"
                        where lg."idlot" = ${obj.idlot}
                    and l.status = true`;

        return sequelize.query(sqlorder).spread((results, metadata) => {
            if (results.length != 0) {
                let sql = `
                            select lg.lotconsumed1 as "id", lc."idorder"
                            from ${schema}.lot l 
                                inner join ${schema}."lotconsumed"  lc on  l.id = lc."idlot"
                                inner join ${schema}."lotgenerated" lg on lg.lotconsumed1 = lc.idlot
                            where l.status = true
                                and lc."idorder" = ${results[0].idorder}
                                and lg.idlot = ${obj.idlot}
                            
                            union
                            
                            select lg.lotconsumed2 as "id", lc."idorder"
                            from ${schema}.lot l 
                                inner join ${schema}."lotconsumed"  lc on  l.id = lc."idlot"
                                inner join ${schema}."lotgenerated" lg on lg.lotconsumed2 = lc.idlot
                            where l.status = true
                                and lc."idorder" = ${results[0].idorder}
                                and lg.idlot = ${obj.idlot}
                            order by 1`;

                return sequelize.query(sql).spread((results, metadata) => {
                    return results;
                })
            } else {
                return [{
                    idorder: 'Not generated'
                }]
            }
        })
    }, {
            method: "POST"
        });

    app.api.register('lastLotReadInOrder', async (data, res) => {
        let sql = `select l.idlot, tb.valueMaxColumn
                        from ${schema}.lotconsumed as l, (select MAX(idorderentry) as valueMaxColumn from ${schema}.lotconsumed where idorder = '${data.idorder}') as tb
                        where idorder = '${data.idorder}'
                            and l.idorderentry = tb.valueMaxColumn`;

        return sequelize.query(sql).spread((results, metadata) => {
            return {
                data: results,
                success: true
            };
        })
    }, {
            method: "POST"
        });

    app.api.register('lotConsumedPerLotGenerate', async (data, res) => {
        let sqlorder = `select * from ${schema}.lotconsumed a, ${schema}.lot b where a.idlot = b.id and idorder = '${data.idorder}' and weight > 0 order by idorderentry;`;
        return sequelize.query(sqlorder).spread((results, metadata) => {
            return {
                data: results,
                success: true
            };
        })
    }, {
            method: "POST"
        });

    //GET INFO QR CODE
    app.api.register('lotDetails', async (req, ctx) => {

        let idlot = req.idlot;

        let sql = `select o."idclient", a."idorder", mc."numbervalue" as "valueM", mc."idcharacteristic",
                lc."numbervalue"  as "valueL", lc.name, e.description as equipment,
                now() as dateTime from ${schema}.lot l 
                left join ${schema}.allocation a on l.id = a."idlot"
                left join ${schema}."order" o on o."idordermes" = a."idorder" 
                left join ${schema}.equipment e on e.id = o."idequipmentscheduled"
                inner join ${schema}."lotcharacteristic" lc on l.id = lc."idlot"
                inner join ${schema}."materialcharacteristic" mc on l."idmaterial" = mc."idmaterial"
                where l.id = ${idlot};`;

        return sequelize.query(sql).spread((results, metadata) => {
            let obj = {};
            if (results.length) {
                for (let i = 0; i < results.length; i++) {

                    if (results[i].idcharacteristic == 'CG_DIAMETRO') {

                        obj.diameter = results[i].valueM;

                        if (results[i].name == "CG_QUANTIDADE") {
                            obj.valueP = results[i].valueL;
                        } else if (results[i].name == "CG_PESO_LIQUIDO") {
                            obj.valueW = results[i].valueL;
                        }

                    } else if (results[i].idcharacteristic == 'CG_ESPESSURA') {

                        obj.thickness = results[i].valueM;

                        if (results[i].name == "CG_QUANTIDADE") {
                            obj.valueP = results[i].valueL;
                        } else if (results[i].name == "CG_PESO_LIQUIDO") {
                            obj.valueW = results[i].valueL;
                        }

                    } else if (results[i].idcharacteristic == 'CG_COMPRIMENTO') {

                        obj.length = results[i].valueM;

                        if (results[i].name == "CG_QUANTIDADE") {
                            obj.valueP = results[i].valueL;
                        } else if (results[i].name == "CG_PESO_LIQUIDO") {
                            obj.description = 'CG_PESO_LIQUIDO';
                            obj.valueW = results[i].valueL;
                        }

                    } else if (results[i].idcharacteristic == 'CG_ACO') {

                        obj.steel = results[i].valueM;

                        if (results[i].name == "CG_QUANTIDADE") {
                            obj.valueP = results[i].valueL;
                        } else if (results[i].name == "CG_PESO_LIQUIDO") {
                            obj.valueW = results[i].valueL;
                        }

                    }
                }
                obj.datetime = results[0].datetime;
                obj.idclient = results[0].idclient;
                obj.idorder = results[0].idorder;
                obj.equipment = results[0].equipment;
                obj.idlot = idlot
                return {
                    data: obj,
                    success: true
                }
            } else {
                return {
                    data: {},
                    success: false
                }
            }


        })
    });


    //GET LOT SEQUENCE
    app.api.register('lotSequence', async (data) => {
        let sql = `select NEXTVAL('${schema}.SEQ_LOT')`;
        return sequelize.query(sql).spread((results, metadata) => {
            return {
                data: results,
                success: true
            };
        })

    }, {
            method: "POST"
        });
    //GET LOT SEQUENCE


    app.api.register('getDetailsLotConsumed', async (data) => {
        let sql = `select 
                l.idlot,
                l.idequipment,
                (select description from ${schema}.equipment e where e.id = l.idequipment) as equipment,
                (select description from ${schema}.material mat where mat.id = lt.idmaterial) as material,
                case when lt.situation = 'D' then 'red'
                    when lt.situation = 'A' then 'green'
                    else 'white'
                end as situation,
                (select numbervalue from ${schema}.lotcharacteristic lc where lc.idlot = l.idlot and lc."name" = 'CG_PESO_LIQUIDO') as weight,
                l.iduser
            from ${schema}.lotconsumed l
                left join ${schema}.lot lt on  lt.id = l.idlot
                where l.idorder = '${data.idorder}'
                order by l.idorderentry`;

        return sequelize.query(sql).spread((results, metadata) => {
            return {
                data: results,
                success: true
            };
        });
    }, {
            method: "POST"
        });

    app.api.register('getDetailsLotGenerated', async (data) => {
        let sql = `select 
                    l.idlot,
                    l.idequipment,
                    (select description from ${schema}.equipment e where e.id = l.idequipment) as equipment,
                    (select description from ${schema}.material mat where mat.id = lt.idmaterial) as material,
                    case when lt.situation = 'P' then 'yellow'
                        when lt.situation = 'A' then 'green'
                        else 'white'
                    end as situation,
                    (select numbervalue from ${schema}.lotcharacteristic lc where lc.idlot = l.idlot and lc."name" = 'CG_PESO_LIQUIDO') as weight,
                    l.iduser,
                    l.idshift,
                    (select lcl.textvalue from ${schema}.lotcharacteristic lcl where lcl.idlot = l.idlot and lcl."name" = 'CG_LOCALIZACAO') as "local",
                    l.lotconsumed1,
                    l.lotweight1,
                    l.lotconsumed2,
                    l.lotweight2
                from ${schema}.lotgenerated l
                    left join ${schema}.lot lt on  lt.id = l.idlot
                    where l.idorder = '${data.idorder}'`;
        return sequelize.query(sql).spread((results, metadata) => {
            return {
                data: results,
                success: true
            };
        });
    }, {
            method: "POST"
        });

}