/* eslint-disable node/no-callback-literal */
import * as jayson from 'jayson/promise';
import type * as core from '@engel/core';
import type * as types from '@engel/types';
import type Cluster from './Cluster';
import type ClusterManager from './ClusterManager';

export default class RPCMethods {
        private manager: ClusterManager;
        private logger: core.Logger;

        public constructor(manager: ClusterManager) {
                this.manager = manager;
                this.logger = manager.logger.get('RPC Methods');
        }

        public get map(): Record<string, types.JaysonMethod> {
                return {
                        restart: this.restart
                };
        }

        private restart: types.ClusterManagerRPCMethods['restart'] = ({ target, id, statusPort }, cb) => {
                let clusters: Cluster[];

                switch (target) {
                        case 'all': {
                                this.logger.info('Restarting all clusters...');

                                clusters = [...this.manager.processes.values()];
                                break;
                        }
                        case 'client': {
                                const ids = <string[]>(id instanceof Array ? id : [id]);

                                this.logger.info(`Restarting clients ${ids.map(id => `"${id}"`).join(', ')}`);

                                clusters = [...this.manager.processes.values()]
                                        .filter(c => ids.includes(c.client));

                                break;
                        }
                        case 'cluster': {
                                const ids = (id instanceof Array ? id : [id]).map(id => Number(id));

                                clusters = [...this.manager.processes.values()]
                                        .filter(c => ids.includes(c.id));
                                break;
                        }
                        default:
                                return cb({ code: 404, message: 'Invalid target' });
                }

                if (!clusters || !clusters.length) {
                        return cb({ code: 400, message: "Couldn't resolve clusters" });
                }

                let client: jayson.HttpClient;
                let count = 0;

                const sendUpdatedCount = () => {
                        client.request('update', { count, total: clusters.length })
                                .catch(() => null);
                };

                if (statusPort) {
                        statusPort = Number(statusPort);
                        if (isNaN(statusPort)) {
                                return cb({ code: 400, message: 'Invalid status port' });
                        }
                        client = jayson.client.http({ port: statusPort });
                        sendUpdatedCount();
                }

                clusters.forEach(cluster => {
                        const p = cluster.restart();

                        if (client) {
                                p.then(() => {
                                        count++;
                                        sendUpdatedCount();
                                });
                        }
                });

                return cb(null);
        }
}
