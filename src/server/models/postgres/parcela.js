exports.default = (sequelize, dataTypes) => {
    const Server = require('../../lib/Server');
    const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('parcela', {
        idplano: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        numeroparcela: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        datavencimento: {
            type: dataTypes.DATE,
            allowNull: false,
            required: true
        },
        valor: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true
        },
        datapagamento: {
            type: dataTypes.DATE,
            allowNull: true,
            required: false
        },
        statusparcela: {
            type: dataTypes.STRING(50),
            allowNull: false,
            required: true
        },
        formapagamento: {
            type: dataTypes.STRING(50),
            allowNull: false,
            required: true
        },
    }, {
        createdAt: 'dtcreated',
        updatedAt: 'dtupdated'
    }).schema(schema);

    return model;
};