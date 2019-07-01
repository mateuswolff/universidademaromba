const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

//var solver = require("./src/solver");

exports.default = function (app) {

    // URL BASE
    const resourceBase = '/api/';

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;

    app.api.register('typesOfSteels', async (data) => {
        try {
            let sql = `select distinct textvalue as id 
                            from ${schema}.materialcharacteristic m 
                                where m.status = true 
                                and m.idcharacteristic = 'CG_ACO'`
            return sequelize.query(sql).spread((results, metadata) => {
                return { data: results, success: true };
            })
        } catch (error) {
            console.error(error);
            return { data: error, success: false };
        }

    }, { method: "POST" });


    app.api.register('technicalSheet', async (data) => {
        try {
            let sql = `select 
            concat(TO_NUMBER(m.id, '999999999999999999'), ' - ', m.description) as material,
            mt.description as "materialtype",  
            acom as steel, 
            diametrom1 as diameter, 
            larguram1 as width, 
            espessuram1 as thickness,
            comprimentom1 as length,
            terminacaom as edge
            from ${schema}.material m 
        left join ${schema}."materialtype" mt on (m."idmaterialtype" = mt.id)
        left join (
            SELECT * 
            FROM crosstab (
                            'select "idmaterial", "idcharacteristic", "numbervalue" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'',''CG_TERMINACAO'') ORDER BY 1,2',
                            'select distinct "idcharacteristic" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'',''CG_TERMINACAO'') ORDER BY 1'
                            ) 
                            AS result_test(materialm1 character varying(200), acom1 character varying(200), comprimentom1 REAL, diametrom1 REAL, espessuram1 REAL, grupomaterialm1 character varying(200),larguram1 REAL, terminacaom1 character varying(200))
                        ) as cm1 on (m.id = cm1.materialm1)
        left join (
            SELECT * 
            FROM crosstab (
                            'select "idmaterial", "idcharacteristic", "textvalue" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'',''CG_TERMINACAO'') ORDER BY 1,2',
                            'select distinct "idcharacteristic" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'',''CG_TERMINACAO'') ORDER BY 1'
                            ) 
                            AS result_test(materialm character varying(200), acom character varying(200), comprimentom character varying(200), diametrom character varying(200), espessuram character varying(200), grupomaterialm character varying(200),larguram character varying(200), terminacaom character varying(200))
                        ) as cm2 on (m.id = cm2.materialm)
       where m.id = '${data.idmaterial}'`;

            return sequelize.query(sql).spread((results, metadata) => {
                return { data: results, success: true };
            })
        } catch (error) {
            console.error(error);
            return { data: error, success: false };
        }

    }, { method: "POST" });

    app.api.register('getMaterialsByCharacteristics', async (steel, thickness, width) => {

        let sql = `select
                 ma.id
                ,concat(TO_NUMBER(ma.id, '999999999999999999'), ' - ', ma.description) as "description"
                ,ca."textvalue" as steel
                ,ce."numbervalue" as thickness
                ,cl."numbervalue" as width
            from ${schema}.material as ma
            inner join ${schema}."materialcharacteristic" ca
              on ca."idmaterial" = ma.id
            inner join ${schema}."materialcharacteristic" ce
               on ce."idmaterial" = ma.id
            inner join ${schema}."materialcharacteristic" cl
               on cl."idmaterial" = ma.id
            where 
                  ca."idcharacteristic" = 'CG_ACO' 
              and ca."textvalue"        = '${steel}'
              and ce."idcharacteristic" = 'CG_ESPESSURA' 
              and ce."numbervalue"      = ${thickness}
              and cl."idcharacteristic" = 'CG_LARGURA' 
              and cl."numbervalue"      < ${width}
              and ma.idmaterialtype = 'FI'
        `
        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        })
    }, { method: "POST" })

    app.api.register('calcBestYield', async (list, maxWidth) => {
        const solver = require("javascript-lp-solver");
        let variables = {};
        let ints = {};
        let constraints = {};

        for (let item of list) {
            variables[item.id] = {
                "width": item.width,
                "rend": (item.width * 100) / maxWidth
            }

            variables[item.id][item.id] = 1
            ints[item.id] = 1;

            constraints[item.id] = { "min": 1 };
        }

        constraints["width"] = { "max": maxWidth };

        let model = {
            "optimize": "rend",
            "opType": "max",
            "constraints": constraints,
            "variables": variables,
            "ints": ints
        }

        return solver.Solve(model);
    }, { method: "POST" });


    // MATERIAL SAME STEEL
    // app.express.express.get(resourceBase + 'materialSameSteel', async (req, res) => {
    app.api.register('materialSameSteel', async (data) => {

        let material = data.material;

        let sql = `
                    select m1.*, mc2."textvalue" 
                    from ${schema}.material m1
                        inner join ${schema}."materialcharacteristic" mc2 on (m1.id = mc2."idmaterial")
                    where
                        mc2."idcharacteristic" = 'CG_ACO'
                        and mc2."textvalue" = (
                                                select mc."textvalue" 
                                            from ${schema}.material m
                                            inner join ${schema}."materialcharacteristic" mc on (m.id = mc."idmaterial" )
                                            where
                                                mc."idcharacteristic" = 'CG_ACO'
                                                and m.id = '${material}'
                                    ) `;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }

        })
    }, { method: "POST" });

    // Material Lot
    app.api.register('materialLot', async (data) => {
        sql = `select
        concat(TO_NUMBER(MA.id, '999999999999999999'), ' - ', MA.description) as "material",
        comprimentom1 as "lengthm",
        diametrom1 as "diameterm",
        espessuram1 as "thicknessm",
        larguram1 as "widthm",
        acom as "steelm",
        grupomaterialm as "materialgroupm"
      from ${schema}.material MA
      left join ${schema}."lot" LO on (LO."idmaterial" = MA.id)
      left join (
          SELECT * 
          FROM crosstab(
      'select "idmaterial", "idcharacteristic", "numbervalue" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1,2',
      'select distinct "idcharacteristic" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1'
      ) 
        as result_test(materialm character varying(200), acom1 REAL, comprimentom1 REAL, diametrom1 REAL, espessuram1 REAL, grupomaterialm1 character varying(200),larguram1 REAL)
      ) as cm1 on (MA."id" = cm1.materialm)
      left join (
          SELECT * 
          FROM crosstab(
      'select "idmaterial", "idcharacteristic", "textvalue" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1,2',
      'select distinct "idcharacteristic" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1'
      ) 
        as result_test(materialm character varying(200), acom character varying(200), comprimentom character varying(200), diametrom character varying(200), espessuram character varying(200), grupomaterialm character varying(200),larguram character varying(200))
      ) as cm2 on (MA."id" = cm2.materialm)
      where 
      (MA.id = '${data.idlot}' or LO."id" = '${data.idlot}')
      and MA."status" = true`;

        return sequelize.query(sql).spread((results, metadata) => {
            return { data: results, success: true }
        });

    }, { method: "POST" });
}

