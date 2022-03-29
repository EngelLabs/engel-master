"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const commandLogSchema = new mongoose.Schema({
    name: { type: String, index: true },
    message: { type: Object },
    failed: { type: Boolean, required: false, index: true },
    created: { type: Number, default: Date.now }
}, {
    collection: 'commandlogs', strict: false
});
commandLogSchema.index({ 'message.id': 1 });
commandLogSchema.index({ 'message.guild': 1 });
const CommandLog = mongoose.model('CommandLog', commandLogSchema);
exports.default = CommandLog;
//# sourceMappingURL=CommandLog.js.map