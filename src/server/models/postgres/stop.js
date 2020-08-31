exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('stop', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        idequipment: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
            required: true
        },
        idorder: {
            type: dataTypes.INTEGER,
            allowNull: true,
            required: false
        },
        stoptype: {
            type: dataTypes.STRING(200), //'PLANNED', 'PERFORMED'
            allowNull: false,
            required: true
        },
        startdate: {
            type: dataTypes.DATE,
            allowNull: false,
            required: true
        },
        enddate: {
            type: dataTypes.DATE,
            allowNull: true,
            required: false
        },
        idstopreason: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        idstoptype: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        quantityofparts: {
            type: dataTypes.FLOAT,
            allowNull: true,
            required: false
        },
        velocity: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true
        },
        letter: {
            type: dataTypes.STRING(20),
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
        model.belongsTo(models.stopreason, {
            foreignKey: 'idstopreason'
        });

        // model.belongsTo(models.stoptype, {
        //     foreignKey: 'idstoptype'
        // });
    };
    return model;
};