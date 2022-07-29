import * as mongodb from 'mongodb';
import type * as types from '@engel/types';
import type App from '../structures/App';

export default class MongoDB {
        public db: mongodb.Db;
        private _collections: Record<string, mongodb.Collection> = Object.create(null);

        public constructor(app: App) {
                const logger = app.logger.get('MongoDB');

                const { mongo } = app.staticConfig;
                const uri = `mongodb://${mongo.host}:${mongo.port}/${mongo.db}`;

                const client = new mongodb.MongoClient(uri, {
                        connectTimeoutMS: 4500,
                        serverSelectionTimeoutMS: 2000,
                        keepAlive: true
                });

                client
                        .on('close', () => {
                                logger.debug('Disconnected.');
                        })
                        .on('error', err => {
                                logger.debug(err);
                        });

                client.connect((err) => {
                        if (err) throw err;

                        logger.debug('Connected.');
                });

                this.db = client.db();
        }

        public collection(name: string): mongodb.Collection<any> {
                if (!this._collections[name]) {
                        this._collections[name] = this.db.collection(name);
                }
                return this._collections[name];
        }

        get commandlogs(): mongodb.Collection<types.CommandLog> {
                return this.collection('commandlogs');
        }

        get configurations(): mongodb.Collection<types.Config> {
                return this.collection('configurations');
        }

        get giveaways(): mongodb.Collection<types.Giveaway> {
                return this.collection('giveaways');
        }

        get guilds(): mongodb.Collection<types.Guild> {
                return this.collection('guilds');
        }

        get modlogs(): mongodb.Collection<types.ModLog> {
                return this.collection('modlogs');
        }

        get tags(): mongodb.Collection<types.Tag> {
                return this.collection('tags');
        }

        get weblogs(): mongodb.Collection<types.WebLog> {
                return this.collection('weblogs');
        }
}
