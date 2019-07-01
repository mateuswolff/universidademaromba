const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // URL BASE
    const resourceBase = '/api/';

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;
    const { allocation } = config.postgres.DB;

    // ALLOCATED RAW MATERIAL
    app.api.register('saveAllocation', async (req) => {
        let data = req.allocation;

        return sequelize.transaction(async (t) => {
            if (data[0].order === undefined) {
                await allocation.findAll({
                    where: {
                        idorder: data[0].idorder,
                    },
                    raw: false,
                    transaction: t
                })
                    .then(async (res) => {
                        for (let i = 0; i < res.length; i++) {
                            await res[i].destroy();
                        }
                    })

                for (let i = 0; i < data.length; i++) {
                    await allocation.create(data[i], {
                        transaction: t
                    });
                }

            } else {
                await allocation.findAll({
                    where: {
                        idorder: data[0].order
                    },
                    raw: false,
                    transaction: t
                }).then(async (res) => {
                    for (let i = 0; i < res.length; i++) {
                        await res[i].destroy();
                    }
                })
            }

        }).then((results) => {
            //res.api.send(results, 200);
            return { data: true, success: true }
        }).catch((err) => {
            //res.api.send(err, 400);
            return { data: false, success: false }
        });
    }, { method: "POST" });


    //GET ALLOCATION
    app.api.register('getAllocation', async (req) => {

        let idorder = req.idorder;

        let sql = `select a."idorder", a."idlot", a."iduser", a."standardmaterialidentifier",
        a.weight, a.pieces, a."specialinstruction", a.status, a."dtcreated", a."dtupdated",
        concat(TO_NUMBER(m.id, '999999999999999999'), ' - ', m.description) as "description", l.idmaterial, lc.textvalue as idrun, o."saleorder", o."saleorderitem",
        CASE WHEN a."standardmaterialidentifier" = TRUE THEN 'Default Raw Material' ELSE 'Raw Material' END
        from ${schema}.allocation a
            inner join ${schema}.lot l on a."idlot" = l.id
            inner join ${schema}.material m on l."idmaterial" = m.id
            inner join ${schema}.order o on o.idordermes = a.idorder
            left join ${schema}.lotcharacteristic lc on (l.id = lc.idlot and lc."name" = 'CG_CODIGO_ORIGEM')
        where a."idorder" = ${idorder}`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });
    }, { method: "POST" });

    // POST QUERY DEFAULT RAW MATERIAL ALLOCATION
    app.api.register('rawDefaultMaterialAllocation', async (req) => {
        let idrawmaterial = req.idrawmaterial;
        let sql = `select distinct concat(TO_NUMBER(m.id, '999999999999999999'), ' - ', m.description) as "description",l."idmaterial", l.id as "idlot", lcl.numbervalue as lenght, lc."numbervalue" as weight, lc1.textvalue as idrun, mc.textvalue as steelm
      from ${schema}.lot l
        inner join ${schema}."order" o on (l."idmaterial" = o."idrawmaterial")
        inner join ${schema}.material m on (m.id = o."idrawmaterial")
        inner join ${schema}."lotcharacteristic" lc on (lc."idlot" = l.id and lc.name = 'CG_PESO_LIQUIDO')
        left join ${schema}."lotcharacteristic" lcl on (lcl."idlot" = l.id and lcl.name = 'CG_COMPRIMENTO')
        left join ${schema}.lotcharacteristic lc1 on (l.id = lc1.idlot and lc1."name" = 'CG_CODIGO_ORIGEM')
        left join ${schema}."materialcharacteristic" mc on (mc.idmaterial = m.id and mc.idcharacteristic = 'CG_ACO')
      where o."idrawmaterial" = '${idrawmaterial}'
      and l.situation = 'A'
      order by l.id;`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    });

    // POST QUERY RAW MATERIAL ALLOCATION
    app.api.register('rawMaterialAllocation', async (req) => {
        let rawmaterial = req.rawmaterial;
        let idrawmaterial = req.idrawmaterial;
        let idmaterial = req.idmaterial;
        let sql = `	 select distinct concat(TO_NUMBER(m.id, '999999999999999999'), ' - ', m.description) as "description", l.id as "idlot", l."idmaterial", 
          lc."numbervalue" as weight, lc1.textvalue as idrun, mc."textvalue" as "materialgroupm",
          mca."textvalue" as "steelm", mcd."numbervalue" as "diameterm",
      mct."numbervalue" as "thicknessm", mcl."numbervalue" as "lengthm",
      mcw."numbervalue" as "widthm"
              from ${schema}.lot l 
                inner join ${schema}."lotcharacteristic" lc on (l.Id = lc."idlot" and lc."name" = 'CG_PESO_LIQUIDO')
                inner join ${schema}.material m on l."idmaterial" = m.Id
                inner join ${schema}."materialcharacteristic" mc on (l."idmaterial" = mc."idmaterial" and (mc."textvalue" = 'TB' or mc."textvalue" = 'TU' or mc."textvalue" = 'BO' or mc."textvalue" = 'FI'))
                left join ${schema}."materialcharacteristic" mca on (l."idmaterial" = mca."idmaterial" and mca."idcharacteristic" = 'CG_ACO')
                left join ${schema}."materialcharacteristic" mcd on (l."idmaterial" = mcd."idmaterial" and mcd."idcharacteristic" = 'CG_DIAMETRO')
                left join ${schema}."materialcharacteristic" mct on (l."idmaterial" = mct."idmaterial" and mct."idcharacteristic" = 'CG_ESPESSURA')
                left join ${schema}."materialcharacteristic" mcl on (l."idmaterial" = mcl."idmaterial" and mcl."idcharacteristic" = 'CG_COMPRIMENTO')
                left join ${schema}."materialcharacteristic" mcw on (l."idmaterial" = mcw."idmaterial" and mcw."idcharacteristic" = 'CG_LARGURA')
                left join ${schema}.lotcharacteristic lc1 on (l.id = lc1.idlot and lc1."name" = 'CG_CODIGO_ORIGEM')
              where m."description" LIKE '%${rawmaterial}%' and l.situation = 'A'
              and m.id not in (
                select distinct m.id
                   from ${schema}.material m
                inner join ${schema}."order" o on (o."idmaterial" = m.id)
                    where (o."idrawmaterial" = '${idrawmaterial}'
                    and o."idmaterial" = '${idmaterial}')
                union
                   select distinct o."idrawmaterial"
                   from ${schema}.material m
                inner join ${schema}."order" o on (o."idmaterial" = m.id)
                   where (o."idrawmaterial" = '${idrawmaterial}'
                   and o."idmaterial" = '${idmaterial}')
                
                )`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    });


    // Remove allocation that was not used
    app.api.register('removeAllocation', async (req) => {
        let data = req;

        return sequelize.transaction(async (t) => {

            //Desalocar lotes alocados mas não consumidos
            let sql = `	select * from ${schema}.allocation al
                    where
                    al.idorder = ${data.idordermes}
                    and al.idlot not in (select idlot from ${schema}.lotconsumed where idorder = ${data.idordermes})`;

            let notconsumed = await sequelize.query(sql).spread(async (results) => {
                return { data: results, success: true }
            });
            notconsumed = notconsumed.data;

            if (notconsumed.length > 0) {
                for (let i = 0; i < notconsumed.length; i++) {
                    await allocation.destroy({
                        where: {
                            idorder: data.idordermes,
                            idlot: notconsumed[i].idlot,
                        }
                    }, { transaction: t });
                }
            }

        }).then((results) => {
            return { data: true, success: true }
        }).catch((err) => {
            return { data: false, success: false }
        });
    }, { method: "POST" });

}


