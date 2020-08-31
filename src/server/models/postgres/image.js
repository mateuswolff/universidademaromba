exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('image', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            required: true,
            unique: true,
            autoIncrement: true
        },
        idorder: {
            type: dataTypes.INTEGER,
            allowNull: false,
            required: true,
        },
        name: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true,
        },
        adress: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true,
        },
        iduser: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        status: {
            type: dataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true
        },
    },{
        createdAt: 'dtcreated',
        updatedAt :'dtupdated'
    }).schema(schema);
    return model;
};