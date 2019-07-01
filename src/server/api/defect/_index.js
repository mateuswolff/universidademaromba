const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // URL BASE
    const resourceBase = '/api/';

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;
    const { material } = config.postgres.DB;


    app.api.register('defectTypeByOrder', async (req, ctx) => {
        
        let data = req; 
        let sql = `
        select d.*, dt.description as "defect" 
        from ${schema}.defect d 
        inner join ${schema}.defecttype dt on (d.iddefecttype = dt.id)
        where d.idorder = ${data.idordermes}
        `;
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    });

}

