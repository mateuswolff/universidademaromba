exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('planopagamento', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        idcliente: {
            type: dataTypes.INTEGER,
            allowNull: false,
            required: true
        },
        tipoplano: {
            type: dataTypes.STRING(100),
            allowNull: false,
            required: true
        },
        dataadesao: {
            type: dataTypes.DATE,
            allowNull: true,
            required: false
        }
    },{
        createdAt: 'dtcreated',
        updatedAt :'dtupdated'
    }).schema(schema);

    return model;
};