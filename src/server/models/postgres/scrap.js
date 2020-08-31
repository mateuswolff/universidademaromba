exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('scrap', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        idlot: {
            type: dataTypes.BIGINT,
            allowNull: true,
        },
        idequipment: {
            type: dataTypes.STRING(200),
            allowNull: true,
        },
        idorder: {
            type: dataTypes.INTEGER,
            allowNull: true,
        },
        idscrapsequence: {
            type: dataTypes.INTEGER,
            allowNull: true,
        },
        idscrapreason: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true,
        },
        weight: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true,
        },
        quantity: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true,
        },
        idoperation: {
            type: dataTypes.STRING(200),
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