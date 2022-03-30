import Base from '../structures/Base';

export default class IPCManager extends Base {
        public send(op: string, data?: any) {
                const d = {
                        data,
                        client: this.baseConfig.client.name,
                        cluster: this.baseConfig.cluster.id
                };

                if (!process.connected) {
                        return false;
                }

                process.send({ op, d });
        }
}
