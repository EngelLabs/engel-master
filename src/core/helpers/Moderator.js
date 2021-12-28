const Base = require('../structures/Base');


/**
 * Moderation helper
 * @class Moderator
 */
class Moderator extends Base {
    async createMuteRole(guild, guildConfig) {
        try {
            var role = await this.eris.createRole(guild.id, { name: 'Muted' });
        } catch (err) {
            return Promise.reject(`I can\'t create a mute role.
            Use the \`muterole set\` command to set one.`);
        }

        for (const channel of guild.channels.values()) {
            this.eris.editChannelPermission(channel.id, role.id, 0, 3147840, 0, 'Automatic muterole creation')
                .catch(() => false);
        }

        guildConfig.muteRole = role.id;
        this.bot.guilds.update(guild.id, { $set: { 'muteRole': role.id } });
        this.bot.logger.info(`[Modules.Helper] Created mute role R${role.id} G${guild.id}.`);

        return Promise.resolve(role);
    }
}


module.exports = Moderator;