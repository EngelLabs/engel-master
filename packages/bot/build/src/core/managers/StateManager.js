"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("../structures/Base");
class StateManager extends Base_1.default {
    _wsEvents = 0;
    _httpEvents = 0;
    _messages = {};
    _uncacheInterval;
    constructor(core) {
        super(core);
        core.events
            .registerListener('rawWS', this.rawWS.bind(this))
            .registerListener('rawREST', this.rawREST.bind(this))
            .registerListener('messageCreate', this.messageCreate.bind(this))
            .registerListener('messageUpdate', this.messageUpdate.bind(this))
            .registerListener('messageDelete', this.messageDelete.bind(this))
            .registerListener('guildDelete', this.guildDelete.bind(this))
            .registerListener('channelDelete', this.channelDelete.bind(this));
        core
            .on('config', this._configure.bind(this));
        setInterval(this._sync.bind(this), 10000);
    }
    _sync() {
        const clusterStats = JSON.stringify({
            ws: this._wsEvents,
            http: this._httpEvents,
            guilds: this.eris.guilds.size,
            members: this.eris.guilds.reduce((mCount, g) => mCount + g.memberCount, 0),
            users: this.eris.users.size
        });
        this._wsEvents = 0;
        this._httpEvents = 0;
        this.redis.hset('engel:clusters', `${this.baseConfig.client.id}:${this.baseConfig.cluster.id}`, clusterStats)
            .catch(err => this.log(err, 'error'));
    }
    _configure(config) {
        if (config.messageCache && config.messageUncacheInterval !== this.config?.messageUncacheInterval) {
            clearInterval(this._uncacheInterval);
            this._uncacheInterval = setInterval(this._uncacheMessages.bind(this), config.messageUncacheInterval);
        }
    }
    _uncacheMessages() {
        for (const id in this._messages) {
            const message = this._messages[id];
            if (message.createdAt < (Date.now() - this.config.messageMaxAge)) {
                delete this._messages[id];
            }
        }
    }
    getMessage(id) {
        return this._messages[id];
    }
    rawWS() {
        this._wsEvents++;
    }
    rawREST() {
        this._httpEvents++;
    }
    messageCreate({ message }) {
        if (!this.config.messageCache)
            return;
        if (message.author.bot)
            return;
        const copied = {
            id: message.id,
            content: message.content,
            author: message.author,
            channel: message.channel,
            createdAt: message.createdAt,
            guildID: message.guildID
        };
        this._messages[copied.id] = copied;
    }
    messageUpdate({ message }) {
        const oldMessage = this._messages[message.id];
        if (message.content !== oldMessage.content) {
            oldMessage.content = message.content;
        }
    }
    messageDelete({ message }) {
        delete this._messages[message.id];
    }
    guildDelete({ guild }) {
        for (const id in this._messages) {
            const message = this._messages[id];
            if (message.channel.guild.id === guild.id) {
                delete this._messages[id];
            }
        }
    }
    channelDelete({ channel }) {
        for (const id in this._messages) {
            const message = this._messages[id];
            if (message.channel.id === channel.id) {
                delete this._messages[id];
            }
        }
    }
}
exports.default = StateManager;
//# sourceMappingURL=StateManager.js.map