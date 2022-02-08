const Collection = require('../structures/Collection');
const baseConfig = require('../utils/baseConfig');


class CommandCollection extends Collection {
        constructor(bot) {
                super();

                this.bot = bot;
        }

        register() {
                this.bot.config.commands = {};

                this.all()
                        .map(command => command.globalConfig)
                        .forEach(c => {
                                if (!c) return;

                                this.bot.config.commands[c.name] = c;
                        });

                return new Promise((resolve, reject) => {
                        this.bot.models.Config.updateOne({ state: baseConfig.client.state }, { $set: { commands: this.bot.config.commands } })
                                .exec()
                                .then(resolve)
                                .catch(reject);
                });
        }

        all() {
                const ret = [...this.unique()];

                for (const command of this.unique()) {
                        if (command.commands) {
                                ret.push(command.commands.all());
                        }
                }

                return ret.flat();
        }
}


module.exports = CommandCollection;