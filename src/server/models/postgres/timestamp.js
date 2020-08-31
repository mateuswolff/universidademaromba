exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('timestamp', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        idequipment: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
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
        idmaterial: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        weight: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true
        },
        pieces: {
            type: dataTypes.INTEGER,
            allowNull: false,
            required: true
        },
        dtinitial: {
            type: dataTypes.DATE,
            allowNull: false,
            required: true
        },
        dtfinal: {
            type: dataTypes.DATE,
            allowNull: false,
            required: true
        },
        stdproductivity: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true
        },
        productivity: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true
        },
        t0: {
            type: dataTypes.FLOAT,
            allowNull: true
        },
        t1: {
            type: dataTypes.FLOAT,
            allowNull: true
        },
        t2: {
            type: dataTypes.FLOAT,
            allowNull: true
        },
        t3: {
            type: dataTypes.FLOAT,
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