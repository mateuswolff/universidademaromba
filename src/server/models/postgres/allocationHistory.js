exports.default = (sequelize, dataTypes) => {
    const Server = require('../../lib/Server');
    const schema = Server.App.i.config.sequelize.schema;
    const model = sequelize.define('allocationshistory', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        idorder: {
            type: dataTypes.INTEGER,
            allowNull: false,
            required: true
        },
        idlot: {
            type: dataTypes.BIGINT,
            allowNull: false,
            required: true
        },
        idcallocation: {
            type: dataTypes.STRING,
            allowNull: false,
            required: true
        },
        iduser: {
            type: dataTypes.STRING,
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