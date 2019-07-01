const config = require('../../config/sequelize.conf');

exports.default = function (app) {
    const { layout, tagprint } = config.postgres.DB;

    // SAVE PENDENCY AND PENDENCY RELEASES
    app.api.register('print', async (data) => {
        const net = require("net");
        const moment = require("moment");

        await tagprint.create({
                test: data.test ? data.test : false,
                ip: data.ip ? data.ip : null,
                idlayout: data.layout ? data.layout : null,
                barqrcode: data.barCodeAndQRCode ? data.barCodeAndQRCode : null,
                client: data.client ? data.client : null,
                idlot: data.idlot ? data.idlot : null,
                qtdpieces: data.qtdPieces ? data.qtdPieces : null,
                weight: data.netWeight ? data.netWeight : null,
                idordermes: data.idorder ? data.idorder : null,
                idordersap: data.order ? data.order : null,
                iduser: data.iduser,
                status: true
            });

        if (data.test) {
            let sock = net.connect(9100, data.ip, async () => {
                sock.on("data", (d) => {})

                sock.on('error', function (ex) {
                    return { message: ex, success: false };
                });

                sock.write(`PP24,260:AN7
                            PP 225,245
                            FT "Swiss 721 BT",11
                            PT "${data.name} - ${data.ip}"
                            PP 225,200
                            FT "Swiss 721 BT",11
                            PT "${data.description}"
                            PP 225,155
                            FT "Swiss 721 BT",11
                            PT "${moment().format('DD/MM/YYYY HH:mm')}"
                            LAYOUT RUN ""
                            PF
                            PRINT KEY OFF
                            `);

                await sock.end();
            });
            return { data: 'success', success: true };
        } else {
            let lt = await layout.findOne({
                where: { id: data.layout },
                raw: true
            });

            if (lt) {
                let sock = net.connect(9100, data.ip, async () => {
                    sock.on("data", (d) => {})

                    sock.on('error', function (ex) {
                        return { message: ex, success: false };
                    });

                    let ptr = lt.template.replace(/\${([^}]*?)}/g, (match, group, offset, string) => {
                        return group in data ? data[group] : match
                    });

                    let replaceUndefined = ptr.replace(/undefined/g, '-');
                    replaceUndefined = replaceUndefined.replace(/null/g, '-');
                    sock.write(replaceUndefined);

                    await sock.end();
                });
                return { data: 'success', success: true };
            } else {
                return { data: 'No print layout registered for this printer', success: true };
            };
        }
    }, { webpublic: true, method: "POST" });
}