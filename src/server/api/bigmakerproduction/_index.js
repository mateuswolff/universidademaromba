const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // URL BASE
    const resourceBase = '/api/';

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;
    const { stepequipment, steppieces, order, lotgenerated, lotconsumed, stop, scrap, allocation, lotcharacteristic, lot, lothistory, interface } = config.postgres.DB;

    // CREATE STEP PIECES
    app.api.register('createStepPieces', async (data) => {
        //and idlot = '${data.lotSelected.idlot}'
        return sequelize.transaction(async (t) => {

            // if (!data.lotSelected) {
            //     return false
            // }
            // else {
            let cont = 1;

            for (let i = 0; i < data.steps.length; i++) {
                for (let j = 1; j <= data.lotSelected.expectedquantity; j++) {
                    await steppieces.create({
                        idequipment: data.idequipmentexpected,
                        idordermes: data.idordermes,
                        idlot: data.lotSelected.idlot,
                        piece: j,
                        idstep: data.steps[i].idstep,
                        sequence: data.steps[i].sequence,
                        iduser: data.iduser,
                        status: true
                    }, { transaction: t });
                }
            }
            //}




        }).then(function (result) {
            return { data: result, success: true }
        }).catch(function (err) {
            return { data: err, success: false }
        });

    }, { method: "POST" });

    //FIND STEP PIECES FOR BIG MAKER PRODUCTION
    app.api.register('findStepPieces', async (data, ctx) => {
        let sql = ''

        if (data.sequence == 1) {
            sql = `	
                        select sp.idequipment, 
                            o.idordermes,
                            o.idordersap,
                            l.id as "lot", 
                            sp.piece, 
                            sp.idstep, 
                            sp."sequence", 
                            s.description as step,
                            sp."dtinitial",
                            sp."dtend",
                            sp."text",
                            sp.chkscrap,
                            concat(TO_NUMBER(m.id, '999999999999999999'), ' - ', m.description) as "material",
                            concat(TO_NUMBER(rm.id, '999999999999999999'), ' - ', rm.description) as "rawmaterial",
                            o.idmaterial,
                            o.idequipmentscheduled as "equipmentscheduled",
                            o.idclient
                        from ${schema}.steppieces sp
                            inner join ${schema}."step" s on (sp.idstep = s.id)
                            inner join ${schema}."order" o on (sp.idordermes = o.idordermes)
                            inner join ${schema}."lot" l on (sp.idlot = l.id)
                            inner join ${schema}."material" m on (o.idmaterial = m.id)
                            inner join ${schema}."material" rm on (o.idrawmaterial = rm.id)
                        where sp.idordermes = '${data.idordermes}'
                        and sp.idstep = ${data.idstep}
                        and sp.ispacked <> true
                        order by l.id, sp.piece `
        }
        else {

            sql = `select sp.idequipment, 
                        o.idordermes,
                        o.idordersap,
                        l.id as "lot", 
                        sp.piece, 
                        sp.idstep, 
                        sp."sequence", 
                        s.description as step,
                        sp."dtinitial",
                        sp."dtend",
                        sp."text",
                        sp.chkscrap,
                        concat(TO_NUMBER(m.id, '999999999999999999'), ' - ', m.description) as "material",
                        concat(TO_NUMBER(rm.id, '999999999999999999'), ' - ', rm.description) as "rawmaterial",
                        o.idmaterial,
                        o.idequipmentscheduled as "equipmentscheduled",
                        o.idclient
                    from ${schema}.steppieces sp
                        inner join ${schema}."step" s on (sp.idstep = s.id)
                        inner join ${schema}."order" o on (sp.idordermes = o.idordermes)
                        inner join ${schema}."lot" l on (sp.idlot = l.id)
                        inner join ${schema}."material" m on (o.idmaterial = m.id)
                        inner join ${schema}."material" rm on (o.idrawmaterial = rm.id)
                    where sp.idordermes = '${data.idordermes}'
                    and sp.idstep = ${data.idstep}
                    and sp.ispacked <> true
                    and sp.piece not in (
                    	 select sp.piece 
	                    from ${schema}.steppieces sp
	                        inner join ${schema}."step" s on (sp.idstep = s.id)
	                        inner join ${schema}."order" o on (sp.idordermes = o.idordermes)
	                        inner join ${schema}."lot" l on (sp.idlot = l.id)
	                        inner join ${schema}."material" m on (o.idmaterial = m.id)
	                        inner join ${schema}."material" rm on (o.idrawmaterial = rm.id)
	                   	where sp.idordermes = '${data.idordermes}'
	                   	and sp."sequence" = '${data.sequence - 1}'
                        and (sp.dtinitial is null or sp.dtend is null)
                        and sp.chkscrap = false
	                   	order by sp.piece
                    )
                    order by sp.piece`
        }

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })

    });

    //FIND STEP PIECES FOR BIG MAKER PRODUCTION
    app.api.register('findPackedPieces', async (data, ctx) => {
        return sequelize.transaction(async (t) => {

            data = data.obj;

            let resultObj = {};

            let sql = `	
                    select distinct sp.idequipment, 
                    o.idordermes,
                    o.idordersap,
                    l.id as "lot", 
                    sp.piece, 
                    sp."text",
                    sp.chkscrap,
                    concat(TO_NUMBER(m.id, '999999999999999999'), ' - ', m.description) as "material",
                    concat(TO_NUMBER(rm.id, '999999999999999999'), ' - ', rm.description) as "rawmaterial",
                    o.idmaterial,
                    o.idequipmentscheduled as "equipmentscheduled",
                    o.idclient
                    from ${schema}.steppieces sp
                        inner join ${schema}."step" s on (sp.idstep = s.id)
                        inner join ${schema}."order" o on (sp.idordermes = o.idordermes)
                        inner join ${schema}."lot" l on (sp.idlot = l.id)
                        inner join ${schema}."material" m on (o.idmaterial = m.id)
                        inner join ${schema}."material" rm on (o.idrawmaterial = rm.id)
                    where sp.idordermes = '${data.idordermes}'
                    and sp.ispacked = true
                    order by l.id, sp.piece`

            let packeds = await sequelize.query(sql).spread(async (results) => {
                return { data: results, success: true }
            });

            resultObj.packeds = packeds.data

            let lotsgenerated = await lotgenerated.findAll({
                where: { idorder: data.idordermes },
                raw: true
            });

            resultObj.lotsgenerated = lotsgenerated;

            let stops = await stop.findAll({
                where: { idorder: data.idordermes },
                raw: true
            });

            resultObj.stops = stops;

            let scraps = await scrap.findAll({
                where: { idorder: data.idordermes },
                raw: true
            });

            resultObj.scraps = scraps;

            let lotsconsumed = await lotconsumed.findAll({
                where: { idorder: data.idordermes },
                raw: true
            });

            resultObj.lotsconsumed = lotsconsumed;

            let allocated = await allocation.findAll({
                where: { idorder: data.idordermes },
                raw: true
            });

            resultObj.allocated = allocated;

            sql = `	select sum(lc.numbervalue) 
                        from ${schema}.lotconsumed l
                            inner join ${schema}.lotcharacteristic lc on (l.idlot = lc.idlot and lc."name" = 'CG_PESO_LIQUIDO') 
                        where l.idorder = ${data.idordermes}`;

            let readed = await sequelize.query(sql).spread(async (results) => {
                return { data: results, success: true }
            });

            resultObj.readed = readed.data[0];

            return { resultObj, success: true }

        }).then(function (result) {
            return { data: result, success: true }
        }).catch(function (err) {
            return { data: err, success: false }
        });

    });

    //FINISHING BIGMAKER ORDER
    app.api.register('finishBigMakerOrder', async (data, ctx) => {
        return sequelize.transaction(async (t) => {

            data = data.data;
            let idordermes = data.packeds[0].idordermes;
            let idordersap = data.packeds[0].idordersap;

            let idequipmentscheduled = data.packeds[0].idequipment;
            let sumscrap = 0;

            for (let i = 0; i < data.scraps.length; i++) {
                sumscrap += data.scraps[i].weight
            }

            sql_com = `select * from ${schema}.company`;

            let company = await sequelize.query(sql_com).spread(async (results) => {
                return { data: results, success: true }
            });

            //Desalocar lotes alocados mas não consumidos
            let sql = `	select * from ${schema}.allocation al
                    where
                    al.idorder = ${idordermes}
                    and al.idlot not in (select idlot from ${schema}.lotconsumed where idorder = ${idordermes})`;

            let notconsumed = await sequelize.query(sql).spread(async (results) => {
                return { data: results, success: true }
            });
            notconsumed = notconsumed.data;

            if (notconsumed.length > 0) {
                for (let i = 0; i < notconsumed.length; i++) {
                    await allocation.destroy({
                        where: {
                            idorder: idordermes,
                            idlot: notconsumed[i].idlot,
                        }
                    }, { transaction: t });
                }
            }

            //Retornar o peso para trás no último lote consumido
            sql = `	select l.id as idlot, l.idmaterial 
                    from ${schema}.lotconsumed lc
                    inner join ${schema}.lot l on (l.id = lc.idlot)
                    where lc.idorder = ${idordermes}
                    order by lc.dtcreated desc
                    limit 1`;

            let lastconsumed = await sequelize.query(sql).spread(async (results) => {
                return { data: results, success: true }
            });
            lastconsumed = lastconsumed.data[0];

            //modificando as características quando houver retorno de peso e registrando na tabela de  histórico do lote
            if (data.returned && data.returned.returnedBackWeight > 0) {

                let oldweight = await lotcharacteristic.findOne({
                    where: { idlot: lastconsumed.idlot, name: "CG_PESO_LIQUIDO" },
                    raw: true
                });

                let oldpieces = await lotcharacteristic.findOne({
                    where: { idlot: lastconsumed.idlot, name: "CG_QUANTIDADE" },
                    raw: true
                });

                await lotcharacteristic.update({ numbervalue: data.returned.returnedBackWeight, textvalue: data.returned.returnedBackWeight, iduser: data.iduser }, {
                    where: {
                        idlot: lastconsumed.idlot,
                        name: 'CG_PESO_LIQUIDO'
                    },
                    raw: false,
                    transaction: t
                })

                await lotcharacteristic.update({ numbervalue: data.returned.returnedBackWeight, textvalue: data.returned.returnedBackWeight, iduser: data.iduser }, {
                    where: {
                        idlot: lastconsumed.idlot,
                        name: 'CG_PESO_BRUTO'
                    },
                    raw: false,
                    transaction: t
                })

                await lotcharacteristic.update({ numbervalue: data.returned.returnedBackPieces, textvalue: data.returned.returnedBackPieces, iduser: data.iduser }, {
                    where: {
                        idlot: lastconsumed.idlot,
                        name: 'CG_QUANTIDADE'
                    },
                    raw: false,
                    transaction: t
                })

                await lothistory.create({
                    lot: lastconsumed.idlot,
                    field: 'CG_PESO_LIQUIDO',
                    valuebefore: oldweight.numbervalue,
                    valueafter: data.returned.returnedBackWeight,
                    iduser: data.iduser,
                    status: true
                }, { transaction: t })

                await lothistory.create({
                    lot: lastconsumed.idlot,
                    field: 'CG_QUANTIDADE',
                    valuebefore: oldpieces.numbervalue,
                    valueafter: data.returned.returnedBackPieces,
                    iduser: data.iduser,
                    status: true
                }, { transaction: t })

            }
            else {
                await lot.update({ status: false, iduser: data.iduser }, {
                    where: {
                        id: lastconsumed.idlot
                    },
                    raw: true,
                    transaction: t
                })
            }

            //criando novas sucatas caso alguma seja registrada no encerramento da ordem
            if (data.newScraps.length > 0) {
                for (let i = 0; i < data.newScraps.length; i++) {
                    await scrap.create({
                        idlot: lastconsumed.idlot,
                        idequipment: idequipmentscheduled,
                        idorder: idordermes,
                        idscrapreason: data.newScraps[i].scrapreason,
                        weight: data.newScraps[i].weight,
                        iduser: data.iduser,
                        quantity: 0,
                        status: true
                    }, { transaction: t });

                    sumscrap += data.newScraps[i].weight;
                }
            }

            /* Encerra a OP*/
            await order.update({
                orderstatus: 'FINISHED'
            }, {
                    where: {
                        idordermes: idordermes,
                    },
                    raw: true,
                    transaction: t
                });

            /*criação da interface de encerramento de ordem*/

            //Sequencia da interface
            let sql_seq = `select NEXTVAL('public.SEQ_INT')`;

            sequence = await sequelize.query(sql_seq).spread(async (results) => {
                return { data: results, success: true }
            });

            let seqint = sequence.data[0].nextval

            xml = `<?xml version="1.0" encoding="UTF-8"?>
                    <COLLECT>
                        <SEQUENCE>${seqint}</SEQUENCE>
                        <CENTER>${company.data[0].center}</CENTER>
                        <WORKCENTER>${idequipmentscheduled}</WORKCENTER>
                        <SCRAPP>
                            <MATERIALCONSUMED>${lastconsumed.idmaterial}</MATERIALCONSUMED>
                            <LOTCONSUMED>${("0000000000" + lastconsumed.idlot).slice(-10)}</LOTCONSUMED>
                            <WEIGHTSCRAPPED>${(Number(sumscrap).toFixed(3) - 0.0005).toFixed(3)}</WEIGHTSCRAPPED>
                            <END>X</END>
                        </SCRAPP>
                        <PRODUCED>`;


            //Lotes consumidos
            sql = ` select l.id, sum(lg.lotweight1), l.idmaterial
                    from ${schema}.lotgenerated lg 
                    inner join ${schema}.lot l on (l.id = lg.lotconsumed1)
                    where lg.idorder = '${idordermes}' group by l.id, l.idmaterial`;

            let lotsconsumed = await sequelize.query(sql).spread(async (results) => {
                return { data: results, success: true }
            });
            lotsconsumed = lotsconsumed.data

            for (let i = 0; i < lotsconsumed.length; i++) {

                xml += `
                        <LOTCONSUMED>
                            <MATERIALCONSUMED>${lotsconsumed[i].idmaterial}</MATERIALCONSUMED>
                            <LOTCONSUMED>${("0000000000" + lotsconsumed[i].id).slice(-10)}</LOTCONSUMED>
                            <WEIGHTCONSUMED>${(Number(lotsconsumed[i].sum).toFixed(3) - 0.0005).toFixed(3)}</WEIGHTCONSUMED> 
                            <ORDERPRODUCTION>${idordersap}</ORDERPRODUCTION>
                        </LOTCONSUMED>`;
            }

            xml += `</PRODUCED>
                </COLLECT>`;

            xml = xml.trim();


            let statusinterface = await interface.findAll({
                where: {
                    idordermes: idordermes,
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
                idordermes: idordermes,
                idordersap: idordersap
            },
                {
                    transaction: t,
                });

            return { data, success: true }

        }).then(function (result) {
            return { data: result, success: true }
        }).catch(function (err) {
            return { data: err, success: false }
        });

    });



}

