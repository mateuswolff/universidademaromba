const config = require('../../config/sequelize.conf');
const CrudRequestController = require('../../controllers/crudRequestController');
const SpecificRequestController = require('../../controllers/specificRequestController');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {
    const sequelize = config.postgres.sequelize;
    // POST QUERY
    app.api.register('findTransportResourceByLocal', async (data) => {
        let sql = `select * from ${schema}."local" lc
        where lc.id
        not in (
            select trl.idlocal from ${schema}.transportresourcelocallink trl
                where trl.idtransportresource = '${data.idresource}');`

        return sequelize.query(sql).spread(async (result) => {
            return { data: result, success: true };
        });
    }, {method: "POST"});

    app.api.register('findAllTransportResourceLocalLink', async (data) => {
        let sql = `select trl.id, trl.idtransportresource, trl.idlocal, tr.description as transportresource, l.description as "local"
        from ${schema}.transportresourcelocallink trl 
            inner join ${schema}.transportresource tr on tr.id = trl.idtransportresource
            inner join ${schema}."local" l on l.id = trl.idlocal
        where trl.idtransportresource = '${data.idresource}';`

        return sequelize.query(sql).spread(async (result) => {
            return { data: result, success: true };
        });
    }, {method: "POST"});
}