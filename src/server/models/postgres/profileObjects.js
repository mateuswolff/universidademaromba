exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('profileobjects', {
        idcompany: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false
        },
        idform: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false
        },
        idobject: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false
        },
        idprofile: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false
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