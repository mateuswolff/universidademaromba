exports.default = (sequelize, dataTypes) => {
    const Server = require('../../lib/Server'); 
    const schema = Server.App.i.config.sequelize.schema;

  const model = sequelize.define('oeestop', {
      id: {
          type: dataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      idstopreason: {
          type: dataTypes.STRING(200),
          allowNull: false,
          required: true
      },
      idstoptype: {
          type: dataTypes.STRING(200),
          allowNull: false,
          required: true
      },
      setup: {
          type: dataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
      },
      calendar: {
          type: dataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
      },
      iduser: {
          type: dataTypes.STRING(200),
          allowNull: false,
          required: true
      },
      status: {
          type: dataTypes.BOOLEAN,
          allowNull: true,
          defaultValue: true
      }
  },{
      createdAt: 'dtcreated',
      updatedAt :'dtupdated'
  }).schema(schema);
  return model;
};