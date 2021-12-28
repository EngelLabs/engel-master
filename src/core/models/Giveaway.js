const { Schema, model } = require('mongoose');


const giveawaySchema = new Schema({
    guild:   { type: String },
    author:  { type: String },
    message: { type: String },
    title:   { type: String },
    info:    { type: String },
    item:    { type: String },
    expiry:  { type: Number },
},
    { collection: 'giveaways'},
);


module.exports = model('Giveaway', giveawaySchema);