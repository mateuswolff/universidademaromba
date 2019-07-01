exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('orderprodhistory', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        idordermes: {
            type: dataTypes.INTEGER,
            allowNull: false,
            required: true
        },
        idequipment: {
            type: dataTypes.STRING(200),
            required: true,
            allowNull: false
        }, 
        startdate: {
            type: dataTypes.DATE,
            allowNull: false,
            required: true
        },
        stopdate: {
            type: dataTypes.DATE,
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
