exports.default = (sequelize, dataTypes) => {
    const Server = require('../../lib/Server');
    const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('stoptype', {
        id: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
            unique: true,
            required: true
        },
        idstopreason: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        idstopoee: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
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
    }, {
            createdAt: 'dtcreated',
            updatedAt: 'dtupdated'
        }).schema(schema);
    model.associate = (models) => {
        model.hasMany(models.stop, {
            foreignKey: 'idstoptype'
        });
    };
    return model;
};