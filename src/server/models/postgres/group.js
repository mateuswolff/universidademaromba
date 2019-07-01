exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('group', {
        id: {
            type: dataTypes.STRING(15),
            primaryKey: true,
            allowNull: false,
            unique: true,
            required: true
        },
        name: {
            type: dataTypes.STRING,
            unique: true,
            allowNull: false,
            required: true
        },
        description: {
            type: dataTypes.STRING,
            unique: true,
            allowNull: false,
            required: true
        },
        perms: {
            type: dataTypes.JSON,
            unique: false,
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