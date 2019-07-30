const _ = require("underscore");

class Collection {
    constructor(Model, data) {
        this.models = [];
        _.each(data, dataSet => {
            this.models.push(new Model(dataSet));
        });
    }

    serialize(args) {
        let json = [];
        _.each(this.models, model => {
            json.push(model.serialize(args));
        })
        return json;
    }
}

module.exports = Collection;