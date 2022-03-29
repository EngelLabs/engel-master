"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const giveawaySchema = new mongoose.Schema({
    guild: { type: String },
    author: { type: String },
    message: { type: String },
    title: { type: String },
    info: { type: String },
    item: { type: String },
    expiry: { type: Number }
}, {
    collection: 'giveaways'
});
const Giveaway = mongoose.model('Giveaway', giveawaySchema);
exports.default = Giveaway;
//# sourceMappingURL=Giveaway.js.map