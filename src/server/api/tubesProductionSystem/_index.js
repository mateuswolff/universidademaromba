const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

  // URL BASE
  const resourceBase = '/api/';

  // MODEL INSTANCE
  const sequelize = config.postgres.sequelize;

  // Tubes Production System
  app.api.register('tubesProductionSystem', async (req, ctx) => {

    let where = req;

    let sql = `SELECT 
        OD."idordermes",
        OD."sequence",
        OD."orderstatus",
        OD."requestdate",
        OD."plannedorderquantity",
        OD."expectedquantity",
        MA."description" as descriptionMaterial,
        MC1."textvalue" as "steel",
        MC2."numbervalue" as "thickness",
        MC3."numbervalue" as "diameter"
        from ${schema}."order" OD
        inner join ${schema}.productionprogramitem PPI on (PPI.idorder = OD.idordermes)
        inner join ${schema}.productionprogram PP on (PPI.idprogram = PP.id and PP.situation = 'C')
        left join ${schema}."material" MA on (MA."id" = OD."idmaterial")
        left join ${schema}."materialcharacteristic" MC1 on (MC1."idmaterial" = OD."idrawmaterial" and MC1."idcharacteristic" = 'CG_ACO')
        left join ${schema}."materialcharacteristic" MC2 on (MC2."idmaterial" = OD."idrawmaterial" and MC2."idcharacteristic" = 'CG_ESPESSURA')
        left join ${schema}."materialcharacteristic" MC3 on (MC3."idmaterial" = OD."idrawmaterial" and MC3."idcharacteristic" = 'CG_DIAMETRO')
        where OD."idequipmentscheduled" = '${where.idequipment}'
        and OD."idequipmentscheduled" = PP.equipment
        and OD."sequence" is not null
        and OD."status" = true
        --and OD.sequence > 0
        and (
        	OD."orderstatus" <> 'FINISHED' 
        	)
        order by OD."sequence" asc`;

    return sequelize.query(sql).spread(async (results, metadata) => {
      let result = await generateSituationColor(results);
      return { data: result, success: true }
    });

  });

  async function generateSituationColor(items) {
    for (let order of items) {
      await new Promise((resolve, reject) => {
        let sql = `select
              MR.id as idinmove,
              AL.idlot as idinallocation,
              MR."situationmovement" as situation -- count(MR."situationmovement")
              FROM ${schema}.allocation AL
              left join ${schema}."moverequest" MR on (MR."idlot" = AL."idlot" and MR."status" = true)
              where AL."idorder" = '${order.idordermes}'`
        sequelize.query(sql).spread((item, metadata) => {
          if (item.length) {

            //let released = item.filter(elem => elem.situation === "R").length;
            let pedding = item.filter(elem => elem.situation === "P").length;
            let in_front_off = item.filter(elem => elem.situation === "E").length;
            //let working = item.filter(elem => elem.situation === "T").length;
            let notMovimented = item.filter(elem => elem.situation === null && elem.idinmove === null).length;
            //let allocated = item.filter(elem => elem.idinmove === null).length;
            let total = item.length;

            if (notMovimented === total || pedding === total) {
              order.statusallocation = 'red';
            } else if (pedding) {
              //} else if (released === total || in_front_off === total || working === total) {
              order.statusallocation = 'yellow';
            } else if (in_front_off) {
              order.statusallocation = 'green';
            } else {
              order.statusallocation = 'red';
            }

          } else {
            order.statusallocation = 'black';
          }
          resolve(null);
        });
      });

    }
    return items;
  }

  app.api.register('orderNorm', async (req, ctx) => {

    let where = req;

    let sql = `select cp.description
               from ${schema}."order" o
                  inner join ${schema}.material mc on (o.idmaterial = mc.id)
                  inner join ${schema}.controlplan cp on (cp.id = mc.idcontrolplan)
               where o.idordermes = '${where.idordermes}'
               union
               select cp.description
               from ${schema}."order" o
                   inner join ${schema}.materialcharacteristic mc on (o.idmaterial = mc.idmaterial and mc.idcharacteristic = 'CG_NORMA')
                   inner join ${schema}.controlplan cp on (cp.idnorm = mc.textvalue)
               where o.idordermes = '${where.idordermes}'`;
    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true }
    });

  });

  // Tubes Production System
  app.api.register('tubesLotSystem', async (req, ctx) => {

    let where = req;

    let sql = `SELECT DISTINCT
                    AL."idorder",
                    AL."idlot",
                    concat(TO_NUMBER(MA.id, '999999999999999999'), ' - ', MA."description") as descriptionMaterial,
                    MR."situationmovement",
                    MC1."textvalue" as "steel",
                    MC2."numbervalue" as "thickness",
                    MC3."numbervalue" as "width",
                    MC4."numbervalue" as "diameter",
                    LO."situation",
                    LO."idmaterial",
                    LO."idlocal",
                    case 
                    	when LC.originalweight is null then LO1.numbervalue
                    	when LC.originalweight = 0 then LO1.numbervalue
                    	else LC.originalweight
                    end as "plannedorderquantity", 
                    LO2."numbervalue" as "expectedquantity",
                    O."idmaterial" as "idmaterialproduced",
                    concat(TO_NUMBER(M.id, '999999999999999999'), ' - ', M.description) as "materialproduced",
                    SI.description as "specialinstruction"
                    FROM ${schema}.allocation AL
                    inner join ${schema}."order" O on (AL.idorder = O.idordermes)
                    inner join ${schema}."material" M on (O.idmaterial = M.id)
                    left join ${schema}.lotconsumed LC on (LC.idlot = AL.idlot)
                    left join ${schema}.specialinstruction SI on (SI.idorder = O.idordermes)
                    left join ${schema}."moverequest" MR on (MR."idlot" = AL."idlot" and MR."status" = true and MR."idequipment" = O."idequipmentscheduled")
                    inner join ${schema}."lot" LO on (LO."id" = AL."idlot" and LO.situation not in ('F'))
                    left join ${schema}."material" MA on (MA."id" = LO."idmaterial")
                    left join ${schema}."materialcharacteristic" MC1 on (MC1."idmaterial" = LO."idmaterial" and MC1."idcharacteristic" = 'CG_ACO')
                    left join ${schema}."materialcharacteristic" MC2 on (MC2."idmaterial" = LO."idmaterial" and MC2."idcharacteristic" = 'CG_ESPESSURA')
                    left join ${schema}."materialcharacteristic" MC3 on (MC3."idmaterial" = LO."idmaterial" and MC3."idcharacteristic" = 'CG_LARGURA')
                    left join ${schema}."materialcharacteristic" MC4 on (MC4."idmaterial" = LO."idmaterial" and MC4."idcharacteristic" = 'CG_DIAMETRO')
                    left join ${schema}."lotcharacteristic" LO1 on (LO1."idmaterial" = LO."idmaterial" and LO1."idlot" = AL."idlot" and LO1."name" = 'CG_PESO_LIQUIDO')
                    left join ${schema}."lotcharacteristic" LO2 on (LO2."idmaterial" = LO."idmaterial" and LO2."idlot" = AL."idlot" and LO2."name" = 'CG_QUANTIDADE')
                    where AL."idorder" = '${where.idordermes}'`;

    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true }
    });

  });

}