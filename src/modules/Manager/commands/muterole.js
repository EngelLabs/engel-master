const Command = require('../../../structures/Command');


const muterole = new Command({
    name: 'muterole',
    usage: '[role]',
    info: 'Manage the server\'s mute role',
    cooldown: 4000,
    execute: async function (ctx) {
        if (!ctx.args.length) {
            if (ctx.guildConfig.muteRole) {
                    const muteRole = ctx.guild.roles.get(ctx.guildConfig.muteRole);

                    if (muteRole) {
                        return ctx.success(
                            `Mute role for **${ctx.guild.name}**: ${muteRole.mention} (ID: ${muteRole.id})`,
                            { allowedMentions: { roles: false } },
                        );
                    }
                }
            
            return ctx.error(`This server doesn\'t have a mute role configured.`);
        }

        let role;

        try {
            role = await ctx.bot.converter.role(ctx, ctx.args[0]);
        } catch (err) {
            return ctx.error(err);
        }

        if (!role) return ctx.error(`Role \`${ctx.args[0]}\` not found.`);

        const topRole = ctx.topRole;
        if (topRole && role.position >= topRole.position) {
            return ctx.error('That role\'s position is too high; It has to be below my highest role.');
        }

        ctx.guildConfig.muteRole = role.id;
        await ctx.bot.guilds.update(ctx.guildConfig.id, { $set: { muteRole: role.id } });
        
        return ctx.success('Mute role updated.');
    }
});

muterole.command({
    name: 'set',
    usage: '<role>',
    info: 'Set a role as the server\'s mute role',
    cooldown: 4000,
    requiredArgs: 1,
    execute: function (ctx) {
        return muterole.execute(ctx);
    }
})

muterole.command({
    name: 'create',
    info: 'Automatically create the mute role',
    cooldown: 30000,
    requiredPermissions: ['manageRoles', 'manageChannels'],
    execute: async function (ctx) {
        try {
            var role = await ctx.bot.helper.createMuteRole(ctx.guild, ctx.guildConfig);
        } catch (err) {
            return ctx.error(err.toString());
        }

        return ctx.success(`Mute role ${role.mention} created.`, { allowedMentions: { roles: false } });
    }
});

muterole.command({
    name: 'remove',
    info: 'Remove the server\'s mute role',
    cooldown: 4000,
    execute: function (ctx) {
        delete ctx.guildConfig.muteRole;
        ctx.bot.guilds.update(ctx.guildConfig.id, { $unset: { 'muteRole': null } });

        return ctx.success('Mute role cleared.');
    }
})

module.exports = muterole;