exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('materialreceipt', {
        idlot: {
            type: dataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            required: true,
            unique: true
        },
        receivingdate: {
            type: dataTypes.DATE,
            allowNull: false,
            required: true
        },
        situation: {
            type: dataTypes.STRING(200), //"pending", "released"
            allowNull: false,
            required: true
        },
        idlocal: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        detet: {
            type: dataTypes.STRING(200), //"null", "approved", "disapproved"
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