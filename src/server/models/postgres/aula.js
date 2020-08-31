exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('aula', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        idusuario: {
            type: dataTypes.INTEGER,
            allowNull: true,
            required: false
        },
        modalidade: {
            type: dataTypes.STRING(100),
            allowNull: true,
            required: false
        },
        tipo: {
            type: dataTypes.STRING(100),
            allowNull: true,
            required: false
        },
        diasdasemana: {
            type: dataTypes.STRING(100),
            allowNull: true,
            required: false
        },
        inicio: {
            type: dataTypes.STRING(50),
            allowNull: true,
            required: false
        },
        fim: {
            type: dataTypes.STRING(50),
            allowNull: true,
            required: true
        },
        sala: {
            type: dataTypes.STRING(100),
            allowNull: true,
            required: false
        },
    },{
        createdAt: 'dtcreated',
        updatedAt :'dtupdated'
    }).schema(schema);

    return model;
};