const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // URL BASE
    const resourceBase = '/api/';

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;

    // GET QUERY all stops in ranger 
    app.api.register('AllScraps', async (req, ctx) => {
        

        let where = req;

        let sql = `SELECT 
        sc."idequipment",
        sc."idorder", 
        sc."idscrapsequence",
        sc."dtcreated",
        sc."idoperation",
        sc."weight",
        sc."quantity",
        sc."iduser",
        sr."description" as descriptionreason,
        od."idclient",
        od."idordermes",
        concat(TO_NUMBER(ma1.id, '999999999999999999'), ' - ', ma1."description") as material,
        concat(TO_NUMBER(ma2.id, '999999999999999999'), ' - ', ma2."description") as rawmaterial
        from ${schema}."scrap" as sc
        left JOIN ${schema}."order" od ON (od."idordermes" = sc."idorder")
        left JOIN ${schema}."material" ma1 ON (ma1."id" = od."idmaterial")
        left JOIN ${schema}."material" ma2 ON (ma2."id" = od."idrawmaterial")
        left JOIN ${schema}."scrapreason" sr ON (sr."id" = sc."idscrapreason")
        where sc."status" = true`;

        if (where.idOp != null) {
            sql += ` and sc."idorder" = '${where.idOp}'`;
        };

        if (where.idEquipment != null) {
            sql += ` and sc."idequipment" = '${where.idEquipment}'`;
        };

        if (where.startDate != null) {
            if (where.endDate != null) {
                sql += ` and sc."dtcreated" BETWEEN '${where.startDate} 00:00:00' and '${where.endDate} 23:59:59'`;
            }
        }

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })

    });

    //validando se a sucata pode ser gerada
    app.api.register('getWeightOutput', async (idorder) => {
        let sql = `
                    select al."sum" - sum(coalesce(ls.lotweight,0)) as "remainingweight"
                    from (
                            select sum(lotweight1) as "lotweight"
                            from ${schema}.lotgenerated 
                            where idorder = ${idorder}
                            
                            union
                            
                            select sum(lotweight2) as "lotweight"
                                from ${schema}.lotgenerated 
                                where idorder = ${idorder}
                                    and lotweight2 is not null
                            
                            union
                            
                            select sum(weight) as "lotweight"
                            from ${schema}.scrap sc
                            where idorder = ${idorder}
                        ) as ls,
                        (
                            select sum(weight) 
                            from ${schema}.allocation 
                            where idorder = ${idorder}) as al
                            group by al."sum"`;
                            
        return sequelize.query(sql).spread((results, metadata) => {
          return { data: results, success: true };
        })
      }, { method: "POST" });

}