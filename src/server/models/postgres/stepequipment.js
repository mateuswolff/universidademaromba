exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('stepequipment', {
        idequipment: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
        },
        idstep: {
            type: dataTypes.INTEGER,
            allowNull: false,
            required: true,
            primaryKey: true,
        },
        sequence: {
            type: dataTypes.INTEGER,
            allowNull: false,
            required: true,
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

        model.belongsTo(models.step, {
            foreignKey: 'idstep',
            sourcekey: 'id'
        });
    };

    return model;
};