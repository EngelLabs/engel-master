/* This module borrows conversion logic from discord.py */
// I will be also redoing this core class
const { ChannelTypes } = require('eris').Constants;

const idRegex = /([0-9]{15,20})$/;
const roleMentionRegex = /<@&([0-9]{15,20})>$/;
const userMentionRegex = /<@!?([0-9]{15,20})>$/;
const channelMentionRegex = /<#([0-9]{15,20})>$/;
const timeRegex = /[a-zA-Z]+|[0-9]+/g;

const invalidArgument = 'Invalid argument.';
const invalidArugment2 = `Invalid argument. Try again by providing an ID/@mention?`


class Converter {
    constructor(core) {
        this.bot = core.bot;
        this.eris = core.eris;
    }

    role(ctx, argument) {
        return new Promise((resolve, reject) => {
            if (!argument || !argument.length) return reject(invalidArgument);

            let match = argument.match(idRegex);

            if (!match || !match.length) {
                match = argument.match(roleMentionRegex);

                if (!match || !match.length) {
                    return reject(invalidArugment2);
                }
            }

            resolve(ctx.guild.roles.get(match[1]));
        });
    }

    member(ctx, argument) {
        return new Promise((resolve, reject) => {
            if (!argument || !argument.length) return reject(invalidArgument);

            let match = argument.match(idRegex);

            if (!match || !match.length) {
                match = argument.match(userMentionRegex);

                if (!match || !match.length) {
                    return reject(invalidArugment2);
                }
            }

            const member = ctx.guild.members.get(match[1]);

            member
                ? resolve(member)
                : this.eris.getRESTGuildMember(ctx.guild.id, match[1])
                    .then(member => resolve(member))
                    .catch(() => resolve(false));
        });
    }

    user(ctx, argument) {
        return new Promise((resolve, reject) => {
            if (!argument || !argument.length) return reject(invalidArgument);

            let match = argument.match(idRegex);

            if (!match || !match.length) {
                match = argument.match(userMentionRegex);
                if (!match || !match.length) {
                    return reject(invalidArugment2);
                }
            }

            const user = this.eris.users.get(match[1]);

            user
                ? resolve(user)
                : this.eris.getRESTUser(match[1])
                    .then(user => resolve(user))
                    .catch(() => resolve(false));
        });
    }

    channel(ctx, argument) {
        return new Promise((resolve, reject) => {
            if (!argument || !argument.length) return reject(invalidArgument);

            let match = argument.match(idRegex);

            if (!match || !match.length) {
                match = argument.match(channelMentionRegex);
                if (!match || !match.length) {
                    return reject(invalidArugment2);
                }
            }

            const channel = ctx.guild.channels.get(match[1]);

            channel
                ? resolve(channel)
                : this.eris.getRESTChannel(match[1])
                    .then(channel => resolve(channel))
                    .catch(() => resolve(false));
        });
    }

    textChannel(ctx, argument) {
        return new Promise((resolve, reject) => {
            if (!argument || !argument.length) return reject(invalidArgument);

            let match = argument.match(idRegex);

            if (!match || !match.length) {
                match = argument.match(channelMentionRegex);
                if (!match || !match.length) {
                    return reject(invalidArugment2);
                }
            }

            const channel = ctx.guild.channels.get(match[1]);

            if (channel && channel.type !== ChannelTypes.GUILD_TEXT) {
                return reject(`${channel.mention} is not a text channel.`);
            }

            channel
                ? resolve(channel)
                : this.eris.getRESTChannel(match[1])
                    .then(channel => {
                        channel.type === ChannelTypes.GUILD_TEXT
                            ? resolve(channel)
                            : reject(`${channel.mention} is not a text channel.`);
                    })
                    .catch(() => resolve(false));
        });
    }

    channelId(argument) {
        if (!argument || !argument.length) return invalidArgument;

        let match = argument.match(idRegex);

        if (!match || !match.length) {
            match = argument.match(channelMentionRegex);
            if (!match || !match.length) {
                return invalidArugment2;
            }
        }

        return match[1];
    }

    userId(argument) {
        if (!argument || !argument.length) return invalidArgument;

        let match = argument.match(idRegex);

        if (!match || !match.length) {
            match = argument.match(userMentionRegex);
            if (!match || !match.length) {
                return invalidArugment2;
            }
        }

        return match[1];
    }

    duration(argument) {
        if (!argument || !argument.length) return;

        const match = argument.match(timeRegex);

        if (!match || !match.length) return;

        const ret = parseInt(match[0], 10);

        switch (match[1]) {
            case 's':
                return Math.round(ret);

            case 'm':
                return Math.round(ret * 60);

            case 'h':
                return Math.round(ret * 60 * 60);

            case 'd':
                return Math.round(ret * 60 * 60 * 24);

            case 'w':
                return Math.round(ret * 60 * 60 * 24 * 7);

            case 'mo':
                return Math.round(ret * 60 * 60 * 24 * 30);
        }
    }
}


module.exports = Converter;