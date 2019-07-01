const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // URL BASE
    const resourceBase = '/api/';

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;
    const { checklistitemresult } = config.postgres.DB;

    app.api.register('linkedChecklistItem', async (req) => {
        let data = req;
        let sql = `	 
                    select cl.id as "idchecklist", e.id as "idequipment", e.description as equipment, cli.id as "checklistitem", cli.description as "checklistitemdescription", cli."typevalue"
                    from ${schema}.checklist cl 
                        inner join ${schema}."checklistitemlink" clil on (clil."idchecklist" = cl.id)
                        inner join ${schema}."checklistitem" cli on (cli.id = clil."idchecklistitem")
                        inner join ${schema}.equipment e on (e.id = cl."idequipment")
                    where e.id = '${data.equipment}'
                    `;
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    });


    app.api.register('unlinkedChecklistItem', async (req) => {
        let data = req;
        let sql = `	 
                    select * 
                    from ${schema}."checklistitem" cli 
                    where cli.id not in(
                                select cli.id
                                from ${schema}.checklist cl 
                                    inner join ${schema}."checklistitemlink" clil on (clil."idchecklist" = cl.id)
                                    inner join ${schema}."checklistitem" cli on (cli.id = clil."idchecklistitem")
                                    inner join ${schema}.equipment e on (e.id = cl."idequipment")
                                where e.id = '${data.equipment}'
            ) and cli.status = true `;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    });


    // CHECK LIST RESULT
    app.api.register('saveChecklistItemResult', async (req) => {
        let data = req;

        return sequelize.transaction(async (t) => {

            for (let i = 0; i < data.checklistitemresult.checklistItems.length; i++) {
                let clir = {
                    idchecklist: data.checklistitemresult.checklistItems[i].idchecklist,
                    idchecklistitem: data.checklistitemresult.checklistItems[i].checklistitem,
                    idordermes: parseInt(data.checklistitemresult.order),
                    iduser: "default-sistema"
                }
                await checklistitemresult.create(clir, {
                    transaction: t
                })
            }

        }).then((result) => {
            return { data: result, success: true }
        }).catch((err) => {
            return { data: err, success: false }
        });
    }, { method: "POST" });

    // UPDATE CHECK LIST RESULT
    app.api.register('updateChecklistItemResult', async (req) => {
        
        let data = req.updated;

        return sequelize.transaction(async (t) => {

            for (let i = 0; i < data.length; i++) {

                if (data[i].checked == 'true')
                    data[i].checked = true
                if (data[i].checked == 'false')
                    data[i].checked = false

                let clir = {
                    idchecklist: parseInt(data[i].idchecklist),
                    idchecklistitem: data[i].idchecklistitem,
                    idordermes: data[i].idordermes,
                }

                let numbervalue = null;
                let textvalue = null;

                if (data[i].hasOwnProperty('numbervalue') && data[i].numbervalue != "")
                    numbervalue = Number(data[i].numbervalue)

                if (data[i].hasOwnProperty('textvalue') && data[i].text != "")
                    textvalue = data[i].textvalue


                let clirData = {
                    checked: data[i].checked,
                    textvalue: textvalue,
                    numbervalue: numbervalue
                }

                await checklistitemresult.update(clirData, {
                    where: clir,
                    transaction: t
                })
            }

        }).then((result) => {
            return { data: result, success: true };
        }).catch((err) => {
            return { data: err, success: false };
        });
    }, { method: "POST" });
}

