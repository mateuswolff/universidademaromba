const config = require('../../config/sequelize.conf');
const CrudRequestController = require('../../controllers/crudRequestController');
const SpecificRequestController = require('../../controllers/specificRequestController');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {
    const sequelize = config.postgres.sequelize;
    // POST QUERY
    app.api.register('findResourceTypeByEquipmemt', async (data) => {
        let sql = `select * from ${schema}.resourcetype rt 
            where rt.id 
                not in (
                        select rtl.idresourcetype 
                        from ${schema}.resourcetypeequipmentlink rtl 
                        where rtl.idequipment = '${data.idequipment}'
                        );`

        return sequelize.query(sql).spread(async (result) => {
            return { data: result, success: true };
        });
    }, { method: "POST" });

    app.api.register('findAllResourcetypeEquipmentLink', async (data) => {
        let sql = `select rtl.id, rtl.idequipment, rtl.idresourcetype, e.description as equipment, r.description as resourcetype
        from ${schema}.resourcetypeequipmentlink rtl 
            inner join ${schema}.equipment e on e.id = rtl.idequipment
            inner join ${schema}.resourcetype r on r.id = rtl.idresourcetype
        where rtl.idequipment = '${data.idequipment}';`

        return sequelize.query(sql).spread(async (result) => {
            return { data: result, success: true };
        });
    }, { method: "POST" });
}