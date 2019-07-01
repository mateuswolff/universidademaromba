exports.default = (sequelize, dataTypes) => {
    const Server = require('../../lib/Server'); 
    const schema = Server.App.i.config.sequelize.schema;

  const model = sequelize.define('print', {
      id: {
          type: dataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
      },
      name: {
          type: dataTypes.STRING(200),
          allowNull: false,
          required: true,
          unique: true
      },
      description: {
          type: dataTypes.STRING(200),
          allowNull: false,
          required: true
      },
      ip: {
          type: dataTypes.STRING(200),
          allowNull: false,
          required: true
      },
      idlayout: {
          type: dataTypes.INTEGER,
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