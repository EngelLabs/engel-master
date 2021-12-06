const { Schema, model } = require('mongoose');


const guildSchema = new Schema({
    id:       { type: String, index: true },
    longId:   { type: Schema.Types.Long, index: true },
    prefixes: { type: Array },
    muteRole: { type: String },
    commands: { type: Object },
    blacklisted: { type: Boolean },
    gold:     { type: Boolean },
    plan:     { type: Number },
    vip:      { type: Boolean },
},
    { collection: 'guilds', strict: false, minimize: false },
);


module.exports = model('Guild', guildSchema);