import * as mongoose from 'mongoose';
import type App from '../structures/App';

export default function Mongoose(app: App): mongoose.Mongoose {
        const logger = app.logger.get('Mongoose');

        logger.debug(`${Object.values(mongoose.models).length} models registered.`);

        mongoose.connection
                .on('connected', () => {
                        logger.debug('Connected.');
                })
                .on('disconnected', () => {
                        logger.debug('Disconnected.');
                })
                .on('error', err => {
                        logger.debug(err, 'error');
                });

        const { mongo } = app.baseConfig;

        const uri = `mongodb://${mongo.host}:${mongo.port}/${mongo.db}`;

        mongoose.connect(uri, {
                connectTimeoutMS: 4500,
                serverSelectionTimeoutMS: 2000,
                keepAlive: true,
                autoIndex: false,
                autoCreate: false
        });

        return mongoose;
}
