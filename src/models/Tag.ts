import * as mongoose from 'mongoose';
import * as types from '../types';


// https://stackoverflow.com/questions/45614172/mongoose-static-model-definitions-in-typescript
interface TagModel extends mongoose.Model<types.Tag> {
        findOneAndIncrement: typeof Tag.findOne;
        incrementUses(guild: string, name: string): void;
}

const tagSchema = new mongoose.Schema<types.Tag>({
        name: { type: String, required: true },
        content: { type: String, required: true },
        guild: { type: String, required: true, index: true },
        author: { type: String, required: true },
        uses: { type: Number, required: false },
        createdAt: { type: Number, required: true, default: Date.now },
        editedAt: { type: Number, required: false },
},
        { collection: 'tags' },
);

tagSchema.static('findOneAndIncrement', (...args) => {
        return new Promise((resolve, reject) => {
                Tag.findOne(...args)
                        .lean()
                        .exec()
                        .then(res => {
                                res && Tag.incrementUses(res.guild, res.name);

                                resolve(res);
                        })
                        .catch(err => reject(err));
        });
});

tagSchema.static('incrementUses', (guild, name) => {
        Tag.collection.updateOne(
                { guild, name },
                { $inc: { uses: 1 } }
        ).catch(() => false);
});

tagSchema.index(
        { name: 1, guild: 1 },
        { unique: true },
);

tagSchema.index(
        { guild: 1, author: 1 },
);


const Tag = mongoose.model<types.Tag, TagModel>('Tag', tagSchema);


export default Tag;
