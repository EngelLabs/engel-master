'use strict';

global.Promise = require('bluebird');

const Bot = require('./core/Bot');

const bot = new Bot();

bot.start();