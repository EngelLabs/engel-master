const Command = require('../../../core/structures/Command');
const Context = require('../../../core/structures/Context');


const getNested = (value, key) => {
        for (const k of key.split('.')) {
                value = value?.[k];
        }

        return value;
}

const afterConfig = async (ctx) => {
        if (!ctx._config) {
                return ctx.error(`Config does not exist for state \`${ctx.args.state}\``);
        }

        let o = getNested(ctx._config, ctx.args.key);

        if (typeof o === 'object') {
                o = JSON.stringify(o);
        }

        return ctx.success(`Key \`${ctx.args.key}\`, value \`${o}\``);
}

const beforeGuild = ctx => {
        if (!ctx.args.length && !ctx.guild) {
                return ctx.error('Must provide a guild ID.');
        }

        ctx.guildId = ctx.args[0] || ctx.guild.id;
}

const config = new Command({
        name: 'config',
        aliases: ['c'],
        info: "Manage the core's configuration",
        namespace: true
});

config.command({
        name: 'set',
        aliases: ['write'],
        info: 'Set a value in configuration',
        options: [
                { name: 'key', alias: 'k', required: true },
                { name: 'value', alias: 'v', required: true },
                { name: 'type', alias: 't', default: 'string' },
                { name: 'state', alias: 's', default: ctx => ctx.state },
        ],
        after: afterConfig,
        execute: function (ctx) {
                let value = ctx.args.value;

                switch (ctx.args.type.toLowerCase()) {
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
                                try { value = eval(value); } catch { }

                                break;
                        default:
                                return ctx.error(`Unknown type \`${ctx.args.type}\`.`);
                }

                return ctx.models.Config.findOne({ state: ctx.args.state }).then(config => {
                        if (getNested(config, ctx.args.key)?.constructor !== value.constructor) {
                                return ctx.error(`Invalid key \`${ctx.args.key}\`.`);
                        }

                        return ctx.models.Config.findOneAndUpdate({ state: ctx.args.state }, { $set: { [ctx.args.key]: value } }, { new: true })
                                .then(config => {
                                        ctx._config = config;
                                });
                });
        }
});

config.command({
        name: 'get',
        aliases: ['read'],
        info: 'Get a value from configuration',
        options: [
                { name: 'key', alias: 'k', required: true },
                { name: 'state', alias: 's', default: ctx => ctx.state },
        ],
        after: afterConfig,
        execute: function (ctx) {
                return ctx.models.Config.findOne({ state: ctx.args.state })
                        .then(config => {
                                ctx._config = config;
                        });
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
                const guildConfig = await ctx.core.guilds.fetch(ctx.guildId);

                if (guildConfig) {
                        return ctx.success(`Guild \`${ctx.guildId}\`'s configuration refreshed.`);
                }

                await ctx.core.guilds.create(ctx.guildId);

                return ctx.success(`Guild \`${ctx.guildId}\`'s configuration created.`);
        }
});

guild.command({
        name: 'premium',
        aliases: ['p'],
        info: "Toggle a guild's premium",
        before: beforeGuild,
        dmEnabled: true,
        execute: async function (ctx) {
                let guildConfig = await ctx.core.guilds.fetch(ctx.guildId);

                const result = await ctx.core.guilds.update(guildConfig, { $set: { isPremium: !guildConfig.isPremium } });

                if (!result.modifiedCount) {
                        return ctx.error('Could not update that guild.');
                }

                guildConfig = await ctx.core.guilds.fetch(guildConfig.id);

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
                const result = await ctx.core.guilds.update(ctx.guildId, { $set: { client: ctx.args[1] } });

                if (!result.modifiedCount) {
                        return ctx.error('Could not update that guild.');
                }

                const guildConfig = await ctx.core.guilds.fetch(ctx.guildId);

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
                const result = await ctx.models.Guild.deleteOne({ id: ctx.guildId });

                ctx.core.guilds.delete(ctx.guildId);

                return result.deletedCount
                        ? ctx.success(`Guild \`${ctx.guildId}\`'s configuration deleted.`)
                        : ctx.error(`Guild \`${ctx.guildId}\` has not been configured.`);
        }
});


module.exports = config;