const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // URL BASE
    const resourceBase = '/api/';

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;

    // KPI Yield
    app.api.register('kpiYield', async (req) => {
        let where = req;

        sql = `select distinct 
            od."requestdate" as date, 
            COALESCE ((SELECT sum (oe."plannedorderquantity") FROM ${schema}."order" oe where oe."requestdate" = od."requestdate"), 0) as "sales", 
            COALESCE ((SELECT sum (sc."weight") FROM ${schema}."scrap" sc where TO_CHAR(sc."dtcreated" :: DATE, 'yyyymmdd') = TO_CHAR(od."requestdate" :: DATE, 'yyyymmdd')), 0) as "sales2" 
            from ${schema}."order" od where status = true`;

        if (where.idequipment != null) {
            sql += ` and od."idequipmentscheduled" = '${where.idequipment}' `;
        }

        if (where.startdate != null) {
            if (where.enddate == null) {
                sql += ` and od."requestdate" BETWEEN '${where.startdate} 00:00:00' and '${where.startdate} 23:59:59'`;
            } else {
                sql += ` and od."requestdate" BETWEEN '${where.startdate} 00:00:00' and '${where.enddate} 23:59:59'`;
            }
        }

        sql += ` order by od."requestdate" asc`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });

    });

    // OP
    app.api.register('weightOP', async (req) => {
        let where = req;

        sql = `select * 
            from ${schema}."order" od where od."status" = true`;

        if (where.idequipment != null) {
            sql += ` and od."idequipmentscheduled" = '${where.idequipment}' `;
        }

        if (where.startdate != null) {
            if (where.enddate == null) {
                sql += ` and od."requestdate" BETWEEN '${where.startdate} 00:00:00' and '${where.startdate} 23:59:59'`;
            } else {
                sql += ` and od."requestdate" BETWEEN '${where.startdate} 00:00:00' and '${where.enddate} 23:59:59'`;
            }
        }

        sql += ` order by od."requestdate" asc`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });

    });

    // Scrap
    app.api.register('weightScrap', async (req) => {
        let where = req;

        sql = `select * 
            from ${schema}."scrap" sc where status = true`;

        if (where.idequipment != null) {
            sql += ` and sc."idequipment" = '${where.idequipment}' `;
        }

        if (where.startdate != null) {
            if (where.enddate == null) {
                sql += ` and sc."dtcreated" BETWEEN '${where.startdate} 00:00:00' and '${where.startdate} 23:59:59'`;
            } else {
                sql += ` and sc."dtcreated" BETWEEN '${where.startdate} 00:00:00' and '${where.enddate} 23:59:59'`;
            }
        }

        sql += ` order by sc."dtcreated" asc`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });
    });
}