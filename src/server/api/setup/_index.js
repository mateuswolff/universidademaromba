const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;

    // RELATORIO RNC
    app.api.register('reportSetup', async (data, ctx) => {
        let sqlTable = `select o.idordermes, 
                mr.description as rawmaterial, 
                mm.description as material, 
                o.dtcreated as datecreated,
                st.letter as shift,
                st.startdate,
                st.enddate,
                st.iduser,
                e.description as equipment,
                st.idorder
                from  ${schema}.stop st
                    left join ${schema}."order" o on st.idorder = o.idordermes
                    left join ${schema}.material mr on o.idrawmaterial = mr.id
                    left join ${schema}.material mm on o.idmaterial = mm.id
                    left join ${schema}.equipment e on o.idequipmentscheduled = e.id
                    where st.idstopreason = '999'`;

        if (data.idequipment)
            sqlTable += ` and o.idequipmentscheduled = '${data.idequipment}'`;

        sqlTable += ` and st.startdate between '${data.startdate}' and '${data.enddate}'`;
        let resultTable = await sequelize.query(sqlTable).spread((result) => {
            return result;
        });

        let sqlChart = `select  sum(cast((extract(day from lg.enddate - lg.startdate) * 24 * 60) + (extract(hour from lg.enddate - lg.startdate) * 60) + (extract(minute from lg.enddate - lg.startdate)) as integer)) produced,
                            cast(case when ms."time" is null then 0 else ms."time" end as integer) "default",
                            cast(lg.startdate as date), 
                            cast(lg.enddate as date), 
                            lg.idorder
                            from ${schema}.stop lg
                            left join ${schema}."order" o on o.idordermes = lg.idorder
                            left join ${schema}.matrixsetup ms on ms.idmaterialfrom = o.idrawmaterial and ms.idmaterialto = o.idmaterial
                            where lg.idstopreason = '999'`;

        if (data.idequipment)
            sqlChart += ` and o.idequipmentscheduled = '${data.idequipment}'`;


        sqlChart += ` and startdate between '${data.startdate}' and '${data.enddate}'
                        group by lg.idorder, 
                        cast(lg.startdate as date), 
                        cast(lg.enddate as date), 
                        lg.idstopreason, 
                        idrawmaterial,
                        idmaterial,
                        ms."time"`;

        let resultChart = await sequelize.query(sqlChart).spread((result) => {
            return result;
        });

        return { data: { table: resultTable, chart: resultChart }, success: true };
    }, { method: "POST" })
}