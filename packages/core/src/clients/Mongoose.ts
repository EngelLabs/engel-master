import * as mongoose from 'mongoose';
import type * as types from '@engel/types';
import type App from '../structures/App';

export default function Mongoose(app: App): mongoose.Mongoose {
        const log = (message?: any, level?: types.LogLevels, prefix: string = 'Mongoose') => {
                app.log(message, level, prefix);
        };

        log(`${Object.values(mongoose.models).length} models registered.`);

        mongoose.connection
                .on('connected', () => {
                        log('Connected.');
                })
                .on('disconnected', () => {
                        log('Disconnected.');
                })
                .on('error', err => {
                        log(err, 'error');
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
