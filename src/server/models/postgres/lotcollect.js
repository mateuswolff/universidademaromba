exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('lotcollect', {
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
        idlot: {
            type: dataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            required: true
        },
        startdate: {
            type: dataTypes.DATE,
            allowNull: false,
            required: true
        },
        iduser: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        weight: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true
        },
        weightleft: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true
        },  
        weightpackaged: {
            type: dataTypes.FLOAT,
            allowNull: true,
            required: false
        },   
        weightcollected: {
            type: dataTypes.FLOAT,
            allowNull: true,
            required: false
        },   
        quantitycollected: {
            type: dataTypes.FLOAT,
            allowNull: true,
            required: false
        },  
        quantitypackaged: {
            type: dataTypes.FLOAT,
            allowNull: true,
            required: false
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