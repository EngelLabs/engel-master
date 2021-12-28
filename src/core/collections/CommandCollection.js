const Collection = require('../structures/Collection');


class CommandCollection extends Collection {
    constructor(bot) {
        super();

        this.bot = bot;
    }

    register() {
        let update;

        [...this.unique()]
            .map(command => this.getConfig(command))
            .forEach(c => {
                if (!c) return;

                update = update || {};

                update['commands.' + c.name] = this.bot.config.commands[c.name] = c;
            });

        if (update) {
            return new Promise((resolve, reject) => {
                this.bot.models.Config.updateOne({ state: this.bot.state }, { $set: update })
                    .exec()
                    .then(resolve)
                    .catch(reject);
            });
        }
        
        return Promise.resolve(false);
    }

    getConfig(command) {
        const ret = [command.globalConfig];

        if (command.commands) {
            for (const subcommand of command.commands.unique()) {
                ret.push(...this.getConfig(subcommand));
            }
        }

        return ret.filter(c => c);
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
}


module.exports = CommandCollection;