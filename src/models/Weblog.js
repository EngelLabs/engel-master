const { Schema, model } = require('mongoose');


// might add more info to this (like ip and whatnot)
const weblogSchema = new Schema({
        guild: { type: String },
        user: { type: String },
        info: { type: String },
        date: { type: Date, default: () => new Date() },
},
        { collection: 'weblogs' },
);


module.exports = model('Weblog', weblogSchema);