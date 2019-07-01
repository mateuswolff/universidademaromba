const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;
const moment = require('moment');
moment().format();

exports.default = function (app) {

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;
    const { coilcuttingplan, ordercuttingplan, order, interface, allocation, allocationshistory } = config.postgres.DB;

    app.api.register('createCoilCutPlan', async (cutPlan, materials, ctx) => {
        let item = {};

        try {

            return sequelize.transaction(async (t) => {
                cutPlan.iduser = ctx && ctx.login ? ctx.login : 'default_user';

                let sql = `
                select lc1.numbervalue as weight, lc1.idmaterial as idrawmaterial, lc2.numbervalue as width, mc1.numbervalue as widthmaterial
                from ${schema}.lotcharacteristic lc1
                    left join ${schema}.lotcharacteristic lc2 on (lc1.idlot = lc2.idlot and lc2.name = 'CG_LARGURA')
                    left join ${schema}.materialcharacteristic mc1 on (lc1.idmaterial = mc1.idmaterial and mc1.idcharacteristic = 'CG_LARGURA') 
                where lc1.idlot = '${cutPlan.idlot}'
                    and lc1.name = 'CG_PESO_LIQUIDO'`;

                let rweight = await sequelize.query(sql).spread(async (results) => {
                    return { data: results, success: true }
                });

                let sumweight = 0;

                if (rweight.data.length > 0) {

                    item = await coilcuttingplan.create(cutPlan, { transaction: t });

                    let ordercreated = [];

                    for (let i = 0; i < materials.length; i++) {

                        materials[i].idcuttingplan = item.id;

                        await ordercuttingplan.create(materials[i], { transaction: t });

                        let sumwidth = 0;

                        for (let k = 0; k < materials.length; k++){
                            sumwidth += (materials[k].quantity * materials[k].width)
                        }

                        let weight = (materials[i].width / rweight.data[0].width * rweight.data[0].weight) / (sumwidth / rweight.data[0].width)

                        for (let j = 0; j < materials[i].cuts; j++) {

                            ordercreated.push(await order.create({
                                idordergroup: 0,
                                orderstatus: "PRODUCTION",
                                ordertype: "PRODUCTION",
                                urgency: "NORMAL",
                                idmaterial: materials[i].idmaterial,
                                idrawmaterial: rweight.data[0].idrawmaterial,
                                plannedorderquantity: parseFloat(weight).toFixed(3), //Caso dê alocação e menos, basta tirar o toFixed - 0.0005
                                expectedquantity: parseFloat(weight).toFixed(3),
                                requestdate: new Date(),
                                sequence: 0,
                                idequipmentexpected: cutPlan.idequipment, //equipamento selecionado em tela
                                idequipmentscheduled: cutPlan.idequipment,
                                status: true,
                                iduser: materials[i].iduser

                            }, { transaction: t }));
                        }
                    }

                    for (let i = 0; i < ordercreated.length; i++) {

                        sumweight += ordercreated[i].plannedorderquantity;

                        let weight = ordercreated[i].plannedorderquantity;

                        if(i == ordercreated.length - 1){
                            let difference = rweight.data[0].weight - sumweight
                            weight = weight + difference
                        }

                        await allocation.create({
                            idorder: ordercreated[i].idordermes,
                            idlot: cutPlan.idlot,
                            iduser: ordercreated[i].iduser,
                            standardmaterialidentifier: true,
                            weight: weight,
                            pieces: 1
                        },
                            {
                                transaction: t,
                                raw: true
                            });

                        await allocationshistory.create({
                            idorder: ordercreated[i].idordermes,
                            idlot: cutPlan.idlot,
                            idcallocation: 'A',
                            iduser: ordercreated[i].iduser,
                        },
                            {
                                transaction: t,
                                raw: true
                            });

                        sql = `select NEXTVAL('public.SEQ_INT')`;

                        let sequence = await sequelize.query(sql).spread(async (results) => {
                            return { data: results, success: true }
                        });

                        sql = `select * from ${schema}.company`;

                        let company = await sequelize.query(sql).spread(async (results) => {
                            return { data: results, success: true }
                        });

                        let xml = `<?xml version="1.0" encoding="UTF-8"?><CUTTINGPLAN><SEQUENCE>${sequence.data[0].nextval}</SEQUENCE><CENTER>${company.data[0].center}</CENTER><ORDER><DUEDATE>${moment().format("YYYY-MM-DD")}</DUEDATE><OPERATION>A</OPERATION><WEIGHT>${ordercreated[i].plannedorderquantity}</WEIGHT><IDEQUIPMENTSCHEDULED>${cutPlan.idequipment}</IDEQUIPMENTSCHEDULED><IDMATERIAL>${ordercreated[i].idmaterial}</IDMATERIAL><ORDERMES>${ordercreated[i].idordermes}</ORDERMES></ORDER><LOT><IDRAWMATERIAL>${ordercreated[i].idrawmaterial}</IDRAWMATERIAL><IDLOT>${("0000000000" + cutPlan.idlot).slice(-10)}</IDLOT><LOTWEIGHT>${ordercreated[i].plannedorderquantity}</LOTWEIGHT></LOT></CUTTINGPLAN>`;

                        let statusinterface = await interface.findAll({
                            where: {
                                idordermes: ordercreated[i].idordermes,
                                idstatus: {
                                    $notIn: ['OK', 'RSD']
                                    //$ne: 'OK'
                                }
                            },
                            transaction: t,
                            raw: true
                        });

                        let idstatus = statusinterface.length > 0 ? 'BLK' : 'NEW'

                        await interface.create({
                            id: sequence.data[0].nextval,
                            idinterface: 'MS01',
                            date: new Date(),
                            idstatus: idstatus,
                            messageinterface: xml,
                            iduser: ordercreated[i].iduser,
                            idordermes: ordercreated[i].idordermes
                        });
                    }

                }

            }).then((result) => {
                if (Object.keys(item).length === 0)
                    return { data: 'There are not enough characteristics on this lot', success: false }
                else
                    return { data: item, success: true }
            }).catch((err) => {
                console.log(err)
                return { data: null, success: false }
            });

        } catch (result) {
        }

    }, { method: "POST" })

    app.api.register('deleteCoilCutPlan', async (cutPlan, ctx) => {

        let item = {};

        try {

            return sequelize.transaction(async (t) => {
                cutPlan.iduser = ctx && ctx.login ? ctx.login : 'default_user';

                let sql = `
                            select 
                                a.idlot, a.weight, o.idordermes, o.idordersap, o.idmaterial, o.idequipmentscheduled 
                            from 
                                ${schema}.allocation a
                                inner join ${schema}."order" o on (a.idorder = o.idordermes)
                            where a.idlot = ${cutPlan.lot}`

                let allocated = await sequelize.query(sql).spread(async (results) => {
                    return { data: results, success: true }
                });

                if (allocated.data.length) {
                    allocated = allocated.data;
                }
                else {
                    item = {
                        data: "Unallocated Lot!",
                        success: false
                    };
                    return item;
                }

                for (let i = 0; i < allocated.length; i++) {
                    if (!allocated[i].idordersap) {
                        item = {
                            data: "There is an order without the SAP number, wait for the interface return!",
                            success: false
                        };
                        return item;
                    }
                }

                for (let i = 0; i < allocated.length; i++) {

                    sql = `select NEXTVAL('public.SEQ_INT')`;

                    let sequence = await sequelize.query(sql).spread(async (results) => {
                        return { data: results, success: true }
                    });

                    sql = `select * from ${schema}.company`;

                    let company = await sequelize.query(sql).spread(async (results) => {
                        return { data: results, success: true }
                    });

                    let xml = `<?xml version="1.0" encoding="UTF-8"?>
                                <CUTTINGPLAN>
                                    <SEQUENCE>${sequence.data[0].nextval}</SEQUENCE>
                                    <CENTER>${company.data[0].center}</CENTER>
                                    <ORDER>
                                        <DUEDATE>${moment().format("YYYY-MM-DD")}</DUEDATE>
                                        <OPERATION>E</OPERATION>
                                        <WEIGHT>0</WEIGHT>
                                        <IDEQUIPMENTSCHEDULED>${cutPlan.equipmentId}</IDEQUIPMENTSCHEDULED>
                                        <IDMATERIAL>${allocated[i].idmaterial}</IDMATERIAL>
                                        <ORDERMES>${allocated[i].idordermes}</ORDERMES>
                                        <ORDERPRODUCTION>${allocated[i].idordersap}</ORDERPRODUCTION>
                                    </ORDER>
                                </CUTTINGPLAN>`;

                    let statusinterface = await interface.findAll({
                        where: {
                            idordermes: allocated[i].idordermes,
                            idstatus: {
                                $notIn: ['OK', 'RSD']
                            }
                        },
                        transaction: t,
                        raw: true
                    });

                    let idstatus = statusinterface.length > 0 ? 'BLK' : 'NEW'

                    await interface.create({
                        id: sequence.data[0].nextval,
                        idinterface: 'MS01',
                        date: new Date(),
                        idstatus: idstatus,
                        messageinterface: xml,
                        iduser: cutPlan.iduser,
                        idordermes: allocated[i].idordermes
                    });

                }

                item.success = true;
                item.data = cutPlan.id;

                await allocation.destroy({
                    where: {
                        idlot: cutPlan.lot,
                    }
                }, { transaction: t });

                await coilcuttingplan.destroy({
                    where: {
                        id: cutPlan.id,
                    }
                }, { transaction: t });


            }).then((result) => {
                return item
            }).catch((err) => {
                console.log(err)
                return { data: null, success: false }
            });

        } catch (result) {
        }

    }, { method: "POST" })


    app.api.register('findOrderAllocationCoilCutPlan', async (data) => {
        let sql = `
        select o.idordermes, o.idordersap, o.saleorder, a.idlot, a.weight, o.idmaterial, o.idrawmaterial, o.orderstatus, ccp.id as coilcuttingplan, o.expectedquantity, o.idequipmentscheduled, o.requestdate
        from ${schema}.allocation a
        inner join ${schema}.order o on(a.idorder = o.idordermes)
        inner join ${schema}.coilcuttingplan ccp on(a.idlot = ccp.idlot)
        where a.idlot = ${data.idlot}
        and ccp.id =  ${data.idccp}`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });
    }, { method: "POST" });


    app.api.register('updateCoilCutPlan', async (cutPlan, materials, ctx) => {
        let item = {};

        return sequelize.transaction(async (t) => {
            cutPlan.iduser = ctx && ctx.login ? ctx.login : 'default_user';

            item = await coilcuttingplan.update(cutPlan, { where: { id: cutPlan.id } }, { transaction: t });

            await ordercuttingplan.destroy({ where: { idcuttingplan: cutPlan.id } }, { transaction: t });

            for (let material of materials) {
                material.idcuttingplan = cutPlan.id;

                await ordercuttingplan.create(material, { transaction: t });
            }

        }).then((result) => {
            return { data: item, success: true }
        }).catch((err) => {
            return { data: null, success: false }
        });
    }, { method: "POST" })

    app.api.register('packagesToBeGeneratedCoilCutting', async (data) => {
        let sql = `select c.id, c.idlot, c.idequipment, ( select sum(oc.quantity) from ${schema}.ordercuttingplan oc where oc.idcuttingplan = c.id) as total
		from ${schema}.coilcuttingplan c
	where c.idequipment = '${data.idequipment}'
        and c.situation = 'P'`;
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });
    }, { method: "POST" });


    app.api.register('findAllCoilCutPlanByEquip', async (data) => {
        let sql = `select ccp.id as idcoilcuttingplan, ccp.idlot, l.quality, l."idrun", mcl."numbervalue" as "widthlot", lc."numbervalue" as "weight", ccp.yield, ccp.refile, ocp."idmaterial", m.description, mc."numbervalue" as "width", ocp.quantity, rm.description as "rmdescription",
        CASE WHEN mr."situationmovement"='E' THEN 'IN_FRONT_OF' when mr."situationmovement"='P' then 'PENDING' ELSE 'NOT_REALIZED' end as situation
        from ${schema}."coilcuttingplan" as ccp
            inner join ${schema}."ordercuttingplan" as ocp on ccp.id = ocp."idcuttingplan"
            inner join ${schema}.material as m on m.id = ocp."idmaterial"
            inner join ${schema}."materialcharacteristic" as mc on m.id = mc."idmaterial"
            inner join ${schema}.lot as l on l.id = ccp.idlot
            inner join mes_ribeirao.material as rm on l.idmaterial = rm.id
			inner join ${schema}."materialcharacteristic" as mcl on mcl."idmaterial" = l."idmaterial"
			inner join ${schema}."lotcharacteristic" as lc on lc."idmaterial" = l."idmaterial"
            left join ${schema}."moverequest" as mr on ccp.idlot = mr."idlot" and mr."idequipment" = ccp.idequipment and mr.id = 
              (select max(id) from ${schema}."moverequest" as mr3 where mr3."idequipment" = mr."idequipment" and mr3."idlot" = mr."idlot")
        where mc."idcharacteristic" = 'CG_LARGURA' 
        and mcl."idcharacteristic" = 'CG_LARGURA'
        and lc."name" = 'CG_PESO_LIQUIDO'
        and lc."idlot" = l.id
        and ccp.idequipment = '${data.idequipment}'
        and ccp.situation <> 'R' 
        order by idcoilcuttingplan, ocp."dtcreated"`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });
    }, { method: "POST" });

    app.api.register('findAllCoilCutPlanById', async (data) => {
        let sql = `select ccp.id as idcoilcuttingplan, ccp.idlot, l.quality, l."idrun", mcl."numbervalue" as "widthlot", lc."numbervalue" as "weight", ccp.yield, ccp.refile, ocp."idmaterial", m.description, mc."numbervalue" as "width", ocp.quantity,
        CASE WHEN mr."situationmovement"='E' THEN 'IN_FRONT_OF' when mr."situationmovement"='P' then 'PENDING' ELSE 'NOT_REALIZED' end as situation
        from ${schema}."coilcuttingplan" as ccp
            inner join ${schema}."ordercuttingplan" as ocp on ccp.id = ocp."idcuttingplan"
            inner join ${schema}.material as m on m.id = ocp."idmaterial"
            inner join ${schema}."materialcharacteristic" as mc on m.id = mc."idmaterial"
            inner join ${schema}.lot as l on l.id = ccp.idlot
			inner join ${schema}."materialcharacteristic" as mcl on mcl."idmaterial" = l."idmaterial"
			inner join ${schema}."lotcharacteristic" as lc on lc."idmaterial" = l."idmaterial"
            left join ${schema}."moverequest" as mr on ccp.idlot = mr."idlot" and mr."idequipment" = ccp.idequipment and mr.id = 
              (select max(id) from ${schema}."moverequest" as mr3 where mr3."idequipment" = mr."idequipment" and mr3."idlot" = mr."idlot")
        where mc."idcharacteristic" = 'CG_LARGURA' 
        and mcl."idcharacteristic" = 'CG_LARGURA'
        and lc."name" = 'CG_PESO_LIQUIDO'
        and lc."idlot" = l.id
        and ccp.id = ${data.id}
        and ccp.situation <> 'R' 
        order by idcoilcuttingplan, ocp."dtcreated"`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });
    }, { method: "POST" });

    app.api.register('findCoilCutPlan', async (data) => {
        let sql = `select m.id as "idmaterial", concat(TO_NUMBER(m.id, '999999999999999999'), ' - ', m.description) as description, mc."numbervalue" as "width", ocp.quantity 
            		from ${schema}."ordercuttingplan" as ocp 
		             inner join ${schema}.material as m on m.id = ocp."idmaterial"
                    inner join ${schema}."materialcharacteristic" as mc on m.id = mc."idmaterial"
                where mc."idcharacteristic" = 'CG_LARGURA' and ocp."idcuttingplan" = '${data.idcuttingplan}'`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });
    }, { method: "POST" });

    app.api.register('listCoilCutPlan', async (equipment, situation, interval) => {

        let sql = `
         select 
                 c.id
                ,c.dtcreated
                ,c.idequipment
                ,e.description as equipmentdesc
                ,c.idlot
                ,c.refile
                ,c.yield
                ,c.situation
                ,o.idmaterial
                ,concat(TO_NUMBER(m.id, '999999999999999999'), ' - ', m.description) as materialdesc
                ,o.quantity
                ,ca."textvalue" as steel
                ,ce."numbervalue" as thickness
                ,cl."numbervalue" as width
                ,lc."numbervalue" as lotweight
                ,rmc.numbervalue as rmwidth
                ,l.idrun as runid
                ,mat.id as materialscrap
            from 
                ${schema}.coilcuttingplan c
          inner join
                ${schema}.ordercuttingplan o
             on o.idcuttingplan = c.id
          inner join
                ${schema}.equipment e
             on e.id = c.idequipment
          inner join
                ${schema}.material m
             on m.id = o.idmaterial
          inner join ${schema}."materialcharacteristic" ca
             on ca."idmaterial" = m.id
          inner join ${schema}."materialcharacteristic" ce
             on ce."idmaterial" = m.id
          inner join ${schema}."materialcharacteristic" cl
             on cl."idmaterial" = m.id
          inner join ${schema}."lotcharacteristic" lc
               on lc.idlot = c.idlot and lc."name" = 'CG_PESO_LIQUIDO'
          inner join ${schema}."lot" l
          	 on l.id = lc.idlot
          inner join ${schema}.material m2
          	 on m2.id = l.idmaterial
          inner join ${schema}.materialcharacteristic rmc
          	 on m2.id = rmc.idmaterial and rmc.idcharacteristic = 'CG_LARGURA'                
          left join ${schema}.material mat
          	 on mat.description like 'SUCATA %' || ca."textvalue" || '%'  
             where c.status              = true
            and ca."idcharacteristic" = 'CG_ACO' 
            and ce."idcharacteristic" = 'CG_ESPESSURA'              
            and cl."idcharacteristic" = 'CG_LARGURA' 
        `;

        if (equipment != null && equipment != '')
            sql += `and c.idequipment = '${equipment}' `

        if (situation != null && situation != '')
            sql += `and c.situation = '${situation}' `

        if (interval != null && interval.begin && interval.end)
            sql += `and to_char(c.dtcreated :: DATE, 'yyyymmdd') between '${interval.begin}' and  '${interval.end}'`

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });
    }, { method: "POST" });
}