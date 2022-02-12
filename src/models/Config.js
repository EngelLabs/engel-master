const { Schema, model } = require('mongoose');
const { globalDefaults: defaults, client } = require('../core/utils/baseConfig');

const configSchemaBase = { state: { type: String, default: client.state } };

for (const key in defaults) {
        const value = defaults[key];

        configSchemaBase[key] = { type: value.constructor, default: value };
}

const configSchema = new Schema(configSchemaBase,
        { collection: 'configurations', minimize: false }
);

configSchema.index(
        { state: 1 },
        { unique: true },
);



module.exports = model('Config', configSchema);