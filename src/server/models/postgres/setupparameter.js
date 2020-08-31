exports.default = (sequelize, dataTypes) => {
    const Server = require('../../lib/Server'); 
    const schema = Server.App.i.config.sequelize.schema;

  const model = sequelize.define('setupparameter', {
      id: {
          type: dataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          autoIncrement: true
      },
      idequipment: {
          type: dataTypes.STRING(200),
          require: true,
          unique: true,
          allowNull: false
      },
      targett1: {
        type: dataTypes.FLOAT,
        allowNull: true,
        required: false
      },
      targett2: {
        type: dataTypes.FLOAT,
        allowNull: true,
        required: false
      },
      targett3: {
        type: dataTypes.FLOAT,
        allowNull: true,
        required: false
      },
      targetoee: {
        type: dataTypes.FLOAT,
        allowNull: true,
        required: false
      },
      cgdiameter: {
        type: dataTypes.INTEGER,
        allowNull: false,
        required: true
      },
      cgnorm: {
        type: dataTypes.INTEGER,
        allowNull: false,
        required: true
      },
      cgthickness: {
        type: dataTypes.INTEGER,
        allowNull: false,
        required: true
      },
      cglength: {
        type: dataTypes.INTEGER,
        allowNull: false,
        required: true
      },
      cgsteel: {
        type: dataTypes.INTEGER,
        allowNull: false,
        required: true
      },
      cggrana: {
        type: dataTypes.INTEGER,
        allowNull: true,
        required: false
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