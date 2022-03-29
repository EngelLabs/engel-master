"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@engel/core");
function Eris(_core) {
    const client = core.Eris(_core, {
        intents: [
            'directMessages',
            'guilds',
            'guildBans',
            'guildEmojisAndStickers',
            'guildInvites',
            'guildMembers',
            'guildMessages',
            'guildPresences',
            'guildVoiceStates'
        ],
        autoreconnect: true,
        compress: true,
        messageLimit: 0,
        firstShardID: _core.baseConfig.cluster.firstShard,
        lastShardID: _core.baseConfig.cluster.lastShard,
        maxShards: _core.baseConfig.client.shards
    });
    const log = (message, level, shardID) => {
        _core.log(message, level, shardID !== undefined ? `Shard ${shardID}` : 'Eris');
    };
    client
        .on('connect', id => {
        log('Connected.', 'info', id);
    })
        .on('shardDisconnect', (_, id) => {
        log('Disconnected.', 'info', id);
    })
        .on('shardReady', id => {
        log('Ready.', 'info', id);
    })
        .on('shardResume', id => {
        log('Resumed.', 'info', id);
    });
    return client;
}
exports.default = Eris;
//# sourceMappingURL=Eris.js.map