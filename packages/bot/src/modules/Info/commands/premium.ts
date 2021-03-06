import Command from '../../../core/structures/Command';
import Permission from '../../../core/helpers/Permission';
import type Info from '..';

export default new Command<Info>({
        name: 'premium',
        info: 'Get information regarding Premium',
        cooldown: 30000,
        execute: function (ctx) {
                const permissions = new Permission(ctx.app);

                let msg = '';

                msg += 'Premium enables an improved engel experience by giving you access to an improved and extended feature set.\n';
                msg += 'It also helps the development and uptime of the bot. No, it\'s not available yet (still under development!).\n';

                if (permissions.isOwner(ctx.guild, ctx.author) && ctx.guildConfig.isPremium && !ctx.guildConfig.hasPremium) {
                        msg += 'You somehow have a premium plan for this guild. You will be able to invite the premium bot when the beta launches.';
                }

                return ctx.premium(msg);
        }
});
