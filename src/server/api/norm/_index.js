const config = require('../../config/sequelize.conf');
const CrudRequestController = require('../../controllers/crudRequestController');
const SpecificRequestController = require('../../controllers/specificRequestController');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // URL BASE
    const resourceBase = '/api/';

    // MODEL INSTANCE
    const {
        norm,
        normrule,
        material,
        materialcharacteristic,
        equipment,
        controlplan
    } = config.postgres.DB;
    const sequelize = config.postgres.sequelize;

    // CRUD Controller INSTANCE
    const crudRequestController = new CrudRequestController.crudRequestController(norm);
    const specificRequestController = new SpecificRequestController.specificRequestController(norm, [normrule]);

    // POST QUERY
    app.api.register('createNorm', async (data) => {
        try {
            return specificRequestController.createAssociate(data).then((norm) => {
                return norm;
            }, (error) => {
                
                if (error.name == 'SequelizeUniqueConstraintError');
                    return {message: "Duplicate Record", success: false};
            });
        } catch (error) {
            console.error('err', error);
        }
    }, { method: "POST" });

    // POST QUERY
    app.api.register('getRulesByMaterial', async (data) => {
  
        // Ordem de Prioridade para Verificação da Norma
        // 1º Material
        // 2º CG_NORMA
        // 3º Equipamento

        /* Verifico se o Material tem vinculo */
        let resulta = await material.findAll({
            where: {
                id: data.idmaterial
            },
            raw: true
        });

        if (resulta.length && resulta[0].idcontrolplan !== null) {

            /* Verifico o IdNorm */
            let resultb = await controlplan.findAll({
                where: {
                    id: resulta[0].idcontrolplan
                },
                raw: true
            });
            
            /* Verifico as Normas */
            let resultc = await normrule.findAll({
                where: {
                    idnorm: resultb[0].idnorm
                },
                raw: true
            });

            return { data: resultc, success: true };

        } else { 

            /* Se Material Não Tiver Vinculo */
            /* Verifico a Norma do Material Caracteristica */
            let resultb = await materialcharacteristic.findAll({
                where: {
                    idmaterial: data.idmaterial,
                    idcharacteristic: 'CG_NORMA'
                },
                raw: true
            });

            if (resultb.length)  {

                /* Verifico as Normas */
                let resultc = await normrule.findAll({
                    where: {
                        idnorm: resultb[0].textvalue.trim()
                    },
                    raw: true
                });

                return { data: resultc, success: true };

            } else {

                /* Se não tiver a Norma no Material Caracteristica */
                /* Verifico se o Equipamento tem vinculo */
                let resultb = await equipment.findAll({
                    where: {
                        id: data.idequipment
                    },
                    raw: true
                });

                if (resultb[0].idcontrolplan !== null) {

                    /* Verifico o IdNorm */
                    let resultc = await controlplan.findAll({
                        where: {
                            id: resultb[0].datecontrolplan
                        },
                        raw: true
                    });
                    
                    /* Verifico as Normas */
                    let resultd = await normrule.findAll({
                        where: {
                            idnorm: resultc[0].idnorm
                        },
                        raw: true
                    });

                    return { data: resultd, success: true };
        
                } else { 

                    return { data: {}, success: true };

                }
  
            }

        }
            
    }, { method: "POST" });

    // PUT QUERY
    app.api.register('updateNorm', async (data) => {
        try {
            return specificRequestController.updateAssociate(data, normrule).then((norm) => {
                return norm;
            });
        } catch (error) {
            console.error('err', error);
        }
    });

    // Get Norm By Material
    app.api.register('getNormByMaterial', async (data) => {

        let idmaterial = data.idmaterial;
        
        sql = `
                select m.id as materialid, m.description as materialdescription, n.id as norm
                from 
                    ${schema}.material m
                    inner join ${schema}.controlplan c on (c.id = m.idcontrolplan)
                    inner join ${schema}.norm n on (c.idnorm = n.id)
                where
                    m.id = '${idmaterial}'`

        return await sequelize.query(sql).spread(async (results) => {
            return { data: results, success: true }
        });

 
    }, { method: "POST" });
}