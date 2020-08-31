exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('eddycurrent', {
        idsequence: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        idequipment: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        idorder: {
            type: dataTypes.INTEGER,
            allowNull: false,
            required: true
        },
        date: {
            type: dataTypes.DATE,
            allowNull: false,
            required: true
        },
        velocity: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true
        },
        phase: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true
        },
        frequency: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true
        },
        sensitivity: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true
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