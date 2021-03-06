import Command from '../../../core/structures/Command';
import type Core from '..';

const prefix = new Command<Core>({
        name: 'prefix',
        aliases: ['prefixes', 'p'],
        info: 'View and manage admin prefixes',
        execute: async function (ctx) {
                const prefixes = ctx.config.prefixes.private
                        .filter(({ length }) => length)
                        .map(p => `\`${p}\``)
                        .join(', ');

                let msg = `Admin prefix${ctx.config.prefixes.private.length > 1 ? 'es' : ''}: ${prefixes}.`;

                if (ctx.config.prefixes.private.includes('')) {
                        msg += '\nPrefix-less invocation is enabled.';
                }

                return ctx.success(msg);
        }
});

prefix.command({
        name: 'add',
        aliases: ['+', 'a'],
        info: 'Add an admin prefix',
        requiredArgs: 1,
        execute: async function (ctx) {
                let prefix = ctx.args.join(' ');

                if (prefix.startsWith('"') && prefix.endsWith('"')) {
                        prefix = prefix.slice(1, -1).trimLeft();
                }

                if (ctx.config.prefixes.private.includes(prefix)) {
                        return ctx.error('That prefix already exists.');
                }

                await ctx.mongo.configurations.updateOne({ state: ctx.config.state }, { $addToSet: { 'prefixes.private': prefix } });
                await ctx.app.configure();

                return ctx.success(`Added prefix \`${prefix.length ? prefix : '<no prefix>'}\`.`);
        }
});

prefix.command({
        name: 'remove',
        aliases: ['-', 'r'],
        info: 'Remove an admin prefix',
        requiredArgs: 1,
        execute: async function (ctx) {
                let prefix = ctx.args.join(' ');

                if (prefix.startsWith('"') && prefix.endsWith('"')) {
                        prefix = prefix.slice(1, -1).trimLeft();
                }

                if (!ctx.config.prefixes.private.includes(prefix)) {
                        return ctx.error('That prefix already exists.');
                }

                await ctx.mongo.configurations.updateOne({ state: ctx.config.state }, { $pull: { 'prefixes.private': prefix } });
                await ctx.app.configure();

                return ctx.success(`Removed prefix \`${prefix.length ? prefix : '<no prefix>'}\`.`);
        }
});

prefix.command({
        name: 'set',
        aliases: ['='],
        info: 'Replace admin prefixes',
        requiredArgs: 1,
        execute: async function (ctx) {
                let prefix = ctx.args.join(' ');

                if (prefix.startsWith('"') && prefix.endsWith('"')) {
                        prefix = prefix.slice(1, -1).trimLeft();
                }

                await ctx.mongo.configurations.updateOne({ state: ctx.config.state }, { $set: { 'prefixes.private': [prefix] } });
                await ctx.app.configure();

                return ctx.success(`Replaced prefixes with \`${prefix.length ? prefix : '<no prefix>'}\`.`);
        }
});

export default prefix;
