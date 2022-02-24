const { Module } = require('@engel/core');


class AutoModerator extends Module {
        constructor() {
                super();

                this.dbName = 'automod';
                this.aliases = ['automod', 'automoderation'];
                this.info = 'Configurable auto server moderation';
                this.disabled = true;
        }

        injectHook() {
                this.listeners = [];

                this.listeners.push(this.messageCreate.bind(this));
        }

        messageCreate({ guildConfig, message }) {
                if (!this.bot.isReady) return;

                const config = this.config;

                if (config.shutup) return;
        }
}


module.exports = AutoModerator;