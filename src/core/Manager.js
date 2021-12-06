const cluster = require('cluster');
const logger = require('./logger');


class Manager {
    run() {
        cluster.fork();
        
        cluster.on('online', worker => {
            logger.info(`[Manager] Worker PID[${worker.process.pid}] online.`);
        });

        // cluster.default.on('online')
        cluster.on('exit', (worker, code, signal) => {
            logger.info(`[Manager] Worker ${worker.process.pid} exited with code ${code}, ${signal}.`)
            
            cluster.fork();
        });

        cluster.on('message', (worker, message, handle) => {
            if (!message || !message.op) {
                logger.warn(`[Manager] Received unknown message ${message} from process ${worker.process.pid}.`);
            }
            if (this[message.op]) {
                this[message.op](worker, message, handle);
            } else {
                logger.warn(`[Manager] Received unknown message ${message} from process ${worker.process.pid}.`);
            }
        });
    }

    close(worker,) {
        logger.info(`[Manager] Received signal to terminate app from process ${worker.process.pid}.`);

        process.exit(1);
    }
}


module.exports = Manager;