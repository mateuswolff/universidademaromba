exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('clientes', {
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
        rg: {
            type: dataTypes.STRING(100),
            allowNull: true,
            required: true
        },
        cpf: {
            type: dataTypes.STRING(100),
            allowNull: true,
            required: true
        },
        cep: {
            type: dataTypes.STRING(100),
            allowNull: true,
            required: true
        },
        logradouro: {
            type: dataTypes.STRING(255),
            allowNull: true,
            required: true
        },
        numero: {
            type: dataTypes.INTEGER,
            allowNull: true,
            required: true
        },
        complemento: {
            type: dataTypes.STRING(100),
            allowNull: true,
            required: true
        },
        bairro: {
            type: dataTypes.STRING(255),
            allowNull: true,
            required: true
        },
        cidade: {
            type: dataTypes.STRING(255),
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
        biometria: {
            type: dataTypes.STRING(255),
            allowNull: true,
            required: true
        }
    },{
        createdAt: 'dtcreated',
        updatedAt :'dtupdated'
    }).schema(schema);

    return model;
};