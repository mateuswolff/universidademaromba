const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // URL BASE
    const resourceBase = '/api/';

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;
    const { logdata } = config.postgres.DB;

    

    // Remove allocation that was not used
    app.api.register('findLogdata', async (data, res) => {

        return sequelize.transaction(async (t) => {

            let tablefilter = data.table == 'all' ? '' : `and tablename = '` + data.table + `'`;


            let sql = `
                        select * from ${schema}.logdata 
                        where 
                            dtcreated between '${data.startdate} ` + `00:00:00` + `' and '${data.enddate} ` + `23:59:59` + `'`
                            + tablefilter +
                            ` and logkey like '%${data.logkey}%'`;

            let result = await sequelize.query(sql).spread(async (results) => {
                return { data: results, success: true }
            });
            result = result.data;

            return result

        }).then((results) => {
            return { data: results, success: true }
        }).catch((err) => {
            return { data: false, success: false }
        });
    }, { method: "POST" });

}


