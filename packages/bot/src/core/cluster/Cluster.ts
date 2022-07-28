import * as _cluster from 'cluster';
import type * as queue from 'queue';
import type * as core from '@engel/core';
import type * as types from '@engel/types';
import type ClusterManager from './ClusterManager';
import Queue from 'queue';

const cluster = <_cluster.Cluster><unknown>_cluster;

export default class Cluster {
        public id: number;
        public client: string;
        private worker: _cluster.Worker;
        private manager: ClusterManager;
        private config: types.ClusterConfig;
        private logger: core.Logger;

        public constructor(manager: ClusterManager, clusterConfig: types.ClusterConfig) {
                this.manager = manager;
                this.config = clusterConfig;
                this.id = clusterConfig.id;
                this.client = clusterConfig.client;
                this.logger = manager.logger.get(`Cluster ${this.id}`);
        }

        public spawn(): void {
                this.initialize().then(() => {
                        this.queue.push(this.connect.bind(this));
                });
        }

        public restart(): Promise<void> {
                return new Promise(resolve => {
                        this.queue.push(next => {
                                const cb = () => {
                                        next();
                                        resolve();
                                };

                                this.logger.info('Restarting...');

                                const worker = this.worker;
                                delete this.worker;

                                worker.kill('SIGTERM');
                                worker.on('exit', () => {
                                        this.initialize().then(() => this.connect(cb));
                                });
                        });
                });
        }

        private initialize(): Promise<void> {
                return new Promise(resolve => {
                        const worker = this.worker = cluster.fork(this.config.env);

                        worker
                                .on('online', () => {
                                        this.logger.info('Online.');
                                })
                                .on('disconnect', () => {
                                        this.logger.info('Offline.');
                                })
                                .on('error', err => {
                                        this.logger.error(err);
                                })
                                .on('exit', () => {
                                        this.logger.info(`Exited (code=${worker.process.exitCode}).`);

                                        if (this.worker === worker) {
                                                this.logger.info('Attempting restart...');
                                                this.initialize().then(() => resolve());
                                        }
                                });

                        const messageListener = (message: any) => {
                                if (message === 'hello') {
                                        worker.off('message', messageListener);
                                        resolve();
                                }
                        };

                        worker.on('message', messageListener);
                });
        }

        private connect(next: queue.QueueWorkerCallback) {
                const messageListener = (message: any) => {
                        if (message === 'ready') {
                                this.logger.info('Ready.');
                                this.worker.off('message', messageListener);
                                next();
                        }
                };

                this.worker.on('message', messageListener);
                this.worker.send('connect', err => err && this.logger.error(err));
        }

        private get queue(): Queue {
                const { queues } = this.manager;

                if (!queues.has(this.client)) {
                        const _queue = new Queue({ concurrency: 1, autostart: true });
                        queues.set(this.client, _queue);
                }

                return queues.get(this.client);
        }
}
