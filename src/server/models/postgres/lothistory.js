exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('lothistory', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            required: true,
            unique: true,
            autoIncrement: true
        },
        lot: {
            type: dataTypes.BIGINT,
            allowNull: false,
            required: true
        },
        field: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        valuebefore: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        valueafter: {
            type: dataTypes.STRING(200),
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