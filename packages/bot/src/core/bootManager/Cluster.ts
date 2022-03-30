import * as _cluster from 'cluster';
import * as core from '@engel/core';
import type Manager from './Manager';

const cluster = <_cluster.Cluster><unknown>_cluster;

export default class Cluster extends core.Base {
        private _manager: Manager;
        private _config: any;
        public worker: _cluster.Worker;
        public id: number;
        public client: string;

        public get logPrefix(): string {
                return `${this.client.toUpperCase()}-C${this.id}`;
        }

        /**
         * Spawn a new cluster
         * @param manager Manager instance
         * @param clusterConfig Cluster configuration
         */
        public constructor(manager: Manager, clusterConfig: any) {
                super(manager);

                this._manager = manager;
                this._config = clusterConfig;
                this.id = clusterConfig.id;
                this.client = clusterConfig.client;

                this.spawn();
        }

        private spawn() {
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
                                        } catch {
                                                text = message;
                                        }
                                } else {
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
