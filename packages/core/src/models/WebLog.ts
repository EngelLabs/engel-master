import * as mongoose from 'mongoose';
import type * as types from '@engel/types';

const weblogSchema = new mongoose.Schema<types.WebLog>({
        guild: { type: String },
        user: { type: String },
        info: { type: String },
        date: { type: Number, default: Date.now }
}, {
        collection: 'weblogs'
});

const WebLog = mongoose.model('WebLog', weblogSchema);

export default WebLog;
