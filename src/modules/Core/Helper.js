/**
 * @class Helper
 */
class Helper {
    constructor(core) {
        this.bot = core.bot;
        this.eris = core.eris;
    }

    waitFor(eventName, fn, timeout) {
        return new Promise((resolve, reject) => {
            if (!fn) {
                fn = () => true;
            }

            const wrapped = (...args) => {
                if (fn(...args)) {
                    this.eris.removeListener(eventName, wrapped);
                    clearTimeout(timeoutTask);

                    resolve(...args);
                }
            }

            let timeoutTask;

            if (timeout) {
                timeoutTask = setTimeout(() => {
                    this.eris.removeListener(eventName, wrapped);

                    reject();
                }, timeout);
            }

            this.eris.on(eventName, wrapped);
        });
    }

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


module.exports = Helper;