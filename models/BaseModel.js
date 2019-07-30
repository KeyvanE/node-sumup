require('dotenv').config();
const _ = require('underscore');
const logplease = require('logplease');

class BaseModel {
    constructor(args, token = null) {

        this.data = this.originalData = {};
        //api url from config
        this.url = process.env.API_URL;
        this.endpoint = "";
        this.whereString = "";
        this.where = null;
        this.headers = {};
        this.logger = logplease.create(this.constructor.name);

        //default headers
        this.headers['Authorization'] = "Bearer " + process.env.SUMUP_ACCESS_TOKEN;
        this.headers['Accept'] = "application/json";
        this.headers['Content-Type'] = "application/json";

        //fill model attributes
        if (args) {

            _.each(args, (value, key) => {
                this.originalData[key] = this.data[key] = value;
            })

        }
    }

    /**
     * Initialize an instance of the model without using the keyword "new"
     * @param {object} args Parameters to initialize the model with
     * @param {string} token JWT token
     */
    static forge(args) {
        return new this(args);
    }

    /**
     * Add parameters to the URL encoded string of parameters
     * @param {object} args Parameters to be added
     * @param {string} token JWT Token
     */
    static where(args, token = null) {
        let instance = new this(args, token);
        instance.where = args;
        instance.whereString = "?";
        _.each(args, (value, name) => {
            instance.whereString += `${name}=${value}&`;
        });
        return instance;
    }

    /**
     * Get a property from a model
     * @param {string} property 
     */
    get(property) {
        return this.data[property];
    }

    /**
     * Set a property value on a model
     * @param {string} property 
     * @param {*} value 
     */
    set(property, value) {
        this.data[property] = value;
    }

    serialize() {
        return this.data;
    }

    toString() {
        return JSON.stringify(this.data);
    }

    urlEncode() {
        let parts = [];
        _.each(this.data, (value, index) => {
            parts.push(index + "=" + encodeURI(value));
        });
        return parts.join("&");
    }

}

module.exports = BaseModel;