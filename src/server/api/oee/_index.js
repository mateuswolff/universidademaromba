const Sequelize = require('sequelize');
const config = require('../../config/sequelize.conf');
const Server = require('../../lib/Server');
const schema = Server.App.i.config.sequelize.schema;

exports.default = function (app) {

    // URL BASE
    const resourceBase = '/api/';

    // MODEL INSTANCE
    const sequelize = config.postgres.sequelize;
    const { pendency, pendencyrelease, lot, reworkresult, lothistory, scrap } = config.postgres.DB;

    // SAVE PENDENCY AND PENDENCY RELEASES
    app.api.register('loadOee', async (data) => {

        let initialdate = data.initialdate;
        let finaldate = data.finaldate;
        let idequipment = data.idequipment;

        let currentyear = new Date().getFullYear();
        let nextyear = currentyear + 1;
        let previousyear = currentyear - 1;

        let sql = `
                    select it.*,im.minutes, op.targett0 
                    from
                        (SELECT
                            id, idequipment,idorder, dtinitial, dtfinal, extract (month from dtinitial)::numeric::integer as nummonth,
                            (EXTRACT(EPOCH FROM (dtfinal::timestamp - dtinitial::timestamp))) / 60 as stopedtimet0
                        from ${schema}."timestamp" as t
                        where idtype = 'PARADO_T0'
                       and dtinitial::date >= '${initialdate}'::date 
	   	            and dtfinal::date < ('${finaldate}'::date + '1 day':: interval) 
                        and idequipment = '${idequipment}'
                        ) as it
                    inner join (
                        SELECT 
                            extract(month from date_trunc('month',dt)::timestamp)::numeric::integer as nummonth, COUNT(*) * 24 * 60 as minutes
                        FROM 
                            generate_series( DATE '${currentyear}-01-01',DATE '${nextyear}-01-01',interval '1 DAY' ) as dt 
                        group by 
                            date_trunc('month',dt) order by nummonth
                        ) as im on (it.nummonth = im.nummonth)
                        inner join ${schema}.oeeparameter op on (op.idequipment = it.idequipment)`;

        let resultT0 = await sequelize.query(sql).spread(async (results) => {
            return { data: results, success: true }
        });


        sql = ` select stopedtimet0.*, yearminutes.minutes
                from
                        (SELECT
                            idequipment,extract (year from dtinitial)::numeric::integer as numyear,
                            sum((EXTRACT(EPOCH FROM (dtfinal::timestamp - dtinitial::timestamp))) / 60) as stopedtimet0
                        from  ${schema}."timestamp" as t
                        where idtype = 'PARADO_T0'
                            and idequipment = '${idequipment}'
                        group by numyear, idequipment
                        ) as stopedtimet0
                
                inner join
                
                        (SELECT 
                            extract(year from date_trunc('year',dt)::timestamp)::numeric::integer as numyear, COUNT(*) * 24 * 60 as minutes
                        FROM 
                            generate_series( DATE '${currentyear}-01-01',DATE '${nextyear}-01-01',interval '1 DAY' ) as dt 
                        group by 
                            date_trunc('year',dt) 
                            
                        union

                        SELECT 
                            extract(year from date_trunc('year',dt)::timestamp)::numeric::integer as numyear, COUNT(*) * 24 * 60 as minutes
                        FROM 
                            generate_series( DATE '${previousyear}-01-01',DATE '${currentyear}-01-01',interval '1 DAY' ) as dt 
                        group by 
                            date_trunc('year',dt) order by numyear) as yearminutes
                        
                    on yearminutes.numyear = stopedtimet0.numyear`

        let resultAccumulatedT0 = await sequelize.query(sql).spread(async (results) => {
            return { data: results, success: true }
        });


        sql = `
                select it1.*,im.minutes, op.targett1, op.targetoee 
                from (
                    SELECT
                        id, idequipment,idorder, dtinitial, dtfinal, extract (month from dtinitial)::numeric::integer as nummonth,
                        (EXTRACT(EPOCH FROM (dtfinal::timestamp - dtinitial::timestamp))) / 60 as stopedtimet1
                    from ${schema}."timestamp" as t
                    where idtype = 'PARADO_T1'
                        and dtinitial::date >= '${initialdate}'::date 
                        and dtfinal::date < ('${finaldate}'::date + '1 day':: interval) 
                        and idequipment = '${idequipment}'
                    ) as it1
                    
                inner join (
                    
                    SELECT 
                        extract(month from date_trunc('month',dt)::timestamp)::numeric::integer as nummonth, COUNT(*) * 24 * 60 as minutes
                    FROM 
                        generate_series( DATE '${currentyear}-01-01',DATE '${nextyear}-01-01',interval '1 DAY' ) as dt 
                    group by 
                        date_trunc('month',dt) order by nummonth
                    ) as im on (it1.nummonth = im.nummonth)
                    
                    inner join ${schema}.oeeparameter op on (op.idequipment = it1.idequipment)`

        let resultT1 = await sequelize.query(sql).spread(async (results) => {
            return { data: results, success: true }
        });


        sql = ` 
                select 
                    stopedtime.*, 
                    yearminutes.minutes,  
                    yearminutes.minutes - stopedtime."y+z" as "x-y-z", 
                    yearminutes.minutes - stopedtime."y" as "x-y",
                    yearminutes.minutes - stopedtime."y+z"/ yearminutes.minutes - stopedtime."y" as "finalcalc"  
                from
                    (
                        select 
                            idequipment, 
                            numyear, 
                            sum(stopedtime) as "y+z", 
                            sum(stopedtimet0) as "y" 
                        from (
                            SELECT
                                idequipment,extract (year from dtinitial)::numeric::integer as numyear,
                                sum((EXTRACT(EPOCH FROM (dtfinal::timestamp - dtinitial::timestamp))) / 60) as stopedtime,
                                sum((EXTRACT(EPOCH FROM (dtfinal::timestamp - dtinitial::timestamp))) / 60) as stopedtimet0
                            from  
                                ${schema}."timestamp" as t
                            where 
                                idtype = 'PARADO_T0'
                                and idequipment = '${idequipment}'
                            group by 
                                numyear, idequipment
                        
                            union
                        
                            SELECT
                                idequipment,extract (year from dtinitial)::numeric::integer as numyear,
                                sum((EXTRACT(EPOCH FROM (dtfinal::timestamp - dtinitial::timestamp))) / 60) as stopedtime,
                                0 as stopedtimet0
                            from  
                                ${schema}."timestamp" as t
                            where 
                                idtype = 'PARADO_T1'
                                and idequipment = '${idequipment}'
                            group by 
                                numyear, idequipment
                        
                        ) as stopedtime
                        group by 
                            idequipment, numyear
                        
                    ) as stopedtime
                
                inner join
                
                    (SELECT 
                        extract(year from date_trunc('year',dt)::timestamp)::numeric::integer as numyear, 
                        COUNT(*) * 24 * 60 as minutes
                    FROM 
                        generate_series( DATE '${currentyear}-01-01',DATE '${nextyear}-01-01',interval '1 DAY' ) as dt 
                    group by 
                        date_trunc('year',dt) 
                        
                    union

                    SELECT 
                        extract(year from date_trunc('year',dt)::timestamp)::numeric::integer as numyear, 
                        COUNT(*) * 24 * 60 as minutes
                    FROM 
                        generate_series( DATE '${previousyear}-01-01',DATE '${currentyear}-01-01',interval '1 DAY' ) as dt 
                    group by 
                        date_trunc('year',dt) order by numyear) as yearminutes
                    
                on yearminutes.numyear = stopedtime.numyear`

        let resultAccumulatedT1 = await sequelize.query(sql).spread(async (results) => {
            return { data: results, success: true }
        });

        sql = `
                select 
                        it2.idequipment, 
                        it2.nummonth, 
                        it2.runningtime, 
                        it0.stopt0, 
                        it1.stopt1, 
                        im.minutes, 
                        op.targett2,
                        op.targetoee,
                        ((im.minutes - it0.stopt0 - it1.stopt1)/ it2.runningtime) * 100 as resultt2
                        
                from (
                    SELECT
                        idequipment, 
                        extract (month from dtinitial)::numeric::integer as nummonth,
                        sum((EXTRACT(EPOCH FROM (dtfinal::timestamp - dtinitial::timestamp))) / 60) as runningtime
                    from  ${schema}."timestamp" as t
                    where idtype = 'RUNNING'
                        and dtinitial::date >= '${initialdate}'::date 
                        and dtfinal::date < ('${finaldate}'::date + '1 day':: interval) 
                        and idequipment = '${idequipment}'
                    group by 
                        nummonth, 
                        idequipment
                    ) as it2
                    
                inner join(
                
                    SELECT
                        idequipment,
                        extract (month from dtinitial)::numeric::integer as nummonth,
                        SUM((EXTRACT(EPOCH FROM (dtfinal::timestamp - dtinitial::timestamp))) / 60) as stopt0
                    from  ${schema}."timestamp" as t
                    where idtype = 'PARADO_T0'
                        and dtinitial::date >= '${initialdate}'::date 
                        and dtfinal::date < ('${finaldate}'::date + '1 day':: interval) 
                        and idequipment = '${idequipment}'
                    group by 
                        nummonth, 
                        idequipment
                    ) as it0 on (it2.nummonth = it0.nummonth)
                    
                inner join(
                
                    SELECT
                        idequipment,
                        extract (month from dtinitial)::numeric::integer as nummonth,
                        SUM((EXTRACT(EPOCH FROM (dtfinal::timestamp - dtinitial::timestamp))) / 60) as stopt1
                    from  ${schema}."timestamp" as t
                    where idtype = 'PARADO_T1'
                        and dtinitial::date >= '${initialdate}'::date 
                        and dtfinal::date < ('${finaldate}'::date + '1 day':: interval) 
                        and idequipment = '${idequipment}'
                    group by 
                        nummonth, 
                        idequipment
                    ) as it1 on (it2.nummonth = it1.nummonth)
                    
                inner join (
                    
                    SELECT 
                        extract(month from date_trunc('month',dt)::timestamp)::numeric::integer as nummonth, 
                        COUNT(*) * 24 * 60 as minutes
                    FROM 
                        generate_series( DATE '${currentyear}-01-01',DATE '${nextyear}-01-01',interval '1 DAY' ) as dt 
                    group by 
                        date_trunc('month',dt) order by nummonth
                    ) as im on (it2.nummonth = im.nummonth)
                    
                inner join  ${schema}.oeeparameter op on (op.idequipment = it2.idequipment)`

        let resultT2 = await sequelize.query(sql).spread(async (results) => {
            return { data: results, success: true }
        });

        sql = `
                select 
                    stopedtime.*, 
                    yearminutes.minutes,  
                    yearminutes.minutes - stopedtime."y+z" as "x-y-z", 
                    yearminutes.minutes - stopedtime."y" as "x-y",
                    stopedtime.w / (yearminutes.minutes - stopedtime."y+z") as "finalcalc"
                from
                    (
                        select 
                            idequipment, 
                            numyear, 
                            sum(stopedtime) as "y+z", 
                            sum(stopedtimet0) as "y",
                            sum(runningtime) as "w"
                        from (
                            SELECT
                                idequipment,extract (year from dtinitial)::numeric::integer as numyear,
                                sum((EXTRACT(EPOCH FROM (dtfinal::timestamp - dtinitial::timestamp))) / 60) as stopedtime,
                                sum((EXTRACT(EPOCH FROM (dtfinal::timestamp - dtinitial::timestamp))) / 60) as stopedtimet0,
                                0 as runningtime
                            from  
                                ${schema}."timestamp" as t
                            where 
                                idtype = 'PARADO_T0'
                                and idequipment = '${idequipment}'
                            group by 
                                numyear, idequipment
                        
                            union
                        
                            SELECT
                                idequipment,extract (year from dtinitial)::numeric::integer as numyear,
                                sum((EXTRACT(EPOCH FROM (dtfinal::timestamp - dtinitial::timestamp))) / 60) as stopedtime,
                                0 as stopedtimet0,
                                0 as runningtime
                            from  
                                ${schema}."timestamp" as t
                            where 
                                idtype = 'PARADO_T1'
                                and idequipment = '${idequipment}'
                            group by 
                                numyear, idequipment
                                
                            union
                            
                            SELECT
                                idequipment,extract (year from dtinitial)::numeric::integer as numyear,
                                0 as stopedtime,
                                0 as stopedtimet0,
                                sum((EXTRACT(EPOCH FROM (dtfinal::timestamp - dtinitial::timestamp))) / 60) as runningtime
                            from  
                                ${schema}."timestamp" as t
                            where 
                                idtype = 'RUNNING'
                                and idequipment = '${idequipment}'
                            group by 
                                numyear, idequipment
                        
                        ) as stopedtime
                        group by 
                            idequipment, numyear
                        
                    ) as stopedtime
                
                inner join
                
                    (SELECT 
                        extract(year from date_trunc('year',dt)::timestamp)::numeric::integer as numyear, 
                        COUNT(*) * 24 * 60 as minutes
                    FROM 
                        generate_series( DATE '${currentyear}-01-01',DATE '${nextyear}-01-01',interval '1 DAY' ) as dt 
                    group by 
                        date_trunc('year',dt) 
                        
                    union

                    SELECT 
                        extract(year from date_trunc('year',dt)::timestamp)::numeric::integer as numyear, 
                        COUNT(*) * 24 * 60 as minutes
                    FROM 
                        generate_series( DATE '${previousyear}-01-01',DATE '${currentyear}-01-01',interval '1 DAY' ) as dt 
                    group by 
                        date_trunc('year',dt) order by numyear) as yearminutes
                    
                on yearminutes.numyear = stopedtime.numyear`

        let resultAccumulatedT2 = await sequelize.query(sql).spread(async (results) => {
            return { data: results, success: true }
        });


        sql = `
                select 
					lotconsumed.idequipment, 
					lotconsumed.nummonth,
					lotconsumed.weight as weightconsumed,
					lotgenerated.weight as weightgenerated,
					(lotgenerated.weight / lotconsumed.weight) * 100 as resultt3,
					op.targett3, op.targetoee
				from
					(SELECT
                        idequipment, 
                        extract (month from dtinitial)::numeric::integer as nummonth,
                        sum(weight) as weight
                    from  ${schema}."timestamp" as t
                    where idtype = 'LOTCONSUMED'
                        and dtinitial::date >= '${initialdate}'::date 
                        and dtfinal::date < ('${finaldate}'::date + '1 day':: interval) 
                        and idequipment = '${idequipment}'
                    group by 
                        nummonth, 
                        idequipment) as lotconsumed
                 inner join
                   (SELECT
                        idequipment, 
                        extract (month from dtinitial)::numeric::integer as nummonth,
                        sum(weight) as weight
                    from  ${schema}."timestamp" as t
                    where idtype = 'LOTGENERATED'
                        and dtinitial::date >= '${initialdate}'::date 
                        and dtfinal::date < ('${finaldate}'::date + '1 day':: interval) 
                        and idequipment = '${idequipment}'
                    group by 
                        nummonth, 
                        idequipment) as lotgenerated
					on (lotconsumed.nummonth = lotgenerated.nummonth)
				 inner join ${schema}.oeeparameter op on (op.idequipment = lotconsumed.idequipment)`

        let resultT3 = await sequelize.query(sql).spread(async (results) => {
            return { data: results, success: true }
        });


        sql = `
                select 
                    lotconsumed.idequipment, 
                    lotconsumed.numyear,
                    lotconsumed.weight as weightconsumed,
                    lotgenerated.weight as weightgenerated,
                    (lotgenerated.weight / lotconsumed.weight) * 100 as t3,
                    op.targett3
                from
                    (SELECT
                        idequipment, 
                        extract (year from dtinitial)::numeric::integer as numyear,
                        sum(weight) as weight
                    from  ${schema}."timestamp" as t
                    where idtype = 'LOTCONSUMED'
                        and dtinitial::date >= '${currentyear}-01-01'::date 
                        and dtfinal::date < ('${nextyear}-01-01'::date) 
                        and idequipment = '${idequipment}'
                    group by 
                        numyear, 
                        idequipment) as lotconsumed
                inner join
                (SELECT
                        idequipment, 
                        extract (year from dtinitial)::numeric::integer as numyear,
                        sum(weight) as weight
                    from  ${schema}."timestamp" as t
                    where idtype = 'LOTGENERATED'
                        and dtinitial::date >= '${currentyear}-01-01'::date 
                        and dtfinal::date < '${nextyear}-01-01'::date
                        and idequipment = '${idequipment}'
                    group by 
                        numyear, 
                        idequipment) as lotgenerated
                    on (lotconsumed.numyear = lotgenerated.numyear)
                inner join ${schema}.oeeparameter op on (op.idequipment = lotconsumed.idequipment)
                                
                union
                
                select 
                    lotconsumed.idequipment, 
                    lotconsumed.numyear,
                    lotconsumed.weight as weightconsumed,
                    lotgenerated.weight as weightgenerated,
                    (lotgenerated.weight / lotconsumed.weight) * 100 as t3,
                    op.targett3
                from
                    (SELECT
                        idequipment, 
                        extract (year from dtinitial)::numeric::integer as numyear,
                        sum(weight) as weight
                    from  ${schema}."timestamp" as t
                    where idtype = 'LOTCONSUMED'
                        and dtinitial::date >= '${previousyear}-01-01'::date 
                        and dtfinal::date < ('${currentyear}-01-01'::date) 
                        and idequipment = '${idequipment}'
                    group by 
                        numyear, 
                        idequipment) as lotconsumed
                inner join
                (SELECT
                        idequipment, 
                        extract (year from dtinitial)::numeric::integer as numyear,
                        sum(weight) as weight
                    from  ${schema}."timestamp" as t
                    where idtype = 'LOTGENERATED'
                        and dtinitial::date >= '${previousyear}-01-01'::date 
                        and dtfinal::date < '${currentyear}-01-01'::date 
                        and idequipment = '${idequipment}'
                    group by 
                        numyear, 
                        idequipment) as lotgenerated
                    on (lotconsumed.numyear = lotgenerated.numyear)
                inner join ${schema}.oeeparameter op on (op.idequipment = lotconsumed.idequipment)`

        let resultAccumulatedT3 = await sequelize.query(sql).spread(async (results) => {
            return { data: results, success: true }
        });

        return {
            resultT0: resultT0,
            resultAccumulatedT0: resultAccumulatedT0,
            resultT1: resultT1,
            resultAccumulatedT1: resultAccumulatedT1,
            resultT2: resultT2,
            resultAccumulatedT2: resultAccumulatedT2,
            resultT3: resultT3,
            resultAccumulatedT3: resultAccumulatedT3,
        }

    }, { method: "POST" });

}

