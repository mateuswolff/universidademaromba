exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('resource', {
        id: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
            required: true
        },
        idresourcetype: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true,
        },
        resourcestate: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        recorddate: {
            type: dataTypes.DATE,
            allowNull: false,
            required: true
        },
        dategauging: {
            type: dataTypes.DATE,
            allowNull: false,
            required: true
        },
        duedate: {
            type: dataTypes.DATE,
            allowNull: false,
            required: true
        },
        scrapdate: {
            type: dataTypes.DATE,
            allowNull: true,
            required: false
        },
        certified: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        model: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        local: {
            type: dataTypes.STRING(200),
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
        model.belongsTo(models.resourcetype, {
            foreignKey: 'idresourcetype'
        });
    };
    return model;
};