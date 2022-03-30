import Command from '../../../core/structures/Command';
import type Context from '../../../core/structures/Context';
import type Core from '..';

const getNested = (value: any, key: string): any => {
        for (const k of key.split('.')) {
                value = value?.[k];
        }

        return value;
};

const afterConfig = async (ctx: Context) => {
        if (!ctx.locals.config) {
                return ctx.error(`Config does not exist for state \`${ctx.locals.state}\``)
                        .then(() => null);
        }

        let o = getNested(ctx.locals.config, (<string>ctx.locals.key));

        if (typeof o === 'object') {
                o = JSON.stringify(o);
        }

        return ctx.success(`Key \`${ctx.locals.key}\`, value \`${o}\``)
                .then(() => null);
};

const beforeGuild = async (ctx: Context) => {
        if (!ctx.args.length && !ctx.guild) {
                await ctx.error('Must provide a guild ID.');

                return;
        }

        ctx.locals = { guildId: ctx.args[0] || ctx.guild.id };
};

const config = new Command<Core>({
        name: 'config',
        aliases: ['c'],
        info: "Manage the bot's configuration",
        namespace: true
});

config.command({
        name: 'set',
        aliases: ['write'],
        usage: '<type> <key> <value> [state]',
        info: 'Set a value in configuration',
        requiredArgs: 3,
        after: afterConfig,
        execute: async function (ctx) {
                const type = ctx.args.shift(),
                        key = ctx.args.shift();

                let value: any = ctx.args.shift();

                const state = ctx.args.join(' ') || ctx.state;

                switch (type.toLowerCase()) {
                        case 'str':
                        case 'string':
                                value = String(value);

                                break;
                        case 'num':
                        case 'number':
                        case 'int':
                        case 'integer':
                                value = Number(value);

                                break;
                        case 'bool':
                        case 'boolean':
                                /* eslint-disable-next-line no-eval */
                                try { value = eval(value); } catch { }

                                break;
                        default:
                                return ctx.error(`Unknown type \`${type}\`.`);
                }

                let config = await ctx.models.Config
                        .findOne({ state })
                        .lean();

                config = await ctx.models.Config
                        .findOneAndUpdate({ state }, { $set: { [key]: value } }, { new: true })
                        .lean();

                ctx.locals = { key, value, config, state };
        }
});

config.command({
        name: 'get',
        aliases: ['read'],
        usage: '<key> [state]',
        info: 'Get a value from configuration',
        requiredArgs: 1,
        after: afterConfig,
        execute: async function (ctx) {
                const key = ctx.args.shift();
                const state = ctx.args.join(' ') || ctx.state;

                const config = await ctx.models.Config.findOne({ state });

                ctx.locals = { key, state, config };
        }
});

const guild = config.command({
        name: 'guild',
        usage: '[guild]',
        aliases: ['g'],
        info: "Create/refresh a guild's configuration",
        before: beforeGuild,
        dmEnabled: true,
        execute: async function (ctx) {
                const guildConfig = await ctx.app.guilds.fetch(ctx.locals.guildId);

                if (guildConfig) {
                        return ctx.success(`Guild \`${ctx.locals.guildId}\`'s configuration refreshed.`);
                }

                await ctx.app.guilds.create(ctx.locals.guildId);

                return ctx.success(`Guild \`${ctx.locals.guildId}\`'s configuration created.`);
        }
});

guild.command({
        name: 'premium',
        aliases: ['p'],
        info: "Toggle a guild's premium",
        before: beforeGuild,
        dmEnabled: true,
        execute: async function (ctx) {
                let guildConfig = await ctx.app.guilds.fetch(ctx.locals.guildId);

                const result = await ctx.app.guilds.update(guildConfig, { $set: { isPremium: !guildConfig.isPremium } });

                if (!result.modifiedCount) {
                        return ctx.error('Could not update that guild.');
                }

                guildConfig = await ctx.app.guilds.fetch(guildConfig.id);

                return ctx.success(`Guild \`${guildConfig.id}\`'s premium set to: ${guildConfig.isPremium}`);
        }
});

guild.command({
        name: 'client',
        aliases: ['c'],
        info: "Change a guild's client",
        before: beforeGuild,
        dmEnabled: true,
        requiredArgs: 2,
        execute: async function (ctx) {
                const result = await ctx.app.guilds.update(ctx.locals.guildId, { $set: { client: ctx.args[1] } });

                if (!result.modifiedCount) {
                        return ctx.error('Could not update that guild.');
                }

                const guildConfig = await ctx.app.guilds.fetch(ctx.locals.guildId);

                return ctx.success(`Guild \`${guildConfig.id}\`'s client set to: ${guildConfig.client}`);
        }
});

guild.command({
        name: 'delete',
        aliases: ['d', 'del'],
        info: "Delete a guild's configuration",
        before: beforeGuild,
        dmEnabled: true,
        execute: async function (ctx) {
                const result = await ctx.models.Guild.deleteOne({ id: ctx.locals.guildId });

                ctx.app.guilds.delete(ctx.locals.guildId);

                return result.deletedCount
                        ? ctx.success(`Guild \`${ctx.locals.guildId}\`'s configuration deleted.`)
                        : ctx.error(`Guild \`${ctx.locals.guildId}\` has not been configured.`);
        }
});

export default config;
