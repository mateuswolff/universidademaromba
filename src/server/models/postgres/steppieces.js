exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('steppieces', {
        idequipment: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
        },
        idordermes: {
            type: dataTypes.INTEGER,
            allowNull: false,
            required: true,
            primaryKey: true,
        },
        idlot: {
            type: dataTypes.BIGINT,
            allowNull: false,
            required: true,
            primaryKey: true,
        },
        piece: {
            type: dataTypes.INTEGER,
            allowNull: false,
            required: true,
            primaryKey: true,
        },
        idstep: {
            type: dataTypes.INTEGER,
            allowNull: false,
            required: true,
            primaryKey: true,
        },
        sequence: {
            type: dataTypes.INTEGER,
            allowNull: true,
        },
        dtinitial: {
            type: dataTypes.DATE,
            allowNull: true,
        },
        dtend: {
            type: dataTypes.DATE,
            allowNull: true,
        },
        text: {
            type: dataTypes.STRING(200),
            allowNull: true,
        },
        chkscrap: {
            type: dataTypes.BOOLEAN,
            defaultValue: false
        },
        ispacked: {
            type: dataTypes.BOOLEAN,
            defaultValue: false
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

        model.belongsTo(models.equipment, {
            foreignKey: 'idequipment',
            sourcekey: 'id'
        });

        model.belongsTo(models.order, {
            foreignKey: 'idordermes',
            sourcekey: 'idordermes'
        });

        model.belongsTo(models.lot, {
            foreignKey: 'idlot',
            sourcekey: 'id'
        });

        model.belongsTo(models.step, {
            foreignKey: 'idstep',
            sourcekey: 'id'
        });
    };

    return model;
};