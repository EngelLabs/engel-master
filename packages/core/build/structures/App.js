"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const models = require("../models");
const utils = require("../utils/helpers");
const eventemitter3_1 = require("eventemitter3");
const baseConfig_1 = require("../utils/baseConfig");
const Eris_1 = require("../clients/Eris");
const Logger_1 = require("../clients/Logger");
const Mongoose_1 = require("../clients/Mongoose");
const Redis_1 = require("../clients/Redis");
let appInstance;
global.Promise = require('bluebird');
class App extends eventemitter3_1.EventEmitter {
    constructor() {
        super();
        this.baseConfig = baseConfig_1.default;
        this.models = models;
        this.utils = utils;
        this.erisClient = Eris_1.default;
        this.redisClient = Redis_1.default;
        this.mongooseClient = Mongoose_1.default;
        appInstance = this;
    }
    static get instance() {
        return appInstance;
    }
    log(message, level = 'debug', ...sources) {
        var _a;
        if (!message) {
            return;
        }
        if (!sources.length) {
            sources = [this.constructor.name];
        }
        if (level === 'error') {
            message = (_a = message.stack) !== null && _a !== void 0 ? _a : message;
        }
        message = `${sources.map(s => `[${s}]`).join(' ')} ${message}`;
        this.logger.log({ message, level });
    }
    get config() {
        return this._config;
    }
    set config(config) {
        var _a;
        if (!config) {
            this.logger.error(`Configuration not found for state ${baseConfig_1.default.client.state}`);
            process.exit(1);
        }
        this.emit('config', config);
        if (config.configRefreshInterval !== ((_a = this._config) === null || _a === void 0 ? void 0 : _a.configRefreshInterval)) {
            clearInterval(this._configInterval);
            this._configInterval = setInterval(this.configure.bind(this), config.configRefreshInterval);
        }
        this._config = config;
    }
    getConfig() {
        return this.models.Config
            .findOne({ state: baseConfig_1.default.client.state })
            .lean()
            .exec();
    }
    configure() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.config = yield this.getConfig();
            }
            catch (err) {
                this.log(err, 'error');
            }
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.logger = (0, Logger_1.default)(this);
                this.log(`Starting ${baseConfig_1.default.name}(env=${baseConfig_1.default.env} s=${baseConfig_1.default.client.state}, v=${baseConfig_1.default.version}).`);
                this.eris = this.erisClient(this);
                this.mongoose = this.mongooseClient(this);
                this.redis = this.redisClient(this);
                yield this.configure();
                if (typeof this.setup === 'function') {
                    yield this.setup();
                }
            }
            catch (err) {
                try {
                    this.log(err, 'error');
                }
                catch (_a) {
                    console.log(err);
                }
                process.exit(1);
            }
        });
    }
    on(event, fn, context) {
        return super.on(event, fn, context);
    }
}
exports.default = App;
//# sourceMappingURL=App.js.map