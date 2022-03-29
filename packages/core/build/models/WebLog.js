"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const weblogSchema = new mongoose.Schema({
    guild: { type: String },
    user: { type: String },
    info: { type: String },
    date: { type: Number, default: Date.now }
}, {
    collection: 'weblogs'
});
const WebLog = mongoose.model('WebLog', weblogSchema);
exports.default = WebLog;
//# sourceMappingURL=WebLog.js.map