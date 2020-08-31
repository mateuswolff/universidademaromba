exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('checklistitemlink', {
        idchecklist: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        idchecklistitem: {
            type: dataTypes.STRING(200),
            primaryKey: true,
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

        model.belongsTo(models.checklist, {
            foreignKey: 'idchecklist'
        });

        model.belongsTo(models.checklistitem, {
            foreignKey: 'idchecklistitem'
        });
    };
    
    return model;
};