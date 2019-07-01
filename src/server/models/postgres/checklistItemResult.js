exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('checklistitemresult', {
        idchecklist: {
            type: dataTypes.INTEGER,
            allowNull: false,
            required: true,
            primaryKey: true
        },
        idchecklistitem: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true,
            primaryKey: true
        },
        idordermes: {
            type: dataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            required: true
        },
        checked: {
            type: dataTypes.BOOLEAN,
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

        model.belongsTo(models.checklist, {
            foreignKey: 'idchecklist'
        });

        model.belongsTo(models.checklistitem, {
            foreignKey: 'idchecklistitem'
        });

        model.belongsTo(models.order, {
            foreignKey: 'idordermes'
        });
    };
    
    return model;
};