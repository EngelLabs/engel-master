import * as fs from 'fs';
import * as path from 'path';
import * as mongoose from 'mongoose';
import Core from '../structures/Core';


export default function Mongoose (core: Core): mongoose.Mongoose {
        const log = (message?: string | Error, level?: string, prefix: string = 'Mongoose') => {
                core.log(message, level, prefix);
        }

        const modelsPath = path.resolve('../models');

        for (const fileName of fs.readdirSync(modelsPath)) {
                try {
                        require(modelsPath + '/' + fileName);
                } catch (err) {
                        log(err, 'error');
                }
        }

        log(`${Object.values(mongoose.models).length} models registered.`, 'info');

        mongoose.connection
                .on('connected', () => {
                        log('Connected.', 'info');
                })
                .on('disconnected', () => {
                        log('Disconnected.', 'info');
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
        });

        return mongoose;
}