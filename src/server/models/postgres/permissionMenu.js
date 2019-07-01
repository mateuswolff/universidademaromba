exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('permissionmenu', {
        id: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
            unique: true,
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