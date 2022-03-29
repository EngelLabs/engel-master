"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eris = require("eris");
function Eris(core, options) {
    const log = (message, level, prefix = 'Eris') => {
        core.log(message, level, prefix);
    };
    options = Object.assign({
        intents: [],
        allowedMentions: {
            everyone: false,
            roles: false,
            users: true,
            repliedUser: true
        },
        restMode: true
    }, options);
    const client = new eris.Client('Bot ' + core.baseConfig.client.token, options);
    client
        .on('error', (err, shard) => {
        if (!err)
            return;
        if (shard !== undefined) {
            log(err, 'error', `Shard ${shard}`);
        }
        else {
            log(err, 'error');
        }
    })
        .on('warn', (msg, shard) => {
        log(msg, 'warn', `Shard ${shard}`);
    });
    return client;
}
exports.default = Eris;
//# sourceMappingURL=Eris.js.map