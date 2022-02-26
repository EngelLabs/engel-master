import * as mongoose from 'mongoose';
import * as types from '../types';


const guildSchema = new mongoose.Schema<types.GuildConfig>({
        id: { type: String, required: true },
        client: { type: String, required: true },
        prefixes: [{ type: String, required: true }],
        muteRole: { type: String, required: false },
        isIgnored: { type: Boolean, required: false },
        isPremium: { type: Boolean, required: false },
        hasPremium: { type: Boolean, required: false },
        delCommands: { type: Boolean, required: false },
        commands: { type: Object, required: false },
        modules: { type: Object, required: false },
        noDisableWarning: { type: Boolean, required: false },
},
        { collection: 'guilds', minimize: false },
);

guildSchema.index({ id: 1 }, { unique: true });


const Guild = mongoose.model('Guild', guildSchema);


export default Guild;
