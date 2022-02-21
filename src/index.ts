'use strict';

global.Promise = require('bluebird');


import Bot from './core/Bot';


const bot = new Bot();

bot.start();