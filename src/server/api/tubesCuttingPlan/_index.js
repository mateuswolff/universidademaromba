const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;
    //const { tubescuttingplan } = config.postgres.DB;

    app.api.register('smallerMaterial', async (data) => {
        let sql = `
        select 
            m.id as id, 
            concat(TO_NUMBER(m.id, '999999999999999999'), ' - ', m.description) as value, 
            mc1.numbervalue as thickness, 
            mc2.numbervalue as diameter, 
            mc3.textvalue as steel, 
            mc4.numbervalue as length
        from ${schema}.material m
            inner join ${schema}.materialcharacteristic mc1 on (m.id = mc1.idmaterial and mc1.idcharacteristic = 'CG_ESPESSURA' and mc1.numbervalue = ${data.thickness})
            inner join ${schema}.materialcharacteristic mc2 on (m.id = mc2.idmaterial and mc2.idcharacteristic = 'CG_DIAMETRO' and mc2.numbervalue = ${data.diameter})
            inner join ${schema}.materialcharacteristic mc3 on (m.id = mc3.idmaterial and mc3.idcharacteristic = 'CG_ACO' and mc3.textvalue = '${data.steel}')
            inner join ${schema}.materialcharacteristic mc4 on (m.id = mc4.idmaterial and mc4.idcharacteristic = 'CG_COMPRIMENTO' and mc4.numbervalue < ${data.length})`
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });
    }, {method: "POST"});

    
}