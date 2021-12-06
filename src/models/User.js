const { Schema, model } = require('mongoose');


const userSchema = new Schema({
    id: { type: String },
    longId: { type: Schema.Types.Long, index: true },
    blacklisted: { type: Boolean },
    premium: { type: Boolean },
},
    { collection: 'users' },
);


module.exports = model('User', userSchema);