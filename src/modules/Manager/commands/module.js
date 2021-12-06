const Command = require('../../../structures/Command');


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
    execute: async function ({ bot, guildConfig, isAdmin, args, success, error }) {
        const module = bot.modules.get(args[0].slice(0, 1).toUpperCase() + args[0].slice(1));

        if (!module || ((module.private || module.internal) && !isAdmin)) {
            return error(`Module \`${args[0]}\` not found.`);
        }

        const moduleName = module.dbName;

        const moduleConfig = guildConfig[moduleName] = guildConfig[moduleName] || {};
        moduleConfig.enabled = typeof moduleConfig.enabled !== 'undefined' ? !moduleConfig.enabled : false;

        const queryString = 'modules.' + moduleName + '.enabled';
        
        await bot.guilds.update(guildConfig.id, {$set: {[queryString]: moduleConfig.enabled}});

        return success(moduleConfig.enabled
            ? `Module \`${module.name}\` enabled.`
            : `Module \`${module.name}\` disabled.`
        );
    }
});