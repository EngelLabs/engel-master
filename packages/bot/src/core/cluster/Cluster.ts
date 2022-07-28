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
                this.queue.push(this.createWorker.bind(this));
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
                                worker.on('exit', () => this.createWorker(cb));
                        });
                });
        }

        private createWorker(next: queue.QueueWorkerCallback) {
                const worker = this.worker = cluster.fork(this.config.env);

                worker
                        .on('online', () => {
                                this.logger.info('Online.');
                        })
                        .on('disconnect', () => {
                                this.logger.info('Offline.');
                        })
                        .on('message', message => {
                                if (message === 'ready') {
                                        this.logger.info('Ready.');
                                        next();
                                }
                        })
                        .on('error', err => {
                                this.logger.error(err);
                        })
                        .on('exit', () => {
                                this.logger.info(`Exited (code=${worker.process.exitCode}).`);

                                if (this.worker === worker) {
                                        this.logger.info('Attempting restart...');
                                        setTimeout(() => this.createWorker(next), 5000);
                                }
                        });
        }

        private get queue(): Queue {
                const { queues } = this.manager;

                if (!queues.has(this.client)) {
                        const _queue = new Queue({ concurrency: 1, autostart: true });
                        queues.set(this.client, _queue);
                }

                return queues.get(this.client);
        }

        public awaitReady(): Promise<void> {
                return new Promise((resolve) => {
                        const listener = (message: any) => {
                                if (message === 'ready') {
                                        this.worker.off('message', listener);

                                        resolve();
                                }
                        };

                        this.worker.on('message', listener);
                });
        }
}
