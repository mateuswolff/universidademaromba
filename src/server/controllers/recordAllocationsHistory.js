const config = require('../config/sequelize.conf');

// MODEL INSTANCE
  const {
    allocationshistory
} = config.postgres.DB; 

class recordAllocationsHistory {

    constructor() {}
  
    async save(data) {

        return allocationshistory.create({
            idorder: data.idorder, 
            idlot: data.idlot, 
            idcallocation: data.idcallocation, 
            iduser: data.iduser, 
        },
        {
            raw: false
        });

    }

}

exports.recordAllocationsHistory = recordAllocationsHistory;