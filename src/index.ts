'use strict';

import Core from './core/Core';

global.Promise = require('bluebird');

const core = new Core();

core.start();
