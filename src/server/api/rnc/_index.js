const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // URL BASE
    const resourceBase = '/api/';

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;

    // REPORTS RNC
    app.api.register('reportRNC', async (req, ctx) => {
        
        let where = req;

        let sql = `select * from (
            SELECT
            PE."id",
            PE."idorder",
            PE."idlot",
            PE."pendencydate",
		    PE."idpendencytype",
            PE."pendencystatus",
            PT."description",
            PR."chkmd",
            PR."chkscrap",
            LO."idmaterial", 
            LO."saleorder",
            LO."saleorderitem",
            MC1."numbervalue" as "material",
            MC2."textvalue" as "steel",
            MC3."numbervalue" as "thickness",
            MC4."numbervalue" as "diameter",
            MC5."numbervalue" as "width",
            MC6."numbervalue" as "length",
            MC7."numbervalue" as "weight",
            MC8."numbervalue" as "parts",
            
            COALESCE ((SELECT COUNT (*) FROM ${schema}."reworkresult" RR where RR."idpendency" = PE."id"), 0) as "reworkresult", 
           
            COALESCE ((SELECT COUNT (*) FROM ${schema}."pendency" PEQ
            inner join ${schema}."pendencytype" PTQ on (PTQ."id" = PEQ."idpendencytype")
            inner join ${schema}."disposaltype" DTQ on (DTQ."id" = PTQ."iddisposaltype")	
            inner join ${schema}."releaseteam"  RTQ on (RTQ."id" = DTQ."idreleaseteam")
            where PEQ."id" = PE."id" and RTQ."teamtype" = 'P'), 0) as "production", 
           
            COALESCE ((SELECT COUNT (*) FROM ${schema}."pendency" PEQ
            inner join ${schema}."pendencytype" PTQ on (PTQ."id" = PEQ."idpendencytype")
            inner join ${schema}."disposaltype" DTQ on (DTQ."id" = PTQ."iddisposaltype")	
            inner join ${schema}."releaseteam"  RTQ on (RTQ."id" = DTQ."idreleaseteam")
            where PEQ."id" = PE."id" and RTQ."teamtype" = 'Q'), 0) as "quality" 
           
            FROM ${schema}."pendency" PE
            inner join ${schema}."pendencyrelease" PR on (PR."idpendency" = PE."id")
            inner join ${schema}."pendencytype" PT on (PT."id" = PE."idpendencytype")
            inner join ${schema}."lot" LO on (LO."id" = PE."idlot")
            
            left join ${schema}."materialcharacteristic" MC1 on (MC1."idmaterial" = LO."idmaterial" and MC1."idcharacteristic" = 'CG_GRUPO_MAT')
            left join ${schema}."materialcharacteristic" MC2 on (MC2."idmaterial" = LO."idmaterial" and MC2."idcharacteristic" = 'CG_ACO')
            left join ${schema}."materialcharacteristic" MC3 on (MC3."idmaterial" = LO."idmaterial" and MC3."idcharacteristic" = 'CG_ESPESSURA')
            left join ${schema}."materialcharacteristic" MC4 on (MC4."idmaterial" = LO."idmaterial" and MC4."idcharacteristic" = 'CG_DIAMETRO')
            left join ${schema}."materialcharacteristic" MC5 on (MC5."idmaterial" = LO."idmaterial" and MC5."idcharacteristic" = 'CG_LARGURA')
            left join ${schema}."materialcharacteristic" MC6 on (MC6."idmaterial" = LO."idmaterial" and MC6."idcharacteristic" = 'CG_COMPRIMENTO')

            left join ${schema}."lotcharacteristic" MC7 on (MC7."idmaterial" = LO."idmaterial" and MC7."idlot"= LO."id" and MC7."name" = 'CG_PESO')
            left join ${schema}."lotcharacteristic" MC8 on (MC8."idmaterial" = LO."idmaterial" and MC8."idlot"= LO."id" and MC8."name" = 'CG_QUANTIDADE')

        where PE."idlot" > '0'`;

        if (where.pendencystatus != null) {
            sql += ` AND PE."pendencystatus" = '${where.pendencystatus}' `;
        }

        if (where.startdate != null) {
            if (where.enddate == null) {
                sql += ` AND PE."pendencydate" BETWEEN '${where.startdate} 00:00:00' and  '${where.startdate} 23:59:59'`;
            }
        }

        if (where.idshifts != null) {
            sql += ` AND PE."idshift" in ('${where.idshifts}')`;
        }

        sql += `) as tb`

        if (where.typeTeam === "P")  { sql += ` where tb."production" = '1'`; }
        
        if (where.typeTeam === "PQ") { sql += ` where tb."production" = '1' and tb."quality" = '1'`; }

        if (where.typeTeam === "Q")  { sql += ` where tb."quality" = '1'`; }

        if (where.typeTeam === "QP") { sql += ` where tb."quality" = '1' and tb."production" = '1'`; }

        return sequelize.query(sql).spread((results, metadata) => {
            return { message: results, success: true }
        });

    });

    // GRAPHS TYPE RNC 
    app.api.register('graphsRNC', async (req, ctx) => {
        
        let where = req;

        let sql = `select
            PT."id", 
            PT."description", 
        COALESCE ((select COUNT (*) from ${schema}."pendency" PE where PE."idpendencytype" = PT."id"`;

        if (where.startdate != null) {
            if (where.enddate == null) {
                sql += ` and PE."pendencydate" BETWEEN '${where.startdate} 00:00:00' and '${where.startdate} 23:59:59'`;
            }
        }

        if (where.idshifts != null) {
            sql += ` and PE."idshift" in ('${where.idshifts}')`;
        }

        if (where.pendencystatus != null) {
            sql += ` and PE."pendencystatus" = '${where.pendencystatus}' `;
        }

        sql += ` and PE."status" = true), 0) as cont from ${schema}."pendencytype" PT where PT."status" = true`;

        if (where.typeTeam === "P")  { sql += ` and PT."iddisposaltype" = 'Producao'`; }
        
        if (where.typeTeam === "PQ") { sql += ` and PT."iddisposaltype" = 'Prod/Qual'`; }

        if (where.typeTeam === "Q")  { sql += ` and PT."iddisposaltype" = 'Qualidade'`; }

        if (where.typeTeam === "QP") { sql += ` and PT."iddisposaltype" = 'Qual/Prod'`; }

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });

    });

    // GRAPHS TYPE SHIFTS 
    app.api.register('graphsRNCShifts', async (req, ctx) => {
        
        let where = req;

        let sql = `select SH."id", COALESCE (( SELECT COUNT (*) FROM ${schema}."pendency" PE where PE."idshift" = SH."id"`;

        if (where.pendencystatus != null) {
            sql += ` and PE."pendencystatus" = '${where.pendencystatus}' `;
        }

        if (where.startdate != null) {
            if (where.enddate == null) {
                sql += ` and PE."pendencydate" BETWEEN '${where.startdate} 00:00:00' and '${where.startdate} 23:59:59'`;
            } else {
                sql += ` and PE."pendencydate" BETWEEN '${where.startdate} 00:00:00' and '${where.enddate} 23:59:59'`;
            }
        }

        if (where.idequipment != null) {
            sql += ` and LG."idequipment" = '${where.idequipment}' `;
        }

        sql += ` and PE."status" = true ), 0) as "cont" FROM ${schema}."shift" SH where SH."status" = true`;

        if (where.idshifts != null) {
            sql += ` and SH."id" in ('${where.idshifts}')`;
        }

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });

    });

    // ALL SEARCH RNC
    app.express.express.get(resourceBase + 'allSearchRNC', async (req, res) => {
        
        let where = JSON.parse(req.query.where);

        let sql = `SELECT 
        PE."id",
        PE."idpendencytype",
        PE."pendencystatus",
        PE."pendencydate",
        PE."dtupdated",
        PE."iduser",
        PE."idlot",
        PT."description" as "pendencyType",
        MA."description" as "idMaterial",
        MC1."textvalue" as "steel",
        MC2."textvalue" as "thickness",
        MC3."textvalue" as "diameter",
        MC4."textvalue" as "width",
        MC5."textvalue" as "length",
        MC6."textvalue" as "parts",
        MC7."textvalue" as "weight",
        pr1.situation as "situation1",
        pr2.situation as "situation2",
        dt1.idreleaseteam as "releaseteam1",
        dt2.idreleaseteam as "releaseteam2",
        rt1.teamtype as "teamtype1",
        rt2.teamtype as "teamtype2"   
        
        from ${schema}."pendency" as PE 
        left join ${schema}."lot" LO on LO."id" = PE."idlot"
        left join ${schema}.material MA on MA."id" = LO.idmaterial
        left join ${schema}.pendencytype PT on PT.id = PE.idpendencytype
        left join ${schema}."materialcharacteristic" MC1 on (MC1."idmaterial" = LO."idmaterial" and MC1."idcharacteristic" = 'CG_ACO')
        left join ${schema}."materialcharacteristic" MC2 on (MC2."idmaterial" = LO."idmaterial" and MC2."idcharacteristic" = 'CG_ESPESSURA')
        left join ${schema}."materialcharacteristic" MC3 on (MC3."idmaterial" = LO."idmaterial" and MC3."idcharacteristic" = 'CG_DIAMETRO')
        left join ${schema}."materialcharacteristic" MC4 on (MC4."idmaterial" = LO."idmaterial" and MC4."idcharacteristic" = 'CG_LARGURA')
        left join ${schema}."materialcharacteristic" MC5 on (MC5."idmaterial" = LO."idmaterial" and MC5."idcharacteristic" = 'CG_COMPRIMENTO')
        left join ${schema}."lotcharacteristic" MC6 on (MC6."idlot" = LO."id" and MC6."name" = 'CG_QUANTIDADE')
        left join ${schema}."lotcharacteristic" MC7 on (MC7."idlot" = LO."id" and MC7."name" = 'CG_PESO_LIQUIDO')

        left join ${schema}.disposaltype dt1 on (dt1.id = PT.iddisposaltype and dt1.disposaltypesequence = 1)
        left join ${schema}.disposaltype dt2 on (dt2.id = PT.iddisposaltype and dt2.disposaltypesequence =2)
        left join ${schema}."pendencyrelease" pr1 on (PE.id = pr1.idpendency and pr1.disposaltypesequence = 1)
       	left join ${schema}."pendencyrelease" pr2 on (PE.id = pr2.idpendency and pr2.disposaltypesequence = 2)
       	left join ${schema}.releaseteam rt1 on ((dt1.idreleaseteam = rt1.id))
       	left join ${schema}.releaseteam rt2 on ((dt2.idreleaseteam = rt2.id))
        where PE."status" = true`;


        if(where.idRnc != null) {
            sql += ` and PE."id" = '${where.idRnc}'`;
        };

        if(where.idLot != null) {
            sql += ` and PE."idlot" = '${where.idLot}'`;
        };

        if(where.pendencyType != null) {
            sql += ` and PE."idpendencytype" = '${where.pendencyType}'`;
        };

        if(where.pendencyStatus != null) {
            sql += ` and PE."pendencystatus" = '${where.pendencyStatus}'`;
        };

        if (where.startdateRnc != null) {
            if (where.enddateRnc != null) {
                sql += ` and st."pendencydate" BETWEEN '${where.startdateRnc} 00:00:00' and '${where.enddateRnc} 23:59:59'`;
            }
        }

        if (where.enddateRelease != null) {
            if (where.startdateRelease != null) {
                sql += ` and st."releaseddate" BETWEEN '${where.enddateRelease} 00:00:00' and '${where.startdateRelease} 23:59:59'`;
            }
        }
        sequelize.query(sql).spread((results, metadata) => {
            res.api.send(results, 200);
        });

    });

}