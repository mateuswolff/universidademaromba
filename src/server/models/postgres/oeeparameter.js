exports.default = (sequelize, dataTypes) => {
    const Server = require('../../lib/Server'); 
    const schema = Server.App.i.config.sequelize.schema;

  const model = sequelize.define('oeeparameter', {
      idequipment: {
          type: dataTypes.STRING(200),
          primaryKey: true,
          autoIncrement: false
      },
      targett0: {
          type: dataTypes.FLOAT,
          allowNull: false,
          required: true
      },
      targett1: {
        type: dataTypes.FLOAT,
        allowNull: false,
        required: true
      },
      targett2: {
        type: dataTypes.FLOAT,
        allowNull: false,
        required: true
      },
      targett3: {
        type: dataTypes.FLOAT,
        allowNull: false,
        required: true
      },
      targetoee: {
        type: dataTypes.FLOAT,
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