exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('stopreason', {
        id: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
            unique: true,
            required: true
        },
        description: {
            type: dataTypes.STRING,
            allowNull: false,
            required: true
        },
        oeecategory: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        tuc: {
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
    model.associate = (models) => {
        model.hasOne(models.stop, {
            foreignKey: 'idstopreason'
        });
    };
    return model;
};