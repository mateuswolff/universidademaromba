exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('logdata', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            required: true,
            unique: true,
            autoIncrement: true
        },
        logkey: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true,
        },
        tablename: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true,
        },
        fieldname: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true,
        },
        olddata: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        newdata: {
            type: dataTypes.STRING(200),
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