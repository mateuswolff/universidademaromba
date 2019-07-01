exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('releaseteam', {
        id: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
        },
        description: {
            type: dataTypes.STRING,
            allowNull: false,
            required: true
        },
        teamtype: {
            type: dataTypes.STRING,
            required: true,
            allowNull: false,
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
        model.belongsToMany(models.user, {
            through: 'releaseteamuser',
            foreignKeyConstraint: true,
            foreignKey: 'idreleaseteam'
        });

        model.hasOne(models.disposaltype, {
            foreignKey: 'idreleaseteam'
        });
    };
    return model;
};