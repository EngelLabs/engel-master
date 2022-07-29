import * as env from '@engel/env-util';
import * as core from '@engel/core';
import type * as types from '@engel/types';
import pkg = require('../../../package.json');

export default function createStaticConfig(): types.CustomStaticConfig {
        const config = core.createStaticConfig(pkg);

        return Object.assign(config, {
                site: {
                        host: env.str('SITE_HOST', 'localhost'),
                        port: env.str('SITE_PORT', '8080'),
                        secret: env.str('SITE_SECRET')
                }
        });
}
