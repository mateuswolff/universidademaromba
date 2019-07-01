const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;


//#region query
const sqlDefault = `SELECT o.sequence, 
                    o."dtcreated",
                    o."idordermes", 
                    o."idordersap", 
                    o."idordergroup",
                    o."expectedquantity",
                    o."requestdate",
                    o."ordertype",
                    o."orderstatus",
                    o."idequipmentscheduled",
                    o."idequipmentexpected",
                    o.urgency,
                    o."idclient",
                    o."idorderplanned",
                    o."saleorder",
                    o."saleorderitem",
                    eb.description as "equipmentscheduled",
                    ea.description as "equipmentexpected",
                    etb."id" as "equipmentscheduledtype",
                    o."idmaterial",
                    o."ordersequence",
                    o."idorderplanned",
                    concat(TO_NUMBER(ma.id, '999999999999999999'), ' - ', ma.description) as "material",
                    comprimentom1 as "lengthm",
                    diametrom1 as "diameterm",
                    espessuram1 as "thicknessm",
                    larguram1 as "widthm",
                    acom as "steelm",
                    grupomaterialm as "materialgroupm",
                    o."idrawmaterial",
                    mb.description as "rawmaterial",
                    comprimentorm1 as "lengthrm",
                    diametrorm1 as "diameterrm",
                    espessurarm1 as "thicknessrm",
                    largurarm1 as "widthrm",
                    acorm as "steelrm",
                    o."plannedorderquantity" as weight,
                    pcm.productivityvalue,
                    mcn.textvalue as norm,

                    (select TRUNC(N_MINUTES/60) || ':' || lpad(cast (N_MINUTES - (TRUNC(N_MINUTES/60) * 60) as varchar),2,'0') hours
                    from (
                    select 
                    distinct ROUND(((select SUM(WEIGHT) from ${schema}.ALLOCATION A where A.IDORDER = B.idordermes) / (
                             ((C_DIAM.numbervalue - C_ESP.numbervalue) * C_ESP.numbervalue)  *  
                             case  
                             when C_GMAT.textvalue in ('TB','TU') THEN
                               case substring(C_ACO.textvalue,1,1) 
                               when '4' then 0.02463 
                               else 0.02503 end
                             else 0.007967 end )/
                             COALESCE(PM.productivityvalue,10000000))/E.productivity) N_MINUTES
                    from ${schema}."order" B 
                         inner join ${schema}.materialcharacteristic C_DIAM on (B.idmaterial = C_DIAM.idmaterial and C_DIAM.idcharacteristic = 'CG_DIAMETRO')
                         inner join ${schema}.materialcharacteristic C_ESP on (B.idmaterial = C_ESP.idmaterial and C_ESP.idcharacteristic = 'CG_ESPESSURA')
                         inner join ${schema}.materialcharacteristic C_ACO on (B.idmaterial = C_ACO.idmaterial and C_ACO.idcharacteristic = 'CG_ACO')
                         inner join ${schema}.materialcharacteristic C_GMAT on (B.idmaterial = C_GMAT.idmaterial and C_GMAT.idcharacteristic = 'CG_GRUPO_MAT')
                         inner join ${schema}.equipment E on (B.idequipmentscheduled = E.id)
                         left join ${schema}."productivitymaterial" PM on (PM.idmaterial = B.idmaterial and pm.idequipment = e.id)
                    where B.idordermes = o.idordermes) as MINUTES) as scheduledtime,
                    
                    COALESCE ((SELECT COUNT (*) 
                               FROM ${schema}."allocation" alo,
                                    ${schema}.lot lot
                               where alo."idorder" = o."idordermes"
                                 and alo.idlot = lot.id
                                 and lot.situation not in ('D','F')
                               ), 0) as "statusallocation",
                    
                    (
                      select SUM(numbervalue) 
                        from ${schema}.allocation a
                        inner join ${schema}.lotcharacteristic lc on (lc.idlot = a.idlot and lc."name" = 'CG_QUANTIDADE')
                        where a.idorder = o.idordermes
                    ) as sumpiecesallocated

                    from ${schema}."order" o 
                    left join ${schema}.material ma on (o."idmaterial" = ma.id)
                    left join ${schema}.material mb on (o."idrawmaterial" = mb.id)
                
                    left join (
                        SELECT * 
                        FROM crosstab(
                    'select "idmaterial", "idcharacteristic", "numbervalue" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1,2',
                    'select distinct "idcharacteristic" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1'
                    ) 
                          AS result_test(materialm character varying(200), acom1 REAL, comprimentom1 REAL, diametrom1 REAL, espessuram1 REAL, grupomaterialm1 character varying(200),larguram1 REAL)
                        ) as cm1 on (o."idmaterial" = cm1.materialm)
                    left join (
                        SELECT * 
                        FROM crosstab(
                    'select "idmaterial", "idcharacteristic", "textvalue" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1,2',
                    'select distinct "idcharacteristic" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1'
                    ) 
                          AS result_test(materialm character varying(200), acom character varying(200), comprimentom character varying(200), diametrom character varying(200), espessuram character varying(200), grupomaterialm character varying(200),larguram character varying(200))
                        ) as cm2 on (o."idmaterial" = cm2.materialm)
                    left join (
                        SELECT * 
                        FROM crosstab(
                    'select "idmaterial", "idcharacteristic", "numbervalue" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1,2',
                    'select distinct "idcharacteristic" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1'
                    ) 
                          AS result_test(materialrm character varying(200), acorm1 REAL, comprimentorm1 REAL, diametrorm1 REAL, espessurarm1 REAL, grupomaterialrm1 REAL,largurarm1 REAL)
                        ) as crm1 on (o."idrawmaterial" = crm1.materialrm)
                    left join (
                        SELECT * 
                        FROM crosstab(
                    'select "idmaterial", "idcharacteristic", "textvalue" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1,2',
                    'select distinct "idcharacteristic" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1'
                    ) 
                          AS result_test(materialrm character varying(200), acorm character varying(200), comprimentorm character varying(200), diametrorm character varying(200), espessurarm character varying(200), grupomaterialrm character varying(200), largurarm character varying(200))
                        ) as crm2 on (o."idrawmaterial" = crm2.materialrm)

                    inner join ${schema}.equipment ea on (o."idequipmentexpected" = ea."id")
                    left join ${schema}.equipment eb on (o."idequipmentscheduled" = eb."id")
                    left join ${schema}."equipmenttype" etb on (eb."idtype" = etb."id")
                    left join ${schema}.productivitymaterial pcm on pcm.idequipment = o."idequipmentscheduled" and pcm.idmaterial = o."idmaterial"
                    left join ${schema}.materialcharacteristic mcn on (ma.id = mcn.idmaterial and mcn.idcharacteristic = 'CG_NORMA')`;
