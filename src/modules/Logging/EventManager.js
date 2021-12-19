class EventManager {
    constructor(module) {
        this.bot = module.bot;
        this.listeners = module.listeners = [];

        this.registerEvent('messageUpdate');
        this.registerEvent('messageDelete');
    }

    registerEvent(methodName) {
        const wrapped = async (...args) => {
            const o = args[0];
            let guildID;

            if (o instanceof Message) {
                if (o.author.bot) return;

                guildID = o.channel.guild && o.channel.guild.id;
            }

            if (!guildID) return;

            const config = this.bot.config;
            if (config.dev && !config.guilds.testing.includes(guildID)) return;
            if (config.shutup && guildID !== config.guilds.official.id) return;

            const guildConfig = await this.bot.guilds.getOrFetch(guildID);

            if (!guildConfig || guildConfig.isIgnored);
            if (!guildConfig.logging || guildConfig.logging.disabled) return;

            const embed = this[methodName].call(this, guildConfig, ...args);

            embed.color = this.resolveColour(guildConfig, embed.color);
            embed.timestamp = embed.timestamp || new Date().toISOString();

            /* ... */
        }

        const listener = {
            event: methodName,
            execute: wrapped,
        };

        this[methodName] = wrapped;
        this.listeners.push(listener);
    }

    resolveColour(guildConfig, color) {
        const moduleConfig = guildConfig.logging;

        /* ... */
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