import * as mongoose from 'mongoose';


const giveawaySchema = new mongoose.Schema({
        guild: { type: String },
        author: { type: String },
        message: { type: String },
        title: { type: String },
        info: { type: String },
        item: { type: String },
        expiry: { type: Number },
},
        { collection: 'giveaways' },
);

const Giveaway = mongoose.model('Giveaway', giveawaySchema);


export default Giveaway;
