'use strict';

global.Promise = require('bluebird');


import Core from './core/Core';


const core = new Core();

core.start();