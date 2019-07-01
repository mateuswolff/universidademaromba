exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('pushmessage', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        icon: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        badge: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        body: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        delivered: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        to: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        from: {
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
};[]
