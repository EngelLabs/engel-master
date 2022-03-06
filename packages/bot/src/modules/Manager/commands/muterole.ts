import Command from '../../../core/structures/Command';
import Converter from '../../../core/helpers/Converter';
import Roles from '../../../core/helpers/Roles';
import type Manager from '..';

const muterole = new Command<Manager>({
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
                                                { allowedMentions: { roles: false } }
                                        );
                                }
                        }

                        return ctx.error('This server doesn\'t have a mute role configured.');
                }

                const converter = new Converter(ctx.core);

                try {
                        var role = await converter.role(ctx.guild, ctx.args[0]);
                } catch (err) {
                        return ctx.error(err);
                }

                if (!role) return ctx.error(`Role \`${ctx.args[0]}\` not found.`);

                if (role.position >= ctx.topRole?.position) {
                        return ctx.error('That role\'s position is too high; It has to be below my highest role.');
                }

                ctx.guildConfig.muteRole = role.id;
                ctx.core.guilds.update(ctx.guildConfig.id, { $set: { muteRole: role.id } });

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
});

muterole.command({
        name: 'create',
        info: 'Automatically create the mute role',
        cooldown: 30000,
        requiredPermissions: ['manageRoles', 'manageChannels'],
        execute: async function (ctx) {
                const roles = new Roles(ctx.core);

                try {
                        var role = await roles.createMuteRole(ctx.guild, ctx.guildConfig);
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
                ctx.core.guilds.update(ctx.guildConfig.id, { $unset: { muteRole: null } });

                return ctx.success('Mute role cleared.');
        }
});

export default muterole;
