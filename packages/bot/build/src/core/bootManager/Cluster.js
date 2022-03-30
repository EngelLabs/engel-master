"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _cluster = require("cluster");
const core = require("@engel/core");
const cluster = _cluster;
class Cluster extends core.Base {
    _manager;
    _config;
    worker;
    id;
    client;
    get logPrefix() {
        return `${this.client.toUpperCase()}-C${this.id}`;
    }
    constructor(manager, clusterConfig) {
        super(manager);
        this._manager = manager;
        this._config = clusterConfig;
        this.id = clusterConfig.id;
        this.client = clusterConfig.client;
        this.spawn();
    }
    spawn() {
        const worker = this.worker = cluster.fork(this._config.env);
        worker
            .on('online', () => {
            this.log('Online.', 'info');
        })
            .on('disconnect', () => {
            this.log('Offline.', 'info');
        })
            .on('message', message => {
            if (typeof message === 'object') {
                try {
                    var text = JSON.stringify(message);
                }
                catch {
                    text = message;
                }
            }
            else {
                text = message;
            }
            this.log(`Message received: ${text}`);
            if (message?.op === 'ready') {
                this.log('Ready.', 'info');
            }
        })
            .on('error', err => {
            this.log(err, 'error');
        })
            .on('exit', () => {
            this.log(`Exited (code=${worker.process.exitCode}). Restarting...`, 'info');
            setTimeout(() => this.spawn(), 5000);
        });
    }
    awaitReady() {
        return new Promise((resolve) => {
            const listener = (message) => {
                if (message?.op === 'ready') {
                    this.worker.off('message', listener);
                    resolve(null);
                }
            };
            this.worker.on('message', listener);
        });
    }
}
exports.default = Cluster;
//# sourceMappingURL=Cluster.js.map