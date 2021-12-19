const Module = require('../../structures/Module');
const reload = require('require-reload')(require);
const EventManager = reload('./EventManager');


class Logging extends Module {
    constructor() {
        super();

        this.aliases = ['logs', 'serverlogging'];
        this.info = 'Enables logging various server events to channels';

        this.disabled = true;
    }

    injectHook() {
        this.manager = new EventManager(this);

        this.listeners.push(this.messageCreate.bind(this));
        this.listeners.push(this.messageUpdate.bind(this));
        this.listeners.push(this.messageDelete.bind(this));
    }

    preMessage(message) {
        if (message.author && message.author.bot) return;
        if (!message.channel || !message.channel.guild) return;

        const guildID = message.channel.guild.id;
    }

    messageCreate(message) {
        if (!this.preMessage(message)) return;

        const copied = {
            content: message.content,
            author: {
                id: message.author.id,
                username: message.author.username,
                discriminator: message.author.discriminator,
                avatarURL: message.author.avatarURL,
            },
            guild: message.channel.guild.id,
        };

        return this.models.Message.create(copied);
    }

    messageUpdate(message, oldMessage) {
        if (!message.content) return;
        if (oldMessage && oldMessage.content === message.content) return;

        return this.models.Message
            .updateOne(
                { id: message.id, guild: guildID },
                { $set: { content: message.content } })
            .exec();
    }

    messageDelete(message) {
        const guildID = message.guildID ||
            (message.channel && message.channel.guild && message.channel.guild.id);

        if (!guildID) return;

        return this.models.Message
            .deleteOne({ id: message.id, guild: guildID })
            .exec();
    }
}


module.exports = Logging;