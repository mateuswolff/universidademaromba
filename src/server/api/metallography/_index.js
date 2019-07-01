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
    app.api.register('AllMetallography', async (req) => {
        let where = req;
        let sql = `SELECT 
        me."id",
        me."idorder",
        me."idlot",
        me."validation",
        me."dtcreated",
        me."iduser"
        from ${schema}."metallography" as me
        left JOIN ${schema}."order" od ON (od."idordermes" = me."idorder")
        where me."status" = true`;

        if (where.typeSituation == "P") {
            sql += ` and me."validation" is null`;
        } else {
            sql += ` and me."validation" is not null`;
        }

        if (where.idOp != null) {
            sql += ` and me."idorder" = '${where.idOp}'`;
        };

        if (where.idLot != null) {
            sql += ` and me."idlot" = '${where.idLot}'`;
        };

        if (where.situation != null) {
            sql += ` and me."validation" = '${where.situation}'`;
        };

        if (where.startDate != null) {
            if (where.endDate != null) {
                sql += ` and me."dtcreated" BETWEEN '${where.startDate} 00:00:00' and '${where.endDate} 23:59:59'`;
            }
        }

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })

    });

}