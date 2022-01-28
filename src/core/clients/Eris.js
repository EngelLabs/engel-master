const { Client } = require('eris');
const Base = require('../structures/Base');


const options = {
        intents: [
                'directMessages',
                'guilds',
                'guildBans',
                'guildEmojisAndStickers',
                'guildInvites',
                'guildMembers',
                'guildMessages',
                'guildPresences',
                'guildVoiceStates',
        ],
        restMode: true,
        messageLimit: 0,
        getAllUsers: true,
};

class Eris extends Base {
        /**
         * 
         * @param {Bot} bot The bot instance
         * @returns {Client}
         */
        constructor(bot) {
                super(bot);

                const client = new Client(
                        'Bot ' + this.baseConfig.client.token, options
                );

                client
                        .on('connect', () => {
                                this.log('Connected.', 'info')
                        })
                        .on('disconnect', () => {
                                this.log('Disconnected.', 'info');

                                this.bot._erisIsReady = false;
                        })
                        .on('ready', () => {
                                this.log('Ready.', 'info');

                                this.bot._erisIsReady = true;
                        })
                        .on('error', err => {
                                this.log(err, 'error');
                        })
                        .on('warn', msg => {
                                this.log(msg, 'warn');
                        });

                client.connect = this.connect;

                return client;
        }

        async connect() {
                const me = await this.getSelf();

                if (this.baseConfig.client.id !== me.id) {
                        throw new Error(
                                `Invalid clientId ${this.baseConfig.client.id} provided. Actual user ID: ${me.id}`
                        );
                }

                return Client.prototype.connect.call(this);
        }
}


module.exports = Eris;