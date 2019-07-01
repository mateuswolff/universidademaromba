const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {
    const sequelize = config.postgres.sequelize;

    app.api.register('getStandardPackage', async (data) => {
        // let sql = `select * from ${schema}.standardpackage 
        //             where thicknessmin < '${data.thickness}'
        //             and thicknessmax > '${data.thickness}' 
        //             and diametermin < '${data.diameter}' 
        //             and diametermax > '${data.diameter}'`;

        let sql = `select *
                    from 
                    ${schema}.standardpackage a
                    where
                            ${data.thickness} between thicknessmin and thicknessmax
                        and ${data.diameter} between diametermin and diametermax
                        and ${data.length} between lengthmin and lengthmax
                        and status = 'true'`
        return sequelize.query(sql).spread(async (result) => {
            return { data: result, success: true };
        });
    }, { method: "POST" });
}