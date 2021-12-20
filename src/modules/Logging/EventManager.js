const colorMapping = {
    yellow: 14921762,
    red: 12202793
};



class EventManager {
    constructor(module) {
        this.module = module;
        this.bot = module.bot;
        this.eris = module.eris;

        this.scheduled = {};

        this.registerEvent('messageUpdate');
        this.registerEvent('messageDelete');

        module.tasks.push(
            [this.dispatchWebhooks.bind(this, 6500)]
        );
    }

    dispatchWebhooks() {
        const allEmbeds = this.scheduled;

        this.scheduled = {};

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

                    if (guildConfig.logging && guildConfig.logging[eventConfig.name]) {
                        const actual = guildConfig.logging[eventConfig.name];

                        delete actual.webhook;
                        delete actual.channel;
                    }

                    break;
                } else {
                    this.module.log(err, 'error')
                }
            }
        }
    }

    registerEvent(methodName) {
        const wrapped = async (...args) => {
            const o = args[0];
            let guildID;

            if (o.channel) {
                if (o.author.bot) return;

                guildID = o.channel.guild && o.channel.guild.id;
            }

            if (!guildID) return;

            const config = this.bot.config;
            if (config.dev && !config.guilds.testing.includes(guildID)) return;
            if (config.shutup && guildID !== config.guilds.official.id) return;

            const guildConfig = await this.bot.guilds.getOrFetch(guildID);

            if (!guildConfig || guildConfig.isIgnored);

            const moduleConfig = guildConfig.logging;
            if (!moduleConfig || moduleConfig.disabled) return;

            const eventConfig = moduleConfig[methodName];
            if (!eventConfig || eventConfig.disabled) return;
            if (!eventConfig.webhook || !eventConfig.channel) return;

            const embed = await this['_' + methodName](guildConfig, ...args);

            if (typeof embed.color !== 'undefined') {
                embed.color = eventConfig.color || moduleConfig[embed.color] || colorMapping[embed.color];
            }

            embed.timestamp = embed.timestamp || new Date().toISOString();

            this.scheduleEmbed(guildConfig, eventConfig, methodName, embed);
        }

        const listener = {
            event: methodName,
            execute: wrapped,
        };

        this['_' + methodName] = this[methodName].bind(this);
        this[methodName] = wrapped;
        this.module.listeners.push(listener);
    }

    scheduleEmbed(guildConfig, eventConfig, eventName, embed) {
        if (!this.scheduled[eventConfig.webhook.id]) {
            this.scheduled[eventConfig.webhook.id] = {
                guildConfig: guildConfig,
                eventConfig: Object.assign({ name: eventName }, eventConfig),
                embeds: []
            };
        }

        this.scheduled[eventConfig.webhook.id].embeds.push(embed);
    }

    messageDelete(_, message) {
        let msg = '';

        msg += `**Message deleted**\n`;
        msg += `**Channel:** ${message.channel.mention} (${message.channel.id})\n`;
        msg += `**Author:** ${message.author.mention} (${message.author.id})\n`;
        msg += `**Content:** ${message.content}\n`;

        return {
            color: 'red',
            description: msg,
            timestamp: new Date(message.createdAt).toISOString(),
            footer: {
                text: 'Sent at',
            },
            author: {
                name: message.author.username + '#' + message.author.discriminator,
                url: message.author.avatarURL,
                icon_url: message.author.avatarURL,
            },
        };
    }

    messageUpdate(_, message, oldMessage) {
        let msg = '';

        msg += `**Message edited**\n`;
        msg += `**Channel:** ${message.channel.mention} (${message.channel.id})\n`;
        msg += `**Author:** ${message.author.mention} (${message.author.id})\n`;
        msg += `**Before:** ${oldMessage.content}\n`;
        msg += `**After:** ${message.content}\n`;

        return {
            color: 'yellow',
            description: msg,
            timestamp: new Date(message.createdAt).toISOString(),
            footer: {
                text: 'Sent at'
            },
            author: {
                name: message.author.username + '#' + message.author.discriminator,
                url: message.author.avatarURL,
                icon_url: message.author.avatarURL,
            },
        };
    }
}


module.exports = EventManager;