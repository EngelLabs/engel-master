const { Schema, model } = require('mongoose');


const subscriptionSchema = new Schema({
    id:    { type: String },
    type:   { type: Number },
    expiry: { type: String },
},
    { collection: 'subscriptions' },
);

module.exports = model('Subscription', subscriptionSchema)