/* eslint-disable node/no-callback-literal */
import type * as core from '@engel/core';
import type * as types from '@engel/types';
import type Cluster from './Cluster';
import type ClusterManager from './ClusterManager';

export default class RPCMethods {
        private manager: ClusterManager;
        private logger: core.Logger;

        public constructor(manager: ClusterManager) {
                this.manager = manager;
                this.logger = manager.logger.get('ClusterManager').get('RPC Methods');
        }

        public get map(): Record<string, types.JaysonMethod> {
                return {
                        restart: this.restart
                };
        }

        private restart: types.ClusterManagerRPCMethods['restart'] = ({ target, id }, cb) => {
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

                const status = { count: 0, total: clusters.length };
                const publishStatus = () => {
                        this.manager.redis.publish('engel:clusters:restart', JSON.stringify(status))
                                .catch(err => this.logger.error(err));
                };

                publishStatus();

                clusters.forEach(cluster => {
                        cluster.restart().then(() => {
                                status.count++;
                                publishStatus();
                        });
                });

                return cb(null);
        }
}
