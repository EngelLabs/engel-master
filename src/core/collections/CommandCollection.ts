import * as core from '@engel/core';
import Command from '../structures/Command';
import Bot from '../Bot';


export default class CommandCollection extends core.Collection<Command> {
        private _bot?: Bot;

        public constructor(bot?: Bot) {
                super();

                if (bot) {
                        this._bot = bot;
                }
        }

        public register(): Promise<void> {
                this._bot.config.commands = {};

                this.all()
                        .map(command => command.globalConfig)
                        .forEach(c => {
                                if (!c) return;

                                this._bot.config.commands[c.name] = c;
                        });

                return new Promise((resolve, reject) => {
                        this._bot.models.Config.updateOne({ state: this._bot.baseConfig.client.state }, { $set: { commands: this._bot.config.commands } })
                                .exec()
                                .then(() => resolve())
                                .catch(reject);
                });
        }

        public all(): Command[] {
                const ret = [...this.unique()];

                for (const command of this.unique()) {
                        if (command.commands) {
                                ret.push(...command.commands.all());
                        }
                }

                return ret.flat();
        }
}
