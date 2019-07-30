require('dotenv').config();
const BaseModel = require('./BaseModel');
const fetch = require('node-fetch');

class Checkout extends BaseModel {
    constructor(args) {
        super(args);
        this.endpoint = "checkouts";
    }

    create(checkout_reference = null, amount = null, currency = null, pay_to_email = null) {

        if (checkout_reference) this.set("checkout_reference", checkout_reference);
        if (amount) this.set("amount", amount);
        if (currency) this.set("currency", currency);
        if (pay_to_email) this.set("pay_to_email", pay_to_email);

        return new Promise((resolve, reject) => {
            fetch(process.env.SUMUP_API_URL + this.endpoint, {
                method: 'POST',
                body: JSON.stringify({
                    checkout_reference: this.get("checkout_reference"),
                    amount: this.get("amount"),
                    currency: this.get("currency"),
                    pay_to_email: this.get("pay_to_email")
                }),
                headers: this.headers,
            })
                .then(res => res.json())
                .then(json => {
                    resolve(new this.constructor(json));
                })
        });
    }

    process(payment_type = null, card = null) {

        if (payment_type) this.set("payment_type", payment_type);
        if (card) this.set("card", card);

        let query = {
            url: process.env.SUMUP_API_URL + this.endpoint + "/" + this.get("id"),
            body: this.toString(),
            method: "PUT",
            headers: this.headers
        }

        if (process.env.DEBUG) {
            this.logger.info(query.method + " : " + query.url);
            this.logger.info("BODY : ", query.body);
            this.logger.info("HEADERS : ", query.headers);
        }

        return new Promise((resolve, reject) => {
            fetch(query.url, {
                method: query.method,
                body: query.body,
                headers: query.headers,
            })
                .then(res => res.json())
                .then(json => {
                    if (json.id) {
                        resolve(new this.constructor(json));
                    } else {
                        reject(json);
                    }
                })
        });
    }
}

module.exports = Checkout;
