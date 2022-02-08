const Module = require('../../core/structures/Module');
const reload = require('require-reload')(require);
const Events = reload('./helpers/Events');


class Logging extends Module {
        constructor() {
                super();

                this.aliases = ['logs', 'serverlogging'];
                this.info = 'Enables logging various server events to channels';
        }

        injectHook() {
                this.tasks = [];
                this.listeners = [];
                this._scheduled = {};

                this._events = new Events(this);

                const wrap = fn => this.wrapListener(fn);

                this.listeners.push(wrap(this.messageUpdate.bind(this)));
                this.listeners.push(wrap(this.messageDelete.bind(this)));
                this.listeners.push(wrap(this.guildRoleCreate.bind(this)));
                this.listeners.push(wrap(this.guildRoleDelete.bind(this)));
                this.listeners.push(wrap(this.guildRoleUpdate.bind(this)));

                this.tasks.push(
                        [this.dispatchWebhooks.bind(this), 6500],
                );
        }

        wrapListener(fn) {
                const wrapped = async payload => {
                        const { guildConfig, isDM } = payload;

                        if (isDM || !guildConfig) return;

                        const config = this.config;

                        if (this.baseConfig.dev && !config.guilds.testing.includes(guildConfig.id)) return;

                        if (!guildConfig.logging || guildConfig.logging.disabled) return;

                        if (config.shutup && (guildConfig.id !== config.guilds.official.id)) return;

                        return fn(payload);
                }

                const listener = {
                        event: fn.name,
                        execute: wrapped
                };

                return listener;
        }

        dispatchWebhooks() {
                const allEmbeds = this._scheduled;

                this._scheduled = {};

                for (const key in allEmbeds) {
                        const { guildConfig, eventConfig, embeds } = allEmbeds[key];

                        this.executeWebhook(guildConfig, eventConfig, embeds);
                }
        }

        async executeWebhook(guildConfig, eventConfig, embeds) {
                while (embeds.length) {
                        const toSend = embeds.splice(0, 10);

                        try {
                                await this.eris.executeWebhook(eventConfig.webhook.id, eventConfig.webhook.token, { embeds: toSend });
                        } catch (err) {
                                if (err.code === 10015) {
                                        let msg = '';

                                        msg += 'One of my webhooks were removed from this channel.\n';
                                        msg += 'Logs sent using said webhook have been put on hold.\n';
                                        msg += 'Please reconfigure webhooks using the `logging refresh` command.';

                                        this.eris.createMessage(eventConfig.channel, msg).catch(() => false);

                                        const update = {
                                                [`logging.${eventConfig.name}.webhook`]: null,
                                                [`logging.${eventConfig.name}.channel`]: null,
                                        };

                                        this.bot.guilds.update(guildConfig, { $unset: update });

                                        if (guildConfig.logging?.[eventConfig.name]) {
                                                const actual = guildConfig.logging[eventConfig.name];

                                                delete actual.webhook;
                                                delete actual.channel;
                                        }

                                        break;
                                } else {
                                        this.log(err, 'error');
                                }
                        }
                }
        }

        scheduleEmbeds(guildConfig, eventConfig, webhook, eventName, embeds) {
                if (!this._scheduled[webhook.id]) {
                        this._scheduled[webhook.id] = {
                                guildConfig: guildConfig,
                                eventConfig: Object.assign({ name: eventName, webhook }, eventConfig),
                                embeds: embeds
                        };
                } else {
                        this._scheduled[webhook.id].embeds.push(...embeds);
                }
        }

        guildRoleCreate({ guildConfig, guild, role }) {
                return this._events.guildRoleCreate(guildConfig, guild, role);
        }

        guildRoleDelete({ guildConfig, guild, role }) {
                return this._events.guildRoleDelete(guildConfig, guild, role);
        }

        guildRoleUpdate({ guildConfig, guild, role, oldRole }) {
                return this._events.guildRoleUpdate(guildConfig, guild, role, oldRole);
        }

        messageUpdate({ guildConfig, message, oldMessage }) {
                if (oldMessage.content !== message.content) {
                        return this._events.messageContentUpdate(guildConfig, message, oldMessage);
                }
        }

        messageDelete({ guildConfig, message }) {
                return this._events.messageDelete(guildConfig, message);
        }
}


module.exports = Logging;