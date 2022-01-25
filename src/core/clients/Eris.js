const { Client } = require('eris');
const Base = require('../structures/Base');


class Eris extends Base {
        constructor(server) {
                super(server);

                const client = new Client('Bot ' + this.baseConfig.client.token, {
                        restMode: true,
                });

                return client;
        }
}


module.exports = Eris;