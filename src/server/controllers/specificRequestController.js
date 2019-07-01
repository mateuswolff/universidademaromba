class specificRequestController {

    constructor(model, associate = []) {
        this.model = model;
        this.associate = associate;
    }

    async findAllAssociate(select, where, limit, offset, raw = false) {
        return await this.model
            .findAll({
                attributes: select,
                where: where,
                limit: limit,
                offset: offset,
                include: this.associate,
                separate: true,
                raw: raw
            })
            .then(item => {
                return { data: item, metadata: { success: true } };
            })
            .catch(err => {
                return { data: err, metadata: { success: false } };
            });
    }

    async findOneAssociate(select, where, limit, offset, raw = false) {
        return await this.model
            .findOne({
                attributes: select,
                where: where,
                limit: limit,
                offset: offset,
                include: this.associate,
                raw: raw
            })
            .then(item => {
                return { data: item, metadata: { success: true } };
            })
            .catch(err => {
                return { data: err, metadata: { success: false } };
            });
    }

    async createAssociate(object, opts) {
        return await this.model.create(object, {
            include: this.associate,
            transaction: opts && opts.transaction ? opts.transaction : null
        });
    }

    async updateAssociate(object, modelNormRule) {
        return this.model
            .findById(object.id, { include: this.associate })
            .then(customer => {
                // Remove old normrule
                customer.normrules.forEach(normrule => {
                    normrule.destroy();
                });

                // Create new normrule
                let normsRules = [];
                object.normrules.forEach(normRuleData => {
                    let normRulesReq = modelNormRule.create(normRuleData)
                        .then(normrule => {
                            // normrule.$set('norm', customer);
                            normrule.save();
                        });
                    normsRules.push(normRulesReq);
                });

                // Update customer
                customer.set(object);

                return Promise.all([
                    normsRules
                ])
                    .then(() => customer.save())
                    .then((response) => { return response })
                    .catch((err) => { console.error(err); return err.message; });
            })
            .catch((err) => { console.error(err); return err.message; });
    };
}
exports.specificRequestController = specificRequestController;