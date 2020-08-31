exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('interface', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true
        },
        idinterface: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        idordermes: {
            type: dataTypes.INTEGER,
            allowNull: true
        },
        idordersap: {
            type: dataTypes.STRING(200),
            allowNull: true
        },
        idlot: {
            type: dataTypes.BIGINT,
            allowNull: true
        },
        weight: {
            type: dataTypes.FLOAT,
            allowNull: true
        },
        weightblocked: {
            type: dataTypes.FLOAT,
            allowNull: true
        },
        idmaterial: {
            type: dataTypes.STRING(200),
            allowNull: true
        },
        date: {
            type: dataTypes.DATEONLY,
            allowNull: true,
            required: false
        },
        idstatus: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        messagestatus: {
            type: dataTypes.TEXT,
            allowNull: true,
            required: false
        },
        messageinterface: {
            type: dataTypes.TEXT,
            allowNull: true,
            required: false
        },
        iduser: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        status: {
            type: dataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true
        },
    },{
        createdAt: 'dtcreated',
        updatedAt :'dtupdated'
    }).schema(schema);
    return model;
};