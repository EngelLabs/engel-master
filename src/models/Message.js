const { Schema, model } = require('mongoose');

const messageSchema = new Schema({
    id: { type: String },
    content: { type: String },
    author: { type: Object },
    channel: { type: Object },
    guild: { type: String },
},
    { collection: 'messages' },
);

messageSchema.index(
    { id: 1, guild: 1 },
    { unique: true },
);


module.exports = model('Message', messageSchema);