import * as _cluster from 'cluster';
import * as core from '@engel/core';
import type Manager from './Manager';

const cluster = <_cluster.Cluster><unknown>_cluster;

export default class Cluster extends core.Base {
        private _config: any;
        public worker: _cluster.Worker;
        public id: number;
        public client: string;
        private logger: core.Logger;

        /**
         * Spawn a new cluster
         * @param clusterConfig Cluster configuration
         */
        public constructor(manager: Manager, clusterConfig: any) {
                super(manager);

                this._config = clusterConfig;
                this.id = clusterConfig.id;
                this.client = clusterConfig.client;
                this.logger = this.app.logger.get(`C${this.id}`);

                this.spawn();
        }

        private spawn() {
                const worker = this.worker = cluster.fork(this._config.env);

                worker
                        .on('online', () => {
                                this.logger.info('Online.');
                        })
                        .on('disconnect', () => {
                                this.logger.info('Offline.');
                        })
                        .on('message', message => {
                                if (typeof message === 'object') {
                                        try {
                                                var text = JSON.stringify(message);
                                        } catch {
                                                text = message;
                                        }
                                } else {
                                        text = message;
                                }

                                this.logger.debug(`Message received: ${text}`);

                                if (message?.op === 'ready') {
                                        this.logger.info('Ready.');
                                }
                        })
                        .on('error', err => {
                                this.logger.error(err);
                        })
                        .on('exit', () => {
                                this.logger.info(`Exited (code=${worker.process.exitCode}). Restarting...`);

                                setTimeout(() => this.spawn(), 5000);
                        });
        }

        public awaitReady() {
                return new Promise((resolve) => {
                        const listener = (message: any) => {
                                if (message?.op === 'ready') {
                                        this.worker.off('message', listener);

                                        resolve(null);
                                }
                        };

                        this.worker.on('message', listener);
                });
        }
}
