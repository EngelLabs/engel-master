"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeReaction = exports.addReaction = exports.sendMessage = exports.sleep = exports.getTopRole = exports.capitalize = exports.readdir = void 0;
const fs = require("fs");
const util = require("util");
const eris = require("eris");
const Core_1 = require("../structures/Core");
exports.readdir = util.promisify(fs.readdir);
function capitalize(str) {
    if (!str || !str.length)
        return '';
    return str[0].toUpperCase() + str.slice(1);
}
exports.capitalize = capitalize;
function getTopRole(guild) {
    if (!guild) {
        return;
    }
    const me = guild.members.get(Core_1.default.instance.eris.user.id);
    if (!me || !me.roles.length) {
        return;
    }
    return me.roles
        .map(id => guild.roles.get(id))
        .reduce((prev, curr) => (curr === null || curr === void 0 ? void 0 : curr.position) > prev.position ? curr : prev);
}
exports.getTopRole = getTopRole;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;
function sendMessage(channel, content, type) {
    if (!content) {
        return Promise.resolve(null);
    }
    const core = Core_1.default.instance;
    if (!type) {
        if (typeof content !== 'string' && content.embed) {
            if (!content.embeds) {
                content.embeds = [];
            }
            if (content.embed.colour && !content.embed.color) {
                content.embed.color = content.embed.colour;
                delete content.embed.colour;
            }
            content.embeds.push(content.embed);
            delete content.embed;
        }
        if (typeof channel !== 'string' && (!(channel instanceof eris.PrivateChannel))) {
            const permissions = channel.permissionsOf(core.eris.user.id);
            if (typeof content !== 'string' && content.embeds && !permissions.has('embedLinks')) {
                if (permissions.has('sendMessages')) {
                    sendMessage(channel, "I'm missing permissions to `Embed Links` and can't display this message.");
                }
                return Promise.resolve(null);
            }
        }
        if (typeof content !== 'string') {
            var file = content.file;
            delete content.file;
        }
        return core.eris.createMessage(typeof channel === 'string' ? channel : channel.id, content, file);
    }
    const { config } = core;
    const colour = config.colours[type];
    const emoji = config.emojis[type];
    const toSend = {};
    if (typeof channel !== 'string' && (!(channel instanceof eris.PrivateChannel))) {
        const perms = channel.permissionsOf(core.eris.user.id);
        if (!perms.has('sendMessages')) {
            return Promise.resolve(null);
        }
        if (perms.has('useExternalEmojis') && !config.disableEmojis) {
            content = `<${emoji}> ` + content;
        }
        if (perms.has('embedLinks')) {
            toSend.embed = {
                description: content,
                color: colour
            };
        }
        else {
            toSend.content = content;
        }
    }
    else {
        toSend.embed = {
            description: content,
            color: colour
        };
    }
    return sendMessage(channel, toSend);
}
exports.sendMessage = sendMessage;
function addReaction(channel, message, type) {
    return _messageReaction(channel, message, type, 'addMessageReaction');
}
exports.addReaction = addReaction;
function removeReaction(channel, message, type) {
    return _messageReaction(channel, message, type, 'removeMessageReaction');
}
exports.removeReaction = removeReaction;
function _messageReaction(channel, message, type, method) {
    const core = Core_1.default.instance;
    if (typeof channel !== 'string' && (!(channel instanceof eris.PrivateChannel))) {
        const perms = channel.permissionsOf(core.eris.user.id);
        if (perms && !perms.has('useExternalEmojis')) {
            return Promise.resolve(null);
        }
    }
    return core.eris[method](typeof channel === 'string' ? channel : channel.id, typeof message === 'string' ? message : message.id, core.config.emojis[type]);
}
//# sourceMappingURL=helpers.js.map