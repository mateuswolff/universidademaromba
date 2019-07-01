const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // URL BASE
    const resourceBase = '/api/';

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;
    const { stepequipment } = config.postgres.DB;

    app.api.register('linkedStep', async (req) => {
        let data = req;
        let sql = `	 
                    select s.id as "idstep", s.description as "step", e.id as "idequipment", e.description as "equipment", se."sequence"
                    from ${schema}.stepequipment se 
                        inner join ${schema}.step s on (s.id = se.idstep)
                        inner join ${schema}.equipment e on (e.id = se."idequipment")
                    where e.id = '${data.idequipment}'
                    `;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    });

    app.api.register('linkedStepByOrder', async (req) => {
        let data = req;
        let sql = `	 select s.id as "idstep", s.description as "step", e.id as "idequipment", e.description as "equipment", se."sequence",
                    (select 
                        count(*) 
                    from 
                    ${schema}.steppieces 
                    where 
                        idequipment = e.id 
                        and idstep = s.id 
                        and idordermes = ${data.idordermes} 
                        and dtend is not null
                        and ispacked = false
                        and chkscrap = false) as worked,
                    (select 
                        count(*) 
                    from 
                        ${schema}.steppieces 
                    where 
                        idequipment = e.id 
                        and idstep = s.id 
                        and idordermes = ${data.idordermes} 
                        and dtend is not null
                        and ispacked = true
                        and chkscrap = false) as packed,
                    (select 
                        count(*) 
                    from 
                        ${schema}.steppieces 
                    where 
                        idequipment = e.id 
                        and idstep = s.id 
                        and idordermes = ${data.idordermes}
                        and dtinitial is null
                        and dtend is null
                        and chkscrap = false) as pendent,
                    (select 
                        count(*) 
                    from 
                        ${schema}.steppieces 
                    where 
                        idequipment = e.id 
                        and idstep = s.id 
                        and idordermes = ${data.idordermes} 
                        and dtinitial is not null
                        and dtend is null
                        and chkscrap = false) as producing,
                    (select 
                        count(*) 
                    from 
                        ${schema}.steppieces 
                    where 
                        idequipment = e.id 
                        and idstep = s.id 
                        and idordermes = ${data.idordermes} 
                        and chkscrap = true) as scrapped
                from ${schema}.stepequipment se 
                    inner join ${schema}.step s on (s.id = se.idstep)
                    inner join ${schema}.equipment e on (e.id = se."idequipment")
                where e.id = '${data.idequipment}'
                order by se."sequence"`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    });

    app.api.register('unlinkedStep', async (req) => {
        let data = req;
        let sql = `	 
                    select * 
                    from ${schema}.step s 
                    where s.id not in(
                                select s.id
                                from ${schema}.stepequipment se 
                                    inner join ${schema}.step s on (s.id = se.idstep)
                                    inner join ${schema}.equipment e on (e.id = se."idequipment")
                                where e.id = '${data.idequipment}')
                        and s.status = true`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    });


    // REORGANIZE SEQUENCE OF STEPEQUIPMENT
    app.api.register('reorganizeStepEquipment', async (req) => {

        return sequelize.transaction(async (t) => {

            for (let i = 0; i < req.length; i++) {

                let reorganize = {
                    sequence: i + 1
                }

                let selected = {
                    idequipment: req[i].idequipment,
                    idstep: req[i].idstep
                }

                await stepequipment.update(reorganize, {
                    where: selected,
                    transaction: t
                })
            }

        }).then((result) => {
            return { data: result, success: true };
        }).catch((err) => {
            return { data: err, success: false };
        });
    }, { method: "POST" });

}

