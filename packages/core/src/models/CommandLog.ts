import * as mongoose from 'mongoose';
import type * as types from '@engel/types';

const commandLogSchema = new mongoose.Schema<types.CommandLog>({
        name: { type: String, index: true },
        message: { type: Object },
        failed: { type: Boolean, required: false, index: true },
        created: { type: Number, default: Date.now }
}, {
        collection: 'commandlogs', strict: false
});

commandLogSchema.index(
        { 'message.id': 1 }
);

commandLogSchema.index(
        { 'message.guild': 1 }
);

const CommandLog = mongoose.model('CommandLog', commandLogSchema);

export default CommandLog;
