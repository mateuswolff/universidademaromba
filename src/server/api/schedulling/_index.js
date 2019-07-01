const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;
const moment = require('moment');
moment().format();

exports.default = function (app) {

    // URL BASE
    const resourceBase = '/api/';

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;
    const { order, productionprogram, productionprogramitem, moverequest, company, allocation, interface, lot } = config.postgres.DB;
    const Op = Sequelize.Op;

    // ALLOCATED RAW MATERIAL
    app.api.register('changeEquipment', async (data, ctx) => {
        let orders = await order.findAll({
            where: {
                idequipmentscheduled: data.order.idequipmentscheduled,
                ordertype: 'PRODUCTION',
                orderstatus: {
                    [Op.ne]: 'FINISHED'
                }
            },
            raw: true
        });

        let sequence = orders.length ? Math.max.apply(Math, orders.map(function (o) {
            return o.sequence;
        })) + 1 : 1;

        data.sequence = sequence;

        let updted = await order.update(data.order, {
            where: {
                idordermes: data.order.idordermes
            }
        });

        if (updted[0] === 1) {
            return { data: updted, success: true };
        } else {
            return { data: "Equipment scheduled not updated", success: false };
        }
    })

    // Schedulling
    app.api.register('playSchedulling', async (data, ctx) => {
        return sequelize.transaction(async (t) => {

            /* Verifico os production program daquele equipamento */
            let pprogram = await productionprogram.findAll({
                where: {
                    equipment: data.equipment,
                    situation: {
                        [Op.ne]: 'H'
                    }
                },
                transaction: t,
                raw: true
            });

            let result = false;

            if (pprogram.length > 0) {

                /* Pego o index do C/N do array */
                let getCurrent = pprogram.findIndex(x => x.situation == "C");
                let getNew = pprogram.findIndex(x => x.situation == "N");

                if (getCurrent != -1) {

                    if (getNew != -1) {

                        /* Atualizar Situation dos Production Program Current */
                        await productionprogram.update({ situation: 'H' }, {
                            where: {
                                id: pprogram[getCurrent].id
                            },
                            transaction: t
                        });

                        /* Atualizar Situation dos Production Program New */
                        await productionprogram.update({ situation: 'C' }, {
                            where: {
                                id: pprogram[getNew].id
                            },
                            transaction: t
                        });

                    }

                    result = true;

                } else if (getNew != -1) {

                    /* Atualizar Situation dos Production Program New */
                    await productionprogram.update({ situation: 'C' }, {
                        where: {
                            id: pprogram[getNew].id
                        },
                        transaction: t
                    });

                    result = true;

                } else {

                    result = false;

                }

                if (result) {
                    /* Verifico o ID */
                    let id = getNew != -1 ? getNew : getCurrent;

                    /* Verifico os production program item do current atual */
                    let pprogramitems = await productionprogramitem.findAll({
                        where: {
                            idprogram: pprogram[id].id,
                            status: true,
                        },
                        transaction: t,
                        raw: true
                    });

                    await createInterface(pprogramitems, data.iduser);
                }

            }

            return { data: null, success: result }

        });

    });

    async function createInterface(op, iduser) {
        return sequelize.transaction(async (t) => {

            for (let i = 0; i < op.length; i++) {

                /* Verifico a OP */
                let getOp = await order.findAll({
                    where: {
                        idordermes: op[i].idorder,
                    },
                    transaction: t,
                    raw: true
                });

                if (getOp[0].orderstatus == 'PRODUCTION') {

                    sql = `select NEXTVAL('public.SEQ_INT')`;
                    let sequence = await sequelize.query(sql).spread(async (results) => {
                        return { data: results, success: true }
                    });

                    /* Verifico a company */
                    let getCompany = await company.findAll({
                        where: {
                            status: true,
                        },
                        transaction: t,
                        raw: true
                    });

                    let xml = `<?xml version="1.0" encoding="UTF-8"?>
                <CUTTINGPLAN>
                    <SEQUENCE>${sequence.data[0].nextval}</SEQUENCE>
                    <CENTER>${getCompany[0].center}</CENTER>
                    <ORDER>
                        <DUEDATE>${getOp[0].requestdate}</DUEDATE>
                        <OPERATION>A</OPERATION>`;
                    if (getOp[0].idordersap) {
                        xml += `
                        <ORDERPRODUCTION>${getOp[0].idordersap}</ORDERPRODUCTION>`;
                    }
                    xml += `
                        <WEIGHT>${parseInt((parseFloat(getOp[0].plannedorderquantity)) * 1000) / 1000}</WEIGHT>
                        <IDEQUIPMENTSCHEDULED>${getOp[0].idequipmentscheduled}</IDEQUIPMENTSCHEDULED>
                        <IDMATERIAL>${getOp[0].idmaterial}</IDMATERIAL>
                        <ORDERMES>${getOp[0].idordermes}</ORDERMES>
                    </ORDER>`;

                    /* Busco os Lots Alocados */
                    let getAllocation = await allocation.findAll({
                        where: {
                            idorder: op[i].idorder,
                            status: true
                        },
                        transaction: t,
                        raw: true
                    });

                    for (let x = 0; x < getAllocation.length; x++) {

                        /* Busca dados dos Lots Alocados */
                        let getLotInfo = await lot.findAll({
                            where: {
                                id: getAllocation[x].idlot,
                                status: true
                            },
                            transaction: t,
                            raw: true
                        });

                        xml += `<LOT>
                        <IDRAWMATERIAL>${getLotInfo[0].idmaterial}</IDRAWMATERIAL>
                        <IDLOT>${("0000000000" + getAllocation[x].idlot).slice(-10)}</IDLOT>
                        <LOTWEIGHT>${getAllocation[x].weight}</LOTWEIGHT>
                    </LOT>`;
                        //<LOTWEIGHT>${getOp[0].plannedorderquantity}</LOTWEIGHT>
                    }

                    xml += `</CUTTINGPLAN>`;

                    let statusinterface = await interface.findAll({
                        where: {
                            idordermes: getOp[0].idordermes,
                            idstatus: {
                                $notIn: ['OK', 'RSD']
                            }
                        },
                        transaction: t,
                        raw: true
                    });

                    let idstatus = statusinterface.length > 0 ? 'BLK' : 'NEW'

                    /* Gero a Interface */
                    await interface.create({
                        id: sequence.data[0].nextval,
                        idinterface: 'MS01',
                        date: new Date(),
                        idstatus: idstatus,
                        messageinterface: xml,
                        iduser: iduser,
                        idordermes: getOp[0].idordermes,
                        idordersap: getOp[0].idordersap ? getOp[0].idordersap : null
                    });

                }
            }

        });

    }

    app.api.register('deleteMoveRequest', async (data, ctx) => {

        let item = {};

        try {

            return sequelize.transaction(async (t) => {

                let iduser = ctx && ctx.login ? ctx.login : 'default_user';

                let sql = `
                            select 
                                a.idlot, a.weight, o.idordermes, o.idordersap, o.idmaterial, o.idequipmentscheduled 
                            from 
                                ${schema}.allocation a
                                inner join ${schema}."order" o on (a.idorder = o.idordermes)
                            where o.idordermes = ${data.idordermes}`

                let allocated = await sequelize.query(sql).spread(async (results) => {
                    return { data: results, success: true }
                });

                if (allocated.data.length) {
                    allocated = allocated.data;
                }
                else {
                    item = {
                        data: "Unallocated Lot!",
                        success: false
                    };
                    return item;
                }

                for (let i = 0; i < allocated.length; i++) {
                    await moverequest.destroy({
                        where: {
                            idlot: allocated[i].idlot,
                        }
                    }, { transaction: t });
                }

                await productionprogramitem.destroy({
                    where: {
                        idorder: data.idordermes,
                    }
                }, { transaction: t });

                item.success = true;
                item.data = null;

            }).then((result) => {
                return item
            }).catch((err) => {
                console.log(err)
                return { data: null, success: false }
            });

        } catch (result) {
        }

    }, { method: "POST" })

}