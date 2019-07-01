const config = require('../config/sequelize.conf');
const CrudRequestController = require('../controllers/crudRequestController');
const SpecificRequestController = require('../controllers/specificRequestController');

exports.sequenceGenerator = async (req, res, next) => {
    if (req.params.model === 'disposaltype') {
        // MODEL INSTANCE
        const {
            disposaltype,
            releaseteam
        } = config.postgres.DB;

        const crudRequestController = new CrudRequestController.crudRequestController(disposaltype);
        const specificRequestController = new SpecificRequestController.specificRequestController(disposaltype, [releaseteam]);

        let item = await specificRequestController.findAllAssociate({
            id: req.body.id
        });

        if (!item.length) {
            req.body.sequence = 1;
            next();
        } else {
            let itensSequence = item.map(disposal => {
                return disposal.sequence
            });
            let max = itensSequence[itensSequence.length - 1];
            req.body.sequence = max + 1;
            next();
        }
    } else {
        next();
    }
}