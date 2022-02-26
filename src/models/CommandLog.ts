import * as mongoose from 'mongoose';


const commandLogSchema = new mongoose.Schema({
        name: { type: String, index: true },
        message: { type: Object },
        failed: { type: Boolean, required: false, index: true },
        created: { type: Date, default: () => new Date },
},
        { collection: 'commandlogs', strict: false },
);

commandLogSchema.index(
        { 'message.id': 1 }
);

commandLogSchema.index(
        { 'message.guild': 1 },
);


const CommandLog = mongoose.model('CommandLog', commandLogSchema);


export default CommandLog;
