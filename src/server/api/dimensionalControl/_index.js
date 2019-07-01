const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // URL BASE
    const resourceBase = '/api/';

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;
    const { dimensionalcontrolitem, dimensionalcontrolresult } = config.postgres.DB;

    app.api.register('dimensionalcontrollink', async (data) => {
        let sql = `select 
                    dcl.idequipment as "idequipment", 
                    dci.id as "iddimensionalcontrolitem",
                    dci.description as "description"
                    from ${schema}.dimensionalcontrollink dcl 
                    inner join ${schema}.dimensionalcontrolitem dci on (dci."id" = dcl.iddimensionalcontrolitem)
                    where dcl.idequipment = '${data.idequipment}'`;
        return sequelize.query(sql).spread((results, metadata) => {
            return results;
        })
    }, { method: "POST" })

    app.api.register('saveDimensionalControl', async (data) => {
        return sequelize.transaction(async (t) => {
            try {
                for (let i = 0; i < data.itens.length; i++) {
                    let item = data.itens[i];
                    await dimensionalcontrolresult.create(item, { transaction: t });
                }
                return { status: true, message: 'success' };
            } catch (error) {
                return { status: false, message: error };
            }
        }).then((res) => {
            return { data: res.message, success: res.status };
        }).catch((err) => {
            return { data: err, success: false }
        });
    }, { method: "POST" })

    app.api.register('updateDimensionalControl', async (data) => {
        return sequelize.transaction(async (t) => {
            try {
                if (data.itens.length) {
                    let item = await dimensionalcontrolresult.destroy({
                        where: {
                            idorder: Number(data.itens[0].idorder),
                            sequence: Number(data.itens[0].sequence)
                            //idlot: Number(data.itens[0].idlot)
                        }
                    });

                    for (let i = 0; i < data.itens.length; i++) {
                        let item = data.itens[i];

                        await dimensionalcontrolresult.create(item, { transaction: t });
                    }
                    return { status: true, message: 'success' };
                } else {
                    return { status: true, message: 'Nothing to do' };
                }
            } catch (error) {
                return { status: false, message: error };
            }
        }).then((res) => {
            return { data: res.message, success: res.status };
        }).catch((err) => {
            return { data: err, success: false }
        });
    }, { method: "POST" })

    // RETURN COLUNS HEADER
    app.api.register('returnColunsHeader', async (req) => {
        let data = req;

        let sql = `
        -- select abaixo criado para gerar a coluna de número de peças
        select 0 as "iddimensionalcontrolitem", 'Number of Pieces' as "description", 'number' as "typevalue"

        union 

        (select distinct 
                CR.iddimensionalcontrolitem, CI.description, CI.typevalue
        from ${schema}.dimensionalcontrolresult CR, ${schema}.dimensionalcontrolitem CI
        where CI.id = CR.iddimensionalcontrolitem
        and CR.idorder = '${data.idorder}'
        order by CR.iddimensionalcontrolitem asc)`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true };
        });

    }, { method: "POST" });

    // RETURN COLUNS DATA
    app.api.register('returnColunsData', async (req) => {
        let data = req;

        let sql = `select   
        CR."sequence",
        CI."typevalue",
        CR."textvalue",
        CR."booleanvalue",
        CR."numbervalue",
        CR."selectvalue",
        CR."minvalue",
        CR."maxvalue",
        CR."qtypieces",
        CR."idorder",
        CR."idequipment",
        CR."idlot",
        CR."iddimensionalcontrolitem"
        from ${schema}.dimensionalcontrolresult CR, 
        ${schema}.dimensionalcontrolitem CI
        where CI.id = CR.iddimensionalcontrolitem
        and CR.idorder = '${data.idorder}'
        order by CR."sequence", CR."iddimensionalcontrolitem" asc`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });

    });

    // RETURN Hardness
    app.api.register('hardness', async (data) => {

        let sql = `select B.NUMBERVALUE
        from ${schema}.dimensionalcontrolitem A,
             ${schema}.dimensionalcontrolresult B
        where A.id = B.iddimensionalcontrolitem
          and upper(description) like '%DUREZA%'
          and IDLOT = '${data.idlot}'
        limit  1`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });
        
        /* Verifico o id da DUREZA */
/*
        let resulta = await dimensionalcontrolitem.findAll({
            where: {
                description: data.description
            },
            raw: true
        });

        if (resulta.length) {
            /* Verifico o Controle Dimensional */
/*
            let resultb = await dimensionalcontrolresult.findAll({
                where: {
                    iddimensionalcontrolitem: resulta[0].id,
                    idlot: data.idlot
                },
                raw: true
            });

            if (resultb.length) {
                return { data: resultb[0].numbervalue, success: true }
            } else {
                return { data: 0, success: true }
            }
        } else {
            return { data: 0, success: true }
        }
*/
    });
}