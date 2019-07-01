exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('ordercuttingplan', {
        idcuttingplan: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            required: true
        },
        idmaterial: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
            required: true
        },
        quantity: {
            type: dataTypes.INTEGER,
            allowNull: false
        },
        idordermes: {
            type: dataTypes.INTEGER,
            allowNull: true
        }
    },{
        createdAt: 'dtcreated',
        updatedAt :'dtupdated'
    }).schema(schema);
    model.associate = (models) => {
        model.belongsTo(models.coilcuttingplan, {
            foreignKey: 'idcuttingplan',
            onDelete: 'CASCADE'
        });
    };
    return model;
};