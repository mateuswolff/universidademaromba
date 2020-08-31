exports.default = (sequelize, dataTypes) => {
    const Server = require('../../lib/Server');
    const schema = Server.App.i.config.sequelize.schema;
    const model = sequelize.define('yieldapprover', {
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
        yield: {
            type: dataTypes.FLOAT,
            allowNull: true
        },
        usertext: {
            type: dataTypes.STRING(500),
            allowNull: false,
            required: true
        },
        userrequest: {
            type: dataTypes.STRING,
            allowNull: false,
            required: true
        },
        daterequested: {
            type: dataTypes.DATE,
            allowNull: false,
            required: true
        },
        approved: {
            type: dataTypes.BOOLEAN,
            allowNull: true
        },
        userapproval: {
            type: dataTypes.STRING,
            allowNull: true,
            required: false
        },
        textapproval: {
            type: dataTypes.STRING(500),
            allowNull: true,
        },
        dateapproval: {
            type: dataTypes.DATE,
            allowNull: true,
            required: false
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