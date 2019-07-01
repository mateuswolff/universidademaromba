exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('norm', {
        id: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
            required: true
        },
        type: {
            type: dataTypes.STRING,
            allowNull: false,
            required: true
        },
        normtext: {
            type: dataTypes.TEXT,
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
        model.hasMany(models.normrule, {
            foreignKey: 'idnorm',
            foreignKeyConstraint: true,
            onDelete: 'cascade'
        });
    };
    return model;
};