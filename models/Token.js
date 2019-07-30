require('dotenv').config();
const BaseModel = require('./BaseModel');

class Token extends BaseModel {
    constructor(args) {
        super(args);
        this.endpoint = "token";
    }
}

module.exports = Token;
