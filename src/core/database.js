const { MongoClient, Db, Logger } = require('mongodb');
const baseConfig = require('./baseConfig');
const logger = require('./logger');

const collectionCache = {};
const options = {
    socketTimeoutMS: 25000,
    keepAlive: true
};

const client = new MongoClient(baseConfig.mongoUri, options);


client
    .on('open', () => {
        logger.info('[MongoDB] Connected.');
    })
    .on('close', () => {
        logger.debug('[MongoDB] Connection closed.');
    })
    .on('error', err => {
        logger.error('[MongoDB] Something went wrong.');
        console.error(err);
    })
    .on('timeout', () => {
        logger.error('[MongoDB] Connection timed out.');
    });

const db = client.db();

client.db = () => db;

db.collection = (name, opts) => {
    if (opts) return Db.prototype.collection.call(db, name, opts);

    let ret = collectionCache[name];

    if (ret) return ret;

    ret = Db.prototype.collection.call(db, name, opts);

    return (collectionCache[name] = ret);
}


module.exports = client;