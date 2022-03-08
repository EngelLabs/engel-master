import * as getenv from 'getenv';
import { baseConfig } from '@engel/core';
import pkg = require('../../../package.json');

type _BaseConfig = typeof baseConfig & {
        site: { host: string; port: string; secret: string; };
}

baseConfig.name = pkg.name;
baseConfig.version = pkg.version;

(<_BaseConfig>baseConfig).site = {
        host: getenv.string('SITE_HOST', 'localhost'),
        port: getenv.string('SITE_PORT', '8080'),
        secret: getenv.string('SITE_SECRET')
};

export default (<_BaseConfig>baseConfig);