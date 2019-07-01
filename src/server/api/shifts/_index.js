const Sequelize = require('sequelize');
const CrudRequestController = require('../../controllers/crudRequestController');
const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // URL BASE
    const resourceBase = '/api/';

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;

    // MODEL INSTANCE
    const { shift } = config.postgres.DB;

    // RELATORIO RNC
    app.api.register('reportShifts', async (req, ctx) => {

        let where = req;

        let sql = `select 
                LG."idlot",
                LG."idorder",
                o.idordergroup as "group",
                o."sequence",
                o.saleorderitem,
                LG."idshift",
                LO."idmaterial",
                mc.textvalue as "steel",
                mce.numbervalue as "thickness",
                mcd.numbervalue as "diameter",
                mcl.numbervalue as "width",
                mccomp.numbervalue as "length",
                lp.numbervalue as "weight",
                lpc.numbervalue as "pieces",
                LO.idrun,
                LO.saleorder,
                LO.saleorderitem,
                LG."idequipment",
                LG."dtcreated"
                FROM ${schema}."lotgenerated" LG
                inner join ${schema}."lot" LO on (LO."id" = LG."idlot")
                inner join ${schema}."order" o on (o."idordermes" = LG.idorder)
                left join ${schema}.materialcharacteristic mc on mc.idcharacteristic = 'CG_ACO' and mc.idmaterial = LO.idmaterial 
                left join ${schema}.materialcharacteristic mce on mce.idcharacteristic = 'CG_ESPESSURA' and mce.idmaterial = LO.idmaterial 
                left join ${schema}.materialcharacteristic mcd on mcd.idcharacteristic = 'CG_DIAMETRO' and mcd.idmaterial = LO.idmaterial 
                left join ${schema}.materialcharacteristic mcl on mcl.idcharacteristic = 'CG_LARGURA' and mcl.idmaterial = LO.idmaterial 
                left join ${schema}.materialcharacteristic mccomp on mccomp.idcharacteristic = 'CG_COMPRIMENTO' and mccomp.idmaterial = LO.idmaterial 
                left join ${schema}.lotcharacteristic lp on lp."name" = 'CG_PESO_LIQUIDO' and lp.idlot = LO.id 
                left join ${schema}.lotcharacteristic lpc on lpc."name" = 'CG_QUANTIDADE' and lpc.idlot = LO.id 
                where LG."status" = true`;

        if ((where.startdate != null) && (where.enddate != null)) {
            sql += ` and LG."dtcreated" BETWEEN '${where.startdate} 00:00:00' and '${where.enddate} 23:59:59'`;
        }

        if (where.idequipment != null) {
            sql += ` and LG."idequipment" = '${where.idequipment}' `;
        }

        if (where.idshifts != null) {
            sql += ` and LG."idshift" in ('${where.idshifts}')`;
        }

        sql += ` order by LG."dtcreated" asc`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });

    });

    // GRAPHS SHIFTS
    app.api.register('graphsShifts', async (req, ctx) => {

        let where = req;

        let sql = `select SH."id", 
        COALESCE (( SELECT COUNT (*) FROM ${schema}."lotgenerated" LG where LG."idshift" = SH."id"`;

        if ((where.startdate != null) && (where.enddate != null)) {
            sql += ` and LG."dtcreated" BETWEEN '${where.startdate} 00:00:00' and '${where.enddate} 23:59:59'`;
        }

        if (where.idequipment != null) {
            sql += ` and LG."idequipment" = '${where.idequipment}' `;
        }

        sql += ` and LG."status" = true ), 0) as "cont" FROM ${schema}."shift" SH where SH."status" = true`;

        if (where.idshift != null) {
            sql += ` and SH."id" in ('${where.idshift}')`;
        }

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });

    });

    // LOGIN SHIFTS
    app.api.register('loginShifts', async (req, res) => {
        return shift.findAll({ where: { status: true } });
    }, { webpublic: true, method: "POST" })

    app.api.register('findMyShift', async (req, res) => {
        let sql = `select *
                    from ${schema}.shift 
                where 
                (cast(hourstart as time) < cast(NOW() as time) 
                and cast(hourfinish as time) > cast(NOW() as time)
                and cast(hourstart as time) < cast(hourfinish as time))
                and id <> 'ADM'
                union
                    select * 
                        from ${schema}.shift 
                        where 
                            (cast(hourstart as time) > cast(hourfinish as time) and
                            (
                                (cast(NOW() as time) > cast(hourstart as time) and cast(NOW() as time) < CAST('23:59:59' as TIME))  
                                or
                                (cast(NOW() as time) < cast(hourfinish as time) and cast(NOW() as time) > CAST('00:00:00' as TIME))
                            )
                )
                and id <> 'ADM'`;
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true };
        });
    }, { method: "POST" })

}