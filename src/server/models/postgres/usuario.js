exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('usuario', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        nome: {
            type: dataTypes.STRING(255),
            allowNull: false,
            required: true
        },
        datanascimento: {
            type: dataTypes.DATE,
            required: true
        },
        cpf: {
            type: dataTypes.STRING(100),
            allowNull: true,
            required: true
        },
        rg: {
            type: dataTypes.STRING(100),
            allowNull: true,
            required: true
        },
        telefone: {
            type: dataTypes.STRING(100),
            allowNull: true,
            required: false
        },
        celular: {
            type: dataTypes.STRING(100),
            allowNull: true,
            required: true
        },       
        email: {
            type: dataTypes.STRING(255),
            allowNull: true,
            required: true
        },
        senha: {
            type: dataTypes.STRING(100),
            allowNull: true,
            required: true
        },
        status: {
            type: dataTypes.BOOLEAN,
            allowNull: false,
            required: true
        },
        perfil: {
            type: dataTypes.STRING(100),
            allowNull: true,
            required: true
        },
    },{
        createdAt: 'dtcreated',
        updatedAt :'dtupdated'
    }).schema(schema);

    return model;
};