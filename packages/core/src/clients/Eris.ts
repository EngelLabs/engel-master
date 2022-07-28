import * as eris from 'eris';
import type App from '../structures/App';

export default class Eris extends eris.Client {
        public constructor(app: App, options?: eris.ClientOptions) {
                const logger = app.logger.get('Eris');

                options = Object.assign(<eris.ClientOptions>{
                        intents: [],
                        allowedMentions: {
                                everyone: false,
                                roles: false,
                                users: true,
                                repliedUser: true
                        },
                        restMode: true
                }, options);

                super('Bot ' + app.baseConfig.client.token, options);

                this
                        .on('error', (err, shard) => {
                                if (!err) return;

                                if (shard !== undefined) {
                                        logger.error({ message: err, sources: ['Eris', `Shard ${shard}`] });
                                } else {
                                        logger.error(err);
                                }
                        })
                        .on('warn', (msg, shard) => {
                                logger.warn({ message: msg, sources: ['Eris', `Shard ${shard}`] });
                        });
        }
}
