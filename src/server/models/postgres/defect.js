exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('defect', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        idlot: {
            type: dataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            required: true
        },
        idorder: {
            type: dataTypes.INTEGER,
            allowNull: true,
            required: true            
        },
        iddefecttype: {
            type:  dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
            required: true,
        },
        weight: {
            type: dataTypes.FLOAT,
            allowNull: true,
            required: false
        },
        quantity: {
            type: dataTypes.FLOAT,
            allowNull: true,
            required: false
        },
        idoperation: {
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