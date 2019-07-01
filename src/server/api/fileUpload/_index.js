const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const fs = require('fs');
const yamljs = require("yamljs");

const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    //yaml
    let f = process.env.NODE_ENV ? `config/${process.env.NODE_ENV}.yaml` : 'config/config-dev.yaml';
    const env = yamljs.load(f);

    let imgpath = env.storage.img

    // URL BASE
    const resourceBase = '/api/';

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;
    const { allocation, image, order } = config.postgres.DB;

    // Remove allocation that was not used
    app.api.register('saveImage', async (data, ctx) => {

        data = data.data;

        return sequelize.transaction(async (t) => {

            for (let i = 0; i < data.length; i++) {

                let imagecreated = await image.create({
                    idorder: data[i].order.idordermes,
                    name: data[i].order.idordermes + '-' + data[i].order.idordersap,
                    adress: data[i].order.idordermes + '-' + data[i].order.idordersap + '.' + data[i].extension,
                    iduser: ctx.login,
                }, {
                        raw: true,
                        transaction: t,
                    });

                await image.update({
                    name: data[i].order.idordermes + '-' + data[i].order.idordersap + '-' + imagecreated.id,
                    adress: data[i].order.idordermes + '-' + data[i].order.idordersap + '-' + imagecreated.id + '.' + data[i].extension,
                }, {
                        where: {
                            id: imagecreated.id
                        },
                        raw: true,
                        transaction: t
                    })

                let imgadress = imgpath + data[i].order.idordermes + '-' + data[i].order.idordersap + '-' + imagecreated.id + '.' + data[i].extension;

                let base64string = data[i].content

                fs.writeFile(imgadress, base64string, { encoding: 'base64' }, function (err) {
                    console.log(err)
                });

            }

        }).then((results) => {
            return { data: true, success: true }
        }).catch((err) => {
            return { data: false, success: false }
        });
    }, { method: "POST" });

}


