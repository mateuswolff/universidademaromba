exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('equipment', {
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
        idtype: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        productivity: {
            type: dataTypes.FLOAT,
            allowNull: true
        },
        idarea: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        idhangar: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        idcontrolplan: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        datecontrolplan: {
            type: dataTypes.DATE,
            allowNull: true,
            required: false
        },
        idusercontrolplan: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        idprinter: {
            type: dataTypes.INTEGER,
            allowNull: true,
            required: false
        },
        productivity: {
            type: dataTypes.FLOAT,
            allowNull: true
        },
        yield: {
            type: dataTypes.FLOAT,
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
    },{
        createdAt: 'dtcreated',
        updatedAt :'dtupdated'
    }).schema(schema);
    model.associate = (models) => {
        model.belongsTo(models.equipmenttype, {
            foreignKey: 'idtype'
        });
    };
    return model;
};