exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('materialunitmeasure', {
        idmaterial: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            required: true
        },
        idmeasureunit: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
            required: true
        },
        valuedenominator: {
            type: dataTypes.FLOAT,
            allowNull: true,
            required: false
        },
        valuenumerator: {
            type: dataTypes.FLOAT,
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