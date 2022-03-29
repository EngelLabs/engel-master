"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
function Mongoose(core) {
    const log = (message, level, prefix = 'Mongoose') => {
        core.log(message, level, prefix);
    };
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
        autoIndex: false,
        autoCreate: false
    });
    return mongoose;
}
exports.default = Mongoose;
//# sourceMappingURL=Mongoose.js.map