exports.default = (sequelize, dataTypes) => {
    const Server = require('../../lib/Server');
    const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('productionprogramitem', {
        idprogram: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        sequence: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        idorder: {
            type: dataTypes.INTEGER,
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
    }, {
            createdAt: 'dtcreated',
            updatedAt: 'dtupdated'
        }).schema(schema);
    return model;
};