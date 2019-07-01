exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('moverequest', {
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
        idlot: {
            type: dataTypes.BIGINT,
            allowNull: false,
            required: true
        },
        idlocal: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        situationmovement: {
            type: dataTypes.STRING(20),
            allowNull: false,
            required: true
        },
        idtransportresource: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        momentdate: {
            type: dataTypes.DATE,
            allowNull: true,
            required: false
        },
        idmovimentuser: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        idexchangelot: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        exchangedate: {
            type: dataTypes.DATE,
            allowNull: true,
            required: false
        },
        idexchangeuser: {
            type: dataTypes.STRING(200),
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
    },{
        createdAt: 'dtcreated',
        updatedAt :'dtupdated'
    }).schema(schema);
    return model;
};