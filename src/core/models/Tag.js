const { Schema, model } = require('mongoose');


const tagSchema = new Schema({
        name: { type: String, required: true },
        content: { type: String, required: true },
        guild: { type: String, required: true, index: true },
        author: { type: String, required: true },
        createdAt: { type: Date, required: true, default: Date.now },
        editedAt: { type: Date, required: false },
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


const Tag = module.exports = model('Tag', tagSchema);