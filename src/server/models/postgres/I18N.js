exports.default = (sequelize, dataTypes) => {
      const Server = require('../../lib/Server'); 
      const schema = Server.App.i.config.sequelize.schema;

    const model = sequelize.define('i18n', {
        key: {
            type: dataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
            required: true,
            unique: true
        },
        locale: {
            type: dataTypes.STRING,
            allowNull: false,
            required: true
        },
        value: {
            type: dataTypes.STRING(200),
            allowNull: false,
            required: true
        },
        lastupdatedat: {
            type: dataTypes.BIGINT,
            allowNull: true,
            required: false
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