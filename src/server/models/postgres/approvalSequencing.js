exports.default = (sequelize, dataTypes) => {
    const Server = require('../../lib/Server');
    const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('approvalsequencing', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        idorder: {
            type: dataTypes.INTEGER,
            allowNull: false,
            required: true
        },
        statusrequest: {
            type: dataTypes.STRING(10),
            allowNull: true,
            required: true
        },
        report: {
            type: dataTypes.STRING(500),
            allowNull: false,
            required: true
        },
        releasedate: {
            type: dataTypes.DATE,
            allowNull: false,
            required: true
        },
        iduserapprover: {
            type: dataTypes.STRING(200),
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
    return model;
};