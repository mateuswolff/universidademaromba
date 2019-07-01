const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {
    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;


    // Eddy Current
    app.api.register('eddyCurrent', async (req) => {
        let where = req;

        let interval = where.interval;

        let sql = `SELECT ec."idsequence",
                ec."idequipment", 
                ec."idorder", 
                ec."date", 
                ec.velocity, 
                ec.phase, 
                ec.frequency, 
                ec.sensitivity, 
                ec."iduser",
                MC1."numbervalue" as diameter,
                MC2."numbervalue" as "thickness"
                FROM ${schema}."eddycurrent" ec 
                left join ${schema}."order" OD on (OD."idordermes" = ec."idorder")
                left join ${schema}."materialcharacteristic" MC1 on (MC1."idmaterial" = OD."idmaterial" and MC1."idcharacteristic" = 'CG_DIAMETRO')
                left join ${schema}."materialcharacteristic" MC2 on (MC2."idmaterial" = OD."idmaterial" and MC2."idcharacteristic" = 'CG_ESPESSURA')
                where ec.status = true
                `;
                
        if (where.idsequence != null) {
            sql += ` and ec."idsequence" = '${where.idsequence}'`;
        }

        if (interval != null && interval.begin && interval.end)
            sql += `and to_char(ec.dtcreated :: DATE, 'yyyymmdd') between '${interval.begin}' and  '${interval.end}'`

        if (where.idordermes != null) {
            sql += ` and OD."idordermes" = '${where.idordermes}'`;
        }

        if (where.idequipment != null && where.idequipment != "all") {
            sql += ` and ec."idequipment" = '${where.idequipment}'`;
        }

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });

    });
}