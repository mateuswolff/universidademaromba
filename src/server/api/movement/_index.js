const config = require('../../config/sequelize.conf');
const RecordAllocationsHistory = require('../../controllers/recordAllocationsHistory');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

  // URL BASE
  const resourceBase = '/api/';

  // MODEL INSTANCE
  const sequelize = config.postgres.sequelize;

  // MODEL INSTANCE
  const {
    allocation,
    moverequest,
    allocationshistory
  } = config.postgres.DB;

  // Movement Equipment
  app.api.register('movementEquipment', async (req) => {
    let data = req;

    let sql = `select 
    lt.idlocal as place,
    EQ."description" as placeto,
      LT."idmaterial",
      concat(TO_NUMBER(MA.id, '999999999999999999'), ' - ', MA."description") as descriptionMaterial,
      MR."id",
      MR."idlot",
      LC3."numbervalue" as "numberparts",
      LC2."numbervalue" as weight,
      AL."idorder",
      MR."momentdate",
    MR."iduser",
    AL."standardmaterialidentifier",
    LO."id" as idLocal`;

    if (data.idtransportresource != null) {
      sql += ` FROM ${schema}."transportresourcelocallink" LR 
      left join ${schema}."moverequest" MR on (MR."idlocal" = LR."idlocal" and  MR."situationmovement" = 'P' and MR."status" = true)`;
    } else {
      sql += ` FROM ${schema}."moverequest" MR`;
    }

    sql += ` left join ${schema}."equipment" EQ on (EQ."id" = MR."idequipment")
    left join ${schema}."local" LO on (LO."id" = MR."idlocal")
    left join ${schema}."lot" LT on (LT."id" = MR."idlot")
    left join ${schema}."material" MA on (MA."id" = LT."idmaterial")
    left join ${schema}."lotcharacteristic" LC1 on (LC1."idmaterial" = LT."idmaterial" and LC1."idlot"= LT."id" and LC1."name" = 'CG_LOCALIZACAO')
    left join ${schema}."lotcharacteristic" LC2 on (LC2."idmaterial" = LT."idmaterial" and LC2."idlot"= LT."id" and LC2."name" = 'CG_PESO_LIQUIDO')
    left join ${schema}."lotcharacteristic" LC3 on (LC3."idmaterial" = LT."idmaterial" and LC3."idlot"= LT."id" and LC3."name" = 'CG_QUANTIDADE')
    left join ${schema}."allocation" AL on (AL."idlot" = MR."idlot")`;
    
    if (data.idtransportresource != null && data.idequipment != null) {
      
      sql += ` where LR."idtransportresource" = '${data.idtransportresource}' and 
      MR."idequipment" = '${data.idequipment}' and 
      MR."situationmovement" = 'P' and 
      MR."status" = true and 
      MR.idlocal is not null`;

    } else if (data.idtransportresource != null ||data.idequipment != null) {
    
      if (data.idtransportresource != null) {
    
        sql += ` where LR."idtransportresource" = '${data.idtransportresource}' and 
        MR."situationmovement" = 'P' and 
        MR."status" = true and 
        MR.idlocal is not null`;    
  
      } else {
    
        sql += ` where MR."idequipment" = '${data.idequipment}' and 
        MR."situationmovement" = 'P' and 
        MR."status" = true and 
        MR.idlocal is not null`;    

      }
    
    } else {
    
      sql += ` where MR."situationmovement" = 'P' and MR."status" = true and MR.idlocal is not null`;
    
    }

    if (data.idop != null) {
      sql += ` and AL.idorder = '${data.idop}'`;
    }

    sql += ` order by MR."momentdate" asc`

    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true }
    });

  });

  // Lot Change
  app.api.register('lotChange', async (req) => {
    let data = req;
    let sql = `SELECT 
                LO."id",
                LO."situation",
                LO."idmaterial",
                LO."idlocal",
                LC."description",
                LO."idrun",
                LC."posx",
                LC."posy",
                LC."posz",
                concat(TO_NUMBER(MA.id, '999999999999999999'), ' - ', MA."description") as descriptionMaterial,
                MC1."textvalue" as "steel",
                MC2."numbervalue" as "thickness",
                MC3."numbervalue" as "diameter",
                LO."situation",
                LO1."numbervalue" as "plannedorderquantity", 
                LO2."numbervalue" as "expectedquantity",
                AL."idorder"
                FROM ${schema}.lot LO 
                left join ${schema}."local" LC on (LC."id" = LO."idlocal")
                left join ${schema}."material" MA on (MA."id" = LO."idmaterial")
                left join ${schema}."materialcharacteristic" MC1 on (MC1."idmaterial" = LO."idmaterial" and MC1."idcharacteristic" = 'CG_ACO')
                left join ${schema}."materialcharacteristic" MC2 on (MC2."idmaterial" = LO."idmaterial" and MC2."idcharacteristic" = 'CG_ESPESSURA')
                left join ${schema}."materialcharacteristic" MC3 on (MC3."idmaterial" = LO."idmaterial" and MC3."idcharacteristic" = 'CG_DIAMETRO')
                left join ${schema}."materialcharacteristic" MC4 on (MC4."idmaterial" = LO."idmaterial" and MC4."idcharacteristic" = 'CG_LARGURA')
                left join ${schema}."lotcharacteristic" LO1 on (LO1."idmaterial" = LO."idmaterial" and LO1."name" = 'CG_PESO_LIQUIDO' and LO1."numbervalue" > 0)
                left join ${schema}."lotcharacteristic" LO2 on (LO2."idmaterial" = LO."idmaterial" and LO2."name" = 'CG_QUANTIDADE')
                left join ${schema}."allocation" AL on (AL."idlot" = LO."id" and AL."status" = true)
                where LO."id" != '${data.idlot}' 
                and LO."idmaterial" = '${data.idmaterial}' 
                order by LO."id"`;

    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true }
    });

  });

  // Movement Deposit
  app.api.register('movementDeposit', async (req) => {
    
    let sql = `SELECT
                MR."id",
                MR."idequipment",
                MR."idlot",
                MR."momentdate",
                LO."description",
                LT."idmaterial",
                LC1."numbervalue" as weight,
                LC2."numbervalue" as "numberparts",
                concat(TO_NUMBER(MA.id, '999999999999999999'), ' - ', MA."description") as descriptionMaterial,
                MR."iduser",
                AL."idorder",
                AL."standardmaterialidentifier",
                AL."specialinstruction"
                FROM ${schema}."moverequest" MR
                left join ${schema}."local" LO on (LO."id" = MR."idlocal" and LO."status" = true)
                left join ${schema}."lot" LT on (LT."id" = MR."idlot" and LT."status" = true)
                left join ${schema}."material" MA on (MA."id" = LT."idmaterial")
                left join ${schema}."lotcharacteristic" LC1 on (LC1."idmaterial" = LT."idmaterial" and LC1."idlot"= LT."id" and LC1."name" = 'CG_PESO_LIQUIDO')
                left join ${schema}."lotcharacteristic" LC2 on (LC2."idmaterial" = LT."idmaterial" and LC2."idlot"= LT."id" and LC2."name" = 'CG_QUANTIDADE')
                left join ${schema}."allocation" AL on (AL."idlot" = MR."idlot" and AL."status" = true)
                where MR."idlocal" is null and MR."situationmovement" = 'P' and MR."status" = true
                order by mr.id`;

    return sequelize.query(sql).spread((results, metadata) => {
      return { data: results, success: true }
    });

  });

  app.api.register('lotChangeLocal', async (data, ctx) => {
    return sequelize.transaction(async (t) => {

      /* Verifico se o Lote do Equipamento já está alocado */
      let result = await allocation.findAll({
        where: {
          idorder: data.allocation.idorder,
          idlot: data.allocation.idlot,
          status: true
        },
        transaction: t,
        raw: true
      });

      if (result.length) {

        /* Verifico se o Lote já está alocado */
        let resulta = await allocation.findAll({
          where: {
            idlot: data.lot.id,
            status: true
          },
          transaction: t,
          raw: true
        });

        if (resulta.length) {

          if (data.allocation.idorder == data.lot.idorder) {
            return { data: false, success: false, message: "Don't need to be allocated" };
          } else {
            return { data: false, success: false, message: "Lot already allocated in another OP" };
          }

        } else {

          /* Deleto a alocação da GRID de cima */
          let resultb = await allocation.destroy({
            where: {
              idorder: data.allocation.idorder,
              idlot: data.allocation.idlot,
            },
            transaction: t
          });

          if (resultb == 1) {

            /* Insiro a Alocação Desalocada no Histórico */
            let resultc = await allocationshistory.create({
              idorder: data.allocation.idorder,
              idlot: data.allocation.idlot,
              idcallocation: "D",
              iduser: data.iduser,
            },
            {
              transaction: t,
              raw: false
            });

            if (resultc) {

              /* Insiro a Alocação Alocada no Histórico */
              let resultd = await allocationshistory.create({
                idorder: data.allocation.idorder,
                idlot: data.lot.id,
                idcallocation: "A",
                iduser: data.iduser,
              },
              {
                transaction: t,
                raw: false
              });

              if (resultd) {

                /* Insiro uma Novo Allocation com o Lot novo*/
                let resulte = await allocation.create({
                  idorder: data.allocation.idorder,
                  idlot: data.lot.id,
                  iduser: data.iduser,
                  standardmaterialidentifier: data.allocation.standardmaterialidentifier,
                  weight: data.allocation.weight,
                  pieces: data.allocation.numberparts,
                  specialinstruction: data.allocation.specialinstruction,
                },
                {
                  transaction: t,
                  raw: true
                });

                if (resulte) {

                  /* Desativo o Move Request */
                  let resultf = await moverequest.update({ status: false }, {
                    where: {
                      id: data.moverequest.id,
                      status: true
                    },
                    transaction: t
                  });

                  if (resultf[0] == 1) {

                    /* Insiro um Novo Move Request com o Lot novo */
                    let resultg = await moverequest.create({
                      idequipment: data.moverequest.idequipment,
                      idlot: data.lot.id,
                      idlocal: data.moverequest.idlocal,
                      situationmovement: data.moverequest.situationmovement,
                      idtransportresource: data.moverequest.idtransportresource,
                      momentdate: data.moverequest.momentdate,
                      idmovimentuser: data.moverequest.idmovimentuser,
                      idexchangelot: data.lot.id,
                      exchangedate: data.moverequest.momentdate,
                      idexchangeuser: ctx.login,
                      iduser: data.iduser
                    },
                      {
                        transaction: t,
                        raw: true
                      });

                    if (resultg) {
                      return { data: resultg, success: true, message: "Allocation changed successfully" };
                    } else {
                      return { data: false, success: false, message: "Error creating move request" };
                    }

                  } else {
                    return { data: false, success: false, message: "Error desactivating move request" };
                  }

                } else {
                  return { data: false, success: false, message: "Error creating new allocation" };
                }

              } else {
                return { data: false, success: false, message: "Error creating new record on allocation	history" };
              }

            } else {
              return { data: false, success: false, message: "Error creating new record on allocation	history" };
            }

          } else {
            return { data: false, success: false, message: "Error removing allocations" };
          }

        }

      } else {
        return { data: false, success: false, message: "Not Allocated Lot" };
      }

    });

  });

}