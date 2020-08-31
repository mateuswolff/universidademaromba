exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('normrule', {
        idnorm: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
            required: true
        },
        rulesequence: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            required: true,
        },
        idvariable: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        idfield: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        startrange: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true
        },
        endrange: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true
        },
        mintolerance: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true
        },
        maxtolerance: {
            type: dataTypes.FLOAT,
            allowNull: false,
            required: true
        },
        idunit: {
            type: dataTypes.STRING(200),
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
    model.associate =  (models) => {
        model.belongsTo(models.norm, {
            foreignKeyConstraint: true,
            foreignKey: 'idnorm'
        });
    };
    return model;
};