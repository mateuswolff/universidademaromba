exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('local', {
        id: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
            required: true,
            unique: true
        },
        description: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        idequipment: {
            type: dataTypes.STRING(200),
            allowNull: true,
        },
        idhangar: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true,
            references: {
                model: "hangars",
                key: "id"
            }
        },
        idarea: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        capacity: {
            type: dataTypes.FLOAT,
            allowNull: true,
            required: false
        },
        posx: {
            type: dataTypes.STRING,
            allowNull: false,
            required: true
        },
        posy: {
            type: dataTypes.STRING,
            allowNull: false,
            required: true
        },
        posz: {
            type: dataTypes.STRING,
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
        model.belongsTo(models.area, {
            foreignKey: 'idarea'
        });

        model.belongsTo(models.hangar, {
            foreignKey: 'idhangar'
        });

    };
    return model;
};