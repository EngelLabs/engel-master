const Command = require('../../../structures/Command');
const Guild = require('../../../models/Guild');


const prefix = new Command({
    name: 'prefix',
    aliases: ['prefixes'],
    info: 'View server prefixes',
    cooldown: 4000,
    dmEnabled: true,
    disableModuleCheck: true,
    execute: function (ctx) {
        let msg;

        if (!ctx.guild) {
            prefixes = ctx.guildConfig.prefixes.filter(({length}) => length);
            msg = `Hi! My prefix${prefixes.length > 1 ? 'es' : ''} in dms are: `;
            msg += prefixes.map(p => `\`${p}\``).join(', ');
            msg += '\nYou can also use commands by mentioning me';
            if (ctx.guildConfig.prefixes.includes('')) {
                msg += ' or by not providing a prefix at all';
            }
            msg += '.';
        } else {
            if (ctx.guildConfig.prefixes.length > 1) {
                msg = `Prefixes for **${ctx.guild.name}**: `;
                msg += ctx.guildConfig.prefixes.map(p => `\`${p}\``).join(', ');
            } else {
                msg = `Prefix for **${ctx.guild.name}**: \`${ctx.guildConfig.prefixes[0]}\``
            }
        }

        return ctx.success(msg);
    },
});

prefix.command({
    name: 'add',
    usage: '<*prefix>',
    aliases: ['+'],
    info: 'Add a server prefix',
    cooldown: 4000,
    requiredArgs: 1,
    execute: async function (ctx) {
        if (ctx.guildConfig.prefixes.length >= 15) {
            return ctx.error('You are at the 15 prefix limit.');
        }

        let prefix = ctx.args.join(' ');

        if (prefix.startsWith('"') && prefix.endsWith('"')) {
            prefix = prefix.slice(1, -1);
        }

        if (!prefix.length ||
            prefix.length >= 12) {
            return ctx.error(`Invalid prefix.`);
        }

        if (ctx.guildConfig.prefixes.includes(prefix)) {
            return ctx.error('That prefix already exists.');
        }

        await Guild.updateOne({ id: ctx.guildConfig.id },
            { $addToSet: { 'prefixes': prefix } });

        ctx.guildConfig.prefixes.push(prefix);
        return ctx.success(`Added prefix \`${prefix}\`.`);
    }
});

prefix.command({
    name: 'remove',
    usage: '<*prefix>',
    aliases: ['-'],
    info: 'Remove a server prefix',
    cooldown: 4000,
    requiredArgs: 1,
    execute: async function (ctx) {
        let prefix = ctx.args.join(' ');

        if (prefix.startsWith('"') && prefix.endsWith('"')) {
            prefix = prefix.slice(1, -1);
        }

        if (!ctx.guildConfig.prefixes.includes(prefix)) {
            return ctx.error('That prefix doesn\'t exist.');
        }

        ctx.guildConfig.prefixes = ctx.guildConfig.prefixes.filter(p => p !== prefix);

        if (ctx.guildConfig.prefixes.length > 0) {
            await Guild.updateOne(
                { id: ctx.guildConfig.id },
                { $pull: { 'prefixes': prefix } });

        } else {
            await Guild.updateOne({ id: ctx.guildConfig.id },
                { $set: { 'prefixes': ctx.config.prefixes.default } });

            ctx.guildConfig.prefixes = ctx.config.prefixes.default;
        }

        return ctx.success(`Removed prefix \`${prefix}\`.`);
    }
});

prefix.command({
    name: 'set',
    usage: '<*prefix>',
    aliases: ['='],
    info: 'Replace server prefixes',
    cooldown: 6000,
    requiredArgs: 1,
    execute: async function (ctx) {
        let prefix = ctx.args.join(' ');

        if (prefix.startsWith('"') && prefix.endsWith('"')) {
            prefix = prefix.slice(1, -1);
        }

        if (!prefix.length ||
            prefix.length >= 12) {
                return ctx.error('Invalid prefix.');
            }

        await Guild.updateOne({ id: ctx.guildConfig.id },
            {$set: {'prefixes': [prefix]}});

        ctx.guildConfig.prefixes = [prefix];
        return ctx.success(`Replaced prefixes with \`${prefix}\``);
    }
});


module.exports = prefix;