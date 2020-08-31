exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('cuttingplanhistory', {
        idcuttingplan: {
            type: dataTypes.INTEGER,
            allowNull: false,
            required: true,
            primaryKey: true,
        },
        idlotgenerated: {
            type: dataTypes.BIGINT,
            allowNull: false,
            required: true,
            primaryKey: true,
        },
        idlotconsumed: {
            type: dataTypes.BIGINT,
            allowNull: false,
            required: true,
        },
        idmaterial: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true,
        },
        quantity: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true,
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