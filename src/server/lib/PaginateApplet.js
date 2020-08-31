class Paginate {

    /**
     * Return default paginate object
     * @param limit
     * @param page
     * @param total
     * @returns {{offset, page: *, perPage: *, lastPage: number, total: *}}
     */
    static getPaginateObject(limit, page, total) {
        return {
            offset  : limit * (page - 1),
            page    : page,
            perPage : page === 1 && total < limit ? total : limit,
            lastPage: Math.ceil(total / limit),
            total   : total
        }
    }

    /**
     * Format final result object with data and paginate object
     * @param paginateObject
     * @param dataResult
     * @returns {{data: *, paginate: *}}
     */
    static getPaginateResultObject(paginateObject, dataResult) {
        return {
            data    : dataResult,
            paginate: paginateObject
        }
    }

    /**
     * Return sequelize paginate method
     * @param options: {
                attributes: select,
                limit: limit,
                offset: offset
            }
     * @param limit
     * @param page
     * @returns {Promise|*|Promise<T>}
     */
    sequelize(options) {

        // Initialize paginate object
        let paginateObject = {};

        return this.count()
            .then(total => {

                // Set paginate object
                paginateObject = Paginate.getPaginateObject(options.limit, options.offset, total);

                // Define options complements
                options.offset = paginateObject.offset;

                // Find registers with options
                return this.findAll(options)

            })
            .then(dataResult => {

                // Return registers and paginate
                return Paginate.getPaginateResultObject(paginateObject, dataResult)

            })
            .catch(err => {
                // Reject promise returning errors
                throw err;
            })
    }
}

exports.paginate = new Paginate();