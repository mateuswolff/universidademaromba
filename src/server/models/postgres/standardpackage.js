exports.default = (sequelize, dataTypes) => {
    const Server = require('../../lib/Server'); 
    const schema = Server.App.i.config.sequelize.schema;

  const model = sequelize.define('standardpackage', {
      id: {
          type: dataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      description: {
          type: dataTypes.STRING(200),
          allowNull: true,
          required: false
      },
      thicknessmin: {
          type: dataTypes.FLOAT,
          allowNull: false,
          required: true
      },
      thicknessmax: {
          type: dataTypes.FLOAT,
          allowNull: false,
          required: true
      },
      diametermin: {
          type: dataTypes.FLOAT,
          allowNull: false,
          required: true
      },
      diametermax: {
          type: dataTypes.FLOAT,
          allowNull: false,
          required: true
      },
      lengthmax: {
          type: dataTypes.FLOAT,
          allowNull: true,
          required: false
      },
      lengthmin: {
          type: dataTypes.FLOAT,
          allowNull: true,
          required: false
      },
      packagequantity: {
          type: dataTypes.INTEGER,
          allowNull: false,
          required: true
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