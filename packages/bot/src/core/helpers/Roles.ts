
import type * as eris from 'eris';
import type * as core from '@engel/core';
import type * as types from '@engel/types';
import Base from '../structures/Base';
import App from '../structures/App';

export default class Roles extends Base {
        private logger: core.Logger;

        public constructor(app: App) {
                super(app);

                this.logger = app.logger.get('Roles');
        }

        public resolveMuteRole(guild: eris.Guild, guildConfig: types.Guild): Promise<eris.Role> {
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

        public createMuteRole(guild: eris.Guild, guildConfig: types.Guild): Promise<eris.Role> {
                return new Promise((resolve, reject) => {
                        this.eris.createRole(guild.id, { name: 'Muted' })
                                .then(role => {
                                        for (const channel of guild.channels.values()) {
                                                this.eris
                                                        .editChannelPermission(channel.id, role.id, 0, 3147840, 0, 'Automatic muterole creation')
                                                        .catch(() => false);
                                        }

                                        guildConfig.muteRole = role.id;

                                        this.app.guilds.update(guild.id, { $set: { muteRole: role.id } });

                                        this.logger.debug(`Created mute role R${role.id} G${guild.id}.`);

                                        resolve(role);
                                })
                                .catch(() => {
                                        reject("I can't create a mute role.\nUse the `muterole set` command to set one.");
                                });
                });
        }
}
