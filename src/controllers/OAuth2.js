const Controller = require('../structures/Controller');
const superagent = require('superagent');


class OAuth2 extends Controller {
    constructor() {
        super();

        return [
            {
                uri: '/login',
                get: this.get.bind(this),
            },
        ];
    }

    async get(req, res) {
        if (req.session && req.session.token) return res.redirect('/');
        if (req.query && req.query.code) {
            const client = this.baseConfig.client;
            const body = {
                client_id: client.id,
                client_secret: client.secret,
                grant_type: 'authorization_code',
                code: req.query.code,
                redirect_uri: 'http://localhost:8080/login',
            };

            if (req.query.state) {
                body.state = req.query.state;
            }

            const resp = await superagent
                .post('https://discord.com/api/v9/oauth2/token')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send(body)
                .catch(err => {
                    this.internalServerError(res, null, err);

                    return false;
                });

            if (!resp) return;

            req.session.token = resp.body && resp.body.access_token;

            await this.getUserData(req);

            this.logger.info(`[Controllers.${this.name}] Authorized ${req.session.user.id}.`);

            return res.redirect('/');
        }

        const baseUrl = 'https://discord.com/api/v9';
        const url = baseUrl + `/oauth2/authorize?response_type=code&client_id=${this.baseConfig.client.id}&scope=guilds%20guilds.join%20identify&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Flogin&prompt=consent`;

        return res.redirect(url);
    }
}


module.exports = OAuth2;