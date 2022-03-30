"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const moment = require("moment");
const winston = require("winston");
function Logger(app) {
    const ts = moment().format('l').replaceAll('/', '.');
    const options = {
        level: app.baseConfig.logger.level,
        format: winston.format.combine(winston.format.errors({ stack: true }), winston.format.colorize({ level: true }), winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:SSS' }), winston.format.printf(info => `[${info.timestamp}] [${info.level.padEnd(15)}] ${info.message}`)),
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({
                level: 'info',
                filename: path.join(app.baseConfig.logger.dir, `${ts}.log`)
            }),
            new winston.transports.File({
                level: 'error',
                filename: path.join(app.baseConfig.logger.dir, `${ts}.error.log`)
            })
        ]
    };
    const logger = winston.createLogger(options);
    logger.on('error', err => {
        try {
            logger.error(err);
        }
        catch (_a) {
            console.error(err);
        }
    });
    logger.debug(`[Logger] Loaded (level=${app.baseConfig.logger.level}).`);
    return logger;
}
exports.default = Logger;
//# sourceMappingURL=Logger.js.map