exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('permission', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: dataTypes.STRING,
            allowNull: false,
            required: true
        },
        type: {
            type: dataTypes.STRING,
            allowNull: false,
            required: true
        },
        description: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        values: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        defvalue: {
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
    return model;
};[]