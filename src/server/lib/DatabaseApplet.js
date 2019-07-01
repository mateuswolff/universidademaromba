/* eslint-disable no-console,multiline-ternary */
const Sequelize = require("sequelize");
const Applet = require("./Applet");
const App = require("./Server")
const SequelizeConf = require('../config/sequelize.conf');
const fs = require('fs');
const path = require('path');
const paginate = require('../lib/PaginateApplet');

//const paginate = require('./Paginate');

/**
 * Use this class for all methods that manage databases connections, MySQL, PGSql, MongoDB etc..
 */
class DatabaseApplet extends Applet.Applet {
    /**
     * @param {App} app 
     */
    constructor(app) {
        super(app);
    }

    async init() {
        try {
            this.connectDatabases({
                sequelize_connect: {
                    host: this.app.config.sequelize.host,
                    port: this.app.config.sequelize.port,
                    user: this.app.config.sequelize.user,
                    pass: this.app.config.sequelize.pass,
                    name: this.app.config.sequelize.name,
                    dialect: this.app.config.sequelize.dialect,
                    charset: this.app.config.sequelize.charset,
                    logging: this.app.config.sequelize.logging,
                    force: this.app.config.sequelize.force,
                    alter: this.app.config.sequelize.alter,
                    enabled: this.app.config.sequelize.enabled,
                    configWith: this.app.config.sequelize.configWith,
                    schema: this.app.config.sequelize.schema
                }
            })
        } catch (e) {
            console.error(e);
            process.exit(1);
        }

    }

    /**
     * General database connection
     * Public method to connect all databases automatically
     * @param databases
     * @param logging
     */
    connectDatabases(databases, logging = true) {
        return new Promise((resolve) => {
            Object.keys(databases).forEach(database => {

                switch (databases[database].configWith) {

                    // Configure this DB with sequelize
                    case 'sequelize':

                        this.connectSQL(databases[database], () => {
                            console.log(logging ? `Connection Success [${database.toUpperCase()}]` : '');
                        });

                        break;

                    default:
                        throw Error('unknown database configuration agent.');
                }
            });
            setTimeout(resolve, 2000);
        });
    }

    /**
     *
     * @param databaseConfig
     * @returns {Promise}
     * @private
     */
    async _connectInSQLDialect(databaseConfig) {
        // Get config database dialect or use default
        const dialect = databaseConfig.dialect ? databaseConfig.dialect : this.DEFAULTS.DIALECT;

        // Get config logging or no use logs
        const logging = databaseConfig.logging;

        // Get config database charset or use default
        const charset = databaseConfig.charset ? databaseConfig.charset : this.DEFAULTS.CHARSET;
        
        // Get schema config
        const schema = databaseConfig.schema ? databaseConfig.schema : this.DEFAULTS.schema;

        // Get config database charset or use default
        const force = false;

        // Get config database charset or use default
        const alter = true;

        // Create dialect object
        SequelizeConf[dialect] = {
            sequelize: null,
            DB: []
        };

        // Inject paginate in sequelize Model
        Sequelize.Model.paginate = paginate.paginate.sequelize;

            // Create sequelize instance
            SequelizeConf[dialect].sequelize = new Sequelize(
                this._createSequelizeUri(dialect, databaseConfig), {
                    operatorsAliases: Sequelize.Op.Aliases,
                    charset: charset,
                    logging: logging,
                    timezone: "America/Sao_Paulo",
                    define: {
                        //prevent sequelize from pluralizing table names
                        freezeTableName: true,
                        schema: schema
                    }
                }
            );

            let models = fs.readdirSync(path.join(__dirname, '../models/' + dialect));
            for(let i = 0; i<models.length; i++) {
                let filename = models[i];

        // Define path for model script
        const modelPath = path.join(
            __dirname, '../models/', dialect, filename);

        // Create model with import
        const model = SequelizeConf[dialect].sequelize.import(modelPath);

        // Add model to list
        SequelizeConf[dialect].DB[model.name] = model;
    }

        // Associate models
        let associateModels = Object.keys(SequelizeConf[dialect].DB)
for (let i = 0; i < associateModels.length; i++) {
    let model = associateModels[i];
    if ('associate' in SequelizeConf[dialect].DB[model]) {
        SequelizeConf[dialect].DB[model].associate(SequelizeConf[dialect].DB);
    }
    //SequelizeConf[dialect].DB[model].associate(SequelizeConf[dialect].DB);
}

// Sync models to database
return SequelizeConf[dialect].sequelize.sync({
    force: false,
    logging: logging,
    alert: alter
});
    }

/**
 * Create a connection URI for sequelize with simple usage
 * @param driver
 * @param config
 * @returns {string}
 * @private
 */
_createSequelizeUri(driver, config) {
    return config.user.length ?
        `${driver}://${config.user}:${config.pass}@${config.host}:${config.port}/${config.name}` :
        `${driver}://${config.host}:${config.port}/${config.name}`;
}

/**
 * Public method to connect in many sql dialects, accept callback for success
 * @param databaseConfig
 * @param success
 */
connectSQL(databaseConfig, success) {
    if (databaseConfig.enabled)
        this._connectInSQLDialect(databaseConfig)
            .then((teste) => {
                return success();
            })
            .catch(err => {
                console.log('[SQL Error] \n\n\t' + err.message + '\n\tEXIT\n');
                process.exit(0);
            });
}
}

exports.DatabaseApplet = DatabaseApplet;