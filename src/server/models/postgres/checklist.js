exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('checklist', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        idequipment: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        idreleaseteam: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        shift: {
            type: dataTypes.STRING(50),
            allowNull: true,
            required: false
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
    }, {
            createdAt: 'dtcreated',
            updatedAt: 'dtupdated'
        }).schema(schema);

    model.associate = (models) => {

        model.belongsTo(models.equipment, {
            foreignKey: 'idequipment'
        });

        model.belongsTo(models.releaseteam, {
            foreignKey: 'idreleaseteam'
        });
    };

    return model;
};