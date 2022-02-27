import { baseConfig } from '@engel/core';
import pkg = require('../../../package.json');


baseConfig.name = pkg.name;
baseConfig.version = pkg.version;


export default baseConfig;