const Collection = require('../structures/Collection');
const logger = require('../core/logger');


class CommandCollection extends Collection {
    constructor(bot) {
        super();

        this.bot = bot;
    }

    register(config) {
        const update = {};

        for (const command of this.unique()) {
            this._getConfig(command)
                .forEach(c => {
                    if (!c) return;

                    update['commands.' + c.name] = c
                });
        }

        return new Promise((resolve, reject) => {
            this.bot.models.Config.updateOne({ state: config.state }, { $set: update })
                .exec()
                .then(resolve)
                .catch(reject);
        });
    }

    _getConfig(command) {
        const ret = [command.config];

        if (command.commands) {
            for (const subcommand of command.commands.unique()) {
                ret.push(...this._getConfig(subcommand));
            }
        }

        return ret;
    }

    all() {
        const ret = [...this.unique()];

        for (const command of this.unique()) {
            if (command.commands) {
                ret.push(...command.commands.all());
            }
        }

        return ret;
    }

    log() {
        logger.info(`[Commands] ${this.unique().size} registered.`);
        logger.info(`[Commands] ${this.all().length} total registered.`);
    }
}


module.exports = CommandCollection;