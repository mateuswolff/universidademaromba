exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('material', {
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
        situation: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        idmaterialtype: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        class: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        basicunit: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        idmeasureunit: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        idcharacteristic: {
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
        iduserplancontrol: {
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
    return model;
};