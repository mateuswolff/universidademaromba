exports.default = (sequelize, dataTypes) => {
    const Server = require('../../lib/Server');
    const schema = Server.App.i.config.sequelize.schema;
    const model = sequelize.define('allocation', {
        idorder: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            required: true
        },
        idlot: {
            type: dataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            required: true
        },
        iduser: {
            type: dataTypes.STRING,
            allowNull: false,
            required: true
        },
        standardmaterialidentifier: {
            type: dataTypes.BOOLEAN,
            allowNull: false
        },
        weight: {
            type: dataTypes.FLOAT,
            allowNull: true
        },
        pieces: {
            type: dataTypes.FLOAT,
            allowNull: true
        },
        specialinstruction: {
            type: dataTypes.STRING,
            allowNull: true
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