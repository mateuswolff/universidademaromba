exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('dimensionalcontrolresult', {
        idorder: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            required: true
        },
        sequence: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            required: true
        },
        iddimensionalcontrolitem: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            required: true
        },
        idequipment: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        idlot: {
            type: dataTypes.BIGINT,
            allowNull: true,
            required: false
        },
        qtypieces: {
            type: dataTypes.INTEGER,
            allowNull: true,
            required: false
        },
        textvalue: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        booleanvalue: {
            type: dataTypes.BOOLEAN,
            allowNull: true,
            required: false
        },
        numbervalue: {
            type: dataTypes.FLOAT,
            allowNull: true,
            required: false
        },
        selectvalue: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        minvalue: {
            type: dataTypes.FLOAT,
            allowNull: true,
            required: false
        },
        maxvalue: {
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