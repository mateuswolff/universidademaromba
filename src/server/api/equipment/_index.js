const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;

    app.api.register('equipmentSituation', async () => {
        let sql = `	 
                    select cl.id as "idchecklist", e.id as "idequipment", e.description as equipment, cli.id as "checklistitem", cli.description as "checklistitemdescription", cli."typevalue"
                    from ${schema}.checklist cl 
                        inner join ${schema}."checklistitemlink" clil on (clil."idchecklist" = cl.id)
                        inner join ${schema}."checklistitem" cli on (cli.id = clil."idchecklistitem")
                        inner join ${schema}.equipment e on (e.id = cl."idequipment")
                    where e.id = '${data.equipment}'
                    `;
        return sequelize.query(sql).spread((results, metadata) => {
            return results;
        })
    }, { method: "POST" })

    app.api.register('getEquipmentSituation', async () => {
        let sql = `select 
                    t.id as "typeid"
                    ,t.description as "typedes"
                    ,e.id
                    ,e.description
                    ,s."stoptype"
                    ,sr.description as "stopreason"
                    ,s."startdate"
                    ,o."idordermes"
                    ,o.urgency
                    ,o."idclient"
                    ,(select 
                            --max(s1.velocity)
                            count(1)
                        from ${schema}.stop s1 
                        where 
                            s1."idorder" = o."idordermes" ) as velocity_real
                    ,(select 
                            p."productivityvalue" 
                        from ${schema}."productivitymaterial" p 
                        where 
                            p."idequipment" = e.id 
                        and p."idmaterial"  = o."idmaterial") as velocity_default
                from ${schema}.equipment e 
        left join ${schema}.stop s 
                on (e.id = s."idequipment" and s."enddate" isnull)
        left join ${schema}."order" o 
                on (e.id = o."idequipmentscheduled" and o."orderstatus" = 'IN_PROCESS')
        left join ${schema}.stopreason sr on sr.id = s.idstopreason 
        inner join ${schema}."equipmenttype" t 
                on e."idtype" = t.id
            where 
                    e.status = true
                    order by t.id, e.id`;
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        }).catch((err) => {
            console.error(err);
        });
    }, { method: "POST" })

    app.api.register('getEquipmentDetail', async (equipment) => {
        let sql = `	 
            select 
                     e.id
                    ,e.description
                    ,s."stoptype"
                    ,s."idstopreason"
                    ,s."startdate"
                    ,o."idordermes"
                    ,o.urgency
                    ,o."idclient"
                    ,(select 
                             count(1) 
                        from ${schema}.allocation al 
                       where 
                             al."idorder" = o."idordermes") as qtd_total_lotes_alocados
                    ,(select 
                             count(1) 
                        from ${schema}."lotconsumed" al 
                       where 
                             al."idorder" = o."idordermes") as qtd_lotes_consumidos
                    ,(select 
                             count(1) 
                        from ${schema}."lotgenerated" al 
                       where al."idorder" = o."idordermes") as qtd_lotes_gerados
                from ${schema}.equipment e 
           left join ${schema}.stop s 
                  on (e.id = s."idequipment" and s."enddate" isnull)
          left join ${schema}."order" o 
                  on (e.id = o."idequipmentscheduled" and o."orderstatus" = 'IN_PROCESS')
               where 
                    e.id = '${equipment}'                
                    `;
        return sequelize.query(sql).spread((results, metadata) => {
            return results;
        })
    }, { method: "POST" })

    app.api.register('equipmentPrinter', async (data) => {
        let sql = `select pt.* from ${schema}.equipment
                    left join ${schema}.print pt on equipment.idprinter = pt.id
                    where equipment.id = '${data.idequipment}'`;
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    }, { method: "POST" });

    app.api.register('unlinkDefectEquipment', async (data) => {
        let sql = `select * from ${schema}.defecttype
        where status = true and id not in (
            select iddefect from ${schema}.linkedequipmentdefect where idequipment = '${data.idequipment}'
        )`;
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    }, { method: "POST" });

    app.api.register('linkDefectEquipment', async (data) => {
        let sql = `select lk.idequipment, lk.iddefect, df.description from ${schema}.linkedequipmentdefect lk
        left join ${schema}.defecttype df on id = lk.iddefect
        where idequipment = '${data.idequipment}'`;
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    }, { method: "POST" });

    app.api.register('unlinkStopEquipment', async (data) => {
        let sql = `select * from ${schema}.stoptype
        where id not in (
            select lk.idstop from ${schema}.linkedequipmentstop lk where lk.idequipment = '${data.idequipment}'
        )`;
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    }, { method: "POST" });

    app.api.register('linkStopEquipment', async (data) => {
        let sql = `select lk.idequipment, lk.idstop, st.description from ${schema}.linkedequipmentstop lk
        left join ${schema}.stoptype st on id = lk.idstop
        where idequipment = '${data.idequipment}'`;
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    }, { method: "POST" });

    app.api.register('unlinkScrapEquipment', async (data) => {
        let sql = `select * from ${schema}.scrapreason
        where id not in (
            select lk.idscrap from ${schema}.linkedequipmentscrap lk where lk.idequipment = '${data.idequipment}'
        )`;
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    }, { method: "POST" });

    app.api.register('linkScrapEquipment', async (data) => {
        let sql = `select lk.idequipment, lk.idscrap, st.description from ${schema}.linkedequipmentscrap lk
        left join ${schema}.scrapreason st on id = lk.idscrap
        where idequipment = '${data.idequipment}'`;
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    }, { method: "POST" });


    app.api.register('scrapReasonByEquipment', async (data) => {
        let sql = `select sc.* from ${schema}.scrapreason sc
        inner join ${schema}.linkedequipmentscrap lk on lk.idscrap = sc.id
        where lk.idequipment = '${data.idequipment}'`;
        
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    }, { method: "POST" });

    app.api.register('defectTypeByEquipment', async (data) => {
        let sql = `select df.* from ${schema}.defecttype df
        inner join ${schema}.linkedequipmentdefect lk on lk.iddefect = df.id
        where lk.idequipment = '${data.idequipment}'`;
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    }, { method: "POST" });

    app.api.register('stopReasonByEquipment', async (data) => {
        let sql = `select st.* from ${schema}.stopreason st
        inner join ${schema}.linkedequipmentstop lk on lk.idstop = st.id
        where lk.idequipment = '${data.idequipment}'
        order by st.description
      `;
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    }, { method: "POST" });

}

