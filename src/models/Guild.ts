import * as mongoose from 'mongoose';


const guildSchema = new mongoose.Schema({
        id: { type: String, required: true },
        client: { type: String, required: true },
        prefixes: { type: Array, required: true },
},
        { collection: 'guilds', strict: false, minimize: false },
);

guildSchema.index({ id: 1 }, { unique: true });


const Guild = mongoose.model('Guild', guildSchema);


export default Guild;
