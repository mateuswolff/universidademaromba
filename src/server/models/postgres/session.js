exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('session', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        login: {
            type: dataTypes.STRING,
            allowNull: false,
            required: true
        },
        key: {
            type: dataTypes.STRING,
            allowNull: false,
            required: true
        },
        permissions: {
            type: dataTypes.JSON,
            allowNull: true,
            required: false
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

    model.associate = (models) => {
        model.hasOne(models.permission, {
            foreignKeyConstraint: true,
            foreignKey: 'idpermission'
        })
    };

    return model;
};
[]