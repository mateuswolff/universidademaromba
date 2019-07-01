exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('materialtype', {
        id: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
            required: true,
            unique: true
        },
        description: {
            type: dataTypes.STRING,
            allowNull: false,
            required: true
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
        model.hasOne(models.material, {
            foreignKey: 'idmaterialtype'
        });
    };
    return model;
};