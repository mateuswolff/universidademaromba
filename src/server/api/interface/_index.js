const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const util = require('../../controllers/util.js');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;

    //GET LOT SEQUENCE
    app.api.register('interfaceSequence', async (data) => {
        let sql = `select NEXTVAL('public.SEQ_INT')`;
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true };
        })

    }, { method: "POST" });

    // 
    app.api.register('AllInterface', async (req, ctx) => {
        
        let where = req;

        let sql = `SELECT 
            id, 
            idinterface, 
            idordermes, 
            "date", 
            idstatus, 
            messagestatus, 
            messageinterface, 
            iduser, 
            status, 
            dtcreated, 
            dtupdated,
            idordersap,
            idlot,
            idmaterial,
            weight
            from ${schema}."interface"
        where "status" = true`;

        if (where.idInterface != null) {
            sql += ` and "idinterface" = '${where.idInterface}'`;
        };

        if (where.idStatus != null) {
            sql += ` and "idstatus" = '${where.idStatus}'`;
        };

        if (where.startdate != null) {
            if (where.enddate != null) {
                sql += ` and "date" BETWEEN '${where.startdate} 00:00:00' and '${where.enddate} 23:59:59'`;
            }
        }

        if (where.idordermes != null) {
            sql += ` and "idordermes" = '${where.idordermes}'`;
        }

        if (where.idordersap != null) {
            sql += ` and "idordersap" like '%${where.idordersap}%'`;
        }

        if (where.idlot != null) {
            sql += ` and "idlot" = '${where.idlot}'`;
        }

        sql += ` order by id desc`;
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
        
    });


}