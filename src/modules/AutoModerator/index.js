const Module = require('../../core/structures/Module');


class AutoModerator extends Module {
    constructor() {
        super();

        this.dbName = 'automod';
        this.aliases = ['automod', 'automoderation'];
        this.info = 'Automate moderation for your server';
        this.disabled = true;
    }

    // injectHook() {
    //     this.listeners = [];
    //     this.listeners.push(this.messageCreate.bind(this));
    // }

    messageCreate({ guildConfig, message }) {
        if (!this.bot.ready) return;

        const config = this.bot.config;

        if (config.shutup) return;
    }
}


module.exports = AutoModerator;