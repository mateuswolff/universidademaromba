exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('coilcuttingplan', {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        idlot: {
            type: dataTypes.BIGINT,
            allowNull: false,
            required: true
        },
        idequipment: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        yield: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true
        },
        refile: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true
        },
        situation: {
            type: dataTypes.STRING(200), // pendent, released, in_process
            allowNull: true,
            required: false,
            defaultValue: 'P'
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