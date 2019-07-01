 select 
 	m.description as material,
	mt.description as "materialType",  
	acom as steel, 
	diametrom1 as diameter, 
	larguram1 as width, 
	espessuram1 as thickness,
	comprimentom1 as length,
	terminacaom as edge
 from materials m 
		left join "materialTypes" mt on (m."idMaterialType" = mt.id)
                        left join (
                            SELECT * 
                            FROM crosstab(
                        'select "idmaterial", "idCharacteristic", "numberValue" from "materialCharacteristics" where "idCharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'',''CG_TERMINACAO'') ORDER BY 1,2',
                        'select distinct "idCharacteristic" from "materialCharacteristics" where "idCharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'',''CG_TERMINACAO'') ORDER BY 1'
                        ) 
                              AS result_test(materialm1 character varying(200), acom1 character varying(200), comprimentom1 REAL, diametrom1 REAL, espessuram1 REAL, grupomaterialm1 character varying(200),larguram1 REAL, terminacaom1 character varying(200))
                            ) as cm1 on (m.id = cm1.materialm1)
                        left join (
                            SELECT * 
                            FROM crosstab(
                        'select "idmaterial", "idCharacteristic", "textValue" from "materialCharacteristics" where "idCharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'',''CG_TERMINACAO'') ORDER BY 1,2',
                        'select distinct "idCharacteristic" from "materialCharacteristics" where "idCharacteristic" in (''CG_LARGURA'',''CG_ESPESSURA'',''CG_ACO'',''CG_COMPRIMENTO'',''CG_DIAMETRO'',''CG_GRUPO_MAT'',''CG_TERMINACAO'') ORDER BY 1'
                        ) 
                              AS result_test(materialm character varying(200), acom character varying(200), comprimentom REAL, diametrom REAL, espessuram REAL, grupomaterialm character varying(200),larguram REAL, terminacaom character varying(200))
                            ) as cm2 on (m.id = cm2.materialm)
							
							
							
							
	