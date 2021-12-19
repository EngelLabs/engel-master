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
    execute: function ({ bot, guildConfig, args, success, error }) {
        const module = bot.modules.get(args[0].slice(0, 1).toUpperCase() + args[0].slice(1));

        if (!module || module.private || module.internal) {
            return error(`Module \`${args[0]}\` not found.`);
        }

        const moduleName = module.dbName;

        const moduleConfig = guildConfig[moduleName] = guildConfig[moduleName] || {};
        moduleConfig.disabled = !moduleConfig.disabled;

        const queryString = 'modules.' + moduleName + '.disabled';
        
        bot.guilds.update(guildConfig.id, {$set: {[queryString]: moduleConfig.disabled}});

        return success(moduleConfig.disabled
            ? `Module \`${module.name}\` disabled.`
            : `Module \`${module.name}\` enabled.`
        );
    }
});