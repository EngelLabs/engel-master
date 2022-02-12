const { Command } = require('@timbot/core');


module.exports = new Command({
        name: 'module',
        usage: '<module>',
        info: 'Enable or disable a module',
        examples: [
                'module moderator',
                'module logging',
        ],
        cooldown: 3000,
        requiredArgs: 1,
        alwaysEnabled: true,
        execute: function (ctx) {
                const module = ctx.bot.modules.get(ctx.args[0].slice(0, 1).toUpperCase() + ctx.args[0].slice(1));

                if (!module || module.private || module.internal || module.disabled) {
                        return ctx.error(`Module \`${ctx.args[0]}\` not found.`);
                }

                const moduleName = module.dbName;

                const moduleConfig = ctx.guildConfig[moduleName] = ctx.guildConfig[moduleName] || {};
                moduleConfig.disabled = !moduleConfig.disabled;

                const queryString = moduleName + '.disabled';

                ctx.bot.guilds.update(ctx.guildConfig.id, { $set: { [queryString]: moduleConfig.disabled } });

                return ctx.success(moduleConfig.disabled
                        ? `Module \`${module.name}\` disabled.`
                        : `Module \`${module.name}\` enabled.`
                );
        }
});