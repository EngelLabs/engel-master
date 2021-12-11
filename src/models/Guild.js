const { Schema, model } = require('mongoose');


const guildSchema = new Schema({
    id:       { type: String, index: true },
    prefixes: { type: Array },
    muteRole: { type: String },
    commands: { type: Object },
    isIgnored: { type: Boolean },
    allowedRoles: { type: Array },
    ignoredRoles: { type: Array },
    allowedChannels: { type: Array },
    ignoredChannels: { type: Array },
},
    { collection: 'guilds', strict: false, minimize: false },
);


module.exports = model('Guild', guildSchema);