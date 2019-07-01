const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {
  // MODEL INSTANCE
  const sequelize = config.postgres.sequelize;

  //GET MATRIX
  app.api.register('matrix', async (req) => {
    let sql = `select ms."idequipment", ms."idmaterialfrom", ms."idmaterialto", ms.time, ms."iduser",
    ms.status, ms."dtcreated", ms."dtupdated", e.description, 
    m1.description as "materialFROM", m2.description as "materialto"
    from ${schema}."matrixsetup" ms 
    inner join ${schema}.equipment e on ms."idequipment" = e.id inner join ${schema}.material m1 on 
    ms."idmaterialfrom" = m1.id inner join ${schema}.material m2 on 
    ms."idmaterialto" = m2.id;`;

    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true }
    })
  });
}