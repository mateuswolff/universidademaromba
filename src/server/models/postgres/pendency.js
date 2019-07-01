exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('pendency', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        idorder: {
            type: dataTypes.INTEGER,
            allowNull: true,
        },
        idlot: {
            type: dataTypes.BIGINT,
            allowNull: false,
            required: true
        },
        idpendencytype: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        pendencydate: {
            type: dataTypes.DATE,
            allowNull: true,
            required: false
        },
        idshift: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: false
        },  
        observationtext: {
            type: dataTypes.STRING(2000),
            allowNull: true,
            required: false
        },
        pendencystatus: {
            type: dataTypes.STRING,
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
    return model;
};