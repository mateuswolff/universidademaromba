exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('rework', {
        idreworkitem: {
            type: dataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        idreworktype: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
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

        model.belongsTo(models.reworkitem, {
            foreignKey: 'idreworkitem',
            sourcekey: 'id'
        });

        model.belongsTo(models.reworktype, {
            foreignKey: 'idreworktype',
            sourcekey: 'id'
        });
    };

    return model;
};