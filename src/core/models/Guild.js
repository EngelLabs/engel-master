const { Schema, model } = require('mongoose');


const guildSchema = new Schema({
        id: { type: String, required: true, index: true },
        prefixes: { type: Array, required: true },
        muteRole: { type: String, required: false },
        commands: { type: Object, required: false },
        isPremium: { type: Boolean, required: false },
        hasPremium: { type: Boolean, requiredL: false },
        isIgnored: { type: Boolean, required: false },
        allowedRoles: { type: Array, required: false, default: void 0 },
        ignoredRoles: { type: Array, required: false, default: void 0 },
        allowedChannels: { type: Array, required: false, default: void 0 },
        ignoredChannels: { type: Array, required: false, default: void 0 },
},
        { collection: 'guilds', strict: false, minimize: false },
);


module.exports = model('Guild', guildSchema);