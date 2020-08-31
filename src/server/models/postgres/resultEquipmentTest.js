exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('resultequipmenttest', {
        idequipment: {
            type: dataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            required: true
        },
        idtesttype: {
            type: dataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            required: true
        },
        idorder: {
            type: dataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            required: true
        },
        result: {
            type: dataTypes.STRING(200),
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