"use strict";
const superagent = require("superagent");
module.exports = async function (app, req, res) {
    if (req.session.token) {
        return res.redirect('/');
    }
    const baseConfig = app.baseConfig;
    let redirectUri = baseConfig.dev
        ? `http://localhost:${baseConfig.site.port}/login`
        : baseConfig.site.port
            ? `https://${baseConfig.site.host}:${baseConfig.site.port}/login`
            : `https://${baseConfig.site.host}/login`;
    if (req.query && req.query.code) {
        const client = app.baseConfig.client;
        const data = {
            client_id: client.id,
            client_secret: client.secret,
            grant_type: 'authorization_code',
            code: req.query.code,
            redirect_uri: redirectUri
        };
        try {
            var resp = await superagent
                .post('https://discord.com/api/v9/oauth2/token')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .set('User-Agent', baseConfig.name)
                .send(data);
        }
        catch {
            return res.redirect('/login');
        }
        req.session.token = 'Bearer ' + resp.body.access_token;
        await app.requests.fetchUserData(req);
        app.requests.syncLocals(req, res);
        app.log(`Authorized ${req.session.user.id}.`, 'debug', '/login.get');
        return res.redirect('/');
    }
    redirectUri = encodeURIComponent(redirectUri);
    const baseUrl = 'https://discord.com/api/v9';
    const _url = baseUrl +
        `/oauth2/authorize?response_type=code&client_id=${app.baseConfig.client.id}` +
        `&scope=guilds%20guilds.join%20identify&redirect_uri=${redirectUri}&prompt=consent`;
    return res.redirect(_url);
};
//# sourceMappingURL=get.js.map