exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('order', {
        idordermes: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        idordersap: {
            type: dataTypes.STRING(200),
            allowNull: true,
            unique: true
        },
        idordergroup: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
            required: true
        },
        sequence: {
            type: dataTypes.INTEGER,
            allowNull: true,
            required: false
        },
        orderstatus: {
            type: dataTypes.STRING(200), // ('finished', 'production', 'in_process', 'paused'),
            allowNull: false,
            required: true
        },
        ordertype: {
            type: dataTypes.STRING(200), // ('planned', 'production'),
            allowNull: false,
            required: true
        },
        urgency: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        idclient: {
            type: dataTypes.STRING(200),
            allowNull: true,
            required: false
        },
        idmaterial: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        idrawmaterial: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        idorderplanned : {
            type: dataTypes.INTEGER,
            allowNull: true,
            required: false
        },
        plannedorderquantity: {
            type: dataTypes.FLOAT,
            allowNull: true            
        },
        ordersequence: {
            type: dataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        expectedquantity: {
            type: dataTypes.FLOAT,
            allowNull: true
        },
        saleorder: {
            type: dataTypes.STRING(200),
            allowNull: true
        },
        saleorderitem: {
            type: dataTypes.STRING(200),
            allowNull: true
        },
        requestdate: {
            type: dataTypes.DATEONLY,
            allowNull: true
        },
        idequipmentexpected: {
            type: dataTypes.STRING(200),
            allowNull: true
        }, 
        idequipmentscheduled: {
            type: dataTypes.STRING(200),
            allowNull: true
        },
        yield: {
            type: dataTypes.FLOAT,
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
