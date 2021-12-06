const { Schema, model } = require('mongoose');


const tagSchema = new Schema({
    name:      { type: String },
    content:   { type: String },
    guild:     { type: String, index: true },
    author:    { type: String },
    createdAt: { type: Date, default: Date.now },
    editedAt:  { type: Date },
},
    { collection: 'tags' },
);

tagSchema.static('findOneAndIncrement', (...args) => {
    return new Promise((resolve, reject) => {
        Tag.findOne(...args)
            .lean()
            .exec()
            .then(res => {
                if (res) Tag.incrementUses(res.guild, res.name);

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