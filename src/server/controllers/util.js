class util {

    constructor() {}

    DefineItemCharacteristic(result){
        let ret = [];

        // Group itens by material ID
        let group = result.groupBy(x => x.idlot)

        for(let item of group){
            let newObject = {};

            newObject.id = item.key;
            newObject.idlot = item.key;
            
            if (item.data.length > 0){
                newObject.material = item.data[0].materialDescription;

                for(let prop of item.data){
                    switch (prop.idcharacteristic) {
                        case 'CG_ACO':
                            newObject.steel = prop.textvalue;
                            break;
                        case 'CG_ESPESSURA':
                            newObject.thickness = prop.numbervalue;
                            break;
                        case 'CG_LARGURA':
                            newObject.width = prop.numbervalue;
                            break;
                    }
                    newObject.weight = prop.weight;
                }

                ret.push(newObject);
            }
        }

        return ret;
    }
}

exports.util = util;