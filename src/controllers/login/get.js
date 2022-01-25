const superagent = require('superagent');


module.exports = async function (server, req, res) {
        if (req.session.token) {
                return res.redirect('/');
        }

        let redirectUri;
        const baseConfig = server.baseConfig;

        redirectUri = baseConfig.dev
                ? `http://localhost:${baseConfig.site.port}/login`
                : baseConfig.site.port
                        ? `https://${baseConfig.site.host}:${baseConfig.site.port}/login`
                        : `https://${baseConfig.site.host}/login`;

        if (req.query && req.query.code) {
                const client = server.baseConfig.client;

                data = {
                        client_id: client.id,
                        client_secret: client.secret,
                        grant_type: 'authorization_code',
                        code: req.query.code,
                        redirect_uri: redirectUri,
                };

                // if (req.query.state) {
                //         params.state = req.query.state;
                // }

                let resp;

                try {
                        resp = await superagent
                                .post('https://discord.com/api/v9/oauth2/token')
                                .set('Accept', 'application/json')
                                .set('Content-Type', 'application/x-www-form-urlencoded')
                                .set('User-Agent', baseConfig.name)
                                .send(data);
                } catch (err) {
                        server.log(err, 'error', '/login.get');

                        return server.response(500, res);
                }

                req.session.token = resp.body.access_token;

                await server.fetchUserData(req, res);

                server.log(`Authorized ${req.session.user.id}.`, 'info', '/login.get');

                return server.renderer.index(req, res);
        }

        redirectUri = encodeURIComponent(redirectUri);

        const baseUrl = 'https://discord.com/api/v9';
        const _url = baseUrl +
                `/oauth2/authorize?response_type=code&client_id=${server.baseConfig.client.id}` +
                `&scope=guilds%20guilds.join%20identify&redirect_uri=${redirectUri}&prompt=consent`;

        return res.redirect(_url);
}