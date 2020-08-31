exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('collect', {
        idequipment: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false
        },
        idorder: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        startdate: {
            type: dataTypes.DATE,
            allowNull: false
        },
        enddate: {
            type: dataTypes.DATE,
            allowNull: false
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