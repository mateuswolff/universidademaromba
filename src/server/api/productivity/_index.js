const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // URL BASE
    const resourceBase = '/api/';

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;
    const { material, productivitymaterial } = config.postgres.DB;
    const Op = Sequelize.Op;

    app.api.register('equipmentLink', async (req, ctx) => {
        
        let data = req;
        material.findAll({
            where: {
                description: {
                    [Op.iLike]: `%${data.description}%`
                }
            },
            raw: true,
            limit: 2
        }).then((results) => {
            return { data: results, success: true }
        });
    });


    app.api.register('unlinkedmaterial', async (req, ctx) => {
        
        let data = req;
        let sql = `select id, concat(TO_NUMBER(m.id, '999999999999999999'), ' - ', m.description) as value
                    from ${schema}.material m
                    where m.id ~*'${data.material}'
                    and id not in( 
                        select m.id
                        from ${schema}.material m
                        inner join ${schema}."productivitymaterial" pm on (m.id = pm."idmaterial")
                        where m.id ~*'${data.material}'
                        and pm."idequipment" = '${data.equipment}'
                    )`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })

    });

    app.api.register('productivityperequipment', async (req, ctx) => {
        
        let data = req;
        let sql = `select startdate::date as date, avg(VELOCITY) velocity
                    from ${schema}.stop s
                    where idequipment = '${data.idequipment}'
                    and startdate > now() - '7 day'::interval
                    group by startdate::date
                    order by 1`;
                    
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    });

    app.api.register('productivityMaterialEquipment', async (req, ctx) => {
        
        let idequipment = req.idequipment;
        let sql = `select m.id as id, concat(TO_NUMBER(m.id, '999999999999999999'), ' - ', m.description) as value, e.description as equipmentdescription, pm."productivityvalue", pm."maxproductivity"
                    from ${schema}."productivitymaterial" pm 
                        inner join ${schema}.material m on (m.id = pm."idmaterial")
                        inner join ${schema}.equipment e on (e.id = pm."idequipment")
                    where e.id = '${idequipment}'`;
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    });

    app.api.register('productivityMaterial', async (req, ctx) => {

        let data = req;
        let items = data;

        try {

            return sequelize.transaction(async (t) => {

                for (let i = 0; i < items.length; i++) {
                    
                    await productivitymaterial.create({
                        idequipment: items[i].idequipment,
                        idmaterial: items[i].idmaterial,
                        iduser: items[i].iduser
                    }, { transaction: t });

                }

            }).then((result) => {
                return { data: null, success: true }
            }).catch((err) => {
                return { data: null, success: false }
            });
        
        } catch (result) {
            console.log(result);
        }
    
    }, { method: "POST" });

    app.api.register('productivityMaterialDelete', async (req, ctx) => {

        let data = req;
        let items = data;

        try {

            return sequelize.transaction(async (t) => {

                for (let i = 0; i < items.length; i++) {
                    
                    await productivitymaterial.destroy({ 
                        where: {
                            idequipment: items[i].idequipment,
                            idmaterial: items[i].idmaterial,
                        }
                    }, { transaction: t });

                }

            }).then((result) => {
                return { data: null, success: true }
            }).catch((err) => {
                console.log(err)
                return { data: null, success: false }
            });
        
        } catch (result) {
            console.log(result);
        }
    
    }, { method: "POST" });

    app.api.register('productivityMaterialUpdate', async (req, ctx) => {

        let data = req;
        let items = data;

        try {

            return sequelize.transaction(async (t) => {

                for (let i = 0; i < items.length; i++) {
                    
                    await productivitymaterial.update(
                        { 
                            maxproductivity: items[i].maxproductivity,
                            productivityvalue: items[i].productivityvalue
                        }, {
                        where: {
                            idequipment: items[i].idequipment,
                            idmaterial: items[i].idmaterial,
                            status: true
                        },
                        transaction: t
                    });

                }

            }).then((result) => {
                return { data: null, success: true }
            }).catch((err) => {
                console.log(err)
                return { data: null, success: false }
            });
        
        } catch (result) {
            console.log(result);
        }
    
    }, { method: "POST" });

}