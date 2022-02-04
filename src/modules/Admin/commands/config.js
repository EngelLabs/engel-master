const Command = require('../../../core/structures/Command');


const beforeConfig = ctx => {
        ctx.key = ctx.args[0];
        ctx.value = ctx.config[ctx.key];
}

const afterConfig = async ctx => {
        await ctx.models.Config.updateOne({ state: ctx.config.state }, { $set: { [ctx.key]: ctx.value } });
        await ctx.bot.configure();
        return ctx.success(`Updated key \`${ctx.key}\`, value: \`${ctx.config[ctx.key]}\``);
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
        info: "Manage the bot's configuration",
        namespace: true,
});

config.command({
        name: 'toggle',
        usage: '<key>',
        aliases: ['t'],
        info: 'Toggle a boolean value in configuration',
        before: beforeConfig,
        after: afterConfig,
        requiredArgs: 1,
        execute: async function (ctx) {
                if (typeof ctx.value !== 'boolean') {
                        return ctx.error(`\`${ctx.key}\` is not a valid key.`);
                }

                ctx.value = !ctx.value
        }
});

config.command({
        name: 'string',
        usage: '<key>',
        aliases: ['s'],
        info: 'Change a string value in configuration',
        before: beforeConfig,
        after: afterConfig,
        requiredArgs: 2,
        execute: async function (ctx) {
                if (typeof ctx.value !== 'string') {
                        return ctx.error(`\`${ctx.key}\` is not a valid key.`);
                }

                ctx.value = ctx.args[1];
        }
});

config.command({
        name: 'number',
        usage: '<key>',
        aliases: ['n', 'i', 'int'],
        info: 'Change a number value in configuration',
        before: beforeConfig,
        after: afterConfig,
        requiredArgs: 2,
        execute: async function (ctx) {
                if (typeof ctx.value !== 'number') {
                        return ctx.error(`\`${ctx.key}\` is not a valid key.`);
                }

                ctx.value = parseInt(ctx.args[1]);
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
                const guildConfig = await ctx.bot.guilds.fetch(ctx.guildId);

                if (guildConfig) {
                        return ctx.success(`Guild \`${ctx.guildId}\`'s configuration refreshed.`);
                }

                await ctx.bot.guilds.create(ctx.guildId);

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
                const result = await ctx.bot.guilds.update(ctx.guildConfig, { $set: { isPremium: !ctx.guildConfig.isPremium } });

                if (!result.modifiedCount) {
                        return ctx.error('Could not update that guild.');
                }

                await ctx.bot.guilds.fetch(ctx.guildId);

                return ctx.success(`Guild \`${ctx.guildId}\`'s premium set to: ${ctx.guildConfig.isPremium}`)
        }
})

guild.command({
        name: 'delete',
        aliases: ['d', 'del'],
        info: "Delete a guild's configuration",
        before: beforeGuild,
        dmEnabled: true,
        execute: async function (ctx) {
                const result = await ctx.models.Guild.deleteOne({ id: ctx.guildId });

                ctx.bot.guilds.delete(ctx.guildId);

                return result.deletedCount
                        ? ctx.success(`Guild \`${ctx.guildId}\`'s configuration deleted.`)
                        : ctx.error(`Guild \`${ctx.guildId}\` has not been configured.`);
        }
})


module.exports = config;