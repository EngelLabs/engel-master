'use strict';

const Server = require('../core/Server');
const superagent = require('superagent');
const { Permissions } = require('eris').Constants;


class Controller {
    constructor() {
        if (new.target === Controller) throw new Error(
            'Cannot construct Controller instances directly'
        );

        this.server = Server.instance;
    }

    get name() {
        return this.constructor.name;
    }

    get app() {
        return this.server.app;
    }

    get baseConfig() {
        return this.server.baseConfig;
    }

    get config() {
        return this.server.config;
    }

    get eris() {
        return this.server.eris;
    }

    get logger() {
        return this.server.logger;
    }

    get database() {
        return this.server.database;
    }

    get redis() {
        return this.server.redis;
    }

    get modules() {
        return this.server.modules;
    }

    get commands() {
        return this.server.commands;
    }

    collection(...args) {
        return this.server.database.collection(...args);
    }

    updateGuild(id, update) {
        return this.collection('guilds').updateOne({ id }, update)
            .then(result => {
                this.redis.publish('guildUpdate', id);

                return result;
            });
    }

    apiRequest(token, path) {
        return superagent
            .get('https://discord.com/api/v9' + path)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + token)
            .set('User-Agent', this.baseConfig.name)
            .then(resp => resp.body);
    }

    async getUserData(req) {
        const token = req.session.token;
        const [user, guilds] = await Promise.all([
            this.apiRequest(token, '/users/@me'),
            this.apiRequest(token, '/users/@me/guilds')
        ]);

        req.session.user = user;
        req.session.allGuilds = guilds;
        req.session.guilds = guilds.filter(g => {
            return g.owner ||
                (!!(g.permissions & Permissions.manageGuild.toString())) ||
                (!!(g.permissions & Permissions.administrator.toString()));
        });
    }

    success(res, data) {
        return this._successResponse(res, 200, data);
    }

    created(res, data) {
        return this._successResponse(res, 201, data);
    }

    empty(res) {
        return this._successResponse(res, 204);
    }

    badRequest(res, code = 0, msg) {
        return this._errorResponse(res, 400, code, msg);
    }

    unauthorized(res, code = 0, msg) {
        return this._errorResponse(res, 401, code, msg);
    }

    forbidden(res, code = 0, msg) {
        return this._errorResponse(res, 403, code, msg);
    }

    notFound(res, code = 0, msg) {
        return this._errorResponse(res, 404, code, msg);
    }

    internalServerError(res, code = 0, msg) {
        if (msg) {
            this.logger.error(`[Controllers.${this.name}] Something went wrong.`);
            console.error(msg);
        }

        return this._errorResponse(res, 500, code, 'Something went wrong.');
    }

    _successResponse(res, status, data) {
        return res.status(status || 200).send(data ? { data } : null);
    }

    _errorResponse(res, status, code, message) {
        const data = { message };

        data.code = typeof code === 'number' ? code : 0;

        return res.status(status).send(data);
    }
}


module.exports = Controller;