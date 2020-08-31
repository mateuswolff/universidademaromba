exports.default = (sequelize, dataTypes) => {
    const Server = require('../../lib/Server');
    const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('approvalsequencinglots', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        idapprovalsequencing: {
            type: dataTypes.INTEGER,
            allowNull: false,
            required: true
        },
        idlot: {
            type: dataTypes.STRING(10),
            allowNull: true,
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