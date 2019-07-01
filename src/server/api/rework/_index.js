const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // URL BASE
    const resourceBase = '/api/';

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;
    const { checklistitemresult, reworkresult, pendency, pendencyrelease, lot, allocation, lotcharacteristic, company, order, interface, lotgenerated, lotconsumed } = config.postgres.DB;

    app.api.register('linkedReworkItem', async (req, ctx) => {
        let data = req;
        let sql = `	 
                    select ri.id as "reworkitemid", ri.description as "reworkitem", ri."typevalue", rt.id as "reworktypeid", rt.description as "reworktype"
                    from ${schema}.rework r
                        inner join ${schema}."reworkitem" ri on (r."idreworkitem" = ri.id)
                        inner join ${schema}."reworktype" rt on (r."idreworktype" = rt.id)
                    where 
                    rt.status = true
                    and ri.status = true
                    and r.status = true
                    and rt.id = ${data.reworktype}
                    `;
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    });

    app.api.register('unlinkedReworkItem', async (req, ctx) => {

        let data = req;
        let sql = `	 
                    select * 
                    from ${schema}."reworkitem" ri 
                    where ri.status = true
                    and ri.id not in (
                                        select ri.id
                                        from ${schema}.rework r
                                            inner join ${schema}."reworkitem" ri on (r."idreworkitem" = ri.id)
                                            inner join ${schema}."reworktype" rt on (r."idreworktype" = rt.id)
                                        where 
                                        r.status = true
                                        and ri.status = true
                                        and rt.status = true
                                        and rt.id = ${data.reworktype}
                                        )`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    });

    app.api.register('reworkTypesItems', async (req, ctx) => {
        let sql = `select re.id, re.description, (select count (*)	
                                                    from ${schema}."reworktype" rt
                                                        inner join ${schema}.rework r on (r."idreworktype" = rt.id)
                                                        inner join ${schema}."reworkitem" ri on (r."idreworkitem" = ri.id)
                                                    where rt.id = re.id
                                                    and ri.status = true
                                                    and rt.status = true
                                                    group by rt.description) as cont
                    from ${schema}."reworktype" re
                    where re.status = true
                    and (	select count (*)	
                            from ${schema}."reworktype" rt
                            inner join ${schema}.rework r on (r."idreworktype" = rt.id)
                            inner join ${schema}."reworkitem" ri on (r."idreworkitem" = ri.id)
                            where rt.id = re.id
                            and ri.status = true
                            and rt.status = true
                            group by rt.description) > 0
                    order by 1`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    });

    app.api.register('updateCollect', async (data) => {
        return sequelize.transaction(async (t) => {
            data = data.collects;
            for (let i = 0; i < data.length; i++) {
                await reworkresult.update(data[i], {
                    where: {
                        idlot: data[i].idlot,
                        idpendency: data[i].idpendency,
                        idreworkitem: data[i].idreworkitem,
                        idreworktype: data[i].idreworktype,
                    }
                });
            }

            let sqlPendencyNull = `select distinct on (rr."idreworktype") "idreworktype"
                            from ${schema}."reworkresult" as rr
                        where rr."hourvalue" is null 
                            and rr."textvalue" is null 
                            and rr."numbervalue" is null
                            and rr."idpendency" = ${data[0].idpendency}
                            and rr.status = true`

            return sequelize.query(sqlPendencyNull).spread(async (result) => {
                if (!result.length) {
                    await pendency.update({ pendencystatus: 'L' }, { where: { id: data[0].idpendency } });
                    await pendencyrelease.update({ situation: 'L' }, { where: { idpendency: data[0].idpendency } });
                    let pend = pendency.findAll({ where: { idlot: data[0].idlot, pendencystatus: 'A' } });
                    if (pend.length) {
                        return { data: null, success: true };
                    } else {
                        await lot.update({ situation: 'A' }, { where: { id: data[0].idlot } });
                        return { data: null, success: true };
                    }
                } else {
                    return { data: null, success: true };
                }
            });
        }).then(function (result) {
            return result;
        }).catch(function (err) {
            return { data: err, success: false };
        });
    }, { method: "POST" });

    app.api.register('findAllReworkNotCollected', async (data) => {
        return sequelize.transaction(async (t) => {
            
            iduser = data.login

            let sql = `select 
                            --distinct on (rr."idreworktype") rr."idlot" as idlot, concat(TO_NUMBER(m.id, '999999999999999999'),' - ', m.description) as material,
                            distinct rr."idlot" as idlot, concat(TO_NUMBER(m.id, '999999999999999999'),' - ', m.description) as material,
                            m.id as idmaterial,
                            l.idlocal,
                            pd."pendencydate" as datependency,
                            rr."idpendency" as pendency,
                            rr."idreworktype" as idreworktype,
                            pt.description as pendencytype,
                            rt.description as reworktype,
                            o.idordersap,
                            o.idordermes,
                            o.idequipmentscheduled
                        from ${schema}."reworkresult" as rr
                        left join ${schema}."order" as o on o.idordermes = rr.idordermes
                        inner join ${schema}.lot as l on l.id = rr."idlot"
                        inner join ${schema}.material as m on l."idmaterial" = m.id
                        inner join ${schema}.pendency as pd on rr."idpendency" = pd.id
                        inner join ${schema}."pendencytype" as pt on pd."idpendencytype" = pt.id
                        inner join ${schema}."reworktype" as rt on rr."idreworktype" = rt.id
                        where rr."hourvalue" is null 
                            and rr."textvalue" is null 
                            and rr."numbervalue" is null
                            and rr.status = true`;

            let reworknotcollected = await sequelize.query(sql).spread(async (result) => {
                return { data: result, success: true };
            });
            reworknotcollected = reworknotcollected.data

            for(let i = 0; i < reworknotcollected.length; i++){
                sql = ` select o.idordermes, al.idlot, o.idordersap
                        from ${schema}.allocation al
                            inner join ${schema}."order" o on (al.idorder = o.idordermes)
                        where
                            al.idlot = ${reworknotcollected[i].idlot}
                            and o.ordertype = 'REWORK'`;

                let orderallocated = await sequelize.query(sql).spread(async (result) => {
                    return { data: result, success: true };
                });
                orderallocated = orderallocated.data[0]

                if(orderallocated){
                    let result = await reworkresult.update(
                        {
                            idordermes: orderallocated.idordermes,
                            iduser: iduser
                        },
                        {
                            where: {
                                idlot: orderallocated.idlot,
                                idpendency: reworknotcollected[i].pendency,
                            }
                        });

                    reworknotcollected[i].idordermes = orderallocated.idordermes;
                    reworknotcollected[i].idordersap = orderallocated.idordersap;
                }
            }
            
            console.log(reworknotcollected)

            return {data: reworknotcollected, success: true}

        }).then(function (result) {
            return result;
        }).catch(function (err) {
            console.log(err)
            return { data: err, success: false };
        });
    }, { method: "POST" });

    app.api.register('findAllReworkCollected', async (data) => {
        let sql = `select 
                        distinct on (rr."idreworktype") rr."idlot" as idlot, concat(TO_NUMBER(m.id, '999999999999999999'),' - ', m.description) as material,
                        m.id as idmaterial,
                        l.idlocal,
                        pd."pendencydate" as datependency,
                        rr."idpendency" as pendency,
                        rr."idreworktype" as idreworktype,
                        pt.description as pendencytype,
                        rt.description as reworktype,
                        o.idordersap,
                        o.idordermes,
                        o.idequipmentscheduled
        from ${schema}."reworkresult" as rr
        left join ${schema}."order" as o on o.idordermes = rr.idordermes
        inner join ${schema}.lot as l on l.id = rr."idlot"
        inner join ${schema}.material as m on l."idmaterial" = m.id
        inner join ${schema}.pendency as pd on rr."idpendency" = pd.id
        inner join ${schema}."pendencytype" as pt on pd."idpendencytype" = pt.id
        inner join ${schema}."reworktype" as rt on rr."idreworktype" = rt.id
        where pd."dtupdated" >= NOW() - '1 day'::interval 
          and (rr."hourvalue" is not null 
            or rr."textvalue" is not null 
            or rr."numbervalue" is not null)
            and rr.status = true`;

        return sequelize.query(sql).spread(async (result) => {
            return { data: result, success: true };
        });
    }, { method: "POST" });

    app.api.register('findAllReworkItemByKey', async (data) => {
        let sql = `select rw."idlot", rw."idpendency", rw."idreworktype", rw."idreworkitem", rwi.description, rwi."typevalue", rw."hourvalue", rw."textvalue", "numbervalue"
                    from ${schema}."reworkresult" as rw
                        inner join ${schema}."reworkitem" as rwi on rwi.id = rw."idreworkitem"
                    where "idlot" = ${data.idlot}
                        and "idpendency" = ${data.idpendency}
                        and "idreworktype" = ${data.idreworktype}`;

        return sequelize.query(sql).spread(async (result) => {
            return { data: result, success: true };
        });
    }, { method: "POST" });

    app.api.register('findAllReworkOrder', async (data) => {
        let sql = `
                    select o.idordermes, o.idordersap, 
                    concat(TO_NUMBER(m.id, '999999999999999999'), ' - ', m.description) as "material", 
                    concat(TO_NUMBER(rm.id, '999999999999999999'), ' - ', rm.description) as "rawmaterial"
                    from ${schema}."order" o
                        inner join ${schema}.material m on (o.idmaterial = m.id)
                        inner join ${schema}.material rm on (o.idrawmaterial = rm.id)
                    where
                        o.ordertype = 'REWORK'
                        and o.orderstatus <> 'FINISHED'`;

        return sequelize.query(sql).spread(async (result) => {
            return { data: result, success: true };
        });
    }, { method: "POST" });


    /** POST associar retrabalho à ordem */
    app.api.register('associateOrderRework', async (data) => {
        return sequelize.transaction(async (t) => {
            let rOrder = data.order;
            let rework = data.rework;
            let iduser = data.iduser;

            let result = await reworkresult.update(
                {
                    idordermes: rOrder.idordermes,
                    iduser: iduser
                },
                {
                    where: {
                        idlot: rework.idlot,
                        idpendency: rework.pendency,
                    }
                });

            let lotweight = await lotcharacteristic.findOne({
                where: {
                    idlot: rework.idlot,
                    name: 'CG_PESO_LIQUIDO'
                }
            }, { transaction: t });

            let qtdlot = await lotcharacteristic.findOne({
                where: {
                    idlot: rework.idlot,
                    name: 'CG_QUANTIDADE'
                }
            }, { transaction: t });

            await allocation.create({
                idorder: rOrder.idordermes,
                idlot: rework.idlot,
                iduser: iduser,
                standardmaterialidentifier: false,
                weight: lotweight ? lotweight.numbervalue : null,
                pieces: qtdlot ? qtdlot.numbervalue : null,

            }, { transaction: t });


            /*geração de interface*/

            sql = `select NEXTVAL('public.SEQ_INT')`;
            let sequence = await sequelize.query(sql).spread(async (results) => {
                return { data: results, success: true }
            });

            let seqnum = sequence.data[0].nextval;

            /* Verifico a company */
            let getCompany = await company.findAll({
                where: {
                    status: true,
                },
                transaction: t,
                raw: true
            });

            /* Verifico a OP */
            let getOp = await order.findAll({
                where: {
                    idordermes: rOrder.idordermes,
                },
                transaction: t,
                raw: true
            });

            let xml = `<?xml version="1.0" encoding="UTF-8"?>
                <CUTTINGPLAN>
                    <SEQUENCE>${seqnum}</SEQUENCE>
                    <CENTER>${getCompany[0].center}</CENTER>
                    <ORDER>
                        <DUEDATE>${getOp[0].requestdate}</DUEDATE>
                        <OPERATION>A</OPERATION>`;
            if (getOp[0].idordersap) {
                xml += `
                        <ORDERPRODUCTION>${getOp[0].idordersap}</ORDERPRODUCTION>`;
            }
            xml += `
                        <WEIGHT>${parseInt((parseFloat(getOp[0].plannedorderquantity)) * 1000) / 1000}</WEIGHT>
                        <IDEQUIPMENTSCHEDULED>${getOp[0].idequipmentscheduled}</IDEQUIPMENTSCHEDULED>
                        <IDMATERIAL>${getOp[0].idmaterial}</IDMATERIAL>
                        <ORDERMES>${getOp[0].idordermes}</ORDERMES>
                    </ORDER>`;

            /* Busco os Lots Alocados */
            let getAllocation = await allocation.findAll({
                where: {
                    idorder: rOrder.idordermes,
                    status: true
                },
                transaction: t,
                raw: true
            });

            for (let x = 0; x < getAllocation.length; x++) {

                /* Busca dados dos Lots Alocados */
                let getLotInfo = await lot.findAll({
                    where: {
                        id: getAllocation[x].idlot,
                        status: true
                    },
                    transaction: t,
                    raw: true
                });

                xml += `<LOT>
                        <IDRAWMATERIAL>${getLotInfo[0].idmaterial}</IDRAWMATERIAL>
                        <IDLOT>${("0000000000" + getAllocation[x].idlot).slice(-10)}</IDLOT>
                        <LOTWEIGHT>${getAllocation[x].weight}</LOTWEIGHT>
                    </LOT>`;
            }

            xml += `</CUTTINGPLAN>`;

            let statusinterface = await interface.findAll({
                where: {
                    idordermes: rOrder.idordermes,
                    idstatus: {
                        $notIn: ['OK', 'RSD']
                    }
                },
                transaction: t,
                raw: true
            });

            let idstatus = statusinterface.length > 0 ? 'BLK' : 'NEW'

            /* Gero a Interface */
            await interface.create({
                id: seqnum,
                idinterface: 'MS01',
                date: new Date(),
                idstatus: idstatus,
                messageinterface: xml,
                iduser: iduser,
                idordermes: rOrder.idordermes,
                idordersap: rOrder.idordersap ? rOrder.idordersap : null
            },
                {
                    transaction: t,
                    raw: true
                });

            return { data: true, success: true };
        }).then((results) => {
            //res.api.send(results, 200);
            return { data: true, success: true }
        }).catch((err) => {
            //res.api.send(err, 400);
            console.log(err)
            return { data: err, success: false }
        });
    }, { method: "POST" });


    /** POST associar retrabalho à ordem */
    app.api.register('generateLotRework', async (data) => {
        return sequelize.transaction(async (t) => {

            let sql = `
                    select l.id, l1.numbervalue as "liquidweight", l2.numbervalue as "grossweight", l3.numbervalue as "quantity"  
                    from ${schema}.lot l
                        left join ${schema}.lotcharacteristic l1 on (l.id = l1.idlot and l1."name" = 'CG_PESO_LIQUIDO')
                        left join ${schema}.lotcharacteristic l2 on (l.id = l2.idlot and l2."name" = 'CG_PESO_BRUTO')
                        left join ${schema}.lotcharacteristic l3 on (l.id = l3.idlot and l3."name" = 'CG_QUANTIDADE')
                    where l.id = ${data.idlot}`;

            let lotchar = await sequelize.query(sql).spread(async (result) => {
                return { data: result, success: true };
            });
            lotchar = lotchar.data[0];
            
            sql = `select id from ${schema}.local where idequipment = '${data.idequipmentscheduled}'`;

            let lotLocal = await sequelize.query(sql).spread(async (results) => {
                return { data: results, success: true }
            });

            if (lotLocal.data.length > 0) {
                lotLocal = lotLocal.data[0].id;
            } else {
                lotLocal = "1A1";
            }

            let newLot = null;

            if (data.newWeight > 0) {
                sql = `select NEXTVAL('${schema}.SEQ_LOT')`;

                let id = await sequelize.query(sql).spread(async (results) => {
                    return { data: results, success: true }
                });

                id = id.data[0].nextval;

                newLot = await lot.create({
                    id: id,
                    new: false,
                    idorderprod: '',
                    idmaterial: data.idmaterial,
                    situation: 'A',
                    idlocal: data.idlocal,
                    iduser: data.iduser
                }, { transaction: t });

                await lotcharacteristic.create({
                    idmaterial: data.idmaterial,
                    idlot: newLot.id,
                    name: 'CG_QUANTIDADE',
                    numbervalue: data.newPieces,
                    textvalue: data.newPieces,
                    iduser: data.iduser
                }, { transaction: t });
                await lotcharacteristic.create({
                    idmaterial: data.idmaterial,
                    idlot: newLot.id,
                    name: 'CG_PESO_LIQUIDO',
                    numbervalue: data.newWeight,
                    textvalue: data.newWeight,
                    iduser: data.iduser
                }, { transaction: t });
                await lotcharacteristic.create({
                    idmaterial: data.idmaterial,
                    idlot: newLot.id,
                    name: 'CG_PESO_BRUTO',
                    numbervalue: data.newWeight,
                    textvalue: data.newWeight,
                    iduser: data.iduser
                }, { transaction: t });
                await lotcharacteristic.create({
                    idmaterial: data.idmaterial,
                    idlot: newLot.id,
                    name: 'CG_LOCALIZACAO',
                    textvalue: lotLocal,
                    iduser: data.iduser
                }, { transaction: t });

                await lotgenerated.create({
                    idequipment: data.idequipmentscheduled,
                    idorder: data.idordermes,
                    idoutputorder: data.idordersap,
                    idshift: data.idshift,
                    idlot: newLot.id,
                    iduser: data.iduser,
                    lotconsumed1: Number(data.idlot),
                    lotweight1: data.newWeight,
                }, { transaction: t });


                sql = `
                        select max(idorderentry) 
                        from ${schema}.lotconsumed 
                        where idequipment = '${data.idequipmentscheduled}' and idorder = ${data.idordermes}`;

                let idorderentry = await sequelize.query(sql).spread(async (result) => {
                    return { data: result, success: true };
                });
                idorderentry = idorderentry.data[0]

                await lotconsumed.create({
                    idequipment: data.idequipmentscheduled,
                    idorder: data.idordermes,
                    idorderentry: idorderentry.max ? idorderentry.max : 1,
                    idlot: data.idlot,
                    iduser: data.iduser,
                    weight: data.newWeight,
                }, { transaction: t });

                await lot.update({
                    situation: 'D',
                    status: false,
                    iduser: data.iduser
                }, {
                        where: {
                            id: data.idlot
                        }
                    });
            }
            else {
                await lot.update({
                    situation: 'S',
                    status: false,
                    iduser: data.iduser
                }, {
                        where: {
                            id: data.idlot
                        }
                    });
            }


            await allocation.destroy({
                where: {
                    idorder: data.idordermes,
                    idlot: data.idlot,
                }
            }, { transaction: t });

            let remainingAllocations = await allocation.findAll({
                where: {
                    idorder: data.idordermes,
                    idlot: {
                        $ne: data.idlot
                    },
                    status: true
                },
                transaction: t,
                raw: true
            });

            let result = {};

            result.lot = newLot ? newLot : null;

            result.last = true;
            if (remainingAllocations.length > 0) {
                result.last = false
            }

            //início do trecho de interface de coleta
            let sql_seq = `select NEXTVAL('public.SEQ_INT')`;

            let sequence = await sequelize.query(sql_seq).spread(async (results) => {
                return { data: results, success: true }
            });

            let seqint = sequence.data[0].nextval

            sql_com = `select * from ${schema}.company`;

            let company = await sequelize.query(sql_com).spread(async (results) => {
                return { data: results, success: true }
            });

            //let orderproduction = data.idordersap ? '<ORDERPRODUCTION>' + data.idordersap + '</ORDERPRODUCTION>' : ''

            let weightscrapped = ((parseFloat(lotchar.liquidweight) - parseFloat(data.newWeight)).toFixed(3) - 0.0005).toFixed(3)
            if (parseFloat(weightscrapped) < 0)
                weightscrapped = 0;

            let xml = `<?xml version="1.0" encoding="UTF-8"?>
                          <COLLECT>
                              <SEQUENCE>${seqint}</SEQUENCE>
                              <CENTER>${company.data[0].center}</CENTER>
                              <WORKCENTER>${data.idequipmentscheduled}</WORKCENTER>
                              <SCRAPP>
                                  <MATERIALCONSUMED>${data.idmaterial}</MATERIALCONSUMED>
                                  <LOTCONSUMED>${("0000000000" + data.idlot).slice(-10)}</LOTCONSUMED>
                                  <WEIGHTSCRAPPED>${weightscrapped}</WEIGHTSCRAPPED>`;
            if (result.last)
            {
                xml += `
                                  <END>X</END>
                              </SCRAPP>`;
            } 
            else
            {
                xml += `
                              </SCRAPP>`;
            }

            if (Number(data.newWeight) > 0) {
                xml += `         
                              <PRODUCED>
                                  <MATERIAL>${data.idmaterial}</MATERIAL>
                                  <LOTGENERATED>${("0000000000" + newLot.id).slice(-10)}</LOTGENERATED>
                                  <PIECES>${data.newPieces}</PIECES>
                                  <WEIGHT>${(Number(data.newWeight).toFixed(3) - 0.0005).toFixed(3)}</WEIGHT>
                                  <LOTCHARACTERISTICS>
                                      <CHARACTERISTICCODE>CG_QUANTIDADE</CHARACTERISTICCODE>
                                      <NOMINALVALUE>${data.newPieces}</NOMINALVALUE>
                                  </LOTCHARACTERISTICS>
                                  <LOTCHARACTERISTICS>
                                      <CHARACTERISTICCODE>CG_PESO_LIQUIDO</CHARACTERISTICCODE>
                                      <NOMINALVALUE>${Number(data.newWeight).toFixed(0)}</NOMINALVALUE>
                                      <UNIT>kg</UNIT>
                                  </LOTCHARACTERISTICS>
                                  <LOTCHARACTERISTICS>
                                      <CHARACTERISTICCODE>CG_PESO_BRUTO</CHARACTERISTICCODE>
                                      <NOMINALVALUE>${Number(data.newWeight).toFixed(0)}</NOMINALVALUE>
                                      <UNIT>kg</UNIT>
                                  </LOTCHARACTERISTICS>
                                  <LOTCHARACTERISTICS>
                                      <CHARACTERISTICCODE>CG_LOCALIZACAO</CHARACTERISTICCODE>
                                      <NOMINALVALUE>${lotLocal}</NOMINALVALUE>
                                  </LOTCHARACTERISTICS>
                                  <LOTCONSUMED>
                                      <MATERIALCONSUMED>${data.idmaterial}</MATERIALCONSUMED>
                                      <LOTCONSUMED>${("0000000000" + data.idlot).slice(-10)}</LOTCONSUMED>
                                      <WEIGHTCONSUMED>${data.newWeight}</WEIGHTCONSUMED>
                                      <ORDERPRODUCTION>${data.idordersap}</ORDERPRODUCTION>
                                  </LOTCONSUMED>
                              </PRODUCED>`;
            }

            xml += `
                          </COLLECT>`;
            xml = xml.trim();

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
                id: seqint,
                idinterface: 'MS02',
                date: new Date(),
                idstatus: idstatus,
                messageinterface: xml,
                iduser: data.iduser,
                idordermes: data.idordermes,
                idordersap: data.idordersap,
                idlot: newLot.id
            },
                {
                    transaction: t,
                });
            //fim da interface de coleta


            return result;
        }).then((result) => {
            //res.api.send(results, 200);
            return { data: result, success: true }
        }).catch((err) => {
            //res.api.send(err, 400);
            console.log(err)
            return { data: err, success: false }
        });
    }, { method: "POST" });

}

