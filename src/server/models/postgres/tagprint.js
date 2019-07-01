exports.default = (sequelize, dataTypes) => {
    const Server = require('../../lib/Server');
    const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('tagprint', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        test: {
            type: dataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true
        },
        ip: {
            type: dataTypes.STRING(200),
            allowNull: true,
        },
        idlayout: {
            type: dataTypes.INTEGER,
            allowNull: true,
        },
        barqrcode: {
            type: dataTypes.STRING(200),
            allowNull: true,
        },
        client: {
            type: dataTypes.STRING(200),
            allowNull: true,
        },
        idlot: {
            type: dataTypes.BIGINT,
            allowNull: true,
        },
        qtdpieces: {
            type: dataTypes.INTEGER,
            allowNull: true,
        },
        weight: {
            type: dataTypes.FLOAT,
            allowNull: true,
        },
        idordermes: {
            type: dataTypes.INTEGER,
            allowNull: true,
        },
        idordersap: {
            type: dataTypes.STRING(200),
            allowNull: true,
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