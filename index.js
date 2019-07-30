require('dotenv').config();

const Checkout = require('./models/Checkout');
const Auth = require('./models/Auth');
const Token = require('./models/Token');

module.exports = {
    config: function (args) {

        process.env.SUMUP_API_URL = "https://api.sumup.com/v0.1/";

        if (args.client_id) {
            process.env.SUMUP_CLIENT_ID = args.client_id;
        } else {
            throw new Error("Missing client ID");
        }

        if (args.client_secret) {
            process.env.SUMUP_CLIENT_SECRET = args.client_secret;
        } else {
            throw new Error("Missing client secret key");
        }

        if (args.redirect_uri) {
            process.env.SUMUP_REDIRECT_URI = args.redirect_uri;
        } else {
            throw new Error("Missing redirect URI");
        }

        return this;

    },
    //Express middleware
    expressMd: function (req, res, next) {

        let host = req.get('host');

        //we use this to detect local hostnames and show that instead of localhost
        if (req.headers['x-forwarded-host']) {
            if (req.app.locals.domains.indexOf(req.headers['x-forwarded-host']) === -1)
                host = req.headers['x-forwarded-host'];
        }

        let url = req.protocol + "://" + host + req.originalUrl;

        //we were just redirected from SumUp after logging in
        if (url.indexOf(process.env.SUMUP_REDIRECT_URI) > -1 && req.query.code) {

            Auth.requestToken(req.query.code).then(function (json) {
                console.log("Logged in with SumUp. Add this line in your .env file :")
                console.log("SUMUP_REFRESH_TOKEN=", json.refresh_token);
                res.redirect('/');
            });

        } else {

            //refresh token exists, we use it to renew the access token if needed
            if (process.env.SUMUP_REFRESH_TOKEN) {
                Auth.refreshToken();
                next();
            } else {
                //refresh token does not exist, let's login with SumUp
                Auth.requestURI().then(url => {
                    res.redirect(url);
                });
            }

        }

    },
    Checkout: Checkout,
    Auth: Auth
}