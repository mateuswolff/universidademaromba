exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('reworkresult', {
        idlot: {
            type: dataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
        },
        idpendency: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        idreworktype: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        idreworkitem: {
            type: dataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        hourvalue: {
            type: dataTypes.STRING(50),
            allowNull: true,
        },
        textvalue: {
            type: dataTypes.STRING(200),
            allowNull: true,
        },
        numbervalue: {
            type: dataTypes.FLOAT,
            allowNull: true
        },
        idordermes: {
            type: dataTypes.INTEGER,
            allowNull: true,
            primaryKey: false
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

        model.belongsTo(models.lot, {
            foreignKey: 'idlot',
            sourcekey: 'id'
        });

        model.belongsTo(models.pendency, {
            foreignKey: 'idpendency',
            sourcekey: 'id'
        });

        model.belongsTo(models.reworktype, {
            foreignKey: 'idreworktype',
            sourcekey: 'id'
        });

        model.belongsTo(models.reworkitem, {
            foreignKey: 'idreworkitem',
            sourcekey: 'id'
        });
    };
    
    return model;
};