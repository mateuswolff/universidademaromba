exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('lotgenerated', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        idequipment: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
            required: true
        },
        idorder: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            required: true
        },
        idshift: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },  
        idoutputorder: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        idlot: {
            type: dataTypes.BIGINT,
            allowNull: false,
            required: true
        },
        lotconsumed1: {
            type: dataTypes.BIGINT,
            allowNull: true,
            required: false
        },
        lotweight1: {
            type: dataTypes.FLOAT,
            allowNull: true,
            required: false
        },
        lotconsumed2: {
            type: dataTypes.BIGINT,
            allowNull: true,
            required: false
        },
        lotweight2: {
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