const { Command } = require('@engel/core');


module.exports = new Command({
        name: 'premium',
        info: 'Get information regarding Premium',
        cooldown: 30000,
        execute: function (ctx) {
                let msg = '';

                msg += 'Premium enables an improved engel experience by giving you access to an improved and extended feature set.\n';
                msg += 'It also helps the development and uptime of the core. No, it\'s not available yet (still under development!).\n';

                if (ctx.helpers.permissions.isServerOwner(ctx.author.id) && ctx.guildConfig.isPremium && !ctx.guildConfig.hasPremium) {
                        msg += 'You somehow have a premium plan for this guild. You will be able to invite the premium core when the beta launches.';
                }

                return ctx.premium(msg);
        }
});