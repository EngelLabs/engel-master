
import type * as eris from 'eris';
import type * as types from '@engel/types';
import Base from '../structures/Base';

export default class Roles extends Base {
        public resolveMuteRole(guild: eris.Guild, guildConfig: types.GuildConfig): Promise<eris.Role> {
                return new Promise((resolve, reject) => {
                        let role: eris.Role | undefined;

                        if (guildConfig.muteRole) {
                                role = guild.roles.get(guildConfig.muteRole);

                                if (role) {
                                        return resolve(role);
                                }
                        }

                        this.createMuteRole(guild, guildConfig)
                                .then(resolve)
                                .catch(reject);
                });
        }

        public createMuteRole(guild: eris.Guild, guildConfig: types.GuildConfig): Promise<eris.Role> {
                return new Promise((resolve, reject) => {
                        this.eris.createRole(guild.id, { name: 'Muted' })
                                .then(role => {
                                        for (const channel of guild.channels.values()) {
                                                this.eris
                                                        .editChannelPermission(channel.id, role.id, 0, 3147840, 0, 'Automatic muterole creation')
                                                        .catch(() => false);
                                        }

                                        guildConfig.muteRole = role.id;

                                        this.core.guilds.update(guild.id, { $set: { muteRole: role.id } });

                                        this.log(`Created mute role R${role.id} G${guild.id}.`);

                                        resolve(role);
                                })
                                .catch(() => {
                                        reject("I can't create a mute role.\nUse the `muterole set` command to set one.");
                                });
                });
        }
}
