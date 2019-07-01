exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('productivitymaterial', {
        idequipment: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
            required: true,
        },
        idmaterial: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
            required: true,
        },
        productivityvalue: {
            type: dataTypes.FLOAT,
            allowNull: true,
            required: true,
        },
        maxproductivity: {
            type: dataTypes.FLOAT,
            allowNull: true,
            required: false,
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