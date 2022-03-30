"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
function Mongoose(app) {
    const log = (message, level, prefix = 'Mongoose') => {
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
exports.default = Mongoose;
//# sourceMappingURL=Mongoose.js.map