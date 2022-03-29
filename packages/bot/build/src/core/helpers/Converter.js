"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eris = require("eris");
const Base_1 = require("../structures/Base");
const idRegex = /([0-9]{15,20})$/;
const roleMentionRegex = /<@&([0-9]{15,20})>$/;
const userMentionRegex = /<@!?([0-9]{15,20})>$/;
const channelMentionRegex = /<#([0-9]{15,20})>$/;
const timeRegex = /[a-zA-Z]+|[0-9]+/g;
const invalidArgument = 'Invalid argument.';
const invalidArugment2 = 'Invalid argument. Try again by providing an ID/@mention?';
class Converter extends Base_1.default {
    role(guild, argument) {
        return new Promise((resolve, reject) => {
            const match = this.roleID(argument);
            if (isNaN(parseInt(match)))
                return reject(match);
            resolve(guild.roles.get(match));
        });
    }
    member(guild, argument, fetch = false) {
        return new Promise((resolve, reject) => {
            const match = this.userID(argument);
            if (isNaN(parseInt(match)))
                return reject(match);
            const member = guild.members.get(match);
            if (member || !fetch)
                return resolve(member);
            this.eris.getRESTGuildMember(guild.id, match)
                .then(member => resolve(member))
                .catch(() => resolve(null));
        });
    }
    user(argument, fetch = false) {
        return new Promise((resolve, reject) => {
            const match = this.userID(argument);
            if (isNaN(parseInt(match)))
                return reject(match);
            const user = this.eris.users.get(match);
            if (user || !fetch)
                return resolve(user);
            this.eris.getRESTUser(match)
                .then(user => resolve(user))
                .catch(() => resolve(null));
        });
    }
    channel(guild, argument, fetch = false) {
        return new Promise((resolve, reject) => {
            const match = this.channelID(argument);
            if (isNaN(parseInt(match)))
                return reject(match);
            const channel = guild.channels.get(match);
            if (channel || !fetch)
                return resolve(channel);
            this.eris.getRESTChannel(match)
                .then(channel => resolve(channel))
                .catch(() => resolve(null));
        });
    }
    textChannel(guild, argument, fetch = false) {
        return new Promise((resolve, reject) => {
            this.channel(guild, argument, fetch)
                .then(channel => {
                if (channel?.type !== eris.Constants.ChannelTypes.GUILD_TEXT) {
                    return reject(`${channel.mention} is not a text channel.`);
                }
                resolve(channel);
            })
                .catch(reject);
        });
    }
    id(argument) {
        if (!argument || !argument.length)
            return invalidArgument;
        const match = argument.match(idRegex);
        if (!match || !match.length)
            return 'Invalid ID.';
        return match[1];
    }
    _convertID(argument, altRegex, errorMsg = invalidArugment2) {
        let match = this.id(argument);
        if (isNaN(parseInt(match))) {
            match = argument.match(altRegex);
            if (!match || !match.length) {
                return errorMsg;
            }
            return match[1];
        }
        return match;
    }
    channelID(argument) {
        return this._convertID(argument, channelMentionRegex, invalidArugment2.replace('@', '#'));
    }
    roleID(argument) {
        return this._convertID(argument, roleMentionRegex);
    }
    userID(argument) {
        return this._convertID(argument, userMentionRegex);
    }
    duration(argument) {
        if (!argument || !argument.length)
            return;
        const match = argument.match(timeRegex);
        if (!match || !match.length)
            return;
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
exports.default = Converter;
//# sourceMappingURL=Converter.js.map