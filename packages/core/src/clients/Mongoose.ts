import * as mongoose from 'mongoose';
import type * as types from '@engel/types';
import type Core from '../structures/Core';

export default function Mongoose(core: Core): mongoose.Mongoose {
        const log = (message?: any, level?: types.LogLevels, prefix: string = 'Mongoose') => {
                core.log(message, level, prefix);
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

        const { mongo } = core.baseConfig;

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
