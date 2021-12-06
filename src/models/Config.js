const { Schema, model } = require('mongoose');
const { state, globalDefaults } = require('../core/baseConfig');


const configSchema = new Schema({
    state:            { type: String, default: state },
    dev:              { type: Boolean, default: globalDefaults.dev },
    author:           { type: Object, default: globalDefaults.author },
    client:           { type: Object, default: globalDefaults.client },
    lib:              { type: String, default: globalDefaults.lib },
    name:             { type: String, default: globalDefaults.name },
    prefixes:         { type: Object, default: globalDefaults.prefixes },
    dmConfig:         { type: Object, default: globalDefaults.dmConfig },
    guilds:           { type: Object, default: globalDefaults.guilds },
    users:            { type: Object, default: globalDefaults.users },
    webhooks:         { type: Object, default: globalDefaults.webhooks },
    colours:          { type: Object, default: globalDefaults.colours },
    emojis:           { type: Object, default: globalDefaults.emojis },
    disableEmojis:    { type: Boolean, default: globalDefaults.disableEmojis },
    commands:         { type: Object, default: globalDefaults.commands },
    modules:          { type: Object, default: globalDefaults.modules },
    globalCooldown:   { type: Number, default: globalDefaults.globalCooldown },
    commandCooldown:  { type: Number, default: globalDefaults.commandCooldown },
    cooldownWarn:     { type: Boolean, default: globalDefaults.cooldownWarn },
    cooldownWarnDeleteAfter: { type: Number, default: globalDefaults.cooldownWarnDeleteAfter },
    shutup:           { type: Boolean, default: globalDefaults.shutup },
},
    { collection: 'configurations', strict: false, minimize: false },
);

configSchema.index(
    { state: 1 },
    { unique: true },
);


module.exports = model('Config', configSchema);