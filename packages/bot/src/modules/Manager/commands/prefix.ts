import Command from '../../../core/structures/Command';
import type Manager from '..';

const prefix = new Command<Manager>({
        name: 'prefix',
        aliases: ['prefixes'],
        info: 'View server prefixes',
        cooldown: 4000,
        dmEnabled: true,
        disableModuleCheck: true,
        execute: function (ctx) {
                let msg: string;

                if (!ctx.guild) {
                        const prefixes = ctx.config.prefixes.dm.filter(({ length }) => length);
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
                                msg += ctx.guildConfig.prefixes.map(p => `\`${p}\``).join(', ') + '.';
                        } else {
                                msg = `Prefix for **${ctx.guild.name}**: \`${ctx.guildConfig.prefixes[0]}\`.`;
                        }
                }

                return ctx.success(msg);
        }
});

prefix.command({
        name: 'set',
        usage: '<*prefix>',
        info: 'Replace server prefixes with given prefix',
        aliases: ['='],
        cooldown: 6000,
        requiredArgs: 1,
        execute: async function (ctx) {
                let prefix = ctx.args.join(' ');

                if (prefix.startsWith('"') && prefix.endsWith('"')) {
                        prefix = prefix.slice(1, -1).trimLeft();
                }

                if (!prefix.length ||
                        prefix.length >= 13) {
                        return ctx.error('Invalid prefix length. Must be between 1-12.');
                }

                ctx.guildConfig.prefixes = [prefix];
                ctx.app.guilds.update(ctx.guildConfig.id, { $set: { prefixes: [prefix] } });

                return ctx.success(`Replaced prefixes with \`${prefix}\`.`);
        }
});

prefix.command({
        name: 'add',
        usage: '<*prefix>',
        info: 'Add a server prefix',
        aliases: ['+'],
        cooldown: 4000,
        requiredArgs: 1,
        execute: async function (ctx) {
                if (ctx.guildConfig.prefixes.length >= 15) {
                        return ctx.error('You are at the 15 prefix limit.');
                }

                let prefix = ctx.args.join(' ');

                if (prefix.startsWith('"') && prefix.endsWith('"')) {
                        prefix = prefix.slice(1, -1).trimLeft();
                }

                if (!prefix.length ||
                        prefix.length >= 13) {
                        return ctx.error('Invalid prefix length. Must be between 1-12.');
                }

                if (ctx.guildConfig.prefixes.includes(prefix)) {
                        return ctx.error('That prefix already exists.');
                }

                ctx.guildConfig.prefixes.push(prefix);
                ctx.app.guilds.update(ctx.guildConfig, { $addToSet: { prefixes: prefix } });

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
                        prefix = prefix.slice(1, -1).trimLeft();
                }

                if (!ctx.guildConfig.prefixes.includes(prefix)) {
                        return ctx.error('That prefix doesn\'t exist.');
                }

                let update: any = { $pull: { prefixes: prefix } };

                ctx.guildConfig.prefixes = ctx.guildConfig.prefixes.filter(p => p !== prefix);

                if (!ctx.guildConfig.prefixes.length) {
                        update = { $set: { prefixes: ctx.config.prefixes.default } };

                        ctx.guildConfig.prefixes = ctx.config.prefixes.default.concat();
                }

                ctx.app.guilds.update(ctx.guildConfig, update);

                return ctx.success(`Removed prefix \`${prefix}\`.`);
        }
});

export default prefix;
