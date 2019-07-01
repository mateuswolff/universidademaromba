const mongoose = require('mongoose');
const {
    ObjectId
} = mongoose.Types;

/**
 * Default values to use in express middleware
 * @type {{limit: number, page: number, project: Object}}
 */
const defaults = {
    limit: 1000,
    page: 1,
    project: {
        __v: false
    }
};

exports.parseQuery = async (req, res, next) => {

    // Set default project (is overridden if exist 'select' in req.query)
    req.query.project = defaults.project;

    // Parse select fields
    // Usage: ?select=field1,field2
    if ('select' in req.query) {

        // Mount array of select query fields
        req.query.select = req.query.select.split(',');

        // Clear project object to insert same fields of select for mongodb
        req.query.project = {};

        // Increment project object with select fields for mongodb
        req.query.select.forEach(item => {
            req.query.project[item] = true;
        });
    }


    // Parse limit
    // Usage: ?limit=10
    req.query.limit = 'limit' in req.query ? req.query.limit : defaults.limit;


    // Parse offset
    // Usage: ?offset=20
    // TODO: Falta fazer parte da resposta para retornar dados sobre offset nas resposta
    req.query.offset = 'offset' in req.query ?
        parseInt(req.query.offset, Infinity) :
        req.query.limit * (req.query.page - 1);

    // Parse where fields
    // Usage: ?where={"field1":"value", "field2": "value"}
    req.query.where = 'where' in req.query ? req.query.where : undefined;

    // // Detect ObjectID in where (for MongoDB)
    // Object.keys(req.query.where).forEach(item => {
    //     if (mongoose.Types.ObjectId.isValid(req.query.where[item])) {
    //         req.query.where[item] = mongoose.Types.ObjectId(req.query.where[item]);
    //     }
    // });





    // // Parse page
    // // Usage: ?page=1
    // req.query.page = 'page' in req.query ?
    //     parseInt(req.query.page, Infinity) :
    //     defaults.page;


    // // Parse offset
    // // Usage: ?offset=20
    // req.query.offset = 'offset' in req.query ?
    //     parseInt(req.query.offset, Infinity) :
    //     req.query.limit * (req.query.page - 1);

    // req.query.aggregate = 'aggregate' in req.query ? mongoReplaceObjs(JSON.parse(req.query.aggregate)) : [];

    // if (!req.query.aggregate.find(pipeline => Object.keys(pipeline)[0] === '$match'))
    //     req.query.aggregate.unshift({
    //         $match: {}
    //     });

    // req.query.populate = 'populate' in req.query ? JSON.parse(req.query.populate) : {};

    // if (Object.keys(req.query.populate).length === 0)
    //     req.query.populate = '';

    // Continue...
    next();
}