//#endregion

exports.default = function (app) {
  // MODEL INSTANCE
  const sequelize = config.postgres.sequelize;

  const {
    order,
    productionprogramitem,
    productionprogram,
    lotconsumed
  } = config.postgres.DB;


  // ALLOCATED RAW MATERIAL
  app.api.register('packagesToBeGenerated', async (data, ctx) => {

    let sql = `select A.idorder, 
                --((1000*c3.numbervalue/(7.9*c2.numbervalue*c1.numbervalue))) COMPRIMENTO,
                -- m1.numbervalue/1000 comprimento, m2.numbervalue espessura, m3.numbervalue diametro,
                -- round(((1000*c3.numbervalue/(7.9*c2.numbervalue*c1.numbervalue))) / (m1.numbervalue/1000)) qtd_pecas,
                -- s.packagequantity, 
                m4.idmaterial, m4.textvalue Material,
                (((1000*c3.numbervalue/(7.9*c2.numbervalue*c1.numbervalue))) / (m1.numbervalue/1000))/ s.packagequantity package
                --, m2.CG_GRUPO_MAT
                --=1000*D3/(B5*B4*B3)
                from ${schema}.allocation A
                inner join ${schema}.LOT B on (A.idlot = B.id and b.situation in ('A','P'))
                left join ${schema}.lotcharacteristic c1 on (b.id = c1.idlot and c1."name" = 'CG_LARGURA')
                left join ${schema}.lotcharacteristic c2 on (b.id = c2.idlot and c2."name" = 'CG_ESPESSURA')
                left join ${schema}.lotcharacteristic c3 on (b.id = c3.idlot and c3."name" = 'CG_PESO_LIQUIDO')
                left join ${schema}."order" O on (a.idorder = o.idordermes)
                left join ${schema}.materialcharacteristic M1 on (o.idmaterial = m1.idmaterial and m1.idcharacteristic = 'CG_COMPRIMENTO')
                left join ${schema}.materialcharacteristic M2 on (o.idmaterial = m2.idmaterial and m2.idcharacteristic = 'CG_ESPESSURA')
                left join ${schema}.materialcharacteristic M3 on (o.idmaterial = m3.idmaterial and m3.idcharacteristic = 'CG_DIAMETRO')
                left join ${schema}.materialcharacteristic M4 on (o.idmaterial = m4.idmaterial and m4.idcharacteristic = 'CG_GRUPO_MAT')
                    left join ${schema}.standardpackage s 
                    on (m3.numbervalue between s.diametermin and s.diametermax
                      and
                      m2.numbervalue between s.thicknessmin and s.thicknessmax)
                where O.idequipmentscheduled = '${data.equipment}'
                  and O.orderstatus = 'IN_PROCESS'
                --and a.idorder in (1,80)
                --group by A.idorder  
                order by 1`;

    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true }
    })
  });

  app.api.register('allocatedRawMaterial', async (req, ctx) => {

    let data = req;

    let sql = `Select 
              a."idlot" as "id",
              a."idorder", 
              a."iduser", 
              a."standardmaterialidentifier", 
              a.weight, 
              a.pieces, 
              a."specialinstruction",
              ma.id as "idmaterial",
              concat(TO_NUMBER(ma.id, '999999999999999999'), ' - ', ma.description) as description,
              mc."idcharacteristic",
              mc."numbervalue" as length,
              lc.numbervalue,
              (
                select sum (lc.numbervalue) 
                from ${schema}.allocation a
                inner join ${schema}.lot l on (l.id = a.idlot)
                inner join ${schema}.material ma on (ma."id" = l.idmaterial)
                inner join ${schema}."materialcharacteristic" mc on (mc.idmaterial = ma.id)
                inner join ${schema}.lotcharacteristic lc on (lc.idlot = l.id and lc."name" = 'CG_QUANTIDADE')
                where a."idorder" = '${data.idorder}' and mc.idcharacteristic = 'CG_COMPRIMENTO' and lc."name" = 'CG_QUANTIDADE'
              )
              from ${schema}.allocation a
              inner join ${schema}.lot l on (l.id = a.idlot)
              inner join ${schema}.material ma on (ma."id" = l.idmaterial)
              inner join ${schema}."materialcharacteristic" mc on (mc.idmaterial = ma.id)
              inner join ${schema}.lotcharacteristic lc on (lc.idlot = l.id and lc."name" = 'CG_QUANTIDADE')
              where a."idorder" = '${data.idorder}' and mc.idcharacteristic = 'CG_COMPRIMENTO'`;
    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true }
    })

  });

  // ORDER SEQUENCY E ORDER SECONDARY
  app.api.register('tubesCuttingPlan', async (req, ctx) => {
    let data = req;
    let sql = sqlDefault;

    if (data.type == 'sequenceOrder') {

      sql += ` where o."ordertype" = 'PRODUCTION'
        AND o."orderstatus" = 'PRODUCTION'
        and o.status = true
        and o."idorderplanned" is null
        and o.idordersap is not null
        --and o.sequence > 0
        and eb.id = '${data.idequipment}'`;

    } else {

      if (data.type == 'OrderPlanned') {

        sql += ` where o."idorderplanned" = '${data.idorderplanned}'`;
      } else {
        sql += ` where o."ordertype" = 'PLANNED'
          and o."idorderplanned" is null
          and comprimentom1 <= '${data.leftover}'
          and espessuram1 = '${data.thickness}'
          and diametrom1 = '${data.diameter}'
          and acom = '${data.steel}'`;

      }
    }

    sql += `order by sequence ASC`;
    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true }
    });

  });

  app.api.register('scheduledOrders', async (req, ctx) => {
    let idequipment = req.idequipment;
    let sql = sqlDefault;
    sql += ` where eb.id = '${idequipment}' 
            and o."ordertype" = 'PRODUCTION'
             and o."orderstatus" <> 'FINISHED'
             and o."orderstatus" <> 'PAUSED'
             and o.status = true
             and o."orderstatus" <> 'IN_PROCESS'`;

    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true }
    })
  });

  app.api.register('programOrderByEquipmentAndSituation', async (data, ctx) => {
    let sql = sqlDefault.replace('o.sequence', 'ppi.sequence');
    sql += `
        inner join ${schema}.productionprogramitem ppi on ppi.idorder = o.idordermes
        inner join ${schema}.productionprogram pp on pp.id = ppi.idprogram
        where pp.situation = '${data.situation}'
          and pp.equipment = '${data.equipment}'
          and (o.orderstatus <> 'FINISHED')
        order by sequence ASC`;

    return sequelize.query(sql).spread(async (results, metadata) => {
      let result = await generateSituationColor(results);
      return { data: result, success: true }
    })
  });

  // POST QUERY LOT ALLOCATION
  app.api.register('lotAllocation', async (req, ctx) => {

    let idequipment = req.idequipment;
    let sql = `SELECT 
      o.sequence, 
      o."idordermes", 
      o."idordersap", 
      o."idordergroup",
      o."expectedquantity",
      o."requestdate",
      concat(TO_NUMBER(ma.id, '999999999999999999'), ' - ', ma.description) as "material", 
      concat(TO_NUMBER(mb.id, '999999999999999999'), ' - ', mb.description) as "rawmaterial",
      mb.id as "idrawmaterial",
      eb.description as "scheduled",
      length,
      diameter,
      thickness,
      width,
      steel,
      o."plannedorderquantity" as weight
      from ${schema}."order" o left join ${schema}.material ma on (o."idmaterial" = ma."id")
      left join (
          SELECT * 
          FROM crosstab('select "idmaterial", id, "valuenumber" from ${schema}."materialcharacteristic"') 
             AS result_test(Material character varying(200), length REAL, diameter REAL, thickness REAL, width REAL, steel REAL)
          ) as char on (o."idmaterial" = "idmaterial")
      left join ${schema}.material mb on (o."idrawmaterial" = mb."id")
      left join ${schema}.equipment ea on (o."idequipmentexpected" = ea."id")
      left join ${schema}.equipment eb on (o."idequipmentscheduled" = eb."id")
      where
      o."ordertype" = 'PRODUCTION'
      and eb.id = '${idequipment}'
      order by sequence ASC`;

    return sequelize.query(sql).spread(async (results, metadata) => {
      return { data: results, success: true }
    })

  });

  // POST QUERY LOT ALLOCATION
  app.api.register('allOrderScheduled', async (req, ctx) => {
    try {

      let where = req;
      let sql = sqlDefault;

      sql += `where 
              o."idequipmentscheduled" = '${where.idequipment}' 
              and o."requestdate" >= '${where.startdate}' 
              and o."requestdate" <= '${where.enddate}'
              and o."orderstatus" <> 'FINISHED'
              and o."ordertype" = 'PRODUCTION'
              and o."status" = true
              and o.sequence > 0
              order by sequence ASC`;

      return sequelize.query(sql).spread(async (results, metadata) => {
        let result = await generateSituationColor(results);
        return { data: result, success: true }
      });
    } catch (error) {
      return { data: error, success: false }
    }
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
          inner join ${schema}.lot LO on (LO.id = AL.idlot and LO.situation not in ('F','D'))
          where AL."idorder" = '${order.idordermes}'`
        sequelize.query(sql).spread((item, metadata) => {
          if (item.length) {

            //let released = item.filter(elem => elem.situation === "R").length;
            let pedding = item.filter(elem => elem.situation === "P").length;
            //let in_front_off = item.filter(elem => elem.situation === "E").length;
            //let working = item.filter(elem => elem.situation === "T").length;
            let notMovimented = item.filter(elem => elem.situation === null && elem.idinmove === null).length;
            //let allocated = item.filter(elem => elem.idinmove === null).length;
            let total = item.length;

            if (notMovimented === total || pedding === total) {
              order.statusallocation = 'red';
            } else if (pedding) {
              //} else if (released === total || in_front_off === total || working === total) {
              order.statusallocation = 'yellow';
            } else {
              order.statusallocation = 'green';
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

  // POST QUERY LOT ALLOCATION
  app.api.register('allOrderExpected', async (req, ctx) => {

    let where = req;
    let sql = sqlDefault;

    sql += `
            where o."idequipmentexpected" = '${where.idequipment}' 
            and o."requestdate" >= '${where.startdate}' 
            and o."requestdate" <= '${where.enddate}'
            and o."orderstatus" <> 'FINISHED'
            and o."ordertype" = 'PLANNED'
            and o."status" = true
            order by sequence ASC`;

    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true }
    })

  });

  // Scheduled Order Completed
  app.api.register('getOrderScheduled', async (equipment) => {
    
    //let where = req;
    let data = equipment;
    let sql = `SELECT b.sequence, b.idorder, c.orderstatus
               FROM ${schema}.productionprogram a,
                    ${schema}.productionprogramitem b,
                    ${schema}."order" c
               WHERE a.equipment = '${data.idequipment}'
                 and a.situation = 'C'
                 and b.sequence = '${data.lastSequence}'
                 and b.idprogram = a.id
                 and b.idorder = c.idordermes`;
    
    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true }
    })

  });

  // Order Complete
  app.api.register('getOrder', async (req, ctx) => {


    let where = req;

    let sql = sqlDefault;

    sql += ` where o."idordermes" = '${where.idordermes}'`;

    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true }
    })

  });

  // POST QUERY LOT ALLOCATION
  app.api.register('allOrderProvided', async (req, ctx) => {
    let where = req;
    let sql = sqlDefault;
    sql += `
            where
            o."idequipmentexpected" = '${where.idequipment}' 
            and o."requestdate" >= '${where.startdate}' 
            and o."requestdate" <= '${where.enddate}'
            and o."orderstatus" <> 'FINISHED'
            order by sequence ASC`;

    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true }
    })

  });

  // RawMaterial
  app.api.register('rawmaterial', async (req, ctx) => {


    let data = req;
    let sql = sqlDefault;

    sql += `where o."idmaterial" = '${data.idmaterial}'
      and o."idordermes" = '${data.idordermes}' or 
      o."idrawmaterial" = '${data.idmaterial}'`;

    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true }
    });

  });

  // Return last scrap sequence
  app.api.register('scrapSequence', async (req, ctx) => {
    let data = req;

    sql = `SELECT "idscrapsequence"
      FROM ${schema}.scrap
      WHERE "idorder" = '${data.idordermes}'
      order by "idscrapsequence" desc
      limit 1`;

    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true }
    });
  });

  // Return last scrap sequence
  app.api.register('maxSequenceOrder', async (req, ctx) => {


    sql = `select max(sequence) from ${schema}."order"`;

    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true }
    });

  });

  app.api.register('packagesProduceCutting', async (data, ctx) => {

    /*let sql = `select (tb.expectedquantity / s.packagequantity) as quantity
    from ${schema}.standardpackage s
        ,(select o.idordermes, o.expectedquantity, o.idmaterial, mt.numbervalue as thickness, md.numbervalue as diameter 
          from ${schema}."order" o
        left join ${schema}.materialcharacteristic mt on mt.idmaterial = o.idmaterial and mt.idcharacteristic = 'CG_ESPESSURA' 
        left join ${schema}.materialcharacteristic md on md.idmaterial = o.idmaterial and md.idcharacteristic = 'CG_DIAMETRO' 
         where o.idordermes = '${data.idorder}') tb
   where tb.thickness between s.thicknessmin
                          and s.thicknessmax
     and tb.diameter between s.diametermin
                         and s.diametermax`;
*/
    let sql = `select (tb.expectedquantity / s.packagequantity) as quantity
    from ${schema}.standardpackage s
        ,(select sum(CAST(rm.numbervalue/MC.numbervalue as INTEGER) * A.pieces) expectedquantity, MT.numbervalue thickness, MD.numbervalue diameter, MC.numbervalue length
		from ${schema}.order o
		     inner join ${schema}.allocation a on (a.idorder = o.idordermes)
		     inner join ${schema}.lot l on (l.id = a.idlot)
		     inner join ${schema}.materialcharacteristic rm on (L.iDmaterial = rm.idmaterial and rm.idcharacteristic = 'CG_COMPRIMENTO')
		     inner join ${schema}.materialcharacteristic mc on (O.idmaterial = MC.idmaterial and mc.idcharacteristic = 'CG_COMPRIMENTO')
		     INNER join ${schema}.materialcharacteristic mt on (mt.idmaterial = o.idmaterial and mt.idcharacteristic = 'CG_ESPESSURA') 
		     inner join ${schema}.materialcharacteristic md on (md.idmaterial = o.idmaterial and md.idcharacteristic = 'CG_DIAMETRO')
		where o.idordermes = '${data.idorder}'
		group by MT.numbervalue , MD.numbervalue , MC.numbervalue ) tb
   where tb.thickness between s.thicknessmin
                          and s.thicknessmax
     and tb.diameter between s.diametermin
                         and s.diametermax
     and tb.length between s.lengthmin
                         and s.lengthmax`;

    return sequelize.query(sql).spread((results, metadata) => {

      return { data: results, success: true }
    });

  });

  // Return Release Teams
  app.api.register('pendencyTypes', async (req, ctx) => {

    let data = req;
    sql = `SELECT RT."description"
      FROM ${schema}."pendencytype" PT
      left join ${schema}."disposaltype" DT on (PT."iddisposaltype" = DT."id")
      left join ${schema}."releaseteam" RT on (DT."idreleaseteam" = RT."id")
      WHERE PT."id" = '${data.id}'`;

    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true }
    });

  });

  // Calc Planned Hours
  app.api.register('calcPlannedHours', async (req, ctx) => {
    let data = req;
    let idmaterial = ctx;
    sql = `select TRUNC(N_MINUTES/60) || ':' || lpad(cast (N_MINUTES - (TRUNC(N_MINUTES/60) * 60) as varchar),2,'0') hours
    from (
    select 
    distinct ROUND(((select SUM(WEIGHT) from ${schema}.ALLOCATION A where A.IDORDER = B.idordermes) / (
             ((C_DIAM.numbervalue - C_ESP.numbervalue) * C_ESP.numbervalue)  *  
             case  
             when C_GMAT.textvalue in ('TB','TU') THEN
               case substring(C_ACO.textvalue,1,1) 
               when '4' then 0.02463 
               else 0.02503 end
             else 0.007967 end )/
             COALESCE(PM.productivityvalue,10000000))/E.productivity) N_MINUTES
    from ${schema}."order" B 
         inner join ${schema}.materialcharacteristic C_DIAM on (B.idmaterial = C_DIAM.idmaterial and C_DIAM.idcharacteristic = 'CG_DIAMETRO')
         inner join ${schema}.materialcharacteristic C_ESP on (B.idmaterial = C_ESP.idmaterial and C_ESP.idcharacteristic = 'CG_ESPESSURA')
         inner join ${schema}.materialcharacteristic C_ACO on (B.idmaterial = C_ACO.idmaterial and C_ACO.idcharacteristic = 'CG_ACO')
         inner join ${schema}.materialcharacteristic C_GMAT on (B.idmaterial = C_GMAT.idmaterial and C_GMAT.idcharacteristic = 'CG_GRUPO_MAT')
         left join ${schema}."productivitymaterial" PM on (PM.idmaterial = B.idmaterial)
         inner join ${schema}.equipment E on (B.idequipmentscheduled = E.id)
    where B.idordermes = ${data.idordermes}) as MINUTES;`;

    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true }
    });
  });

  // Order Relationships
  app.api.register('orderRelationships', async (req, ctx) => {


    let data = req;

    sql = `select * 
      from ${schema}."order" o
      left join ${schema}.material m on (o."idmaterial" = m.id)
      left join ${schema}.equipment e on (o."idequipmentscheduled" = e.id)
      WHERE o."idordermes" = '${data.idorder}'`;

    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true }
    });

  });

  app.api.register('getOrdersByCharacteristics', async (steel, thickness, width) => {

    let sql = `
      select
             o.idordermes
            ,ma.id
            ,concat(TO_NUMBER(ma.id, '999999999999999999'), ' - ', ma.description) as "description" 
            ,ca."textvalue" as steel
            ,ce."numbervalue" as thickness
            ,cl."numbervalue" as width
       from ${schema}."order" o 
      inner join ${schema}.material as ma
         on o.idmaterial = ma.id
      inner join ${schema}."materialcharacteristic" ca
         on ca."idmaterial" = ma.id
      inner join ${schema}."materialcharacteristic" ce
         on ce."idmaterial" = ma.id
      inner join ${schema}."materialcharacteristic" cl
         on cl."idmaterial" = ma.id
      where o.status              = true 
        and o.ordertype           = 'PLANNED'
        and ca."idcharacteristic" = 'CG_ACO' 
        and ca."textvalue"        = '${steel}'
        and ce."idcharacteristic" = 'CG_ESPESSURA' 
        and ce."numbervalue"      = ${thickness}
        and cl."idcharacteristic" = 'CG_LARGURA' 
        and cl."numbervalue"      < ${width}
    `
    return sequelize.query(sql).spread((results, metadata) => {
      return results;
    })
  }, { method: "POST" });

  app.api.register('getCharacteriscsByMaterial', async (idmaterial) => {
    let sql = `select
                concat(TO_NUMBER(MA.id, '999999999999999999'), ' - ', MA.description) as "material",
                comprimentom1 as "lengthm",
                diametrom1 as "diameterm",
                espessuram1 as "thicknessm",
                larguram1 as "widthm",
                acom as "steelm",
                grupomaterialm as "materialgroupm"
              from
                ${schema}.material MA
                left join (
                    SELECT * 
                    FROM crosstab(
                    'select "idmaterial", "idcharacteristic", "numbervalue" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1,2',
                    'select distinct "idcharacteristic" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1'
                    ) as result_test(materialm character varying(200), acom1 REAL, comprimentom1 REAL, diametrom1 REAL, espessuram1 REAL, grupomaterialm1 character varying(200),larguram1 REAL)
                ) as cm1 on (MA."id" = cm1.materialm)
                left join (
                    SELECT * 
                    FROM crosstab(
                    'select "idmaterial", "idcharacteristic", "textvalue" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1,2',
                    'select distinct "idcharacteristic" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1'
                    ) as result_test(materialm character varying(200), acom character varying(200), comprimentom character varying(200), diametrom character varying(200), espessuram character varying(200), grupomaterialm character varying(200),larguram character varying(200))
                ) as cm2 on (MA."id" = cm2.materialm)
                where MA."id" = '${idmaterial}'`

    return sequelize.query(sql).spread((results, metadata) => {
      return results;
    })
  }, { method: "POST" });

  app.api.register('getWeightConsumed', async (idorder) => {
/*
    let sql = `
                select lotconsumed, sum(ls.lotweight), o.idordersap, l.idmaterial, max(ls.dtupdated) as "updated"
                from (
                  select idorder, lotconsumed1 as "lotconsumed", sum(lotweight1) as "lotweight", max(dtupdated) as "dtupdated"
                  from ${schema}.lotgenerated 
                  where idorder = ${idorder}
                  group by lotconsumed1, idorder
                  
                  union
                  
                  select idorder, lotconsumed2 as "lotconsumed", sum(lotweight2) as "lotweight", max(dtupdated) as "dtupdated"
                  from ${schema}.lotgenerated 
                  where idorder = ${idorder}
                    and lotweight2 is not null
                  group by lotconsumed2, idorder
                  ) as ls
              inner join ${schema}."order" o on (o.idordermes = ls.idorder)
              inner join ${schema}."lot" l on (l.id = ls.lotconsumed)
              group by lotconsumed, idorder, o.idordersap, l.idmaterial
              order by updated`
*/
    let sql = ` 
                select lc.idlot lotconsumed, lc.originalweight - lc.weight "sum", l.idmaterial, o.idordersap
                from ${schema}.lotconsumed lc
                  inner join ${schema}.lot l on (l.id = lc.idlot)
                  inner join ${schema}.order o on (o.idordermes = lc.idorder)
                where lc.idorder = ${idorder}
                order by lc.idorderentry`
                
    return sequelize.query(sql).spread((results, metadata) => {
      return results;
    })
  }, { method: "POST" });


  app.api.register('getWeightConsumedLots', async (data) => {
    return sequelize.transaction(async (t) => {

      let idorder = data.idordermes

      let sql = `
                select sum(weight) as "lotweight"
                from  ${schema}.scrap sc
                where idorder = ${idorder}`

      let sumscraps = await sequelize.query(sql).spread((results, metadata) => {
        return results;
      })

      sumscraps = sumscraps[0].lotweight ? sumscraps[0].lotweight : 0;

      sql = ` 
                select lc.idlot, lc.weight, l.idmaterial
                from ${schema}.lotconsumed lc
                inner join ${schema}.lot l on (l.id = lc.idlot)
                where lc.idorder = ${idorder}
                order by lc.idorderentry`

      let consumeds = await sequelize.query(sql).spread((results, metadata) => {
        return results;
      })

      sql = ` 
                select idlot, weight
                from ${schema}.allocation
                where idorder = ${idorder}`

      let allocations = await sequelize.query(sql).spread((results, metadata) => {
        return results;
      })

      let aux = 0;

      for (let i = 0; i < consumeds.length; i++) {

        if (consumeds[i].weight > 0) {

          aux = consumeds[i].weight - sumscraps;

          if (aux < 0) {
            consumeds[i].scrap = consumeds[i].weight;
            consumeds[i].weight = 0;
            consumeds[i + 1].weight = consumeds[i + 1].weight + aux;
            consumeds[i + 1].scrap = aux * (-1);
          }
          else if (i == (consumeds.length - 1)) {
            consumeds[i].scrap = sumscraps;
          }
        }

        if (consumeds[consumeds.length - 1].weight == 0) {
          let index = allocations.findIndex(x => x.idlot == consumeds[consumeds.length - 1].idlot);

          if (index != -1) {
            if (consumeds.length > 1 && sumscraps > allocations[index].weight) {
              aux = sumscraps - allocations[index].weight;
              consumeds[consumeds.length - 1].scrap = allocations[index].weight;
              consumeds[consumeds.length - 2].scrap = aux;
            }
            else {
              consumeds[consumeds.length - 1].scrap = sumscraps;
            }
          }

        }

      }

      for (let i = 0; i < consumeds.length; i++) {
        await lotconsumed.update({
          weight: consumeds[i].weight
        }, {
            where: {
              idlot: consumeds[i].idlot,
              idorder: idorder
            }, transaction: t
          });
      }


      return { consumeds, success: true };
    });
  }, { method: "POST" });


  app.api.register('getWeightConsumedLotsSec', async (data) => {
    return sequelize.transaction(async (t) => {

      let idorder = data.idordermes

      sql = ` 
                select lc.idlot, lc.weight, l.idmaterial
                from ${schema}.lotconsumed lc
                inner join ${schema}.lot l on (l.id = lc.idlot)
                where lc.idorder = ${idorder}
                order by lc.idorderentry`

      let consumeds = await sequelize.query(sql).spread((results, metadata) => {
        return results;
      })

      return { consumeds, success: true };
    });
  }, { method: "POST" });


  app.api.register('sortOrders', async (data) => {
    return sequelize.transaction(async (t) => {
      let results = [];
      for (let i = 0; i < data.orders.length; i++) {
        let seq = i + 1;

        let item = {
          idorder: data.orders[i].idordermes,
          sequence: seq
        };

        data.orders[i].sequence = seq;
        results.push(data.orders[i]);

        await productionprogramitem.update(item, {
          where: {
            idorder: item.idorder
          },
          transaction: t
        });

        await order.update({
          sequence: seq
        }, {
            where: {
              idordermes: item.idorder
            }, transaction: t
          });
      }

      return { data: results, success: true };
    });
  }, { method: "POST" });

  app.api.register('getAllOrder', async (data) => {
    let sql = `select o.idordermes, 
        o.idmaterial,
        o.idequipmentscheduled,
        o.idordersap, 
        concat(TO_NUMBER(mr.id, '999999999999999999'), ' - ', mr.description) as rawmaterial, 
        concat(TO_NUMBER(mp.id, '999999999999999999'), ' - ', mp.description) as material, 
        o.orderstatus, 
        o.ordertype, 
        o.urgency, 
        o.idclient, 
        e.description as equipment,
        o.requestdate,
        (select count(*) from ${schema}.lotconsumed lc where lc.idorder = o.idordermes) as quantitylotconsumed,
        (select count(*) from ${schema}.lotgenerated lg where lg.idorder = o.idordermes) as quantitylotgenerated,
        (select count(*) from ${schema}.stop st where st.idorder = o.idordermes) as quantitystop,
        (select count(*) from ${schema}.defect df where df.idorder = o.idordermes) as quantitydefect,
        (select count(*) from ${schema}.scrap sc where sc.idorder = o.idordermes) as quantityscrap,
        (select count(*) from ${schema}.pendency pd where pd.idorder = o.idordermes) as quantityrnc,
        (select count(distinct cd."sequence")  from ${schema}.dimensionalcontrolresult cd where cd.idorder = o.idordermes) as quantitydimensionalcontrol,
        (
          select string_agg(rt.description, ', ')
            from ${schema}.resourceused ru 
            left join ${schema}.resourcetype rt on rt.id = ru.idresourcetype
            where ru.idorder = o.idordermes
        ) as resourceused
        from  ${schema}."order" o
          left join ${schema}.material mr on mr.id = o.idrawmaterial
          left join ${schema}.material mp on mp.id = o.idmaterial
          left join ${schema}.equipment e on e.id = o.idequipmentscheduled
          where o.requestdate between '${data.startdate}' and '${data.enddate}'`;

    if (data.idequipment)
      sql += ` and o.idequipmentscheduled = '${data.idequipment}'`;

    if (data.status)
      sql += ` and o.orderstatus = '${data.status}'`;

    if (data.id) {
      sql += ` and (
          CAST(o.idordersap AS text) like '%${data.id}%' 
        or CAST(o.idordermes AS text) like '%${data.id}%')`;
    }

    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true };
    })

  }, { method: "POST" });



  // ORDER SEQUENCY E ORDER SECONDARY
  app.api.register('getBuffer', async (req, ctx) => {
    let data = req;
    //let sql = sqlDefault;
    let sql = ` 
    SELECT o.sequence, 
                o."dtcreated",
                o."idordermes", 
                o."idordersap", 
                o."idordergroup",
                o."expectedquantity",
                o."requestdate",
                o."ordertype",
                o."orderstatus",
                o."idequipmentscheduled",
                o."idequipmentexpected",
                o.urgency,
                o."idclient",
                o."idorderplanned",
                o."saleorder",
                o."saleorderitem",
                eb.description as "equipmentscheduled",
                ea.description as "equipmentexpected",
                etb."id" as "equipmentscheduledtype",
                o."idmaterial",
                o."ordersequence",
                o."idorderplanned",
                concat(TO_NUMBER(ma."id",'999999999999999999'), ' - ', ma.description) as "material",
                o."idrawmaterial",
                concat(TO_NUMBER(mb."id",'999999999999999999'), ' - ', mb.description) as "rawmaterial",
                o."plannedorderquantity" as weight,
                comprimentom1 as "lengthm",
                diametrom1 as "diameterm",
                espessuram1 as "thicknessm",
                larguram1 as "widthm",
                acom as "steelm",
                grupomaterialm as "materialgroupm",
                comprimentorm1 as "lengthrm",
                diametrorm1 as "diameterrm",
                espessurarm1 as "thicknessrm",
                largurarm1 as "widthrm",
                acorm as "steelrm",
                (
                	select SUM(numbervalue) 
                  	from ${schema}.allocation a
                  	inner join ${schema}.lotcharacteristic lc on (lc.idlot = a.idlot and lc."name" = 'CG_QUANTIDADE')
                  	where a.idorder = o.idordermes
                ) as sumpiecesallocated,
                (select TRUNC(N_MINUTES/60) || ':' || lpad(cast (N_MINUTES - (TRUNC(N_MINUTES/60) * 60) as varchar),2,'0') hours
                    from (
                    select 
                    distinct ROUND(((select SUM(WEIGHT) from ${schema}.ALLOCATION A where A.IDORDER = B.idordermes) / (
                             ((C_DIAM.numbervalue - C_ESP.numbervalue) * C_ESP.numbervalue)  *  
                             case  
                             when C_GMAT.textvalue in ('TB','TU') THEN
                               case substring(C_ACO.textvalue,1,1) 
                               when '4' then 0.02463 
                               else 0.02503 end
                             else 0.007967 end )/
                             COALESCE(PM.productivityvalue,10000000))/E.productivity) N_MINUTES
                    from ${schema}."order" B 
                         inner join ${schema}.materialcharacteristic C_DIAM on (B.idmaterial = C_DIAM.idmaterial and C_DIAM.idcharacteristic = 'CG_DIAMETRO')
                         inner join ${schema}.materialcharacteristic C_ESP on (B.idmaterial = C_ESP.idmaterial and C_ESP.idcharacteristic = 'CG_ESPESSURA')
                         inner join ${schema}.materialcharacteristic C_ACO on (B.idmaterial = C_ACO.idmaterial and C_ACO.idcharacteristic = 'CG_ACO')
                         inner join ${schema}.materialcharacteristic C_GMAT on (B.idmaterial = C_GMAT.idmaterial and C_GMAT.idcharacteristic = 'CG_GRUPO_MAT')
                         left join ${schema}."productivitymaterial" PM on (PM.idmaterial = B.idmaterial and PM.idequipment = B.idequipmentscheduled)
                         inner join ${schema}.equipment E on (B.idequipmentscheduled = E.id)
                    where B.idordermes = o.idordermes) as MINUTES) as scheduledtime,


               	(SELECT sum(weight) from ${schema}.allocation where idorder = o.idordermes) as "sumallocation",                
                COALESCE ((SELECT COUNT (*) FROM ${schema}."allocation" alo 
                    where alo."idorder" = o."idordermes"), 0) as "statusallocation" 
                from ${schema}."order" o 
                left join ${schema}.material ma on (o."idmaterial" = ma.id)
                left join ${schema}.material mb on (o."idrawmaterial" = mb.id)
                left join (
                  SELECT * 
                  FROM crosstab(
              'select "idmaterial", "idcharacteristic", "numbervalue" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1,2',
              'select distinct "idcharacteristic" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1'
              ) 
                    AS result_test(materialm character varying(200), acom1 REAL, comprimentom1 REAL, diametrom1 REAL, espessuram1 REAL, grupomaterialm1 character varying(200),larguram1 REAL)
                  ) as cm1 on (o."idmaterial" = cm1.materialm)
              left join (
                  SELECT * 
                  FROM crosstab(
              'select "idmaterial", "idcharacteristic", "textvalue" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1,2',
              'select distinct "idcharacteristic" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1'
              ) 
                    AS result_test(materialm character varying(200), acom character varying(200), comprimentom character varying(200), diametrom character varying(200), espessuram character varying(200), grupomaterialm character varying(200),larguram character varying(200))
                  ) as cm2 on (o."idmaterial" = cm2.materialm)
              left join (
                  SELECT * 
                  FROM crosstab(
              'select "idmaterial", "idcharacteristic", "numbervalue" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1,2',
              'select distinct "idcharacteristic" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1'
              ) 
                    AS result_test(materialrm character varying(200), acorm1 REAL, comprimentorm1 REAL, diametrorm1 REAL, espessurarm1 REAL, grupomaterialrm1 REAL,largurarm1 REAL)
                  ) as crm1 on (o."idrawmaterial" = crm1.materialrm)
              left join (
                  SELECT * 
                  FROM crosstab(
              'select "idmaterial", "idcharacteristic", "textvalue" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1,2',
              'select distinct "idcharacteristic" from ${schema}."materialcharacteristic" where "idcharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'') ORDER BY 1'
              ) 
                    AS result_test(materialrm character varying(200), acorm character varying(200), comprimentorm character varying(200), diametrorm character varying(200), espessurarm character varying(200), grupomaterialrm character varying(200), largurarm character varying(200))
                  ) as crm2 on (o."idrawmaterial" = crm2.materialrm)
                inner join ${schema}.equipment ea on (o."idequipmentexpected" = ea."id")
                left join ${schema}.equipment eb on (o."idequipmentscheduled" = eb."id")
                left join ${schema}."equipmenttype" etb on (eb."idtype" = etb."id")
                where o.orderstatus not in ('FINISHED')
                and o.ordertype not in ('REWORK','PLANNED')
                and 
                (
                  ('-' <> '${data.idequipment}' and eb.id = '${data.idequipment}') 
                  or
                  ('-' = '${data.idequipment}')
                )
                and o.idordermes not in (
                  select ppi.idorder
                  from ${schema}.productionprogramitem ppi 
                  inner join ${schema}.productionprogram pp on (ppi.idprogram = pp.id)
                  where pp.situation = 'C' 
                  or pp.situation = 'N')`;
        
    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true }
    });

    
  });

  app.api.register('getCharacteriscsByLot', async (idlot) => {
    let sql = `
              select l.id as "idlot",m.description, m.id as materialid, lc1.numbervalue as "weight", mc1.numbervalue as "length"
              from ${schema}.lot l 
              inner join ${schema}.material m on (m.id = l.idmaterial)
              inner join ${schema}.lotcharacteristic lc1 on (l.id = lc1.idlot and lc1."name" = 'CG_PESO_LIQUIDO')
              inner join ${schema}.materialcharacteristic mc1 on (l.idmaterial = mc1.idmaterial and mc1.idcharacteristic = 'CG_COMPRIMENTO')
              where l.id = ${idlot}`;
    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true };
    })
  }, { method: "POST" });

  //PROGRAM ORDERS
  app.api.register('programOrders', async (orders, data, ctx) => {

    try {
      return sequelize.transaction(async (t) => {

        let sql = `
                select * 
                from ${schema}.productionprogram pp
                inner join ${schema}.productionprogramitem ppi on (ppi.idprogram = pp.id)
                where
                pp.situation = 'N' 
                and pp.equipment = '${data.equipmentSelected}'
                order by ppi."sequence"`;

        let program = await sequelize.query(sql).spread(async (results) => {
          return { data: results, success: true }
        });

        if (program.data.length == 0) {

          let productionprogramcreated = await productionprogram.create({
            situation: 'N',
            equipment: data.equipmentSelected,
            iduser: data.iduser,
            status: true
          },
            {
              transaction: t,
              raw: true
            });

          sql = `select ppi.* 
                 from ${schema}.productionprogram pp
                  inner join ${schema}.productionprogramitem ppi on (ppi.idprogram = pp.id)
                  inner join ${schema}."order" o on (o.idordermes = ppi.idorder)
                 where
                  pp.situation = 'C' 
                  and pp.equipment = '${data.equipmentSelected}'
                  and o.orderstatus <> 'FINISHED'
                 order by ppi."sequence"`;

          let programitens = await sequelize.query(sql).spread(async (results) => {
            return { data: results, success: true }
          });

          programitens = programitens.data

          for (let i = 0; i < programitens.length; i++) {
            await productionprogramitem.create({
              idprogram: productionprogramcreated.id,
              sequence: programitens[i].sequence,
              idorder: programitens[i].idorder,
              iduser: data.iduser,
              status: true
            },
              {
                transaction: t,
                raw: true
              });
          }

          sql = `select max(ppi."sequence")  
                 from ${schema}.productionprogram pp
                  inner join ${schema}.productionprogramitem ppi on (ppi.idprogram = pp.id)
                  inner join ${schema}."order" o on (o.idordermes = ppi.idorder)
                 where
                  pp.situation = 'C' 
                  and pp.equipment = '${data.equipmentSelected}'
                  and o.orderstatus <> 'FINISHED'`;

          let maxsequence = await sequelize.query(sql).spread(async (results) => {
            return { data: results, success: true }
          });

          maxsequence = maxsequence.data[0].max;

          for (let i = 0; i < orders.length; i++) {

            await order.update({
              idequipmentscheduled: data.equipmentSelected
            }, {
                where: {
                  idordermes: orders[i].idordermes
                }, transaction: t
              });

            await productionprogramitem.create({
              idprogram: productionprogramcreated.id,
              sequence: ++maxsequence,
              idorder: orders[i].idordermes,
              iduser: data.iduser,
              status: true
            },
              {
                transaction: t,
                raw: true
              });
          }

        }
        else {

          sql = `
                select * 
                from ${schema}.productionprogram pp
                inner join ${schema}.productionprogramitem ppi on (ppi.idprogram = pp.id)
                where
                pp.situation = 'N' 
                and pp.equipment = '${data.equipmentSelected}'
                order by ppi."sequence"`;

          let program = await sequelize.query(sql).spread(async (results) => {
            return { data: results, success: true }
          });

          for (let i = 0; i < orders.length; i++) {

            await order.update({
              idequipmentscheduled: data.equipmentSelected
            }, {
                where: {
                  idordermes: orders[i].idordermes
                }, transaction: t
              });

            await productionprogramitem.create({
              idprogram: program.data[0].id,
              sequence: program.data[program.data.length - 1].sequence + i + 1,
              idorder: orders[i].idordermes,
              iduser: data.iduser,
              status: true
            },
              {
                transaction: t,
                raw: true
              });
          }

        }
      }).then((result) => {
        return { data: result, success: true }
      }).catch((err) => {
        console.log(err)
        return { data: null, success: false }
      });
    } catch (result) {
      console.log(result)
    }

  }, { method: "POST" })

}

