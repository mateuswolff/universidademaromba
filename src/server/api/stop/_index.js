const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;
    
    // RELATORIO STOPS
    app.api.register('reportStops', async (req, ctx) => {
        
        let where = req;

        let sql = ` SELECT 
            st.id, st."idequipment",
            st."idorder", 
            od."idordermes", 
            od."idmaterial",
            od."idrawmaterial",
            mtPro.description as materialproduct,
            mtCon.description as materialcons,
            st."stoptype", 	
            st."startdate",
            st."startdate" as starthour,  
            st."enddate",
            st."enddate" as endhour,
            (( date_PART('day', st."enddate"-st."startdate") * 24 + 
            date_PART('hour', st."enddate"-st."startdate")) * 60 +
            date_PART('minute', st."enddate"-st."startdate") ) as diffinmin,
            st."idstopreason", "stopreason".description as reasonsdescription, 
            st."idstoptype", "stoptype".description as typesdescription,
            st."quantityofparts", st.velocity, st.letter, st."iduser", st.status,
            pdc."observationtext", pdc."pendencystatus"
            from ${schema}."stop" as st
            left join ${schema}."stoptype" ON ("stoptype".id = st."idstoptype")
            left join ${schema}."stopreason" ON ("stopreason".id = st."idstopreason")
            left join ${schema}."order" od ON (od."idordermes" = st."idorder")
            left JOIN ${schema}."material" mtPro ON (mtPro.id = od."idmaterial")
            left JOIN ${schema}."material" mtCon ON (mtCon.id = od."idrawmaterial")
            left JOIN ${schema}."pendency" pdc ON (pdc."idorder" = od."idordermes")
        where st."status" = true`;

        if (where.idequipment != null) {
            sql += ` and st."idequipment" = '${where.idequipment}'`;
        };

        if (where.startdate != null) {
            if (where.enddate != null) {
                sql += ` and st."startdate" BETWEEN '${where.startdate} 00:00:00' and '${where.enddate} 23:59:59'`;
            }
        }

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })

    });

    // GRAPHS STOPS
    app.api.register('graphsStops', async (req, ctx) => {
            
        let where = req;

        let sql = `select 
            id,
            description,
            sum(diffinmin),
            count(diffinmin)
        from (
            select SR."id", SR."description",
                ((date_PART('day', ST."enddate"-ST."startdate") * 24 + 
                date_PART('hour', ST."enddate"-ST."startdate")) * 60 +
                date_PART('minute', ST."enddate"-ST."startdate")) as diffinmin
                from ${schema}."stopreason" SR 
                left join ${schema}."stop" ST ON (ST."idstopreason" = SR."id")
                where st."status" = true`; 

        if (where.idequipment != null) {
            sql += ` and ST."idequipment" = '${where.idequipment}' `;
        }
        
        if (where.startdate != null) {
            if (where.enddate != null) {
                sql += ` and st."startdate" BETWEEN '${where.startdate} 00:00:00' and '${where.enddate} 23:59:59'`;
            }
        }

        sql += `) as TB group by id, description`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });

    });

    // ALLOCATED RAW MATERIAL
    app.api.register('lastStopEquipment', async (req, ctx) => {
        
        let where = req;
            let sql = `select s.*, st.description as "stoptypedescription", sr.description as "stopreasondescription"
                        from ${schema}.stop s
                            left join ${schema}."stopreason" sr on (s."idstopreason" = sr.id)
                            left join ${schema}."stoptype" st on (s."idstoptype" = st.id) 
                    where s."idequipment" = '${where.idequipment}'
                    and s."startdate" <= NOW()
                    and s."enddate" IS NULL 
                    and s.stoptype = 'PERFORMED'
                    and s."status" = true`

            if(where.idorder){
                sql += ` and s."idorder" = '${where.idorder}'`
            }

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });
    });

    // ALLOCATED RAW MATERIAL
    app.api.register('allStopEquipment', async (req, ctx) => {
        

        let where = req;
        let sql = `select s.*, e.description as equipment, st.description as "stoptypedescription", sr.description as "stopreasondescription"
                    from ${schema}.stop s
                        left join ${schema}."stopreason" sr on (s."idstopreason" = sr.id)
                        left join ${schema}."stoptype" st on (s."idstoptype" = st.id) 
                        left join ${schema}.equipment e on e.id = s.idequipment
                   where s."idorder" = '${where.idorder}'
                   and s."status" = true;`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });
    });

    // Validate already exists for registered emergency
    app.api.register('countEmergency', async (req, ctx) => {
        
        let where = req;

        let sql = `SELECT * FROM ${schema}.stop
                where "idequipment" = '${where.idequipment}'
                and "startdate" >=  '${where.date}'
                and "stoptype" = 'PERFORMED'
                and "enddate" is not null;`

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });
    });

    // GET QUERY all stops in ranger 
    app.api.register('AllStops', async (req, ctx) => {
        
        let where = req;

        let sql = ` SELECT 
            st.id, st."idequipment",
            st."idorder", 
            od."idordermes", 
            od."idmaterial",
            od."idrawmaterial",
            mtPro.description as materialproduct,
            mtCon.description as materialcons,
            st."stoptype", 	
            st."startdate",
            st."startdate" as starthour,  
            st."enddate",
            st."enddate" as endhour,
            (( date_PART('day', st."enddate"-st."startdate") * 24 + 
            date_PART('hour', st."enddate"-st."startdate")) * 60 +
            date_PART('minute', st."enddate"-st."startdate") ) as diffinmin,
            st."idstopreason", "stopreason".description as reasonsdescription, 
            st."idstoptype", "stoptype".description as typesdescription,
            st."quantityofparts", st.velocity, st.letter, st."iduser", st.status,
            pdc."observationtext", pdc."pendencystatus"
            from ${schema}."stop" as st
            left join ${schema}."stoptype" ON ("stoptype".id = st."idstoptype")
            left join ${schema}."stopreason" ON ("stopreason".id = st."idstopreason")
            left join ${schema}."order" od ON (od."idordermes" = st."idorder")
            left JOIN ${schema}."material" mtPro ON (mtPro.id = od."idmaterial")
            left JOIN ${schema}."material" mtCon ON (mtCon.id = od."idrawmaterial")
            left JOIN ${schema}."pendency" pdc ON (pdc."idorder" = od."idordermes")
        where st."status" = true`;

        if (where.idStop != null) {
            sql += ` and st."id" = '${where.idStop}'`;
        };

        if (where.idOp != null) {
            sql += ` and st."idorder" = '${where.idOp}'`;
        };

        if (where.idEquipment != null) {
            sql += ` and st."idequipment" = '${where.idEquipment}'`;
        };

        if (where.startdate != null) {
            if (where.enddate != null) {
                sql += ` and st."dtcreated" BETWEEN '${where.startdate} 00:00:00' and '${where.enddate} 23:59:59'`;
            }
        }

        if (where.stopType != null) {
            sql += ` and st."stoptype" = '${where.stopType}'`;
        };

        if (where.idUser != null) {
            sql += ` and st."iduser" = '${where.idUser}'`;
        };

        sql += ` ORDER BY st."startdate"`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
        
    });

    // ROTA COLOQUEI AQUI POR FALTA DE TEMPO FAVOR CRIAR ARQUIVO DE MODEL
    // EXISTE TIPO DEFEITO PARA PODER DELETAR
    app.api.register('DefectInLot', async (req, ctx) => {
        
        let where = req;

        let sql = `
            SELECT "defecttype".id , "defecttype".description, "defecttype"."iduser", "defecttype".status,
            defects."idlot", defects."idorder", defects."iddefecttype", defects.status
            FROM ${schema}."defecttype" 
            inner join ${schema}.defects on ( "defecttype".id = defects."iddefecttype" ) 
            inner join ${schema}."lotgenerated" on ("lotgenerated"."idlot" =   defects."idlot" )
            WHERE `;

        sql += `   "defecttype".id  = '${where.id}' ;`

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    });

    app.api.register('getTotalStopsByType', async (equipment) => {
        let sql = `select 
               sum((date_PART('day', s."enddate" - s."startdate") * 24 + 
                    date_PART('hour', s."enddate" - s."startdate")) * 60 +
                    date_PART('minute', s."enddate" - s."startdate")) as minutes
              ,sr.description as reason
          from ${schema}.stop s
         inner join ${schema}."stopreason" sr
            on sr.id = s."idstopreason" 	   
         where 
               s."idequipment" = '${equipment}'
           and s."enddate"     > current_date - INTERVAL '2' day
         group by   
               sr.description`

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    }, { method: "POST" })


    //validando se a ordem pode ser finalizada
    app.api.register('canFinishOrder', async (idorder) => {
        let sql = `
                    select lc.lotweight - s.lotweight as "remainingweight"
                
                    from (
                            select sum(weight) as "lotweight"
                            from ${schema}.lotconsumed 
                            where idorder = ${idorder}
                        ) as lc,
                        (
                            select sum(weight) as "lotweight"
                            from ${schema}.scrap sc
                            where idorder = ${idorder}
                        ) as s`;
                            
        return sequelize.query(sql).spread((results, metadata) => {
          return { data: results, success: true };
        })
      }, { method: "POST" });
}