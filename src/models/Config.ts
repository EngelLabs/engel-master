import * as mongoose from 'mongoose';
import * as types from '../types';
import baseConfig from '../utils/baseConfig';
import globalDefaults from '../utils/globalDefaults';


const configSchemaBase = { state: { type: String, default: baseConfig.client.state } };


// Going this route because I simply don't want to type it all out -
// every field is required and already has a default value - 
// and I'm simply not a fan of the more verbose syntax.
// I also need the runtime type checking that mongoose implements.
for (const key in globalDefaults) {
        const value = globalDefaults[key];

        configSchemaBase[key] = { type: value.constructor, default: value };
}

// @ts-ignore
// configSchemaBase isn't compatible with types.Config, as expected.
const configSchema = new mongoose.Schema<types.Config>(configSchemaBase,
        { collection: 'configurations', minimize: false }
);

configSchema.index(
        { state: 1 },
        { unique: true },
);


const Config = mongoose.model('Config', configSchema);


export default Config;
