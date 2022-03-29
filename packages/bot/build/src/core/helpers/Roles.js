"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("../structures/Base");
class Roles extends Base_1.default {
    resolveMuteRole(guild, guildConfig) {
        return new Promise((resolve, reject) => {
            let role;
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
    createMuteRole(guild, guildConfig) {
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
exports.default = Roles;
//# sourceMappingURL=Roles.js.map