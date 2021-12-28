const Controller = require('../structures/Controller');
const superagent = require('superagent');


class Index extends Controller {
    constructor() {
        super();

        return [
            {
                use: this.middleware.bind(this),
            },
            {
                uri: '/',
                get: this.get.bind(this),
            },
            {
                uri: '/login',
                get: this.login.bind(this),
            },
        ];
    }

    async middleware(req, res, next) {
        const locals = res.locals = {
            config: this.config,
            scripts: ['/js/react/navbar.js'],
            stylesheets: ['/css/navbar.css'],
        }
        
        if (req.session && req.session.user) {
            try {
                await this.getUserData(req);
            } catch (err) {
                if (err && err.status === 401) {
                    return res.redirect('/');
                }
            }

            locals.user = req.session.user;
            locals.guilds = req.session.guilds;
            locals.allGuilds = req.session.allGuilds;

            req.session.isAdmin = this.config.users.developers.includes(req.session.user.id);
        }

        res.locals = locals;

        return next();
    }

    get(req, res) {
        res.locals.scripts.push('/js/react/homepage.js');
        res.locals.stylesheets.push('/css/index.css');

        return res.render('index');
    }

    async login(req, res) {
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


module.exports = Index;