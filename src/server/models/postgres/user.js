exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('user', {
        user: {
            type: dataTypes.STRING(10),
            primaryKey: true,
            allowNull: false,
            unique: true,
            required: true
        },
        code: {
            type: dataTypes.STRING(10),
            allowNull: false,
            required: true
        },
        name: {
            type: dataTypes.STRING,
            allowNull: false,
            required: true
        },
        email: {
            type: dataTypes.STRING,
            allowNull: true,
            required: false
        },
        area: {
            type: dataTypes.STRING,
            allowNull: true,
            required: false
        },
        situation: {
            type: dataTypes.STRING(1),
            allowNull: false,
            required: true
        },
        telephone: {
            type: dataTypes.STRING,
            allowNull: true,
            required: false
        },
        cellphone: {
            type: dataTypes.STRING,
            allowNull: true,
            required: false
        },
        groups:{
            type: dataTypes.STRING,
            allowNull: true,
            required: false
        },
    },{
        createdAt: 'dtcreated',
        updatedAt :'dtupdated'
    }).schema(schema);

    return model;
};