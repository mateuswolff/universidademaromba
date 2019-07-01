SELECT 
      o.sequence, 
      o."idordermes", 
      o."idordersap", 
      o."idOrderGroup",
        o."expectedQuantity",
      ma.description as "Material", 
      mb.description as "rawMaterial", 
      eb.description as "Scheduled",
      length,
      diameter,
      thickness,
      width,
      steel,
      o."plannedorderquantity" as weight
    FROM orders o left join materials ma on (o."idmaterial" = ma."id")
      left join (
          SELECT * 
          FROM crosstab('select "idmaterial", id, "valueNumber" from "materialCharacteristics" order by 1,2') 
             AS result_test(Material character varying(200), length REAL, diameter REAL, thickness REAL, width REAL, steel REAL)
          ) as char on (o."idmaterial" = "idmaterial")
      left join materials mb on (o."idRawMaterial" = mb."id")
      left join equipment ea on (o."idEquipmentProvided" = ea."id")
      left join equipment eb on (o."idequipmentscheduled" = eb."id")
    where
      o."typeOrder" = 'PRODUCTION'
      and eb.id = '1'
    order by sequence ASC