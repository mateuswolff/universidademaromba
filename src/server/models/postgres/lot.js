exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('lot', {
        id: {
            type: dataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            required: true,
            unique: true
        },
        situation: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        idmaterial: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        idlotsap: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        idlocal: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        quality: {
            type: dataTypes.STRING,
            allowNull: true,
            required: false
        },
        idrun: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        saleorder:{
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        saleorderitem: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        iduser: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        new: {
            type: dataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        idorderprod: {
            type: dataTypes.STRING(200),
            allowNull: true,
            defaultValue: ''
        },
        realweight: {
            type: dataTypes.FLOAT,
            allowNull: true,
        },
        thicknessbegin: {
            type: dataTypes.FLOAT,
            allowNull: true,
        },
        thicknessmiddle: {
            type: dataTypes.FLOAT,
            allowNull: true,
        },
        thicknessend: {
            type: dataTypes.FLOAT,
            allowNull: true,
        },
        reallength: {
            type: dataTypes.FLOAT,
            allowNull: true,
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
    model.associate = (models) => {
        model.hasOne(models.allocation, {
            foreignKey: 'idlot'
        });
    };
    return model;
};