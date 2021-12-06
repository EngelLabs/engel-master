const { Schema, model } = require('mongoose');


const modLogSchema = new Schema({
    case:    { type: Number, required: true },
    type:    { type: String, required: true },
    created: { type: Date, default: () => new Date() },
    expiry:  { type: Date, required: false, index: true },
    duration:{ type: Number, required: false },
    guild:   { type: String, index: true },
    channel: { type: Object, required: false },
    count:   { type: Number, required: false },
    user:    { type: Object, required: false },
    mod:     { type: Object, required: true },
    reason:  { type: String, required: false },
},
    { collection: 'modlogs' },
);

modLogSchema.index(
    { case: 1, guild: 1 },
    { unique: true }
);

modLogSchema.index(
    { expiry: 1, guild: 1, case: 1}
);

modLogSchema.index(
    { guild: 1, 'user.id': 1 }
);

modLogSchema.index(
    { guild: 1, 'channel.id': 1 }
)

modLogSchema.index(
    { guild: 1, 'mod.id': 1 }
);


module.exports = model('ModLog', modLogSchema);