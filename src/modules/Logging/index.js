const Module = require('../../structures/Module');
const reload = require('require-reload')(require);
const EventManager = reload('./EventManager');


class Logging extends Module {
    constructor() {
        super();

        this.aliases = ['logs', 'serverlogging'];
        this.info = 'Enables logging various server events to channels';

        // this.disabled = true;
    }

    injectHook() {
        this.tasks = [];
        this.listeners = [];

        this.listeners.push(this.messageCreate.bind(this));
        this.listeners.push(this.messageUpdate.bind(this));
        this.listeners.push(this.messageDelete.bind(this));

        this.tasks.push(
            [this.deleteMessages.bind(this), 120000]
        );

        this.manager = new EventManager(this);
    }
    
    deleteMessages() {
        return this.models.Message
            .deleteMany({ createdAt: { $lte: Date.now() - (4 * 24 * 60 * 60 * 1000) }})
            .exec();
    }

    async preMessage(message) {
        if (message.author && message.author.bot) return false;

        let guildID;

        if (message.channel && message.channel.guild) {
            guildID = message.channel.guild.id;
        } else {
            guildID = message.guildID;
        }

        if (!guildID) return false;

        const guildConfig = await this.bot.guilds.getOrFetch(guildID);

        return guildConfig && guildConfig.logging && !guildConfig.logging.disabled;
    }

    async messageCreate(message) {
        if (!await this.preMessage(message)) return;

        const copied = {
            id: message.id,
            content: message.content,
            author: {
                id: message.author.id,
                username: message.author.username,
                discriminator: message.author.discriminator,
                avatarURL: message.author.avatarURL,
            },
            channel: {
                id: message.channel.id,
                name: message.channel.name,
            },
            guild: message.channel.guild.id,
            createdAt: message.createdAt,
        };

        return this.models.Message.create(copied);
    }

    messageUpdate(message, oldMessage) {
        if (!message.content) return;
        if (oldMessage && oldMessage.content === message.content) return;

        return this.models.Message
            .updateOne(
                { id: message.id, 'channel.id': message.channel.id },
                { $set: { content: message.content } })
            .exec();
    }

    messageDelete(message) {
        if (!this.preMessage(message)) return;
        const guildID = message.guildID ||
            (message.channel && message.channel.guild && message.channel.guild.id);

        if (!guildID) return;

        return this.models.Message
            .deleteOne({ id: message.id, guild: guildID })
            .exec();
    }
}


module.exports = Logging;