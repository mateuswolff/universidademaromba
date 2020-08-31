const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;

    // RELATORIO STOPS
    app.api.register('relatorioInadimplentes', async (req) => {



        let sql = ` select c.id, c.nome, c.celular, c.email, COUNT(p.statusparcela) parcelas
                    from public.clientes c
                        inner join planopagamento pp on (pp.idcliente = c.id)
                        inner join parcela p on (p.idplano = pp.id)
                    where 
                        p.statusparcela = 'ABERTA'
                    group by c.id
        `;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })

    });


    app.api.register('relatorioAdimplentes', async (req) => {



        let sql = ` select count(*) 
                    from (
                        select c.id, c.nome, c.celular, c.email
                        from public.clientes c
                            inner join planopagamento pp on (pp.idcliente = c.id)
                            inner join parcela p on (p.idplano = pp.id)
                        where 
                            p.statusparcela = 'ABERTA'
                        group by c.id) as co
        `;

        let adimplentes = await sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })

        sql = ` select count(*) 
                    from public.clientes
        `;

        let total = await sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })

        return {
            data:
                [{
                    quantidade: adimplentes.data[0].count,
                    status: "Adimplentes",
                    color: "#2f4f4f"
                },
                {
                    quantidade: (total.data[0].count - adimplentes.data[0].count).toString(),
                    status: "Inadimplentes",
                    color: "#00a0a0"
                }
                ]
           , success: true
    }

});

}