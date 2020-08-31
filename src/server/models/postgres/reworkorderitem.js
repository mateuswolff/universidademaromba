
exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('reworkorderitem', {
         
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        idordersap: {
            type: dataTypes.STRING(200),
            allowNull: false,
        },
        idordermes: {
            type: dataTypes.INTEGER,
            allowNull: true,
        },
        operationnumber: {
            type: dataTypes.STRING(4),
            allowNull: true,
        },
        workcenter: {
            type: dataTypes.STRING(8),
            allowNull: true,
        },
        status: {
            type: dataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        iduser: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        }

    },{
        createdAt: 'dtcreated',
        updatedAt :'dtupdated'
    }).schema(schema);
    
    return model;
};