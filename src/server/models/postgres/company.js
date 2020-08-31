exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('company', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: dataTypes.STRING,
            unique: true,
            allowNull: false,
            required: true
        },
        idtype: {
            type: dataTypes.STRING(1),
            allowNull: false,
            required: true
        },
        center: {
            type: dataTypes.STRING(200),
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

    model.associate =  (models) => {
        model.belongsToMany(models.area, {
            through: 'companyarea',
            foreignKey: 'idtesttype'
        });
    };
    return model;
};