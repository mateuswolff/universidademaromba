exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('dimensionalcontrolitem', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        description: {
            type: dataTypes.STRING,
            allowNull: false,
            required: true
        },
        typevalue: {
            type: dataTypes.STRING(200),
            required: false,
            allowNull: true,
        },
        options: {
            type: dataTypes.STRING,
            required: false,
            allowNull: true
        },
        reference: {
            type: dataTypes.STRING,
            required: false,
            allowNull: true
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
    return model;
};