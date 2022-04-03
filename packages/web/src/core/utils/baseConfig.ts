import * as env from '@engel/env-util';
import { baseConfig } from '@engel/core';
import pkg = require('../../../package.json');

type _BaseConfig = typeof baseConfig & {
        site: { host: string; port: string; secret: string; };
}

baseConfig.name = pkg.name;
baseConfig.version = pkg.version;

(<_BaseConfig>baseConfig).site = {
        host: env.str('SITE_HOST', 'localhost'),
        port: env.str('SITE_PORT', '8080'),
        secret: env.str('SITE_SECRET')
};

export default (<_BaseConfig>baseConfig);
