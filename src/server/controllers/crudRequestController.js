let model = null;
const SendEmailController = require('../controllers/sendEmailController');
let crypto = require('crypto');
let moment = require('moment');
class crudRequestController {

    constructor(model) {
        this.model = model;

    }

    async create(fileToSave, modelString, opts = null) {
        // fileToSave.token = crypto.randomBytes(32).toString('hex');
        // fileToSave.tokenexperein = moment().add('1', 'D').format('YYYY-MM-DD');
        return await this.model
            .create(fileToSave, opts)
            .then(item => {
                // if (modelString == 'user') {
                //     let sendEmailController = new SendEmailController.sendEmailController(item);
                //     sendEmailController.sendEmail();
                // }

                if (fileToSave.users) {
                    item.setUsers(fileToSave.users).then((item) => {
                        return { data: item, metadata: { success: true } };
                    });
                }

                if (!item)
                    return { message: "No items found", metadata: { success: false } };

                return { data: item, metadata: { success: true } };
            })
            .catch(err => {
                return { data: err, message: err, metadata: { success: false } };
            });
    }

    async update(where, fileToUpdate) {
        return await this.model
            .update(fileToUpdate, {
                where: where,
                raw: true
            })
            .then(item => {
                if (!item)
                    return { message: "No items found", metadata: { success: false } };
                return { data: item, metadata: { success: true } };
            })
            .catch(err => {
                return { data: err, message: err, metadata: { success: false } };
            });
    }

    async findAll(select, where, limit, offset) {
        return await this.model
            .findAll({
                attributes: select,
                where: where
            })
            .then(item => {
                if (!item)
                    return { message: "No items found", metadata: { success: false } };
                // return { data: item.data, metadata: { success: true, paginate: item.paginate } };
                return { data: item, metadata: { success: true } };
            })
            .catch(err => {
                return { data: err, message: err, metadata: { success: false } };
            });
    }

    async findById(id) {
        return await this.model
            .findById(id)
            .then(item => {
                if (!item)
                    return { message: "No items found", metadata: { success: false } };

                return { data: item, metadata: { success: true } };
            })
            .catch(err => {
                return { data: err, message: err, metadata: { success: false } };
            });
    }

    async findOne(where, select = null, raw = false) {
        return this.model.findOne({
            where: where,
            attributes: select,
            raw: raw
        }).then(item => {
            if (!item)
                return { message: "No items found", metadata: { success: false } };

            return { data: item, metadata: { success: true } };
        })
            .catch(err => {
                return { data: err, message: err, metadata: { success: false } };
            });
    }

    async delete(fileToDelete) {
        return await this.model
            .destroy({
                where: fileToDelete
            }).then(item => {
                if (!item)
                    return { message: "No items found", metadata: { success: false } };

                return { data: item, metadata: { success: true } };
            })
            .catch(err => {
                return { data: err, message: err, metadata: { success: false } };
            });
    }

    async sum(select, where) {
        return await this.model
            .sum(select.toString(), {
                where: where,
            })
            .then(item => {
                if (!item)
                    return { message: "No items found", metadata: { success: false } };
                return { data: item, metadata: { success: true } };
            })
            .catch(err => {
                return { data: err, message: err, metadata: { success: false } };
            });
    }

    async lastAdd(select, where, limit, offset) {
        return await this.model
            .max(select[0], {
                where: where
            })
            .then(item => {
                if (!item)
                    return { message: "No items found", metadata: { success: false } };
                return { data: item, metadata: { success: true } };
            })
            .catch(err => {
                return { data: err, message: err, metadata: { success: false } };
            });
    }
}

exports.crudRequestController = crudRequestController;