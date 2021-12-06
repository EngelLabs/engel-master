const Controller = require('../structures/Controller');


class Index extends Controller {
    constructor() {
        super();

        return [
            {
                uri: '/',
                use: this.middleware.bind(this),
                get: this.get.bind(this),
            },
        ];
    }

    middleware(req, res, next) {
        const locals = {
            config: this.config,
            scripts: ['/js/react/navbar.js'],
            stylesheets: ['/css/navbar.css'],
        }

        if (req.session && req.session.user) {
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
}


module.exports = Index;