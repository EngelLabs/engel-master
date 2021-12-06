const Command = require('../../../structures/Command');


module.exports = new Command({
    name: 'warn',
    usage: '<user> <*reason>',
    info: 'Warn a server member',
    examples: [
        'warn @timtoy stop being mean >:(',
        'warn 338082875394097153 annoying',
    ],
    cooldown: 3000,
    requiredArgs: 2,
    execute: async function (ctx) {
        try {
            var user = await ctx.bot.converter.user(ctx, ctx.args[0]);
        } catch (err) {
            return ctx.error(err);
        }

        if (!user) return ctx.error(`User \`${ctx.args[0]}\` not found.`);

        const err = ctx.module.userProtectedCheck(ctx, user, 'warn');

        if (err) {
            return ctx.error(err);
        }

        ctx.args.shift();

        const reason = ctx.args.join(' ');

        ctx.module.sendDM(ctx, user, `You were warned in ${ctx.guild.name} for ${reason}.`, null, null);

        ctx.module.createModeration({
            guildConfig: ctx.guildConfig,
            mod: ctx.author,
            user: user,
            type: 'warn',
            reason: reason,
        });

        ctx.module.deleteCommand(ctx);

        return ctx.success(`User **${user.username}#${user.discriminator}** has been warned.`);
    }
});