const { Schema, model } = require('mongoose');


const timerSchema = new Schema({
    expiry: { type: Number, index: true },
    type: { type: String },
    guild: { type: String },
    id: { type: String },
},
    { collection: 'timers' },
);


module.exports = model('Timer', timerSchema);