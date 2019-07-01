exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('materialcharacteristic', {
        idmaterial: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
            required: true
        },
        idcharacteristic: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
            required: true
        },
        description: {
            type: dataTypes.STRING,
            allowNull: true
        },
        textvalue: {
            type: dataTypes.STRING,
            allowNull: true
        },
        numbervalue: {
            type: dataTypes.FLOAT,
            allowNull: true
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