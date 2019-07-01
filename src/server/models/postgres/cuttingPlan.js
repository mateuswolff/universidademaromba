exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('cuttingplan', {
        idorder: {
            type: dataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            required: true
        },
        idcuttingsequence: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            required: true
        },
        idsetup: {
            type: dataTypes.INTEGER,
            allowNull: false,
            required: true
        },
        idsequencesetup: {
            type: dataTypes.INTEGER,
            allowNull: false,
            required: true
        },
        weightsequencesetup: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true
        },
        lengthsequencesetup: {
            type: dataTypes.FLOAT,
            allowNull: true,
            required: false
        },
        widthsequencesetup: {
            type: dataTypes.FLOAT,
            allowNull: true,
            required: false
        },
        quantitypiece: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true
        },
        quantitypiecesecondary: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true
        },
        idsecondaryorder: {
            type: dataTypes.STRING,
            allowNull: false,
            required: true
        },
        weightsecondaryorder: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true
        },
        widthsecondaryorder: {
            type: dataTypes.FLOAT,
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
    },{
        createdAt: 'dtcreated',
        updatedAt :'dtupdated'
    }).schema(schema);
    return model;
};