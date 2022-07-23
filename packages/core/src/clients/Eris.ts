import * as eris from 'eris';
import type App from '../structures/App';

export default function Eris(app: App, options?: eris.ClientOptions): eris.Client {
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

        const client = new eris.Client(
                'Bot ' + app.baseConfig.client.token, options
        );

        client
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

        return client;
}
