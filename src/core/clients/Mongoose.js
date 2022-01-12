const fs = require('fs');
const path = require('path');
const Base = require('../structures/Base');

const modelsPath = path.resolve('src/core/models');


class Mongoose extends Base {
    constructor(bot) {
        super(bot);

        const client = require('mongoose');

        for (const fileName of fs.readdirSync(modelsPath)) {
            try {
                require(modelsPath + '/' + fileName);
            } catch (err) {
                this.log(err, 'error');
            }
        }
        
        this.log(`${Object.values(client.models).length} models registered.`, 'info');

        client.connection
            .on('connected', () => {
                this.log('Connected.', 'info');

                this.bot._mongoIsReady = true;
            })
            .on('disconnected', () => {
                this.log('Disconnected.', 'info');

                this.bot._mongoIsReady = false;
            })
            .on('error', err => {
                this.log(err, 'error')
            });

        const { mongo } = this.baseConfig;

        const uri = `mongodb://${mongo.host}:${mongo.port}/${mongo.db}`;
        
        client.connect(uri, {
            connectTimeoutMS: 4500,
            serverSelectionTimeoutMS: 2000,
            keepAlive: true,
        });

        return client;
    }
}


module.exports = Mongoose;