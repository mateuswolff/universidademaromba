exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('pendencyrelease', {
        idpendency: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        disposaltypesequence: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        reporttext: {
            type: dataTypes.STRING(2000),
            allowNull: true,
            required: true
        },
        idequipment: {
            type: dataTypes.STRING(200),
            allowNull: true,
        },
        chkmd: {
            type: dataTypes.BOOLEAN,
            defaultValue: false
        },
        chkscrap: {
            type: dataTypes.BOOLEAN,
            defaultValue: false
        },
        idmaterialreclass: {
            type: dataTypes.STRING(200),
            allowNull: true,
        },
        idscrapreason: {
            type: dataTypes.STRING(200),
            allowNull: true,
        },
        situation: {
            type: dataTypes.STRING(1),
            allowNull: true,
        },
        date: {
            type: dataTypes.DATE,
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

    model.associate = (models) => {

        model.belongsTo(models.pendency, {
            foreignKey: 'idpendency',
            sourcekey: 'id'
        });

    };

    return model;
};