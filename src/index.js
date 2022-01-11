#!/usr/bin/env node
'use strict';

global.Promise = require('bluebird');
const Server = require('./core/Server');

const server = new Server();

server.start();