const _ = require('lodash');
const { HttpStatusError } = require('./errors');
const { parse } = require('./parser');
const { distinct, raw } = require('./transforms');

class ModelHandler {
    constructor(model, defaults = { limit: 100, offset: 0 }) {
        this.model = model;
        this.defaults = defaults;
    }
    
    create() {
        const handle = (req, res, next) => {
            return this.model
                .create(req.body)
                .then(res.transform)
                .then(respond)
                .catch(next);
            
            function respond(row) {
                res.status(201);
                res.send(row);
            }
        };
        
        return [
            raw,
            handle
        ];
    }

    bulkCreate(sequelize){
        const handle = (req, res, next) => {
            return sequelize
                .transaction((t) => {
                    return Promise.all(req.body
                        .map(val => { return this.model.findOrCreate({where: val, transaction: t}); }));
                })
                .then(reduceResponseToCreated)
                .then(res.transform)
                .then(respond)
                .catch(next);

            function reduceResponseToCreated(rows){
                return rows
                    .filter(result => result[1])
                    .map(result => result[0].dataValues);
            }

            function respond(rows) {
                res.status(201);
                res.send(rows);
            }
        };

        return [
            raw,
            handle
        ];
    }

    get() {
        const handle = (req, res, next) => {
            return this
                .findOne(Object.assign({},req.query,req.params))
                .then(rowExists)
                .then(res.transform)
                .then(respond)
                .catch(next);

            async function rowExists(row){
                if (!row) {
                    throw new HttpStatusError(404, 'Not Found');
                }

                return row;
            }
            
            function respond(row) {
                res.send(row);
            }
        };
        
        return [
            raw,
            handle
        ];
    }
    
    query() {
        const handle = (req, res, next) => {
            return this
                .findAndCountAll(req.query)
                .then(transform)
                .then(respond)
                .catch(next);

            async function transform({ rows, start, end, count }){
                return {rows: await res.transform(rows), start, end, count};
            }
            
            function respond({ rows, start, end, count }) {
                res.set('Content-Range', `${start}-${end}/${count}`);

                if (count > end) {
                    res.status(206);
                } else {
                    res.status(200);
                }

                res.send(rows);
            }
        };
        
        return [
            raw,
            handle
        ];
    }

    remove() {
        const handle = (req, res, next) => {
            return this
                .findOne(req.params)
                .then(destroy)
                .then(res.transform)
                .then(respond)
                .catch(next);

            function destroy(row) {
                if (!row) {
                    throw new HttpStatusError(404, 'Not Found');
                }

                return row.destroy();
            }

            function respond() {
                res.sendStatus(204);
            }
        };

        return [
            raw,
            handle
        ];
    }

    bulkRemove(sequelize){
        const handle = (req, res, next) => {
            return sequelize
                .transaction((t) => {
                    return Promise.all(req.body
                        .map(val => {
                            return Promise.all([val, this.model.destroy({where: val, transaction: t})]);
                        }));
                })
                .then(reduceResponseToDestroyed)
                .then(res.transform)
                .then(respond)
                .catch(next);

            function reduceResponseToDestroyed(rows){
                return rows
                    .filter(result => result[1])
                    .map(result => result[0]);
            }

            function respond(rows) {
                res.status(204);
                res.send(rows);
            }
        };

        return [
            raw,
            handle
        ];
    }

    update() {
        const handle = (req, res, next) => {
            let previousVals;
            return this
                .findOne(Object.assign({},req.query,req.params))
                .then(updateAttributes)
                .then(setPreviousValues)
                .then(res.transform)
                .then(respond)
                .catch(next);
                
            function updateAttributes(row) {
                if (!row) {
                    throw new HttpStatusError(404, 'Not Found');
                }

                previousVals = Object.assign({}, row._previousDataValues);
                
                return row.updateAttributes(req.body);
            }

            function setPreviousValues(row) {
                row._previousDataValues = previousVals;
                for(let change in row._changed){
                    if(row.dataValues[change] !== row._previousDataValues[change]){
                        row._changed[change] = true;
                    }
                }
                return row;
            }
            
            function respond(row) {
                res.send(row);
            }
        };
        
        return [
            raw,
            handle
        ];
    }

    bulkUpdate(sequelize, queryParams = ['id']){
        const handle = (req, res, next) => {
            return findAll(req.body)
                .then(checkAllFound)
                .then(updateAll)
                .then(reduceResponseToUpdated)
                .then(res.transform)
                .then(respond)
                .catch(next);

            function findAll(vals) {
                // remove all duplicates
                vals = vals.filter((elem, index, self) => {
                    return index == self.findIndex((e) => (JSON.stringify(e) === JSON.stringify(elem)));
                });
                return Promise.all(vals.map(findOneRow));
            }

            function checkAllFound(vals) {
                let invalidVals = [];
                for(let val of vals){
                    if(!val.rowToUpdate){
                        invalidVals.push(val.query);
                    }
                }

                if(invalidVals.length > 0){
                    throw new HttpStatusError(404, 'Failed to update because these rows could not be found: ' + JSON.stringify(invalidVals));
                }

                return vals;
            }

            function updateAttributes(row, val, t) {
                let previousVals = Object.assign({}, row._previousDataValues);
                return row
                    .updateAttributes(val, { transaction: t})
                    .then(row => {
                        row._previousDataValues = previousVals;
                        for(let change in row._changed){
                            if(row.dataValues[change] !== row._previousDataValues[change]){
                                row._changed[change] = true;
                            }
                        }
                        return row;
                    });
            }

            function updateAll(vals) {
                return sequelize
                    .transaction((t) => {
                        return Promise.all(vals
                            .map(val => {
                                return updateAttributes(val.rowToUpdate, val.valsToUpdate, t);
                            }));
                    })
            }

            function reduceResponseToUpdated(rows){
                return rows
                    .map(result => result.dataValues);
            }

            function respond(rows) {
                res.send(rows);
            }
        };

        const findOneRow = (val) => {
            let query = {};
            for(let queryParam of queryParams){
                query[queryParam] = val[queryParam];
                delete val[queryParam];
            }
            return this
                .findOne(query)
                .then((row) => {return {rowToUpdate: row, valsToUpdate: val, query: query};});
        };

        return [
            raw,
            handle
        ];
    }
    
    findOne(params, options) {
        options = _.merge(parse(params, this.model), options);

        return this.model.findOne(options);
    }
    
    findAndCountAll(params, options) {
        let parsed = parse(params, this.model);
        
        options = _(parsed)
            .defaults(this.defaults)
            .merge(options)
            .value();
        
        return this.model
            .findAndCountAll(options)
            .then(extract);
            
        function extract({ count, rows }) {
            const start = options.offset + 1;
            const end = Math.min(count, (options.offset + options.limit) || count);
        
            return { rows, start, end, count };
        }
    }
}

module.exports = ModelHandler;