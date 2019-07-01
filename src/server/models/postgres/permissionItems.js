exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('permissionitems', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            unique: true,
            autoIncrement: true
        },
        idmenu: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        env: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        title: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        description: {
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
};[]