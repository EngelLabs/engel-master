const { MongoClient: Client, Db } = require('mongodb');
const Base = require('../structures/Base');


class MongoDB extends Base {
    constructor(server) {
        super(server);

        this._collectionCache = {};

        const { mongo } = this.baseConfig;

        const uri = `mongodb://${mongo.host}:${mongo.port}/${mongo.db}`;

        const client = new Client(uri, {
            socketTimeoutMS: 4500,
            serverSelectionTimeoutMS: 2000,
            keepAlive: true,
        });

        client
            .on('connectionReady', () => {
                this.log('Connected.');
            })
            .on('connectionClosed', () => {
                this.log('Connection closed.');
            })
            .on('error', err => {
                this.log(err, 'error');
            });

        const db = client.db();

        db.collection = (name, opts) => {
            if (opts) return Db.prototype.collection.call(db, name, opts);

            let ret = this._collectionCache[name];

            if (ret) return ret;

            ret = Db.prototype.collection.call(db, name, opts);

            return (this._collectionCache[name] = ret);
        }

        client.db = () => db;

        return client;
    }
}


module.exports = MongoDB;