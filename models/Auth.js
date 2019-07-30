require('dotenv').config();
const BaseModel = require('./BaseModel');
const fetch = require('node-fetch');

class Auth extends BaseModel {
    constructor(args) {
        super(args);
        this.endpoint = "authorize";
    }

    static mustRevalidate() {
        if (typeof process.env.SUMUP_ACCESS_TOKEN == "undefined"
            || (Date.now() / 1000 - process.env.SUMUP_TOKEN_BIRTH) > process.env.SUMUP_TOKEN_DURATION) {
            return true;
        } else {
            return false;
        }
    }

    static refreshToken() {

        if (Auth.mustRevalidate()) {
            let url = "https://api.sumup.com/token";
            let body = "grant_type=refresh_token&client_id=" + process.env.SUMUP_CLIENT_ID + "&client_secret=" + process.env.SUMUP_CLIENT_SECRET + "&refresh_token=" + process.env.SUMUP_REFRESH_TOKEN;

            fetch(url, {
                method: 'post',
                body: body,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            })
                .then(res => res.json())
                .then(json => {
                    Auth.setEnvironnementVariables(json);
                })
        }
    }

    static requestURI() {
        return new Promise((resolve, reject) => {
            let url = "https://api.sumup.com/authorize?response_type=code&client_id=" + process.env.SUMUP_CLIENT_ID + "&redirect_uri=" + process.env.SUMUP_REDIRECT_URI;
            fetch(url)
                .then(res => {
                    resolve(url);
                });
        });
    }

    static requestToken(code) {
        return new Promise((resolve, reject) => {

            let url = "https://api.sumup.com/token";
            let body = "grant_type=authorization_code&client_id=" + process.env.SUMUP_CLIENT_ID + "&client_secret=" + process.env.SUMUP_CLIENT_SECRET + "&code=" + code;

            fetch(url, {
                method: 'post',
                body: body,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            })
                .then(res => res.json())
                .then(json => {
                    Auth.setEnvironnementVariables(json);
                    resolve(json);
                })
        });
    }

    /**
     * Set environnement variables for later use
     * @param {*} json 
     */
    static setEnvironnementVariables(json) {
        process.env.SUMUP_ACCESS_TOKEN = json.access_token;
        process.env.SUMUP_TOKEN_TYPE = json.token_type;
        //token duration
        process.env.SUMUP_TOKEN_DURATION = json.expires_in - 1000;
        //token date of birth in seconds since January 1, 1970
        process.env.SUMUP_TOKEN_BIRTH = Date.now() / 1000;
        //refresh token
        process.env.SUMUP_REFRESH_TOKEN = json.refresh_token;
    }
}

module.exports = Auth;
