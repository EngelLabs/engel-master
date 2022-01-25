const { MongoClient: Client, Db } = require('mongodb');
const Base = require('../structures/Base');


const collectionCache = {};

class MongoDB extends Base {
        constructor(server) {
                super(server);


                const { mongo } = this.baseConfig;

                const uri = `mongodb://${mongo.host}:${mongo.port}/${mongo.db}`;

                const client = new Client(uri, {
                        socketTimeoutMS: 4500,
                        serverSelectionTimeoutMS: 2000,
                        keepAlive: true,
                });

                client
                        .on('open', () => {
                                this.log('Connected.');
                        })
                        .on('close', () => {
                                this.log('Connection closed.');
                        })
                        .on('error', err => {
                                this.log(err, 'error');
                        });

                return client;
        }

        connect() {
                return Client.prototype.connect.call(this)
                        .then(() => {
                                const db = this.db();

                                db.collection = this.collection;

                                this.db = () => db;
                        })
        }

        collection(name, opts) {
                if (opts) {
                        return Db.prototype.collection.call(this, name, opts);
                }

                let ret = collectionCache[name];

                if (ret) {
                        return ret;
                }

                ret = Db.prototype.collection.call(this, name, opts);

                return (collectionCache[name] = ret);
        }
}


module.exports = MongoDB;