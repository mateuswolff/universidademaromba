exports.default = (sequelize, dataTypes) => {
    const Server = require('../../lib/Server');
    const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('layout', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        template: {
            type: dataTypes.TEXT,
            allowNull: false,
            required: true
        },
        width: {
            type: dataTypes.INTEGER,
            allowNull: false,
            required: true
        },
        height: {
            type: dataTypes.INTEGER,
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
    return model;
};