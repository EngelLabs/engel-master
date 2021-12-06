#!/usr/bin/env node
'use strict';

global.Promise = require('bluebird');
const cluster = require('cluster');


if (cluster.isMaster) {
    const Manager = require('./core/Manager');

    const manager = new Manager();

    manager.run();

} else {
    const Bot = require('./core/Bot');

    const bot = new Bot();

    bot.run();
}